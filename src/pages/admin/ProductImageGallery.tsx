import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Star, Trash2, Upload } from 'lucide-react';
import { adminService, ProductImage } from '../../services/admin.service';

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB — matches backend limit

// ─── Types ──────────────────────────────────────────────────────────────────

type UploadStatus = 'queued' | 'uploading' | 'error';

interface PendingImage {
  localId: string;
  file: File;
  previewUrl: string;
  status: UploadStatus;
}

export interface FlushResult {
  succeeded: number;
  failed: number;
}

export interface ProductImageGalleryRef {
  /** Upload all queued images after a new product has been created. */
  flushPending: (productId: string) => Promise<FlushResult>;
  hasPending: () => boolean;
}

interface Props {
  /** Null while creating a brand-new product (pre-save). */
  productId: string | null;
  initialImages: ProductImage[];
}

// ─── Tile sub-component ───────────────────────────────────────────────────────

interface TileProps {
  src: string;
  isPrimary: boolean;
  uploadStatus?: UploadStatus;
  onSetPrimary?: () => void;
  onDelete?: () => void;
}

const ImageTile: React.FC<TileProps> = ({ src, isPrimary, uploadStatus, onSetPrimary, onDelete }) => {
  const uploading = uploadStatus === 'uploading';
  const failed = uploadStatus === 'error';

  return (
    <div
      className="position-relative flex-shrink-0"
      style={{ width: 96, height: 96 }}
    >
      <img
        src={src}
        alt=""
        className="rounded-2 border w-100 h-100"
        style={{
          objectFit: 'cover',
          opacity: uploading ? 0.55 : 1,
          borderColor: failed ? '#dc3545' : undefined,
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.svg';
        }}
      />

      {/* Primary badge */}
      {isPrimary && (
        <span
          className="position-absolute top-0 start-0 m-1 badge bg-warning text-dark"
          style={{ fontSize: 9, lineHeight: 1.4 }}
        >
          <Star size={9} fill="currentColor" style={{ marginRight: 2 }} />
          Main
        </span>
      )}

      {/* Uploading spinner overlay */}
      {uploading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-2"
          style={{ background: 'rgba(0,0,0,0.28)' }}
        >
          <div className="spinner-border spinner-border-sm text-light" />
        </div>
      )}

      {/* Error overlay */}
      {failed && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-2"
          style={{ background: 'rgba(220,53,69,0.72)' }}
        >
          <small className="text-white fw-bold" style={{ fontSize: 11 }}>
            Failed
          </small>
        </div>
      )}

      {/* Bottom action bar — only when not uploading */}
      {!uploading && (
        <div
          className="position-absolute bottom-0 start-0 end-0 d-flex align-items-center px-1 pb-1 rounded-bottom-2"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.58))' }}
        >
          {onSetPrimary && (
            <button
              type="button"
              className="btn p-0"
              title="Set as main photo"
              onClick={onSetPrimary}
              style={{ color: '#ffc107', lineHeight: 1 }}
            >
              <Star size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn p-0 ms-auto"
              title="Remove"
              onClick={onDelete}
              style={{ color: '#ff6b6b', lineHeight: 1 }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Gallery ─────────────────────────────────────────────────────────────────

const ProductImageGallery = forwardRef<ProductImageGalleryRef, Props>(
  ({ productId, initialImages }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [serverImages, setServerImages] = useState<ProductImage[]>(initialImages);
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [dragActive, setDragActive] = useState(false);

    // Reset when the admin switches to a different product
    useEffect(() => {
      setServerImages(initialImages);
      setPendingImages([]);
    }, [initialImages]);

    const totalCount = serverImages.length + pendingImages.length;
    const canAddMore = totalCount < MAX_IMAGES;

    // ── Upload helpers ──────────────────────────────────────────────────────

    const markUploading = (localId: string) =>
      setPendingImages((prev) =>
        prev.map((p) => (p.localId === localId ? { ...p, status: 'uploading' as const } : p)),
      );

    const markError = (localId: string) =>
      setPendingImages((prev) =>
        prev.map((p) => (p.localId === localId ? { ...p, status: 'error' as const } : p)),
      );

    const promoteToServer = (localId: string, uploaded: ProductImage) => {
      setServerImages((prev) => [...prev, uploaded]);
      setPendingImages((prev) => prev.filter((p) => p.localId !== localId));
    };

    // ── flushPending — called by form after createProduct() ────────────────

    const flushPending = useCallback(
      async (pid: string): Promise<FlushResult> => {
        const queue = pendingImages.filter((p) => p.status !== 'error');
        let succeeded = 0;
        let failed = 0;
        for (let i = 0; i < queue.length; i++) {
          const p = queue[i];
          markUploading(p.localId);
          try {
            const isFirst = serverImages.length === 0 && i === 0;
            const uploaded = await adminService.uploadProductImage(pid, p.file, isFirst);
            promoteToServer(p.localId, uploaded);
            succeeded++;
          } catch {
            markError(p.localId);
            failed++;
          }
        }
        return { succeeded, failed };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [pendingImages, serverImages.length],
    );

    useImperativeHandle(ref, () => ({
      flushPending,
      hasPending: () => pendingImages.length > 0,
    }), [flushPending, pendingImages.length]);

    // ── Add files (from drop or picker) ───────────────────────────────────

    const addFiles = useCallback(
      (files: FileList | File[]) => {
        const valid = Array.from(files).filter(
          (f) => f.type.startsWith('image/') && f.size <= MAX_FILE_SIZE,
        );
        const slots = MAX_IMAGES - totalCount;
        const toAdd = valid.slice(0, slots);
        if (!toAdd.length) return;

        if (productId) {
          // Edit mode: upload immediately, one at a time in parallel per file
          toAdd.forEach(async (file) => {
            const localId = crypto.randomUUID();
            const previewUrl = URL.createObjectURL(file);
            setPendingImages((prev) => [
              ...prev,
              { localId, file, previewUrl, status: 'uploading' },
            ]);
            try {
              const isFirst =
                serverImages.length === 0 &&
                pendingImages.filter((p) => p.status !== 'error').length === 0;
              const uploaded = await adminService.uploadProductImage(productId, file, isFirst);
              promoteToServer(localId, uploaded);
            } catch {
              markError(localId);
            }
          });
        } else {
          // New product: queue for later flush
          const newItems: PendingImage[] = toAdd.map((file) => ({
            localId: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'queued' as const,
          }));
          setPendingImages((prev) => [...prev, ...newItems]);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [productId, serverImages.length, pendingImages, totalCount],
    );

    // ── Server image actions ──────────────────────────────────────────────

    const handleSetPrimary = async (imageId: string) => {
      if (!productId) return;
      try {
        await adminService.setPrimaryImage(productId, imageId);
        setServerImages((prev) =>
          prev.map((img) => ({ ...img, is_primary: img.id === imageId })),
        );
      } catch {
        alert('Failed to set main image. Please try again.');
      }
    };

    const handleDeleteServer = async (imageId: string) => {
      if (!productId) return;
      try {
        await adminService.deleteProductImage(productId, imageId);
        setServerImages((prev) => {
          const next = prev.filter((img) => img.id !== imageId);
          // Auto-promote the first remaining image to primary
          if (next.length > 0 && !next.some((img) => img.is_primary)) {
            adminService.setPrimaryImage(productId, next[0].id).catch(() => {});
            return next.map((img, i) => ({ ...img, is_primary: i === 0 }));
          }
          return next;
        });
      } catch {
        alert('Failed to delete image. Please try again.');
      }
    };

    const handleDeletePending = (localId: string) => {
      setPendingImages((prev) => {
        const item = prev.find((p) => p.localId === localId);
        if (item) URL.revokeObjectURL(item.previewUrl);
        return prev.filter((p) => p.localId !== localId);
      });
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
      <div className="mb-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="form-label fw-semibold mb-0">Product Photos</label>
          <span className="badge bg-secondary">
            {totalCount} / {MAX_IMAGES}
          </span>
        </div>

        {/* Thumbnail grid */}
        {(serverImages.length > 0 || pendingImages.length > 0) && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {serverImages.map((img) => (
              <ImageTile
                key={img.id}
                src={img.url}
                isPrimary={img.is_primary}
                onSetPrimary={!img.is_primary ? () => handleSetPrimary(img.id) : undefined}
                onDelete={() => handleDeleteServer(img.id)}
              />
            ))}
            {pendingImages.map((p) => (
              <ImageTile
                key={p.localId}
                src={p.previewUrl}
                isPrimary={false}
                uploadStatus={p.status}
                onDelete={p.status !== 'uploading' ? () => handleDeletePending(p.localId) : undefined}
              />
            ))}
          </div>
        )}

        {/* Drop zone — hidden once at max */}
        {canAddMore && (
          <div
            className={`border-2 border-dashed rounded-3 p-3 text-center ${
              dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
            }`}
            style={{ cursor: 'pointer' }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="d-none"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Upload size={22} className="text-muted mb-1" />
            <p className="mb-0 small fw-semibold">
              Drop photos here or{' '}
              <span className="text-primary text-decoration-underline">browse</span>
            </p>
            <small className="text-muted">
              PNG, JPG, WEBP · max 1 MB each · up to {MAX_IMAGES} photos
            </small>
          </div>
        )}

        {/* Hint for first image = main */}
        {totalCount > 0 && (
          <small className="text-muted d-block mt-1">
            <Star size={11} className="me-1" />
            The first photo is shown as the main product image. Tap{' '}
            <Star size={11} /> on any photo to change it.
          </small>
        )}
      </div>
    );
  },
);

ProductImageGallery.displayName = 'ProductImageGallery';
export default ProductImageGallery;

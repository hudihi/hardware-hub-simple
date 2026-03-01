// src/components/admin/ProductCreateForm.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Written with Bootstrap 5 classes to match the existing admin UI.
// No Tailwind classes — consistent with the rest of AdminProducts.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Hash,
  ImageIcon,
  Link,
  Loader2,
  Package,
  Tag,
  Upload,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  description: string;
  price: string | number;
  category_id: string;
  currency: string;
  unit_of_measure: string;
  stock_quantity: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface UploadImageResponse {
  image_url: string;
}

interface ApiOverrides {
  getCategories?: () => Promise<Category[]>;
  uploadImage?: (file: File) => Promise<UploadImageResponse>;
  createProduct?: (payload: Record<string, unknown>) => Promise<unknown>;
}

interface ProductCreateFormProps {
  onSuccess?: (product: unknown) => void;
  onCancel?: () => void;
  apiOverrides?: ApiOverrides;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const defaultApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch("/categories");
    if (!res.ok) throw new Error("Failed to load categories");
    return res.json();
  },
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const body = new FormData();
    body.append("image", file);
    const res = await fetch("/upload-image", { method: "POST", body });
    if (!res.ok) throw new Error("Image upload failed");
    return res.json();
  },
  createProduct: async (payload: Record<string, unknown>): Promise<unknown> => {
    const res = await fetch("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Could not create product");
    return res.json();
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULTS: ProductForm = {
  name: "", description: "", price: "", category_id: "",
  currency: "TZS", unit_of_measure: "pcs", stock_quantity: 0, is_active: true,
};

const validate = (
  form: ProductForm,
  imageMode: "upload" | "url",
  imageUrl: string,
  uploadedUrl: string | null
): Record<string, string> => {
  const errs: Record<string, string> = {};
  if (!form.name.trim()) errs.name = "Name is required";
  if (!form.description.trim()) errs.description = "Description is required";
  if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
    errs.price = "Enter a valid price (≥ 0)";
  if (!form.category_id) errs.category_id = "Select a category";
  if (imageMode === "url") {
    try { new URL(imageUrl); } catch { errs.image = "Enter a valid image URL"; }
  }
  if (imageMode === "upload" && !uploadedUrl) errs.image = "Upload an image first";
  return errs;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductCreateForm = ({ onSuccess, onCancel, apiOverrides }: ProductCreateFormProps) => {
  const api = { ...defaultApi, ...apiOverrides };

  const [form, setForm]                     = useState<ProductForm>(DEFAULTS);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [catLoading, setCatLoading]         = useState<boolean>(true);

  const [imageMode, setImageMode]           = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl]             = useState<string>("");
  const [uploadedUrl, setUploadedUrl]       = useState<string | null>(null);
  const [uploadFile, setUploadFile]         = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading]       = useState<boolean>(false);
  const [isDragging, setIsDragging]         = useState<boolean>(false);

  const [errors, setErrors]                 = useState<Record<string, string>>({});
  const [submitState, setSubmitState]       = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitMsg, setSubmitMsg]           = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const set = (key: keyof ProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [key]: e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
      }));

  const clearImage = () => {
    setUploadedUrl(null);
    setUploadFile(null);
    setUploadProgress(0);
    setImageUrl("");
  };

  const removeImageError = () =>
    setErrors((e) => { const { image: _, ...rest } = e; return rest; });

  const handleFile = useCallback(async (file: File) => {
    if (!file?.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "File must be an image" })); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Image must be under 5MB" })); return;
    }
    removeImageError();
    setUploadFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress((p) => Math.min(p + 15, 85)), 100);
    try {
      const res = await api.uploadImage(file);
      clearInterval(interval);
      setUploadProgress(100);
      await new Promise<void>((r) => setTimeout(r, 200));
      setUploadedUrl(res.image_url);
    } catch (err) {
      clearInterval(interval);
      setErrors((e) => ({ ...e, image: (err as Error).message }));
      setUploadFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    const errs = validate(form, imageMode, imageUrl, uploadedUrl);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitState("loading");
    try {
      const payload: Record<string, unknown> = {
        ...form,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        image_url: imageMode === "url" ? imageUrl : uploadedUrl,
      };
      const product = await api.createProduct(payload);
      setSubmitState("success");
      setSubmitMsg("Product created successfully!");
      setTimeout(() => {
        setForm(DEFAULTS);
        setErrors({});
        clearImage();
        setSubmitState("idle");
        onSuccess?.(product);
      }, 2000);
    } catch (err) {
      setSubmitState("error");
      setSubmitMsg((err as Error).message);
      setTimeout(() => setSubmitState("idle"), 3500);
    }
  };

  const previewSrc: string | null = imageMode === "upload"
    ? uploadedUrl
    : (() => { try { new URL(imageUrl); return imageUrl; } catch { return null; } })();

  const isSubmitting = submitState === "loading";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <Package size={20} className="me-2" />
          New Product
        </h4>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>
            ← Back to Products
          </button>
        )}
      </div>

      <div className="card card-pahala">
        <div className="card-body p-4">

          {/* ── Core Details ── */}
          <p className="text-uppercase text-muted small fw-semibold mb-3 d-flex align-items-center gap-1">
            <Tag size={12} /> Core Details
          </p>

          <div className="row g-3 mb-3">
            {/* Product Name */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Product Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Premium Wireless Headphones"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                rows={3}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe the product…"
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            {/* Price & Category */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <DollarSign size={13} className="me-1" />
                Price <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${errors.price ? "is-invalid" : ""}`}
                min="0"
                step="0.01"
                value={form.price as number}
                onChange={set("price")}
                placeholder="0.00"
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Category <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <select
                  className={`form-select ${errors.category_id ? "is-invalid" : ""}`}
                  value={form.category_id}
                  onChange={set("category_id")}
                  disabled={catLoading}
                >
                  <option value="">{catLoading ? "Loading…" : "Select category"}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {catLoading && (
                  <span className="input-group-text">
                    <Loader2 size={14} className="animate-spin" />
                  </span>
                )}
                {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* ── Product Image ── */}
          <p className="text-uppercase text-muted small fw-semibold mb-3 d-flex align-items-center gap-1">
            <ImageIcon size={12} /> Product Image
          </p>

          {/* Mode toggle */}
          <div className="btn-group w-100 mb-3" role="group">
            <button
              type="button"
              className={`btn btn-sm ${imageMode === "upload" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => { setImageMode("upload"); removeImageError(); }}
            >
              <Upload size={13} className="me-1" /> Upload File
            </button>
            <button
              type="button"
              className={`btn btn-sm ${imageMode === "url" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => { setImageMode("url"); removeImageError(); }}
            >
              <Link size={13} className="me-1" /> External URL
            </button>
          </div>

          {/* Drag-and-drop zone */}
          {imageMode === "upload" && !uploadedUrl && !isUploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border rounded-3 p-5 text-center ${isDragging ? "border-primary bg-primary bg-opacity-10" : "border-dashed"}`}
              style={{ cursor: "pointer", borderStyle: "dashed" }}
            >
              <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${isDragging ? "bg-primary bg-opacity-25" : "bg-light"}`}
                style={{ width: 48, height: 48 }}>
                <Upload size={20} className={isDragging ? "text-primary" : "text-secondary"} />
              </div>
              <p className="mb-0 fw-semibold">
                Drop image here or{" "}
                <span className="text-primary text-decoration-underline">browse</span>
              </p>
              <small className="text-muted">PNG, JPG, WEBP · max 5MB</small>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
          )}

          {/* Upload progress */}
          {imageMode === "upload" && isUploading && (
            <div className="border rounded-3 p-3 bg-light">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Loader2 size={15} className="text-primary animate-spin" />
                <span className="small">Uploading {uploadFile?.name}…</span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div
                  className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* External URL */}
          {imageMode === "url" && (
            <div className="input-group">
              <span className="input-group-text">
                <Link size={14} className="text-muted" />
              </span>
              <input
                type="text"
                className={`form-control ${errors.image ? "is-invalid" : ""}`}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setErrors((er) => { const { image: _, ...rest } = er; return rest; });
                }}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && <div className="invalid-feedback">{errors.image}</div>}
            </div>
          )}

          {errors.image && !previewSrc && imageMode === "upload" && (
            <div className="text-danger small mt-1 d-flex align-items-center gap-1">
              <AlertCircle size={12} />{errors.image}
            </div>
          )}

          {/* Image preview */}
          {previewSrc && (
            <div className="position-relative mt-2 rounded-3 overflow-hidden border">
              <img
                src={previewSrc}
                alt="Preview"
                className="w-100 object-fit-cover"
                style={{ maxHeight: 200 }}
                onError={() => setErrors((e) => ({ ...e, image: "Could not load image from URL" }))}
              />
              <button
                type="button"
                onClick={clearImage}
                className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle bg-dark text-white border-0 d-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28 }}
              >
                <X size={13} />
              </button>
              <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75">
                Preview
              </span>
            </div>
          )}

          <hr className="my-4" />

          {/* ── Additional Details ── */}
          <p className="text-uppercase text-muted small fw-semibold mb-3 d-flex align-items-center gap-1">
            <Hash size={12} /> Additional Details
          </p>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Currency</label>
              <input
                type="text"
                className="form-control"
                value={form.currency}
                onChange={set("currency")}
                placeholder="TZS"
              />
              <div className="form-text">Default: TZS</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Unit of Measure</label>
              <input
                type="text"
                className="form-control"
                value={form.unit_of_measure}
                onChange={set("unit_of_measure")}
                placeholder="pcs"
              />
              <div className="form-text">Default: pcs</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Stock Quantity</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={form.stock_quantity}
                onChange={set("stock_quantity")}
                placeholder="0"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Active Status</label>
              <div
                className="form-control d-flex align-items-center gap-3"
                style={{ cursor: "pointer" }}
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              >
                {/* Toggle */}
                <div
                  className={`rounded-pill position-relative flex-shrink-0 ${form.is_active ? "bg-success" : "bg-secondary"}`}
                  style={{ width: 40, height: 22, transition: "background 0.2s" }}
                >
                  <div
                    className="position-absolute bg-white rounded-circle shadow-sm"
                    style={{
                      width: 16, height: 16,
                      top: 3, left: 3,
                      transition: "transform 0.2s",
                      transform: form.is_active ? "translateX(18px)" : "translateX(0)",
                    }}
                  />
                </div>
                <span className={`fw-medium small ${form.is_active ? "text-success" : "text-secondary"}`}>
                  {form.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <hr className="my-4" />

          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={15} />
              Please fix the errors above before submitting.
            </div>
          )}

          {submitState === "success" && (
            <div className="alert alert-success py-2 d-flex align-items-center gap-2 mb-3">
              <CheckCircle size={15} />{submitMsg}
            </div>
          )}

          {submitState === "error" && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={15} />{submitMsg}
            </div>
          )}

          <div className="d-flex gap-2">
            {onCancel && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? <><Loader2 size={15} className="animate-spin" /> Creating…</>
                : <><ArrowRight size={15} /> Create Product</>
              }
            </button>
          </div>

        </div>
      </div>

      <style>{`
        :root {
          --pahala-brown: #7C5A3C;
          --pahala-brown-dark: #5C3D2E;
          --pahala-brown-light: #A67C52;
          --pahala-brown-hover: #6B4E35;
          --pahala-white: #FFFFFF;
          --pahala-cream: #FDF8F3;
          --pahala-beige: #F5EDE4;
          --pahala-gray: #6C757D;
          --pahala-gray-light: #F8F9FA;
          --shadow-soft: 0 2px 8px rgba(124, 90, 60, 0.1);
          --shadow-card: 0 4px 12px rgba(124, 90, 60, 0.15);
          --shadow-hover: 0 6px 20px rgba(124, 90, 60, 0.2);
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .border-dashed { border-style: dashed !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        .text-brown { color: var(--pahala-brown) !important; }
        .card-pahala {
          border: none;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-soft);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .card-pahala:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default ProductCreateForm;
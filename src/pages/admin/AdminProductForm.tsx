import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AdminProduct, adminService } from '../../services/admin.service';
import { productService, type Category } from '../../services/product.service';
import ProductImageGallery, { ProductImageGalleryRef } from './ProductImageGallery';

interface AdminProductFormProps {
  open: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
  editingProduct?: AdminProduct | null;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  currency: string;
  unit: string;
  stock: string;
  isActive: boolean;
}

const emptyForm = (): FormData => ({
  name: '',
  description: '',
  price: '0',
  category: '',
  currency: 'TZS',
  unit: 'pcs',
  stock: '0',
  isActive: true,
});

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  open,
  onClose,
  onProductCreated,
  editingProduct,
}) => {
  const { t } = useLanguage();
  const galleryRef = useRef<ProductImageGalleryRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm());

  // Load categories once per open
  useEffect(() => {
    if (!open || categories.length > 0) return;
    setIsLoadingCategories(true);
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoadingCategories(false));
  }, [open, categories.length]);

  // Populate / reset form when editing target changes
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name ?? '',
        description: editingProduct.description ?? '',
        price: editingProduct.price?.toString() ?? '0',
        category: editingProduct.category_id ?? '',
        currency: editingProduct.currency ?? 'TZS',
        unit: editingProduct.unit_of_measure ?? 'pcs',
        stock: editingProduct.stock_quantity?.toString() ?? '0',
        isActive: editingProduct.is_active ?? true,
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [editingProduct]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = t('validation_required');
    if (!form.description.trim()) e.description = t('validation_required');
    if (!form.price || parseFloat(form.price) <= 0) e.price = t('validation_required');
    if (!form.category) e.category = t('validation_required');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        currency: form.currency,
        unit_of_measure: form.unit,
        category_id: form.category,
        stock_quantity: parseInt(form.stock),
        is_active: form.isActive,
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        // Gallery manages its own images in edit mode (immediate uploads/deletes)
      } else {
        const created = await adminService.createProduct(payload);
        // Flush any photos the admin queued before saving
        if (galleryRef.current?.hasPending()) {
          await galleryRef.current.flushPending(created.id);
        }
      }

      setForm(emptyForm());
      setErrors({});
      onProductCreated?.();
      onClose();
    } catch (error: any) {
      const data = error?.response?.data;
      let msg = `Failed to ${editingProduct ? 'update' : 'create'} product.`;
      if (typeof data === 'string') msg = data;
      else if (data?.detail) msg = data.detail;
      else if (data?.message) msg = data.message;
      else if (error?.message) msg = error.message;
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  // Gallery key forces a full remount when switching between products
  const galleryKey = editingProduct?.id ?? 'new';
  const galleryImages = editingProduct?.images ?? [];

  return (
    <div
      className={`modal fade ${open ? 'show d-block' : ''}`}
      style={{ backgroundColor: open ? 'rgba(0,0,0,0.5)' : 'transparent' }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold text-brown">
              <i className={`bi ${editingProduct ? 'bi-pencil' : 'bi-plus-circle'} me-2`} />
              {editingProduct ? 'Edit Product' : t('admin_add_product')}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  {t('checkout_name').replace('Full ', '')} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Product description..."
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              {/* Price & Category */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="price" className="form-label">
                    {t('admin_price')} <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">TZS</span>
                    <input
                      type="number"
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                      id="price"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">
                    {t('admin_category')} <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                    id="category"
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    disabled={isLoadingCategories}
                  >
                    <option value="">
                      {isLoadingCategories ? 'Loading…' : t('admin_all_categories')}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>
              </div>

              {/* Stock */}
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="stock" className="form-label">
                    {t('admin_stock') || 'Stock'}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="stock"
                    min="0"
                    value={form.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active
                  </label>
                </div>
              </div>

              {/* Multi-image gallery */}
              <ProductImageGallery
                key={galleryKey}
                ref={galleryRef}
                productId={editingProduct?.id ?? null}
                initialImages={galleryImages}
              />

              {/* Actions */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-lg me-1" />
                  {t('admin_cancel') || 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      {t('checkout_loading')}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1" />
                      {editingProduct ? 'Update Product' : t('admin_add_product')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="modal-footer border-0" />
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;

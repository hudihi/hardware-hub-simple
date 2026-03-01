import { ImageIcon, Link, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { productService, type Category } from '../../services/product.service';

interface AdminProductFormProps {
  open: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
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
  imageMode: 'upload' | 'url';
  imageUrl: string;
  imageFile: File | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AdminProductForm: React.FC<AdminProductFormProps> = ({ open, onClose, onProductCreated }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (open && categories.length === 0) {
      fetchCategories();
    }
  }, [open, categories.length]);

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    currency: 'TZS',
    unit: 'pcs',
    stock: '0',
    isActive: true,
    imageMode: 'upload',
    imageUrl: '',
    imageFile: null,
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be less than 5MB.');
      return;
    }
    updateField('imageFile', file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const clearImage = () => {
    updateField('imageFile', null);
    updateField('imageUrl', '');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = t('validation_required');
    if (!form.description.trim()) newErrors.description = t('validation_required');
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = t('validation_required');
    if (!form.category) newErrors.category = t('validation_required');
    if (form.imageMode === 'url' && form.imageUrl) {
      try { new URL(form.imageUrl); } catch { newErrors.imageUrl = t('validation_email_invalid'); }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Prepare product data for API
      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        currency: form.currency,
        unit_of_measure: form.unit,
        category_id: form.category,
        image_url: form.imageMode === 'url' ? form.imageUrl : '',
        stock_quantity: parseInt(form.stock),
        is_active: form.isActive,
      };

      let createdProduct;
      
      if (form.imageMode === 'upload' && form.imageFile) {
        // Create product first, then upload image
        createdProduct = await productService.createProductWithImage(productData, form.imageFile);
      } else {
        // Create product without image or with URL
        createdProduct = await productService.createProduct(productData);
      }

      alert(`Product "${form.name}" has been created successfully!`);
      resetForm();
      onProductCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Product creation error:', error);
      const errorMessage = error?.details?.message || error?.message || 'An error occurred while creating the product.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', category: '', currency: 'TZS',
      unit: 'pcs', stock: '0', isActive: true, imageMode: 'upload', imageUrl: '', imageFile: null,
    });
    setImagePreview(null);
    setErrors({});
  };

  const currentPreview = form.imageMode === 'url' && form.imageUrl ? form.imageUrl : imagePreview;

  return (
    <div className={`modal fade ${open ? 'show d-block' : ''}`} style={{ backgroundColor: open ? 'rgba(0,0,0,0.5)' : 'transparent' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold text-brown">
              <i className="bi bi-plus-circle me-2"></i>
              {t('admin_add_product')}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            />
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
                  placeholder={t('admin_search_products').replace('...', '')}
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
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Price & Category row */}
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
                      {isLoadingCategories ? 'Loading categories...' : t('admin_all_categories')}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>
              </div>

              {/* Currency, Unit, Stock row */}
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="currency" className="form-label">Currency</label>
                  <input
                    type="text"
                    className="form-control"
                    id="currency"
                    value={form.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="unit" className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-control"
                    id="unit"
                    value={form.unit}
                    onChange={(e) => updateField('unit', e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="stock" className="form-label">{t('admin_stock')}</label>
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

              {/* Active checkbox */}
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

              {/* Image section */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Product Image</label>
                
                {/* Image mode toggle */}
                <div className="btn-group d-flex mb-3" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="imageMode"
                    id="img-upload"
                    checked={form.imageMode === 'upload'}
                    onChange={() => { updateField('imageMode', 'upload'); clearImage(); }}
                  />
                  <label className="btn btn-outline-primary" htmlFor="img-upload">
                    <Upload size={14} className="me-1" /> Upload Image
                  </label>
                  
                  <input
                    type="radio"
                    className="btn-check"
                    name="imageMode"
                    id="img-url"
                    checked={form.imageMode === 'url'}
                    onChange={() => { updateField('imageMode', 'url'); clearImage(); }}
                  />
                  <label className="btn btn-outline-primary" htmlFor="img-url">
                    <Link size={14} className="me-1" /> Image URL
                  </label>
                </div>

                {form.imageMode === 'upload' ? (
                  <div
                    className={`border-2 border-dashed rounded-3 p-4 text-center ${
                      dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                    />
                    <ImageIcon className="mx-auto mb-2 text-muted" size={32} />
                    <p className="mb-0 fw-semibold">
                      Drop image here or <span className="text-primary text-decoration-underline">browse</span>
                    </p>
                    <small className="text-muted">PNG, JPG, WEBP · max 5MB</small>
                  </div>
                ) : (
                  <div className="mb-3">
                    <input
                      type="url"
                      className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                      value={form.imageUrl}
                      onChange={(e) => updateField('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
                  </div>
                )}

                {/* Image preview */}
                {currentPreview && (
                  <div className="position-relative d-inline-block">
                    <img
                      src={currentPreview}
                      alt="Preview"
                      className="rounded-3 border"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                      onClick={clearImage}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-lg me-1"></i>
              {t('admin_cancel') || 'Cancel'}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('checkout_loading')}
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-1"></i>
                  {t('admin_add_product')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;

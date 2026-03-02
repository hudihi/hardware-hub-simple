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

const MAX_FILE_SIZE = 1024 * 1024; // 1MB (updated to match backend requirements)

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
    price: '0',
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
    // Ensure value is never undefined
    const safeValue = value === undefined ? '' : value;
    setForm(prev => ({ ...prev, [key]: safeValue }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be less than 1MB.');
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
    if (!getSafeValue('name', '').trim()) newErrors.name = t('validation_required');
    if (!getSafeValue('description', '').trim()) newErrors.description = t('validation_required');
    if (!getSafeValue('price', '0') || parseFloat(getSafeValue('price', '0')) <= 0) newErrors.price = t('validation_required');
    if (!getSafeValue('category', '')) newErrors.category = t('validation_required');
    if (getSafeValue('imageMode', 'upload') === 'url' && getSafeValue('imageUrl', '')) {
      try { new URL(getSafeValue('imageUrl', '')); } catch { newErrors.imageUrl = t('validation_email_invalid'); }
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
      const productData: any = {
        name: getSafeValue('name', ''),
        description: getSafeValue('description', ''),
        price: parseFloat(getSafeValue('price', '0')),
        currency: getSafeValue('currency', 'TZS'),
        unit_of_measure: getSafeValue('unit', 'pcs'),
        category_id: getSafeValue('category', ''),
        stock_quantity: parseInt(getSafeValue('stock', '0')),
        is_active: getSafeValue('isActive', true),
      };

      // Only include image_url if it's a valid URL (not empty)
      const imageUrl = getSafeValue('imageMode', 'upload') === 'url' ? getSafeValue('imageUrl', '') : '';
      if (imageUrl && imageUrl.trim()) {
        productData.image_url = imageUrl;
      }

      console.log('Sending product data:', productData);
      console.log('Image mode:', getSafeValue('imageMode', 'upload'));
      console.log('Has image file:', !!getSafeValue('imageFile', null));
      
      // Validate required fields before sending
      if (!productData.name || !productData.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!productData.description || !productData.description.trim()) {
        throw new Error('Product description is required');
      }
      if (!productData.category_id || !productData.category_id.trim()) {
        throw new Error('Category is required');
      }
      if (productData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      let createdProduct;
      
      if (getSafeValue('imageMode', 'upload') === 'upload' && getSafeValue('imageFile', null)) {
        // Create product first, then upload image
        createdProduct = await productService.createProductWithImage(productData, getSafeValue('imageFile', null));
      } else {
        // Create product without image or with URL
        createdProduct = await productService.createProduct(productData);
      }

      alert(`Product "${getSafeValue('name', '')}" has been created successfully!`);
      resetForm();
      onProductCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Product creation error:', error);
      console.error('Full error object:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      // Try to extract detailed validation errors
      let errorMessage = 'An error occurred while creating product.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.log('Processing error data:', errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.errors) {
          // Handle field-specific validation errors
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        } else {
          // If it's an object but we can't find specific fields, stringify it
          errorMessage = JSON.stringify(errorData);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '0',
      category: '',
      currency: 'TZS',
      unit: 'pcs',
      stock: '0',
      isActive: true,
      imageMode: 'upload',
      imageUrl: '',
      imageFile: null,
    });
    setImagePreview(null);
    setErrors({});
  };

  // Helper function to get safe form values
  const getSafeValue = <K extends keyof FormData>(key: K, fallback: FormData[K]) => {
    const value = form[key];
    return value === undefined || value === null ? fallback : value;
  };

  const currentPreview = getSafeValue('imageMode', 'upload') === 'url' && getSafeValue('imageUrl', '') ? getSafeValue('imageUrl', '') : imagePreview;

  // Don't render form if not properly initialized
  if (!open) return null;

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
                  value={getSafeValue('name', '')}
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
                  value={getSafeValue('description', '')}
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
                      value={getSafeValue('price', '0')}
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
                    value={getSafeValue('category', '')}
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
                  <label htmlFor="stock" className="form-label">
                    {t('admin_stock') || 'Stock'}
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                    id="stock"
                    min="0"
                    value={getSafeValue('stock', '0')}
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
                    checked={getSafeValue('imageMode', 'upload') === 'upload'}
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
                    checked={getSafeValue('imageMode', 'upload') === 'url'}
                    onChange={() => { updateField('imageMode', 'url'); clearImage(); }}
                  />
                  <label className="btn btn-outline-primary" htmlFor="img-url">
                    <Link size={14} className="me-1" /> Image URL
                  </label>
                </div>

                {getSafeValue('imageMode', 'upload') === 'upload' ? (
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
                    <small className="text-muted">PNG, JPG, WEBP · max 1MB</small>
                  </div>
                ) : (
                  <div className="mb-3">
                    <input
                      type="url"
                      className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`}
                      value={getSafeValue('imageUrl', '')}
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

              {/* Form buttons */}
              <div className="d-flex justify-content-end gap-2">
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
            </form>
          </div>
          <div className="modal-footer border-0">
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;

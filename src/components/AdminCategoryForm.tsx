import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';

interface AdminCategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (category: Category) => void;
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({ 
  open, 
  onClose, 
  category, 
  onSave 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Category>>({
    id: '',
    name: '',
    slug: '',
    description: '',
    icon: 'bi-tag'
  });

  React.useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ id: '', name: '', slug: '', description: '', icon: 'bi-tag' });
    }
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      return;
    }

    const newCategory: Category = {
      id: formData.id || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
      name: formData.name.trim(),
      description: formData.description?.trim(),
      slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
      icon: formData.icon || 'bi-tag'
    };

    onSave(newCategory);
    onClose();
    setFormData({ id: '', name: '', slug: '', description: '', icon: 'bi-tag' });
  };

  const availableIcons = [
    'bi-tag', 'bi-tools', 'bi-lightning', 'bi-droplet', 
    'bi-palette', 'bi-bricks', 'bi-flower1', 'bi-box',
    'bi-gear', 'bi-wrench', 'bi-hammer', 'bi-house',
    'bi-basket', 'bi-cart', 'bi-bag', 'bi-package'
  ];

  if (!open) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-tag me-2"></i>
              {category ? t('admin_edit') : t('admin_add_category')}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="categoryName" className="form-label">
                  {t('admin_category')} Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="categoryDescription" className="form-label">
                  {t('admin_category')} Description
                </label>
                <textarea
                  className="form-control"
                  id="categoryDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                  rows={3}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="categoryIcon" className="form-label">
                  {t('admin_category')} Icon
                </label>
                <select
                  className="form-select"
                  id="categoryIcon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              {formData.icon && (
                <div className="mb-3">
                  <label className="form-label">Preview</label>
                  <div className="d-flex align-items-center gap-2 p-3 border rounded">
                    <i className={`bi ${formData.icon} fs-4`}></i>
                    <span>{formData.name || 'Category Name'}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-1"></i>
                {t('admin_cancel')}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                <i className="bi bi-check-lg me-1"></i>
                {category ? t('admin_save') : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryForm;

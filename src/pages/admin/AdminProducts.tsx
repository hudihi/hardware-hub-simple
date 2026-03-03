import React, { useEffect, useState } from 'react';
import AdminCategoryForm from '../../components/AdminCategoryForm';
import { useLanguage } from '../../context/LanguageContext';
import { AdminProduct, adminService } from '../../services/admin.service';
import { API_BASE_URL } from '../../services/api';
import categoryService from '../../services/category.service';
import { Category } from '../../types';
import { formatPrice } from '../../utils/format';
import AdminProductForm from './AdminProductForm';

const AdminProducts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { t } = useLanguage();

  const pageSize = 10;

  // Load categories from API on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryService.getAllCategories();
        setCategoriesList(categories);
      } catch (error: any) {
        console.error('Failed to load categories:', error);
        
        // Show specific error message for loading
        let errorMessage = 'Failed to load categories.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Permission denied. You do not have access to view categories.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Could show a toast or alert here instead
        console.warn(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load products from API
  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setError('');
      
      const response = await adminService.getAllProducts(
        currentPage,
        pageSize,
        selectedCategory || undefined,
        searchQuery || undefined
      );
      
      setProducts(response.items);
      setTotalProducts(response.total);
      setTotalPages(response.pages);
      console.log(`Loaded ${response.items.length} products (page ${currentPage} of ${response.pages})`);
    } catch (error: any) {
      console.error('Failed to fetch admin products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        await fetchProducts(); // Refresh products list
      } catch (error: any) {
        console.error('Failed to delete product:', error);
        alert(error.message || 'Failed to delete product');
      }
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categoriesList.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  // Helper function to get full image URL
  const getImageUrl = (product: AdminProduct): string => {
    // Get the primary image from the images array, or fallback to image_url, then placeholder
    const primaryImage = product.images?.find((img: any) => img.is_primary);
    const imageUrl = primaryImage?.url || product.image_url;
    
    // If it's already a full URL (starts with http), return as is
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path starting with /media/, prepend the base URL
    if (imageUrl && imageUrl.startsWith('/media/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // Otherwise, return placeholder
    return '/placeholder.svg';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterReset = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = await categoryService.updateCategory(editingCategory.id, {
          name: category.name,
          description: category.description || ''
        });
        
        setCategoriesList(categoriesList.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...updatedCategory } : cat
        ));
      } else {
        // Add new category
        const newCategory = await categoryService.createCategory({
          name: category.name,
          description: category.description || ''
        });
        
        setCategoriesList([...categoriesList, newCategory]);
      }
      setEditingCategory(null);
      setShowCategoryForm(false);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      
      // Show more specific error message
      let errorMessage = 'Failed to save category. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You do not have access to create categories.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data. Please check your input and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        setCategoriesList(categoriesList.filter(cat => cat.id !== categoryId));
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        
        // Show more specific error message
        let errorMessage = 'Failed to delete category. Please try again.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Permission denied. You do not have access to delete categories.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Category not found.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">{t('admin_products')}</h4>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus me-1"></i>
          {t('admin_add_product')}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={handleFilterReset}>
            Reset Filters
          </button>
        </div>
      )}

      <div className="card-pahala card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input 
                type="text" 
                className="form-control" 
                placeholder={t('admin_search_products')} 
                value={searchQuery} 
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }} 
              />
            </div>
            <div className="col-md-6">
              <select 
                className="form-select" 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">{t('admin_all_categories')}</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card-pahala card">
        <div className="card-body p-0">
          {productsLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-muted">{t('admin_no_products_found')}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t('admin_products')}</th>
                    <th>{t('admin_category')}</th>
                    <th>{t('admin_price')}</th>
                    <th>{t('admin_stock')}</th>
                    <th>{t('admin_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img 
                            src={getImageUrl(product)} 
                            alt={product.name} 
                            className="rounded" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} 
                          />
                          <div>
                            <div className="fw-semibold">{product.name}</div>
                            <small className="text-muted">{product.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {getCategoryName(product.category_id)}
                        </span>
                      </td>
                      <td className="text-brown fw-semibold">
                        {formatPrice(product.price)}/{product.unit_of_measure}
                      </td>
                      <td>
                        <span className={`badge ${product.stock_quantity > 20 ? 'bg-success' : product.stock_quantity > 5 ? 'bg-warning' : 'bg-danger'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEditProduct(product)}
                            title="Edit product"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            {t('admin_showing')} {products.length} {t('admin_of')} {totalProducts} {t('admin_products').toLowerCase()}
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Categories Management Section */}
      {!loading && (
        <div className="card-pahala card mt-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-tags me-2"></i>
              {t('admin_manage_categories')}
            </h5>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
            >
              <i className="bi bi-plus me-1"></i>
              {t('admin_add_category')}
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Icon</th>
                    <th>{t('admin_category')}</th>
                    <th>Description</th>
                    <th>ID</th>
                    <th>{t('admin_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesList.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <i className={`bi ${category.icon || 'bi-tag'} fs-5`}></i>
                      </td>
                      <td className="fw-semibold">{category.name}</td>
                      <td className="text-muted small">{category.description || '-'}</td>
                      <td><code className="text-muted small">{category.id}</code></td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEditCategory(category)}
                            title="Edit category"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            title="Delete category"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {categoriesList.length === 0 && (
              <div className="text-center text-muted py-4">
                <i className="bi bi-tags fs-1 d-block mb-2"></i>
                No categories found. Add your first category to get started.
              </div>
            )}
          </div>
        </div>
      )}

      <AdminProductForm 
        open={showForm} 
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }} 
        onProductCreated={fetchProducts}
        editingProduct={editingProduct}
      />
      <AdminCategoryForm 
        open={showCategoryForm} 
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }} 
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default AdminProducts;

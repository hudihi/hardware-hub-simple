import SearchBar from '@/components/SearchBar';
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import OptimizedProductGrid from '../components/OptimizedProductGrid';
import { useLanguage } from '../context/LanguageContext';
import apiClient from '../services/api';
import { productService } from '../services/product.service';
import { Category, Product } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';
import { processImageUrl } from '../utils/imageUrlUtils';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const { t } = useLanguage();

  // Fetch products on component mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get raw API response instead of processed Product items, sorted by most recent
        const response = await apiClient.get('/api/v1/products/', {
          params: { page: 1, size: 100, ordering: '-created_at' }
        });
        
        // Extract items from raw API response
        const productsData = response.data?.items || [];
        // Map API response to match Product interface expected by components
        const mappedProducts = productsData.map((apiProduct: any) => {
          // Use the same image processing as ProductDetailPage
          const primaryImage = apiProduct.images?.find((img: any) => img.is_primary);
          const rawImageUrl = primaryImage?.url || apiProduct.image_url || '/placeholder.svg';
          const processedImageUrl = processImageUrl(rawImageUrl);
          
          return {
            id: apiProduct.id,
            name: apiProduct.name,
            description: apiProduct.description,
            price: apiProduct.price,
            unit: apiProduct.unit_of_measure, // Map unit_of_measure to unit
            image: processedImageUrl, // Use processed image URL like ProductDetailPage
            category: apiProduct.category_id, // Map category_id to category
            stock: apiProduct.stock_quantity, // Map stock_quantity to stock
          };
        });
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const fetchedCategories = await productService.getCategories();
        // Map API categories to match Category interface expected by components
        const mappedCategories = fetchedCategories.map(apiCategory => {
          return {
            id: apiCategory.id,
            name: apiCategory.name,
            slug: apiCategory.name.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
            icon: getCategoryIcon(apiCategory.name), // Generate icon based on name
            description: apiCategory.description
          };
        });
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const featuredProducts = products.slice(0, 20);

  // Sample suggestions and recent searches (in a real app, these would come from API/localStorage)
  const suggestions = [
    'Power Tools',
    'Hand Tools',
    'Drilling Machine',
    'Electric Saw',
    'Measuring Tools',
    'Safety Equipment',
    'Garden Tools',
    'Painting Supplies'
  ];

  const recentSearches = [
    'Hammer',
    'Screwdriver Set',
    'Power Drill'
  ];

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      
      // Save to recent searches (in a real app, this would be saved to localStorage)
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="h4 fw-bold mb-2">{t('home_welcome')}</h1>
          <p className="mb-3 opacity-75">{t('home_subtitle')}</p>

          <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          placeholder={t('home_search_placeholder')}
          suggestions={suggestions}
          recentSearches={recentSearches}
          isLoading={isLoading}
          />
          
          {/* <HeroSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder={t('home_search_placeholder')}
            suggestions={suggestions}
            recentSearches={recentSearches}
            isLoading={isLoading}
          /> */}
        </div>
      </div>

      <div className="container">
        {/* Categories */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">{t('home_categories')}</h2>
            <Link to="/products" className="text-brown text-decoration-none small">
              {t('home_view_all')} <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          
          <div className="row g-2">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="col-4 col-md-2">
                  <div className="category-card-placeholder">
                    <div className="spinner-border spinner-border-sm text-brown" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              categories.map((category) => (
                <div key={category.id} className="col-4 col-md-2">
                  <CategoryCard category={category} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-header mb-0">{t('home_featured')}</h2>
            <Link to="/products" className="text-brown text-decoration-none small">
              {t('home_view_all')} <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          
          <OptimizedProductGrid
            initialProducts={featuredProducts}
            pageSize={20}
            showLoadMore={false}
          />
        </div>

        {/* Contact Section */}
        <div className="card-pahala card mb-4">
          <div className="card-body text-center py-4">
            <i className="bi bi-headset fs-1 text-brown mb-2 d-block"></i>
            <h5 className="fw-bold mb-2">{t('home_need_help')}</h5>
            <p className="text-muted mb-3 small">
              {t('home_help_text')}
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <a
                href="https://wa.me/+255694352388"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg-mobile"
              >
                <i className="bi bi-whatsapp me-2"></i>
                WhatsApp
              </a>
              <a
                href="tel:+255694352388"
                className="btn btn-outline-primary btn-lg-mobile"
              >
                <i className="bi bi-telephone me-2"></i>
                {t('home_call')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../context/LanguageContext';
import { categories } from '../data/products';
import { API_BASE_URL } from '../services/api';
import { productService } from '../services/product.service';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const { t } = useLanguage();

  const getImageUrl = (apiProduct: any): string => {
    // Get the primary image from the images array, or fallback to image_url, then placeholder
    const primaryImage = apiProduct.images?.find((img: any) => img.is_primary);
    const imageUrl = primaryImage?.url || apiProduct.image_url;
    
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

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productService.getProducts();
        // Map API response to match Product interface expected by components
        const mappedProducts = fetchedProducts.map(apiProduct => {
          return {
            id: apiProduct.id,
            name: apiProduct.name,
            description: apiProduct.description,
            price: apiProduct.price,
            unit: apiProduct.unit_of_measure, // Map unit_of_measure to unit
            image: getImageUrl(apiProduct), // Use getImageUrl to handle uploaded images
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

    fetchProducts();
  }, []);

  // Suggestions based on fetched products and categories
  const suggestions = useMemo(() => {
    return [
      ...categories.map(cat => cat.name),
      ...products.slice(0, 10).map(product => product.name)
    ];
  }, [products]);

  const recentSearches = [
    'Power Tools',
    'Hand Tools',
    'Drilling Machine'
  ];

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [searchQuery, selectedCategory, products]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container py-3">
        {/* Search Bar */}
        <div className="mb-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder={t('home_search_placeholder')}
            suggestions={suggestions}
            recentSearches={recentSearches}
            isLoading={isLoading}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4 overflow-auto hide-scrollbar">
          <div className="d-flex gap-2" style={{ minWidth: 'max-content' }}>
            <button
              className={`btn ${
                selectedCategory === '' ? 'btn-primary' : 'btn-outline-secondary'
              } btn-sm rounded-pill`}
              onClick={() => handleCategoryChange('')}
            >
              {t('products_all')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`btn ${
                  selectedCategory === category.id
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                } btn-sm rounded-pill`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <i className={`bi ${category.icon} me-1`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-muted small mb-3">
          {t('nav_products')} {!productsLoading ? filteredProducts.length : 0} {t('products_found')}
        </p>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-muted" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="row g-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h5>{t('products_none')}</h5>
            <p className="text-muted">{t('products_try_different')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

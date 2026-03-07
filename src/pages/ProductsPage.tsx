import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../context/LanguageContext';
import { productService } from '../services/product.service';
import { Category, Product } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';
import { getProductImageUrl } from '../utils/imageUrlUtils';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useLanguage();

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productService.getProducts();
        // Map API response to match Product interface expected by components
        const mappedProducts = fetchedProducts.map(apiProduct => {
          const imageUrl = getProductImageUrl(apiProduct);
          console.log(`Product: ${apiProduct.name}, Image URL: ${imageUrl}`);
          console.log('API Product data:', apiProduct);
          return {
            id: apiProduct.id,
            name: apiProduct.name,
            description: apiProduct.description,
            price: apiProduct.price,
            unit: apiProduct.unit_of_measure, // Map unit_of_measure to unit
            image: imageUrl, // Use centralized utility to handle uploaded images
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

  // Suggestions based on fetched products and categories
  const suggestions = useMemo(() => {
    return [
      ...categories.map(cat => cat.name),
      ...products.slice(0, 10).map(product => product.name)
    ];
  }, [products, categories]);

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
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <button key={index} className="btn btn-outline-secondary btn-sm rounded-pill" disabled>
                  <div className="spinner-border spinner-border-sm me-1" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading...
                </button>
              ))
            ) : (
              categories.map((category) => (
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
              ))
            )}
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../context/LanguageContext';
import { PaginatedProductsResponse, productService } from '../services/product.service';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [allProductsCache, setAllProductsCache] = useState<Product[]>([]);
  const [cacheInitialized, setCacheInitialized] = useState(false);
  const { t } = useLanguage();
  
  // Ref for infinite scroll detection
  const observer = useRef<IntersectionObserver>();
  const lastProductRef = useRef<HTMLDivElement>(null);

  // Products per page for infinite scroll
  const PAGE_SIZE = 20;

  // Initialize cache with all products
  const initializeCache = useCallback(async () => {
    if (cacheInitialized) return;
    
    let allProducts: any[] = [];
    
    try {
      setProductsLoading(true);
      console.log('Starting cache initialization...');
      
      // Fetch products in batches of 100 (API maximum)
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages && currentPage <= 10) { // Limit to 10 pages (1000 products max)
        try {
          const response: PaginatedProductsResponse = await productService.getProducts(currentPage, 100);
          const pageProducts = response.items || [];
          console.log(`Page ${currentPage} fetched:`, pageProducts.length, 'products');
          
          if (pageProducts.length === 0) {
            hasMorePages = false;
            break;
          }
          
          allProducts = [...allProducts, ...pageProducts];
          
          // Check if there are more pages
          if (response.pages && currentPage >= response.pages) {
            hasMorePages = false;
          } else if (pageProducts.length < 100) {
            // If we got less than 100, we're probably at the end
            hasMorePages = false;
          }
          
          currentPage++;
        } catch (pageError) {
          console.error(`Failed to fetch page ${currentPage}:`, pageError);
          hasMorePages = false;
        }
      }
      
      console.log('Total products fetched:', allProducts.length);
      
      if (allProducts.length === 0) {
        console.warn('No products returned from API');
        setProducts([]);
        setTotalCount(0);
        setHasMore(false);
        setCacheInitialized(true);
        return;
      }
      
      // Map and cache all products
      const mappedProducts = allProducts.map(apiProduct => {
        const imageUrl = getProductImageUrl(apiProduct);
        return {
          id: apiProduct.id,
          name: apiProduct.name,
          description: apiProduct.description,
          price: apiProduct.price,
          unit: apiProduct.unit_of_measure,
          image: imageUrl,
          category: apiProduct.category_id,
          stock: apiProduct.stock_quantity,
        };
      });
      
      setAllProductsCache(mappedProducts);
      setTotalCount(mappedProducts.length);
      setCacheInitialized(true);
      
      // Load first page
      const firstPage = mappedProducts.slice(0, PAGE_SIZE);
      setProducts(firstPage);
      setHasMore(mappedProducts.length > PAGE_SIZE);
      setCurrentPage(1);
      
      console.log('Cache initialized with', mappedProducts.length, 'products');
    } catch (error) {
      console.error('Failed to initialize cache:', error);
      setCacheInitialized(true); // Prevent infinite loading
    } finally {
      setProductsLoading(false);
    }
  }, [cacheInitialized]);

  // Load more products from cache
  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasMore && !searchQuery && !selectedCategory && cacheInitialized) {
      setIsLoadingMore(true);
      
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const nextProducts = allProductsCache.slice(startIndex, endIndex);
      
      setTimeout(() => {
        setProducts(prev => [...prev, ...nextProducts]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < allProductsCache.length);
        setIsLoadingMore(false);
        
        console.log('Loaded more products:', {
          page: nextPage,
          startIndex,
          endIndex,
          newItems: nextProducts.length,
          totalLoaded: products.length + nextProducts.length
        });
      }, 300); // Small delay for better UX
    }
  }, [currentPage, hasMore, isLoadingMore, searchQuery, selectedCategory, cacheInitialized, allProductsCache, products.length]);

  // Setup infinite scroll observer
  useEffect(() => {
    const currentObserver = observer.current;
    const currentLastProduct = lastProductRef.current;

    if (currentObserver) {
      currentObserver.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (currentLastProduct) {
      observer.current.observe(currentLastProduct);
    }

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [loadMoreProducts, hasMore, isLoadingMore]);

  // Initial fetch
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await productService.getCategories();
        const mappedCategories = fetchedCategories.map(apiCategory => {
          return {
            id: apiCategory.id,
            name: apiCategory.name,
            slug: apiCategory.name.toLowerCase().replace(/\s+/g, '-'),
            icon: getCategoryIcon(apiCategory.name),
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

    initializeCache();
    fetchCategories();
  }, [initializeCache]);

  // Reset products when filters change
  useEffect(() => {
    if (searchQuery || selectedCategory) {
      // For filtered results, filter from cache
      if (cacheInitialized) {
        let filtered = allProductsCache;

        if (selectedCategory) {
          filtered = filtered.filter(product => product.category === selectedCategory);
        }

        if (searchQuery.trim()) {
          filtered = filtered.filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setProducts(filtered);
        setTotalCount(filtered.length);
        setHasMore(false);
      }
    } else {
      // Reset to infinite scroll when no filters
      if (cacheInitialized) {
        const firstPage = allProductsCache.slice(0, PAGE_SIZE);
        setProducts(firstPage);
        setHasMore(allProductsCache.length > PAGE_SIZE);
        setCurrentPage(1);
        setTotalCount(allProductsCache.length);
      }
    }
  }, [searchQuery, selectedCategory, cacheInitialized, allProductsCache]);

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

        {/* Products Grid */}
        {productsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-muted" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="row g-3">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="col-6 col-md-4 col-lg-3"
                  ref={index === filteredProducts.length - 1 ? lastProductRef : null}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            
            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-muted me-2" role="status">
                  <span className="visually-hidden">Loading more...</span>
                </div>
                <span className="text-muted small">Loading more products...</span>
              </div>
            )}
          </>
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

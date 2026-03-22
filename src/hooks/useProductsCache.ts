import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService, PaginatedProductsResponse, Product } from '../services/product.service';

interface CachedData {
  products: Product[];
  total: number;
  lastFetched: number;
}

interface UseProductsCacheOptions {
  pageSize?: number;
  cacheTimeout?: number; // in milliseconds
  enableCache?: boolean;
}

const CACHE_KEY = 'products_cache';
const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const useProductsCache = (options: UseProductsCacheOptions = {}) => {
  const {
    pageSize = 20,
    cacheTimeout = DEFAULT_CACHE_TIMEOUT,
    enableCache = true
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Load cached data
  const loadCachedData = useCallback((): CachedData | null => {
    if (!enableCache) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - parsed.lastFetched < cacheTimeout) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load cached products:', error);
    }
    
    // Remove expired cache
    localStorage.removeItem(CACHE_KEY);
    return null;
  }, [enableCache, cacheTimeout]);

  // Save data to cache
  const saveToCache = useCallback((data: Product[], total: number) => {
    if (!enableCache) return;
    
    try {
      const cacheData: CachedData = {
        products: data,
        total,
        lastFetched: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache products:', error);
    }
  }, [enableCache]);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedProductsResponse = await productService.getProducts(page, pageSize);
      const newProducts = response.items || [];
      
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setHasMore(newProducts.length === pageSize && products.length + newProducts.length < response.total);
      setCurrentPage(page);
      
      // Cache only the first page for now
      if (page === 1) {
        saveToCache(newProducts, response.total);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [pageSize, products.length, saveToCache]);

  // Load more products (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProducts(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchProducts]);

  // Initial load with cache
  useEffect(() => {
    const cached = loadCachedData();
    
    if (cached) {
      setProducts(cached.products);
      setHasMore(cached.products.length < cached.total);
      setCurrentPage(1);
    } else {
      fetchProducts(1, false);
    }
  }, [loadCachedData, fetchProducts]);

  // Refresh data (bypass cache)
  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Memoized products for performance
  const memoizedProducts = useMemo(() => products, [products]);

  return {
    products: memoizedProducts,
    loading,
    error,
    hasMore,
    currentPage,
    fetchProducts,
    loadMore,
    refresh,
    clearCache: () => localStorage.removeItem(CACHE_KEY)
  };
};

export default useProductsCache;

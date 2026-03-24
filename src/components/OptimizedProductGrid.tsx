import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { optimizedProductService } from '../services/optimizedProduct.service';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface OptimizedProductGridProps {
  initialProducts?: Product[];
  pageSize?: number;
  showLoadMore?: boolean;
  searchQuery?: string;
  categoryFilter?: string;
}

const OptimizedProductGrid: React.FC<OptimizedProductGridProps> = ({
  initialProducts = [],
  pageSize = 20,
  showLoadMore = true,
  searchQuery = '',
  categoryFilter = ''
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    return filtered;
  }, [products, searchQuery, categoryFilter]);

  // Products to display (for infinite scroll)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await optimizedProductService.getProductsOptimized(
        currentPage + 1,
        pageSize
      );
      
      const newProducts = response.items || [];
      setProducts(prev => [...prev, ...newProducts] as Product[]);
      setCurrentPage(prev => prev + 1);
      setHasMore(newProducts.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, pageSize]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        setVisibleCount(prev => Math.min(prev + pageSize, filteredProducts.length));
      }
    };

    if (showLoadMore) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showLoadMore, filteredProducts.length, pageSize]);

  // Initial load
  useEffect(() => {
    if (initialProducts.length > 0) {
      // Use the provided initial products instead of fetching
      setProducts(initialProducts as Product[]);
      setHasMore(false); // No more products since we're using initial data
    } else {
      loadMore();
    }
  }, [initialProducts]);

  // Clear cache
  const clearCache = useCallback(() => {
    optimizedProductService.clearCache();
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setVisibleCount(pageSize);
    loadMore();
  }, [loadMore, pageSize]);

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger">
          {error}
        </div>
        <button className="btn btn-primary" onClick={clearCache}>
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0 && loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading products...</span>
        </div>
        <p className="mt-3 text-muted">Loading amazing products...</p>
      </div>
    );
  }

  if (displayedProducts.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <div className="empty-state">
          <div className="mb-3">
            <i className="bi bi-search display-1 text-muted"></i>
          </div>
          <h5 className="text-muted">No products found</h5>
          <p className="text-muted">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="optimized-product-grid">
      {/* Products Grid */}
      <div className="row g-3">
        {displayedProducts.map((product, index) => (
          <div key={product.id} className="col-6 col-md-4 col-lg-3">
            <div 
              className="product-card-wrapper"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <ProductCard product={product} />
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </>
            ) : (
              <>
                Load More Products
                <i className="bi bi-arrow-down-circle ms-2"></i>
              </>
            )}
          </button>
        </div>
      )}

      {/* End of Products */}
      {!hasMore && displayedProducts.length > 0 && (
        <div className="text-center mt-4 mb-5">
          <p className="text-muted">
            <i className="bi bi-check-circle text-success me-2"></i>
            You've reached the end of our product catalog
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center mt-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading more...</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card-wrapper {
          opacity: 0;
        }

        .optimized-product-grid {
          min-height: 400px;
        }

        .empty-state {
          padding: 3rem 1rem;
        }
      `}</style>
    </div>
  );
};

export default OptimizedProductGrid;

import apiClient from './api';
import { Category, PaginatedProductsResponse, Product } from './product.service';

// Extended Product interface with images support
interface ProductWithImages extends Product {
  images?: Array<{
    id: string;
    url: string;
    is_primary: boolean;
    product_id: string;
    created_at: string;
  }>;
}

// Optimized product service with performance enhancements
class OptimizedProductService {
  private imageCache = new Map<string, string>();
  private productCache = new Map<string, Product>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get products with optimized caching and image preloading
   */
  async getProductsOptimized(page: number = 1, size: number = 20): Promise<PaginatedProductsResponse> {
    const cacheKey = `products_${page}_${size}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get('/api/v1/products/', {
        params: { page, size }
      });
      
      const result = response.data?.items ? response.data : {
        items: Array.isArray(response.data) ? response.data : [],
        total: response.data?.total || 0,
        page,
        size,
        pages: response.data?.pages || 1
      };

      // Preload images for better UX
      this.preloadImages(result.items.slice(0, 10)); // Preload first 10 images
      
      // Cache the result
      this.setCachedData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  /**
   * Get categories with caching
   */
  async getCategoriesOptimized(): Promise<Category[]> {
    const cacheKey = 'categories';
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get('/api/v1/categories/');
      const categories = response.data || [];
      
      this.setCachedData(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Search products with debouncing and caching
   */
  async searchProducts(query: string, page: number = 1, size: number = 20): Promise<PaginatedProductsResponse> {
    if (!query.trim()) {
      return this.getProductsOptimized(page, size);
    }

    const cacheKey = `search_${query}_${page}_${size}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.get('/api/v1/products/', {
        params: { search: query.trim(), page, size }
      });
      
      const result = response.data?.items ? response.data : {
        items: Array.isArray(response.data) ? response.data : [],
        total: response.data?.total || 0,
        page,
        size,
        pages: response.data?.pages || 1
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }

  /**
   * Preload images for faster rendering
   */
  private preloadImages(products: ProductWithImages[]): void {
    products.forEach(product => {
      const imageUrl = this.getOptimizedImageUrl(product);
      if (imageUrl && !this.imageCache.has(imageUrl)) {
        const img = new Image();
        img.onload = () => {
          this.imageCache.set(imageUrl, imageUrl);
        };
        img.onerror = () => {
          this.imageCache.set(imageUrl, '/placeholder.svg');
        };
        img.src = imageUrl;
      }
    });
  }

  /**
   * Get optimized image URL with caching and resizing
   */
  getOptimizedImageUrl(product: ProductWithImages): string {
    const cacheKey = `img_${product.id}`;
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    let imageUrl = '/placeholder.svg';

    // Try to get primary image
    if (product.images && Array.isArray(product.images)) {
      const primaryImage = product.images.find((img: any) => img.is_primary);
      if (primaryImage?.url) {
        imageUrl = this.optimizeImageUrl(primaryImage.url);
      }
    }

    // Fallback to image_url
    if (imageUrl === '/placeholder.svg' && product.image_url) {
      imageUrl = this.optimizeImageUrl(product.image_url);
    }

    // Cache the result
    this.imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  }

  /**
   * Optimize image URL for faster loading
   */
  private optimizeImageUrl(url: string): string {
    if (!url) return '/placeholder.svg';
    
    // If already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }

    // If relative path, add base URL
    if (url.startsWith('/media/')) {
      return `https://api.pahala.store${url}`;
    }

    return url;
  }

  /**
   * Get cached data if not expired
   */
  private getCachedData(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.productCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.productCache.get(key);
  }

  /**
   * Set cached data with expiry
   */
  private setCachedData(key: string, data: any): void {
    this.productCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.productCache.clear();
    this.cacheExpiry.clear();
    this.imageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      productCacheSize: this.productCache.size,
      imageCacheSize: this.imageCache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of caches
   */
  private estimateMemoryUsage(): string {
    let totalSize = 0;
    
    // Estimate product cache size
    for (const [key, value] of this.productCache.entries()) {
      totalSize += key.length * 2 + JSON.stringify(value).length * 2;
    }
    
    // Estimate image cache size
    for (const [key, value] of this.imageCache.entries()) {
      totalSize += key.length * 2 + value.length * 2;
    }
    
    if (totalSize < 1024) return `${totalSize} bytes`;
    if (totalSize < 1024 * 1024) return `${Math.round(totalSize / 1024)} KB`;
    return `${Math.round(totalSize / (1024 * 1024))} MB`;
  }
}

export const optimizedProductService = new OptimizedProductService();
export default optimizedProductService;

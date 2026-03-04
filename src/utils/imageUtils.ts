interface ImageCache {
  [url: string]: HTMLImageElement;
}

class ImageOptimizer {
  private cache: ImageCache = {};
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  // Preload an image and cache it
  preloadImage(url: string): Promise<HTMLImageElement> {
    // Return from cache if already loaded
    if (this.cache[url]) {
      return Promise.resolve(this.cache[url]);
    }

    // Return existing promise if currently loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache[url] = img;
        this.loadingPromises.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Start loading
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  // Preload multiple images in parallel
  preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(url => this.preloadImage(url).catch(() => null));
    return Promise.all(promises) as Promise<HTMLImageElement[]>;
  }

  // Check if image is cached
  isImageLoaded(url: string): boolean {
    return !!this.cache[url];
  }

  // Get cached image dimensions
  getImageDimensions(url: string): { width: number; height: number } | null {
    const img = this.cache[url];
    if (!img) return null;
    return { width: img.naturalWidth, height: img.naturalHeight };
  }

  // Generate optimized image URL with size parameters (if backend supports)
  getOptimizedUrl(url: string, width?: number, height?: number): string {
    if (!url || url === '/placeholder.svg') return url;
    
    // If URL already has query parameters, add to them
    const separator = url.includes('?') ? '&' : '?';
    
    let optimizedUrl = url;
    if (width) optimizedUrl += `${separator}w=${width}`;
    if (height) optimizedUrl += `${optimizedUrl === url ? separator : '&'}h=${height}`;
    
    return optimizedUrl;
  }

  // Clear cache (useful for memory management)
  clearCache(): void {
    this.cache = {};
    this.loadingPromises.clear();
  }
}

// Singleton instance
const imageOptimizer = new ImageOptimizer();

export default imageOptimizer;

// Hook for React components
export const useImagePreloader = () => {
  const preloadImage = (url: string) => imageOptimizer.preloadImage(url);
  const preloadImages = (urls: string[]) => imageOptimizer.preloadImages(urls);
  const isImageLoaded = (url: string) => imageOptimizer.isImageLoaded(url);
  const getOptimizedUrl = (url: string, width?: number, height?: number) => 
    imageOptimizer.getOptimizedUrl(url, width, height);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    getOptimizedUrl,
    getImageDimensions: (url: string) => imageOptimizer.getImageDimensions(url)
  };
};

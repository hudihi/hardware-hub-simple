import apiClient from './api';

// Types for Product API
export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit_of_measure: string;
  category_id: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  unit_of_measure: string;
  category_id: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
}

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ImageUploadResponse {
  url: string;
  is_primary: boolean;
  id: string;
  product_id: string;
  created_at: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

// Product Service
class ProductService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/api/v1/categories/');
      return response.data;
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to fetch categories',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.post('/api/v1/products/', productData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      const apiError: ApiError = {
        message: 'Failed to create product',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Upload image for a product
   * Note: This requires the product to be created first
   */
  async uploadProductImage(productId: string, file: File, isPrimary: boolean = false): Promise<ImageUploadResponse> {
    if (!file) {
      throw new Error("File is undefined or null");
    }

    const formData = new FormData();

    // MUST match backend parameter name exactly
    formData.append("file", file);
    formData.append("is_primary", String(isPrimary));

    console.log("Uploading file:", file);
    console.log("FormData entries:");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await apiClient.post(
        `/api/v1/admin/products/${productId}/images/upload`,
        formData
      );
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        message: 'Failed to upload image',
        status: error.response?.status,
        details: error.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Create product with image upload (combined operation)
   */
  async createProductWithImage(
    productData: CreateProductRequest,
    imageFile?: File
  ): Promise<Product> {
    try {
      console.log('Creating product with data:', productData);
      
      // First create the product
      const product = await this.createProduct(productData);
      console.log('Product created successfully:', product);
      
      // If there's an image file, upload it
      if (imageFile && product.id) {
        console.log('Uploading image for product:', product.id);
        await this.uploadProductImage(product.id, imageFile, true); // Set as primary image
        console.log('Image upload completed');
      } else {
        console.log('No image file provided or product ID missing');
      }
      
      return product;
    } catch (error: any) {
      console.error('Failed to create product with image:', error);
      
      // Preserve the original error structure for proper error handling
      const apiError: ApiError = {
        message: error?.message || 'Failed to create product with image',
        status: error?.status || error?.response?.status,
        details: error?.details || error?.response?.data
      };
      
      throw apiError;
    }
  }

  /**
   * Get all products (paginated)
   */
  async getProducts(page: number = 1, size: number = 100): Promise<PaginatedProductsResponse> {
    try {
      const response = await apiClient.get('/api/v1/products/', {
        params: { page, size }
      });
      
      console.log('Raw API Response:', response.data);
      
      // Handle paginated response structure
      if (response.data?.items && Array.isArray(response.data.items)) {
        // Backend supports pagination
        return {
          items: response.data.items,
          total: response.data.total || response.data.items.length,
          page: response.data.page || page,
          size: response.data.size || size,
          pages: response.data.pages || Math.ceil((response.data.total || response.data.items.length) / size)
        };
      } else if (Array.isArray(response.data)) {
        // Backend returns array - implement client-side pagination
        const allProducts = response.data;
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedItems = allProducts.slice(startIndex, endIndex);
        
        console.log('Client-side pagination:', {
          totalProducts: allProducts.length,
          page,
          size,
          startIndex,
          endIndex,
          itemsOnPage: paginatedItems.length
        });
        
        return {
          items: paginatedItems,
          total: allProducts.length,
          page: page,
          size: size,
          pages: Math.ceil(allProducts.length / size)
        };
      }
      
      return {
        items: [],
        total: 0,
        page: page,
        size: size,
        pages: 0
      };
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to fetch products',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Get all products (legacy method for backward compatibility)
   */
  async getProductsLegacy(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/api/v1/products/');
      
      // Handle paginated response structure
      if (response.data?.items) {
        return response.data.items;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to fetch products',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const response = await apiClient.get(`/api/v1/products/${productId}`);
      return response.data;
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to fetch product',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Find product by short ID (first 8 characters of UUID)
   * This searches through products efficiently to find a match
   */
  async findProductByShortId(shortId: string): Promise<Product | null> {
    try {
      let page = 1;
      const pageSize = 50; // Use smaller page size to avoid 422 errors
      
      // Search through pages until we find the product or exhaust all products
      while (true) {
        const response = await this.getProducts(page, pageSize);
        
        // Check if current page contains the product
        const product = response.items.find(p => p.id.startsWith(shortId));
        
        if (product) {
          return product;
        }
        
        // If we've reached the end of products, stop searching
        if (page >= response.pages || response.items.length === 0) {
          break;
        }
        
        page++;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding product by short ID:', error);
      const apiError: ApiError = {
        message: 'Failed to find product by short ID',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Update a product
   */
  async updateProduct(productId: string, productData: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await apiClient.put(`/api/v1/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to update product',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/products/${productId}`);
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to delete product',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
      };
      throw apiError;
    }
  }
}

export const productService = new ProductService();
export default productService;

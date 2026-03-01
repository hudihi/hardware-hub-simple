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
    } catch (error) {
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
  async uploadProductImage(productId: string, imageFile: File): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiClient.post(
        `/api/v1/admin/products/${productId}/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to upload image',
        status: (error as any)?.response?.status,
        details: (error as any)?.response?.data
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
      // First create the product
      const product = await this.createProduct(productData);
      
      // If there's an image file, upload it
      if (imageFile && product.id) {
        await this.uploadProductImage(product.id, imageFile);
      }
      
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/api/v1/products/');
      return response.data;
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

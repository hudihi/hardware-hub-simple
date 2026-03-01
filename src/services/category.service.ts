import { Category } from '../types';
import apiClient from './api';

// Types for category management
export interface CategoryRequest {
  name: string;
  description?: string;
  slug?: string;
}

export interface CategoryResponse {
  data: Category[];
  message: string;
}

export interface SingleCategoryResponse {
  data: Category;
  message: string;
}

// Category service
export const categoryService = {
  /**
   * Get all categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      // Try without trailing slash first
      let response;
      try {
        response = await apiClient.get('/api/v1/categories/');
      } catch (error: any) {
        // If that fails, try with trailing slash
        console.log('Trying with trailing slash...');
        response = await apiClient.get('/api/v1/admin/categories/');
      }
      
      console.log('Categories response:', response.status, response.data);
      
      // Handle different response structures
      if (response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data) {
        return [response.data];
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData: CategoryRequest): Promise<Category> => {
    try {
      console.log('Creating category:', categoryData);
      const response = await apiClient.post('/api/v1/admin/categories/', categoryData);
      console.log('Create category response:', response.status, response.data);
      
      // Handle different response structures
      if (response.data?.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      
      throw new Error('Invalid response structure');
    } catch (error: any) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  /**
   * Update an existing category
   */
  updateCategory: async (categoryId: string, categoryData: CategoryRequest): Promise<Category> => {
    try {
      console.log('Updating category:', categoryId, categoryData);
      const response = await apiClient.put(`/api/v1/admin/categories/${categoryId}`, categoryData);
      console.log('Update category response:', response);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Failed to update category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (categoryId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/admin/categories/${categoryId}`);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }
};

export default categoryService;

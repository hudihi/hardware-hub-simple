import apiClient from './api';

// Types for cart management
export interface CartItemRequest {
  product_id: string;
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface CartResponse {
  id: string;
  user_id: string;
  status: string;
  items: CartItemResponse[];
  total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCartResponse {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Cart service
export const cartService = {
  /**
   * Create a new cart
   */
  createCart: async (): Promise<CreateCartResponse> => {
    try {
      console.log('Creating new cart...');
      const response = await apiClient.post('/api/v1/cart/');
      console.log('Cart created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Get cart by ID
   */
  getCart: async (cartId: string): Promise<CartResponse> => {
    try {
      console.log('Getting cart:', cartId);
      const response = await apiClient.get(`/api/v1/cart/${cartId}`);
      console.log('Cart retrieved successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Cart not found');
      }
      
      throw error;
    }
  },

  /**
   * Add item to cart
   */
  addItem: async (cartId: string, productId: string, quantity: number): Promise<CartResponse> => {
    try {
      console.log('Adding item to cart:', { cartId, productId, quantity });
      const payload = {
        product_id: productId,
        quantity
      };
      console.log('Add item payload:', payload);
      
      const response = await apiClient.post(`/api/v1/cart/${cartId}/items`, payload);
      console.log('Add item response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid cart or product data';
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (cartId: string, itemId: string, quantity: number): Promise<CartResponse> => {
    try {
      const response = await apiClient.put(`/api/v1/cart/${cartId}/items/${itemId}`, {
        quantity
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId: string, itemId: string): Promise<CartResponse> => {
    try {
      const response = await apiClient.delete(`/api/v1/cart/${cartId}/items/${itemId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  },

  /**
   * Clear all items from cart
   */
  clearCart: async (cartId: string): Promise<CartResponse> => {
    try {
      const response = await apiClient.delete(`/api/v1/cart/${cartId}/items`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }
};

export default cartService;

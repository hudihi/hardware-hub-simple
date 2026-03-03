import apiClient from './api';

// Types for communication service
export interface ShareOrderResponse {
  whatsapp_url: string;
  message: string;
}

export interface ShareProductResponse {
  whatsapp_url: string;
  message: string;
}

// Communication service
export const communicationService = {
  /**
   * Share order via WhatsApp using API
   */
  shareOrder: async (orderId: string): Promise<ShareOrderResponse> => {
    try {
      console.log('Sharing order:', orderId);
      const response = await apiClient.get(`/api/v1/communication/order/${orderId}/share`);
      console.log('Share order response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to share order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You are not authorized to share this order.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      }
      
      throw error;
    }
  },

  /**
   * Share product via WhatsApp using API
   */
  shareProduct: async (productId: string): Promise<ShareProductResponse> => {
    try {
      console.log('Sharing product:', productId);
      const response = await apiClient.get(`/api/v1/communication/product/${productId}/share`);
      console.log('Share product response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to share product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You are not authorized to share this product.');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found.');
      }
      
      throw error;
    }
  },
};

export default communicationService;

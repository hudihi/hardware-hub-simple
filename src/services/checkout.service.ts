import apiClient from './api';

// Types for checkout
export interface CheckoutRequest {
  cart_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  order_notes: string;
  payment_method: 'PAY_ON_DELIVERY';
}

export interface CheckoutSummaryItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface CheckoutSummaryResponse {
  cart_id: string;
  items: CheckoutSummaryItem[];
  total_amount: number;
}

export interface CheckoutResponse {
  id: string;
  status: string;
  created_at: string;
}

export interface CustomerOrder {
  id: string;
  cart_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  order_notes: string;
  payment_method: string;
  status: string;
  total_amount: number;
  items: any[];
  created_at: string;
  updated_at: string;
}

// Checkout service
export const checkoutService = {
  /**
   * Get checkout summary for a cart
   */
  getCheckoutSummary: async (cartId: string): Promise<CheckoutSummaryResponse> => {
    try {
      console.log('Getting checkout summary for cart:', cartId);
      const response = await apiClient.get(`/api/v1/checkout/${cartId}/summary`);
      console.log('Checkout summary response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get checkout summary:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // If cart not found, empty, or already checked out, we can handle it gracefully
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Cart not found or empty';
        
        // Handle specific case of already checked out cart
        if (errorMessage.includes('already checked out')) {
          throw new Error('Cart already checked out');
        }
        
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },

  /**
   * Process checkout
   */
  processCheckout: async (checkoutData: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      console.log('Processing checkout with data:', checkoutData);
      const response = await apiClient.post('/api/v1/checkout/', checkoutData);
      console.log('Checkout response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to process checkout:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Get customer orders by phone number
   */
  getCustomerOrders: async (phoneNumber: string): Promise<CustomerOrder[]> => {
    try {
      // Security validation
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('Valid phone number is required');
      }

      // Clean and validate phone number
      const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Invalid phone number format');
      }

      console.log('Fetching orders for phone:', cleanPhone.substring(0, 3) + '****' + cleanPhone.substring(cleanPhone.length - 2));
      
      const response = await apiClient.get(`/api/v1/orders/?phone=${encodeURIComponent(cleanPhone)}`);
      
      // Security validation: Ensure response is array
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format - expected array:', response.data);
        throw new Error('Invalid response from server');
      }

      // Security validation: Validate each order has required fields
      const validatedOrders = response.data.filter((order: any) => {
        const hasRequiredFields = order.id && order.customer_phone && order.customer_name;
        if (!hasRequiredFields) {
          console.warn('Invalid order structure detected:', order.id);
        }
        return hasRequiredFields;
      });

      console.log(`Retrieved ${validatedOrders.length} valid orders from server`);
      return validatedOrders;
      
    } catch (error: any) {
      console.error('Failed to get customer orders:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Enhanced error handling for security
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You are not authorized to view these orders.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      throw error;
    }
  }
};

export default checkoutService;

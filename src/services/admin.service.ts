import apiClient from './api';

// Admin Order Types
export interface AdminOrder {
  id: string;
  cart_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  order_notes: string;
  payment_method: string;
  status: string;
  part_of_status: boolean; // Admin can update status if true - controlled by backend/admin system
  total_amount: number;
  items: any[];
  created_at: string;
  updated_at: string;
}

export interface AdminOrdersResponse {
  items: AdminOrder[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface OrderStatusUpdate {
  status: string;
}

// Admin service
export const adminService = {
  /**
   * Get all orders for admin dashboard
   */
  getAllOrders: async (page: number = 1, size: number = 10, status?: string, date_from?: string, date_to?: string): Promise<AdminOrdersResponse> => {
    try {
      console.log('Fetching admin orders with params:', { page, size, status, date_from, date_to });
      
      // Fix: Use correct parameter names and constraints according to API spec
      const validatedPage = Math.max(1, page); // API requires page >= 1
      const validatedSize = Math.max(1, Math.min(size, 100)); // API requires size between 1-100
      
      const params: any = {
        page: validatedPage,
        size: validatedSize
      };
      
      // Add optional parameters only if they are provided
      if (status) {
        params.status = status;
      }
      if (date_from) {
        params.date_from = date_from;
      }
      if (date_to) {
        params.date_to = date_to;
      }
      
      const response = await apiClient.get(`/api/v1/admin/orders/`, { params });
      
      console.log('Admin orders response:', response.data);
      
      // Validate response structure
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }
      
      // Handle different response formats
      const ordersData = response.data;
      
      // If response is directly an array (not paginated)
      if (Array.isArray(ordersData)) {
        return {
          items: ordersData,
          total: ordersData.length,
          page: validatedPage,
          size: validatedSize,
          pages: 1
        };
      }
      
      // If response is paginated object
      if (ordersData.items && Array.isArray(ordersData.items)) {
        return {
          items: ordersData.items,
          total: ordersData.total || ordersData.items.length,
          page: ordersData.page || validatedPage,
          size: ordersData.size || validatedSize,
          pages: ordersData.pages || 1
        };
      }
      
      // If response has unexpected structure
      console.warn('Unexpected response format:', ordersData);
      throw new Error('Unable to parse orders response');
      
    } catch (error: any) {
      console.error('Failed to get admin orders:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Enhanced error handling for admin operations
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 422) {
        // Validation error - provide more specific message
        const validationErrors = error.response?.data?.detail || error.response?.data?.errors;
        const errorMessage = validationErrors || 'Invalid request parameters';
        console.error('Validation errors:', validationErrors);
        throw new Error(`Validation error: ${errorMessage}`);
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      throw error;
    }
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (orderId: string): Promise<AdminOrder> => {
    try {
      console.log('Fetching admin order:', orderId);
      const response = await apiClient.get(`/api/v1/admin/orders/${orderId}`);
      console.log('Admin order response:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.id) {
        throw new Error('Invalid order response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to get admin order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      }
      
      throw error;
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: string): Promise<AdminOrder> => {
    try {
      console.log('Updating order status:', { orderId, status });
      
      // Validate status
      if (!status || typeof status !== 'string') {
        throw new Error('Valid status is required');
      }
      
      // Validate order ID
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Valid order ID is required');
      }
      
      const payload = { status: status };
      
      // Use PATCH method as specified by API
      console.log('Using PATCH method for order status update');
      const response = await apiClient.patch(`/api/v1/admin/orders/${orderId}/status`, payload);
      
      console.log('Order status updated successfully with PATCH:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Enhanced error handling
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Order not found.');
      } else if (error.response?.status === 405) {
        throw new Error('Method not allowed. The API endpoint may not support status updates.');
      } else if (error.response?.status === 400) {
        // Handle specific validation errors
        const errorDetail = error.response?.data?.detail || error.response?.data?.message;
        
        console.error('API Validation Error Detail:', errorDetail);
        console.error('Full Error Response:', error.response?.data);
        
        if (errorDetail?.includes('Invalid status transition')) {
          throw new Error(`Invalid status transition: ${errorDetail}`);
        } else if (errorDetail?.includes('Invalid status')) {
          throw new Error(`Invalid status value: ${errorDetail}`);
        } else if (errorDetail?.includes('already')) {
          throw new Error(`Status already updated: ${errorDetail}`);
        } else if (errorDetail?.includes('not allowed')) {
          throw new Error(`Status change not allowed: ${errorDetail}`);
        } else {
          const validationErrors = error.response?.data?.errors || errorDetail || 'Unknown validation error';
          throw new Error(`Validation error: ${validationErrors}`);
        }
      } else if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.detail || error.response?.data?.errors;
        const errorMessage = validationErrors || 'Invalid status value';
        throw new Error(`Validation error: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  /**
   * Get valid status transitions for an order
   */
  getValidStatusTransitions: (currentStatus: string): string[] => {
    // Define valid status transitions based on exact API behavior (case-sensitive)
    // API expects uppercase status values in both request and response
    const transitions: { [key: string]: string[] } = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],     // From PENDING status
      'CONFIRMED': ['DELIVERED', 'CANCELLED'],  // From CONFIRMED status
      'DELIVERED': [],                            // Terminal status - no changes
      'CANCELLED': []                             // Terminal status - no changes
    };
    
    const validTransitions = transitions[currentStatus] || [];
    return validTransitions;
  },

  /**
   * Check if status transition is valid
   */
  isValidStatusTransition: (fromStatus: string, toStatus: string): boolean => {
    const validTransitions = adminService.getValidStatusTransitions(fromStatus);
    return validTransitions.includes(toStatus);
  },
};

export default adminService;

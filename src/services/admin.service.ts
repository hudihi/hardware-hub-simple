import apiClient from './api';

// Visitor stats
export interface DailyVisitorCount {
  date: string;
  count: number;
}

export interface VisitorStats {
  days: number;
  total: number;
  data: DailyVisitorCount[];
}

// Dashboard Types
export interface DashboardSummary {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  confirmed_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_products: number;
}

export interface RecentOrder {
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

export interface RevenueOverview {
  total_revenue: number;
  order_count: number;
}

export interface PopularProduct {
  product_id: string;
  total_quantity_sold: number;
}

// Product Types
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit_of_measure: string;
  category_id: string;
  category_name?: string;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: any[];
}

export interface AdminProductsResponse {
  items: AdminProduct[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

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
  payment_status: string; // Payment status: PENDING, PAID, AWAITING_CONFIRMATION, etc.
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

export interface PaymentProofPending {
  id: string;
  order_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  payment_reference: string | null;
  payment_method: string;
  status: string;
  created_at: string | null;
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
      'AWAITING_PAYMENT': ['CONFIRMED', 'CANCELLED'],  // From AWAITING_PAYMENT status
      'PENDING_PAYMENT': ['AWAITING_PAYMENT', 'CANCELLED'],  // From PENDING_PAYMENT status
      'AWAITING_VERIFICATION': ['CONFIRMED', 'REJECTED'],  // From AWAITING_VERIFICATION status
      'PENDING_OTP': ['AWAITING_PAYMENT', 'CANCELLED'],  // From PENDING_OTP status
      'REJECTED': ['AWAITING_PAYMENT', 'CANCELLED'],  // From REJECTED status
      'CONFIRMED': ['DELIVERED', 'CANCELLED'],  // From CONFIRMED status
      'DELIVERED': [],                            // Terminal status - no changes
      'CANCELLED': []                             // Terminal status - no changes
    };
    
    const validTransitions = transitions[currentStatus] || [];
    return validTransitions;
  },

  /**
   * Get payment status color class
   */
  getPaymentStatusClass: (paymentStatus: string): string => {
    const status = paymentStatus.toLowerCase();
    if (status.includes('paid')) return 'bg-success text-white';
    if (status.includes('awaiting')) return 'bg-warning text-white';
    if (status.includes('pending')) return 'bg-secondary text-white';
    if (status.includes('rejected')) return 'bg-danger text-white';
    return 'bg-secondary text-white';
  },

  /**
   * Get payment status text
   */
  getPaymentStatusText: (paymentStatus: string, language: string = 'en'): string => {
    const statusTexts: { [key: string]: { [lang: string]: string } } = {
      'PENDING': { en: 'Pending', sw: 'Inasubiri' },
      'PAID': { en: 'Paid', sw: 'Imelipwa' },
      'AWAITING_CONFIRMATION': { en: 'Awaiting Confirmation', sw: 'Inasubiri Kuthibitisho' },
      'AWAITING_VERIFICATION': { en: 'Awaiting Verification', sw: 'Inasubiri Kuthibitisho' },
      'PROOF_REJECTED': { en: 'Proof Rejected', sw: 'Ushahili Umekataliwa' },
      'FAILED': { en: 'Failed', sw: 'Imeshindikwa' },
      'ABANDONED': { en: 'Abandoned', sw: 'Ameachwa' },
    };
    
    return statusTexts[paymentStatus]?.[language] || paymentStatus;
  },

  /**
   * Check if status transition is valid
   */
  isValidStatusTransition: (fromStatus: string, toStatus: string): boolean => {
    const validTransitions = adminService.getValidStatusTransitions(fromStatus);
    return validTransitions.includes(toStatus);
  },

  /**
   * Get dashboard summary statistics
   */
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      console.log('Fetching dashboard summary');
      const response = await apiClient.get('/api/v1/admin/dashboard/summary');
      console.log('Dashboard summary response:', response.data);
      
      if (!response.data) {
        throw new Error('Invalid dashboard summary response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to get dashboard summary:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      throw error;
    }
  },

  /**
   * Get recent orders for dashboard
   */
  getRecentOrders: async (): Promise<RecentOrder[]> => {
    try {
      console.log('Fetching recent orders');
      const response = await apiClient.get('/api/v1/admin/dashboard/recent-orders');
      console.log('Recent orders response:', response.data);
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid recent orders response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to get recent orders:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      throw error;
    }
  },

  /**
   * Get revenue overview
   */
  getRevenueOverview: async (): Promise<RevenueOverview> => {
    try {
      console.log('Fetching revenue overview');
      const response = await apiClient.get('/api/v1/admin/dashboard/revenue');
      console.log('Revenue overview response:', response.data);
      
      if (!response.data) {
        throw new Error('Invalid revenue overview response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to get revenue overview:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      throw error;
    }
  },

  /**
   * Get popular products
   */
  getPopularProducts: async (): Promise<PopularProduct[]> => {
    try {
      console.log('Fetching popular products');
      const response = await apiClient.get('/api/v1/admin/dashboard/popular-products');
      console.log('Popular products response:', response.data);
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid popular products response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to get popular products:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      throw error;
    }
  },

  /**
   * Get all products for admin management
   */
  getAllProducts: async (page: number = 1, size: number = 10, category_id?: string, search?: string): Promise<AdminProductsResponse> => {
    try {
      console.log('Fetching admin products with params:', { page, size, category_id, search });
      
      const validatedPage = Math.max(1, page);
      const validatedSize = Math.max(1, Math.min(size, 100));
      
      const params: any = {
        page: validatedPage,
        size: validatedSize
      };
      
      if (category_id) {
        params.category_id = category_id;
      }
      if (search) {
        params.search = search;
      }
      
      const response = await apiClient.get('/api/v1/products/', { params });
      
      console.log('Admin products response:', response.data);
      
      if (!response.data) {
        throw new Error('Invalid response format from server');
      }
      
      const productsData = response.data;
      
      if (Array.isArray(productsData)) {
        return {
          items: productsData,
          total: productsData.length,
          page: validatedPage,
          size: validatedSize,
          pages: 1
        };
      }
      
      if (productsData.items && Array.isArray(productsData.items)) {
        return {
          items: productsData.items,
          total: productsData.total || productsData.items.length,
          page: productsData.page || validatedPage,
          size: productsData.size || validatedSize,
          pages: productsData.pages || 1
        };
      }
      
      console.warn('Unexpected response format:', productsData);
      throw new Error('Unable to parse products response');
      
    } catch (error: any) {
      console.error('Failed to get admin products:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.detail || error.response?.data?.errors;
        const errorMessage = validationErrors || 'Invalid request parameters';
        throw new Error(`Validation error: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  /**
   * Create a new product
   */
  createProduct: async (productData: Partial<AdminProduct>): Promise<AdminProduct> => {
    try {
      console.log('Creating product:', productData);
      const response = await apiClient.post('/api/v1/admin/products/', productData);
      console.log('Product created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.detail || error.response?.data?.errors;
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      throw error;
    }
  },

  /**
   * Update an existing product
   */
  updateProduct: async (productId: string, productData: Partial<AdminProduct>): Promise<AdminProduct> => {
    try {
      console.log('Updating product:', productId, productData);
      const response = await apiClient.put(`/api/v1/admin/products/${productId}`, productData);
      console.log('Product updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update product:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found.');
      } else if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.detail || error.response?.data?.errors;
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      throw error;
    }
  },

  /**
   * Delete a product
   */
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      console.log('Deleting product:', productId);
      await apiClient.delete(`/api/v1/admin/products/${productId}`);
      console.log('Product deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        throw new Error('Product not found.');
      }
      
      throw error;
    }
  },

  getPendingPaymentProofs: async (): Promise<PaymentProofPending[]> => {
    try {
      const response = await apiClient.get('/api/v1/payments/proofs/pending');
      console.log('Payment proofs API response:', response.data);
      const raw = response.data;
      // Handle all common API response shapes
      if (Array.isArray(raw))             return raw;
      if (Array.isArray(raw?.data))       return raw.data;
      if (Array.isArray(raw?.items))      return raw.items;
      if (Array.isArray(raw?.results))    return raw.results;
      console.warn('Unexpected payment proofs response format:', raw);
      return [];
    } catch (error: any) {
      console.error('Failed to fetch payment proofs:', error);
      if (error.response?.status === 401) throw new Error('Authentication required. Please log in as admin.');
      if (error.response?.status === 403) throw new Error('Access denied. Admin privileges required.');
      throw error;
    }
  },

  // Debug method to fetch all payment proofs regardless of status
  getAllPaymentProofsForDebug: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/v1/payments/proofs');
      console.log('All payment proofs API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch all payment proofs:', error);
      throw error;
    }
  },

  approvePaymentProof: async (proofId: string, verificationNotes?: string): Promise<void> => {
    await apiClient.post(`/api/v1/payments/proofs/${proofId}/approve`, null, {
      params: verificationNotes ? { verification_notes: verificationNotes } : undefined,
    });
  },

  rejectPaymentProof: async (proofId: string, verificationNotes?: string): Promise<void> => {
    await apiClient.post(`/api/v1/payments/proofs/${proofId}/reject`, null, {
      params: verificationNotes ? { verification_notes: verificationNotes } : undefined,
    });
  },

  fetchPaymentProofBlobUrl: async (proofId: string): Promise<string> => {
    const response = await apiClient.get(`/api/v1/payments/proofs/${proofId}/file`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  getVisitorStats: async (days: number = 30): Promise<VisitorStats> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/visitor-stats', { params: { days } });
    return response.data;
  },
};

export default adminService;

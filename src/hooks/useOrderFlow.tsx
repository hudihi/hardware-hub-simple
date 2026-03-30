import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import authService from '../services/auth.service';
import { CheckoutRequest, checkoutService } from '../services/checkout.service';

// Order Flow Types
export type PaymentStatus = 
  | 'NOT_STARTED' 
  | 'AWAITING_PAYMENT'
  | 'AWAITING_VERIFICATION' 
  | 'CONFIRMED'
  | 'REJECTED';

export interface OrderFlowState {
  order_id: string;
  phone: string;
  amount: number;
  items: any[];
  customer_name: string;
  customer_location: string;
  order_notes: string;
  otp_verified: boolean;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

interface OrderFlowContextType {
  orderState: OrderFlowState | null;
  customerOrders: OrderFlowState[];
  createOrder: (orderData: Partial<OrderFlowState> & { items?: any[] }) => Promise<void>;
  requestOTP: (phone: string) => Promise<string>;
  verifyOTP: (otpCode: string) => Promise<boolean>;
  retryPayment: (orderId: string) => Promise<void>;
  fetchCustomerOrders: () => Promise<void>;
  updatePaymentStatus: (status: PaymentStatus) => void;
  resetOrderFlow: () => void;
  isOrderActive: boolean;
  setAwaitingPayment: () => void;
  setAwaitingVerification: () => void;
}

// Context for order flow state
export const OrderFlowContext = createContext<OrderFlowContextType | undefined>(undefined);

// Provider component
export const OrderFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orderState, setOrderState] = useState<OrderFlowState | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderFlowState[]>([]);
  const { cartId } = useCart(); // Get cartId from cart context

  // Generate mock order ID
  const generateOrderId = (): string => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Create new order (persisted to backend)
  const createOrder = async (orderData: Partial<OrderFlowState> & { items?: any[] }): Promise<void> => {
    try {
      // Validate required fields
      if (!orderData.phone || !orderData.amount || !orderData.items || orderData.items.length === 0) {
        throw new Error('Phone, amount, and items are required to create an order');
      }

      // Prepare checkout request for backend
      if (!cartId) {
        throw new Error('No cart found. Please add items to cart first.');
      }

      const checkoutData: CheckoutRequest = {
        cart_id: cartId, // Use cartId from cart context
        customer_name: orderData.customer_name || '',
        customer_phone: orderData.phone,
        customer_location: orderData.customer_location || '',
        order_notes: orderData.order_notes || '',
        payment_method: 'PRIMESTACK_PAY',
        items: orderData.items,
        amount: orderData.amount
      };

      console.log('Creating order on backend:', checkoutData);
      
      // Create order on backend
      const checkoutResponse = await checkoutService.processCheckout(checkoutData);
      
      console.log('Backend checkout response:', checkoutResponse);
      
      if (!checkoutResponse.order_id) {
        throw new Error('Failed to create order on backend - no order_id returned');
      }

      console.log('Order created on backend with ID:', checkoutResponse.order_id);

      // Create local order state with backend order_id
      const now = new Date().toISOString();
      const newOrder: OrderFlowState = {
        order_id: checkoutResponse.order_id, // Use backend order_id
        phone: orderData.phone,
        amount: orderData.amount,
        items: orderData.items,
        customer_name: orderData.customer_name || '',
        customer_location: orderData.customer_location || '',
        order_notes: orderData.order_notes || '',
        otp_verified: false,
        payment_status: 'NOT_STARTED',
        created_at: now,
        updated_at: now,
      };
      
      setOrderState(newOrder);
      console.log('Order created successfully:', newOrder);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  };

  // Request OTP
  const requestOTP = async (phone: string): Promise<string> => {
    try {
      const response = await authService.requestOTP(phone);
      console.log('OTP requested successfully:', response.message);
      return response.message;
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (otpCode: string): Promise<boolean> => {
    if (!orderState?.phone) {
      throw new Error('No phone number available for OTP verification');
    }

    try {
      const response = await authService.verifyOTP(orderState.phone, otpCode);
      
      // Check if we received an access token (successful verification)
      if (response.access_token) {
        setOrderState(prev => prev ? {
          ...prev,
          otp_verified: true,
          payment_status: 'AWAITING_PAYMENT',
          updated_at: new Date().toISOString()
        } : null);
        console.log('OTP verified successfully, token received');
        return true;
      } else {
        console.log('OTP verification failed - no token received');
        return false;
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Retry payment
  const retryPayment = async (orderId: string): Promise<void> => {
    try {
      // Validate order state
      if (!orderState || !orderState.otp_verified) {
        throw new Error('Order must be OTP verified before retrying payment');
      }

      // Check if payment status allows retry
      const retryableStatuses: PaymentStatus[] = ['REJECTED', 'AWAITING_PAYMENT', 'AWAITING_VERIFICATION'];
      if (!retryableStatuses.includes(orderState.payment_status)) {
        throw new Error(`Cannot retry payment with status: ${orderState.payment_status}`);
      }

      // Call retry payment API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.pahala.store'}/api/v1/customer/retry-payment/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getCustomerToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to retry payment: ${response.statusText}`);
      }

      // Update payment status to AWAITING_PAYMENT after successful retry request
      updatePaymentStatus('AWAITING_PAYMENT');
      console.log('Payment retry initiated successfully for order:', orderId);

    } catch (error) {
      console.error('Payment retry failed:', error);
      throw error;
    }
  };

  // Fetch customer orders
  const fetchCustomerOrders = async (): Promise<void> => {
    try {
      const customerToken = authService.getCustomerToken();
      if (!customerToken) {
        throw new Error('Customer not authenticated. Please verify OTP first.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.pahala.store'}/api/v1/customer/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch orders: ${response.statusText}`);
      }

      const ordersData = await response.json();
      
      // Transform API response to match our OrderFlowState format
      const transformedOrders: OrderFlowState[] = ordersData.map((order: any) => ({
        order_id: order.order_id || order.id,
        phone: order.phone || '',
        amount: order.amount || 0,
        items: order.items || [],
        customer_name: order.customer_name || '',
        customer_location: order.customer_location || '',
        order_notes: order.order_notes || '',
        otp_verified: order.otp_verified || false,
        payment_status: order.payment_status || 'NOT_STARTED',
        created_at: order.created_at || new Date().toISOString(),
        updated_at: order.updated_at || new Date().toISOString()
      }));

      setCustomerOrders(transformedOrders);
      console.log('Customer orders fetched successfully:', transformedOrders.length, 'orders');

    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      throw error;
    }
  };

  // Set order to awaiting payment status
  const setAwaitingPayment = () => {
    updatePaymentStatus('AWAITING_PAYMENT');
  };

  // Set order to awaiting verification status
  const setAwaitingVerification = () => {
    updatePaymentStatus('AWAITING_VERIFICATION');
  };

  // Update payment status
  const updatePaymentStatus = (status: PaymentStatus) => {
    setOrderState(prev => prev ? {
      ...prev,
      payment_status: status,
      updated_at: new Date().toISOString()
    } : null);
    console.log('Payment status updated:', status);
  };

  // Reset order flow
  const resetOrderFlow = () => {
    setOrderState(null);
    console.log('Order flow reset');
  };

  // Check if order is active
  const isOrderActive = orderState !== null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('OrderFlow cleanup');
    };
  }, []);

  const value: OrderFlowContextType = {
    orderState,
    customerOrders,
    createOrder,
    requestOTP,
    verifyOTP,
    retryPayment,
    fetchCustomerOrders,
    updatePaymentStatus,
    resetOrderFlow,
    isOrderActive,
    setAwaitingPayment,
    setAwaitingVerification,
  };

  return (
    <OrderFlowContext.Provider value={value}>
      {children}
    </OrderFlowContext.Provider>
  );
};

// Hook to use order flow
export const useOrderFlow = (): OrderFlowContextType => {
  const context = useContext(OrderFlowContext);
  if (context === undefined) {
    throw new Error('useOrderFlow must be used within an OrderFlowProvider');
  }
  return context;
};

export default OrderFlowProvider;

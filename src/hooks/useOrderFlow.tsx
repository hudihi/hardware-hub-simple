import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Order Flow Types
export type PaymentStatus = 'NOT_STARTED' | 'PENDING' | 'COMPLETED' | 'FAILED';

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
  createOrder: (orderData: Partial<OrderFlowState>) => void;
  verifyOTP: (otpCode: string) => Promise<boolean>;
  updatePaymentStatus: (status: PaymentStatus) => void;
  resetOrderFlow: () => void;
  isOrderActive: boolean;
}

// Context for order flow state
export const OrderFlowContext = createContext<OrderFlowContextType | undefined>(undefined);

// Provider component
export const OrderFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orderState, setOrderState] = useState<OrderFlowState | null>(null);

  // Generate mock order ID
  const generateOrderId = (): string => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Create new order
  const createOrder = (orderData: Partial<OrderFlowState>) => {
    const now = new Date().toISOString();
    const newOrder: OrderFlowState = {
      order_id: orderData.order_id || generateOrderId(),
      phone: orderData.phone || '',
      amount: orderData.amount || 0,
      items: orderData.items || [],
      customer_name: orderData.customer_name || '',
      customer_location: orderData.customer_location || '',
      order_notes: orderData.order_notes || '',
      otp_verified: false,
      payment_status: 'NOT_STARTED',
      created_at: now,
      updated_at: now,
    };
    
    setOrderState(newOrder);
    console.log('Order created:', newOrder);
  };

  // Verify OTP (mock implementation)
  const verifyOTP = async (otpCode: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Accept any 6-digit code as valid
        if (otpCode.length === 6 && /^\d{6}$/.test(otpCode)) {
          setOrderState(prev => prev ? {
            ...prev,
            otp_verified: true,
            payment_status: 'PENDING',
            updated_at: new Date().toISOString()
          } : null);
          console.log('OTP verified successfully');
          resolve(true);
        } else {
          console.log('Invalid OTP code');
          resolve(false);
        }
      }, 1000);
    });
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
    createOrder,
    verifyOTP,
    updatePaymentStatus,
    resetOrderFlow,
    isOrderActive,
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

// Helper hook for payment simulation
export const usePaymentSimulation = () => {
  const { updatePaymentStatus } = useOrderFlow();

  const simulatePaymentProcessing = (onComplete?: () => void) => {
    console.log('Starting payment simulation...');
    
    // Simulate payment processing time
    setTimeout(() => {
      updatePaymentStatus('COMPLETED');
      console.log('Payment completed successfully');
      onComplete?.();
    }, 12000); // 12 seconds
  };

  const simulatePaymentFailure = (onFailure?: () => void) => {
    setTimeout(() => {
      updatePaymentStatus('FAILED');
      console.log('Payment failed');
      onFailure?.();
    }, 8000); // 8 seconds
  };

  return {
    simulatePaymentProcessing,
    simulatePaymentFailure,
  };
};

export default OrderFlowProvider;

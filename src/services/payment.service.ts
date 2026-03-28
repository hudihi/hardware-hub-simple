import apiClient from './api';

// Payment Types
export interface PaymentRequest {
  order_id: string;
  amount: number;
  phone_number: string;
  payment_method: 'PRIMESTACK_PAY';
}

export interface PrimeStackPaymentRequest {
  phone: string;
  amount: number;
  order_id: string;
}

export interface PrimeStackPaymentResponse {
  success: boolean;
  order_id: string;
  transaction_id: string;
  payment_status: string;
  amount: number;
  message: string;
  error?: string;
  details?: string;
}

export interface PaymentResponse {
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  message: string;
  ussd_instructions?: string;
  expires_at?: string;
}

export interface PaymentStatusResponse {
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  message: string;
  order_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface OTPVerificationRequest {
  phone_number: string;
  otp_code: string;
  transaction_id?: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
}

// Payment Service - Single Responsibility for Payment API calls
export const paymentService = {
  /**
   * Initiate payment via PrimeStack
   */
  initiatePrimeStackPayment: async (paymentData: PrimeStackPaymentRequest): Promise<PrimeStackPaymentResponse> => {
    try {
      console.log('Initiating PrimeStack payment:', paymentData);
      const response = await apiClient.post('/api/v1/payment/initiate', paymentData);
      console.log('PrimeStack payment initiated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to initiate PrimeStack payment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.detail || errorData?.message || 'Invalid payment data';
        throw new Error(`PrimeStack payment initiation failed: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please verify OTP first.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  },

  /**
   * Initiate payment with USSD PUSH
   */
  initiatePayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      console.log('Initiating payment:', paymentData);
      const response = await apiClient.post('/api/v1/payments/initiate', paymentData);
      console.log('Payment initiated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to initiate payment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.detail || errorData?.message || 'Invalid payment data';
        throw new Error(`Payment initiation failed: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  /**
   * Check payment status
   */
  checkPaymentStatus: async (transactionId: string): Promise<PaymentStatusResponse> => {
    try {
      console.log('Checking payment status for transaction:', transactionId);
      const response = await apiClient.get(`/api/v1/payments/status/${transactionId}`);
      console.log('Payment status:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to check payment status:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('Transaction not found');
      }
      
      throw error;
    }
  },

  /**
   * Retry payment
   */
  retryPayment: async (transactionId: string): Promise<PaymentResponse> => {
    try {
      console.log('Retrying payment for transaction:', transactionId);
      const response = await apiClient.post(`/api/v1/payments/retry/${transactionId}`);
      console.log('Payment retry response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to retry payment:', error);
      throw error;
    }
  },

  /**
   * Verify OTP for payment confirmation
   */
  verifyOTP: async (otpData: OTPVerificationRequest): Promise<OTPVerificationResponse> => {
    try {
      console.log('Verifying OTP:', { ...otpData, otp_code: '***' });
      const response = await apiClient.post('/api/v1/payments/verify-otp', otpData);
      console.log('OTP verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.detail || errorData?.message || 'Invalid OTP';
        throw new Error(`OTP verification failed: ${errorMessage}`);
      }
      
      throw error;
    }
  },

  /**
   * Cancel payment
   */
  cancelPayment: async (transactionId: string): Promise<void> => {
    try {
      console.log('Cancelling payment for transaction:', transactionId);
      await apiClient.post(`/api/v1/payments/cancel/${transactionId}`);
      console.log('Payment cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel payment:', error);
      throw error;
    }
  }
};

export default paymentService;

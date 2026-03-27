import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentService, PaymentRequest, PaymentResponse, PaymentStatusResponse, OTPVerificationRequest } from '../services/payment.service';

// Payment Flow States
export type PaymentState = 
  | 'idle' 
  | 'initiating' 
  | 'pending' 
  | 'verifying_otp' 
  | 'success' 
  | 'failed' 
  | 'timeout' 
  | 'cancelled';

export interface PaymentFlowState {
  state: PaymentState;
  transactionId: string | null;
  status: PaymentStatusResponse | null;
  error: string | null;
  isLoading: boolean;
  ussdInstructions: string | null;
  expiresAt: string | null;
}

export interface PaymentFlowActions {
  initiatePayment: (paymentData: PaymentRequest) => Promise<void>;
  verifyOTP: (otpCode: string) => Promise<void>;
  retryPayment: () => Promise<void>;
  cancelPayment: () => Promise<void>;
  resetFlow: () => void;
  startPolling: (transactionId: string) => void;
  stopPolling: () => void;
}

// Constants
const POLLING_INTERVAL = 3000; // 3 seconds
const PAYMENT_TIMEOUT = 300000; // 5 minutes

// Custom hook for payment flow management
export const usePaymentFlow = (): PaymentFlowState & PaymentFlowActions => {
  const [paymentState, setPaymentState] = useState<PaymentFlowState>({
    state: 'idle',
    transactionId: null,
    status: null,
    error: null,
    isLoading: false,
    ussdInstructions: null,
    expiresAt: null,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all intervals and timeouts
  const clearTimers = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Update payment state
  const updateState = useCallback((updates: Partial<PaymentFlowState>) => {
    setPaymentState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle payment timeout
  const handleTimeout = useCallback(() => {
    clearTimers();
    updateState({
      state: 'timeout',
      isLoading: false,
      error: 'Payment timed out. Please try again.'
    });
  }, [clearTimers, updateState]);

  // Poll payment status
  const pollPaymentStatus = useCallback(async (transactionId: string) => {
    try {
      const status = await paymentService.checkPaymentStatus(transactionId);
      
      updateState({ status });

      switch (status.status) {
        case 'SUCCESS':
          clearTimers();
          updateState({
            state: 'success',
            isLoading: false,
            error: null
          });
          break;
          
        case 'FAILED':
          clearTimers();
          updateState({
            state: 'failed',
            isLoading: false,
            error: status.message || 'Payment failed'
          });
          break;
          
        case 'TIMEOUT':
          handleTimeout();
          break;
          
        case 'PENDING':
          // Continue polling
          break;
          
        default:
          console.warn('Unknown payment status:', status.status);
      }
    } catch (error: any) {
      console.error('Error polling payment status:', error);
      // Don't update state on polling errors, just log them
    }
  }, [clearTimers, handleTimeout, updateState]);

  // Start polling
  const startPolling = useCallback((transactionId: string) => {
    clearTimers();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      pollPaymentStatus(transactionId);
    }, POLLING_INTERVAL);

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, PAYMENT_TIMEOUT);

    // Initial poll
    pollPaymentStatus(transactionId);
  }, [clearTimers, pollPaymentStatus, handleTimeout]);

  // Stop polling
  const stopPolling = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  // Initiate payment
  const initiatePayment = useCallback(async (paymentData: PaymentRequest) => {
    try {
      updateState({
        state: 'initiating',
        isLoading: true,
        error: null
      });

      const response = await paymentService.initiatePayment(paymentData);
      
      updateState({
        state: response.status === 'PENDING' ? 'pending' : 'failed',
        transactionId: response.transaction_id,
        ussdInstructions: response.ussd_instructions,
        expiresAt: response.expires_at,
        isLoading: false,
        error: response.status === 'FAILED' ? response.message : null
      });

      // Start polling if payment is pending
      if (response.status === 'PENDING') {
        startPolling(response.transaction_id);
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      updateState({
        state: 'failed',
        isLoading: false,
        error: error.message || 'Failed to initiate payment'
      });
    }
  }, [updateState, startPolling]);

  // Verify OTP
  const verifyOTP = useCallback(async (otpCode: string) => {
    if (!paymentState.transactionId) {
      updateState({
        state: 'failed',
        error: 'No transaction found to verify'
      });
      return;
    }

    try {
      updateState({
        state: 'verifying_otp',
        isLoading: true,
        error: null
      });

      const otpData: OTPVerificationRequest = {
        phone_number: '', // This should come from the payment request
        otp_code: otpCode,
        transaction_id: paymentState.transactionId
      };

      const response = await paymentService.verifyOTP(otpData);
      
      if (response.success) {
        updateState({
          state: 'success',
          isLoading: false,
          error: null
        });
        stopPolling();
      } else {
        updateState({
          state: 'pending',
          isLoading: false,
          error: response.message || 'OTP verification failed'
        });
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      updateState({
        state: 'pending',
        isLoading: false,
        error: error.message || 'OTP verification failed'
      });
    }
  }, [paymentState.transactionId, updateState, stopPolling]);

  // Retry payment
  const retryPayment = useCallback(async () => {
    if (!paymentState.transactionId) {
      updateState({
        state: 'failed',
        error: 'No transaction to retry'
      });
      return;
    }

    try {
      updateState({
        state: 'initiating',
        isLoading: true,
        error: null
      });

      const response = await paymentService.retryPayment(paymentState.transactionId);
      
      updateState({
        state: response.status === 'PENDING' ? 'pending' : 'failed',
        ussdInstructions: response.ussd_instructions,
        expiresAt: response.expires_at,
        isLoading: false,
        error: response.status === 'FAILED' ? response.message : null
      });

      // Start polling if payment is pending
      if (response.status === 'PENDING') {
        startPolling(response.transaction_id);
      }
    } catch (error: any) {
      console.error('Payment retry failed:', error);
      updateState({
        state: 'failed',
        isLoading: false,
        error: error.message || 'Failed to retry payment'
      });
    }
  }, [paymentState.transactionId, updateState, startPolling]);

  // Cancel payment
  const cancelPayment = useCallback(async () => {
    if (!paymentState.transactionId) {
      return;
    }

    try {
      await paymentService.cancelPayment(paymentState.transactionId);
      clearTimers();
      updateState({
        state: 'cancelled',
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Payment cancellation failed:', error);
      updateState({
        state: 'failed',
        isLoading: false,
        error: error.message || 'Failed to cancel payment'
      });
    }
  }, [paymentState.transactionId, clearTimers, updateState]);

  // Reset flow
  const resetFlow = useCallback(() => {
    clearTimers();
    setPaymentState({
      state: 'idle',
      transactionId: null,
      status: null,
      error: null,
      isLoading: false,
      ussdInstructions: null,
      expiresAt: null,
    });
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    ...paymentState,
    initiatePayment,
    verifyOTP,
    retryPayment,
    cancelPayment,
    resetFlow,
    startPolling,
    stopPolling
  };
};

export default usePaymentFlow;

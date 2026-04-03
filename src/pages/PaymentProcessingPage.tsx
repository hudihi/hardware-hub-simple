import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useCart } from '../context/CartContext';
import { useOrderFlow } from '../hooks/useOrderFlow';

const PaymentProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState, updatePaymentStatus } = useOrderFlow();
  const { clearCart } = useCart();
  const [error, setError] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusCheckCount, setStatusCheckCount] = useState(0);

  // Validate order state
  useEffect(() => {
    if (!orderState) {
      navigate('/checkout');
      return;
    }

    // Check if OTP was verified
    if (!orderState.otp_verified) {
      navigate('/otp-verification');
      return;
    }
  }, [orderState, navigate]);

  // Check payment status periodically
  useEffect(() => {
    if (!orderState || orderState.payment_status !== 'PENDING') {
      return;
    }

    const checkStatus = async () => {
      try {
        setIsCheckingStatus(true);
        setStatusCheckCount(prev => prev + 1);
        
        // Stop checking after 30 attempts (2.5 minutes)
        if (statusCheckCount >= 30) {
          setError('Payment verification is taking longer than expected. Please contact support if payment was completed.');
          return;
        }
        
        // Try to get payment status from order
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.pahala.store'}/api/v1/customer/orders/${orderState.order_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('customer_token')}`
          }
        });

        if (response.ok) {
          const orderData = await response.json();
          const currentPaymentStatus = orderData.payment_status;
          
          console.log('Payment status check:', {
            checkNumber: statusCheckCount + 1,
            currentStatus: currentPaymentStatus,
            previousStatus: orderState.payment_status
          });

          if (currentPaymentStatus === 'COMPLETED') {
            // Payment completed successfully
            updatePaymentStatus('COMPLETED');
            
            // Clear the cart
            try {
              await clearCart();
              console.log('Cart cleared after successful payment');
            } catch (clearError) {
              console.error('Failed to clear cart:', clearError);
            }
            
            // Navigate to order confirmation
            setTimeout(() => {
              navigate('/order-confirmation');
            }, 2000);
          } else if (currentPaymentStatus === 'FAILED') {
            // Payment failed
            updatePaymentStatus('FAILED');
            setError('Payment failed. Please try again.');
          } else if (currentPaymentStatus === 'TIMEOUT') {
            // Payment timed out
            updatePaymentStatus('FAILED');
            setError('Payment timed out. Please try again.');
          }
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        
        // Only show error to user after many attempts
        if (statusCheckCount >= 20) {
          setError('Unable to verify payment status. Please contact support.');
        }
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // Check immediately, then every 5 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    // Stop checking after 2.5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (orderState.payment_status === 'PENDING') {
        setError('Payment verification timed out. Please contact support if payment was completed.');
      }
    }, 150000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderState, navigate, updatePaymentStatus, clearCart, statusCheckCount]);

  if (!orderState) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center">
                <i className="bi bi-phone text-brown text-2xl"></i>
              </div>
            </div>
            <CardTitle className="text-xl text-brown-dark">
              Complete Your Payment
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Please complete the payment on your phone to process your order
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-cream p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-mono font-semibold">{orderState.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-brown">
                  TZS {orderState.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm">{orderState.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {orderState.payment_status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-beige p-4 rounded-lg border border-brown-light">
              <h4 className="font-semibold text-brown-dark mb-2">Payment Instructions:</h4>
              <ul className="text-sm text-brown space-y-1">
                <li>• Complete the payment on your phone</li>
                <li>• We are automatically verifying your payment</li>
                <li>• You will be redirected once payment is confirmed</li>
                <li>• Your cart will be cleared after successful payment</li>
              </ul>
            </div>

            {/* Status Checking Indicator */}
            {isCheckingStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">
                    Checking payment status...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Help Text */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                Please complete the payment on your phone
              </p>
              <p className="text-xs text-gray-500">
                You will be redirected automatically once payment is complete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;

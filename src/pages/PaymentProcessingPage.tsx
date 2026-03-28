import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useOrderFlow } from '../hooks/useOrderFlow';

const PaymentProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState, updatePaymentStatus, initiatePayment } = useOrderFlow();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [paymentResponse, setPaymentResponse] = useState<any>(null);

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

  const handlePayNow = async () => {
    if (!orderState) return;

    try {
      setIsPaying(true);
      setError('');
      
      // Call PrimeStack payment initiation API
      const response = await initiatePayment();
      setPaymentResponse(response);
      
      if (response.success) {
        // Payment initiated successfully
        updatePaymentStatus('PENDING');
        
        // Navigate to payment status after showing success message
        setTimeout(() => {
          navigate('/payment-status');
        }, 3000);
      } else {
        // Payment initiation failed
        setError(response.error || response.message || 'Payment initiation failed');
        updatePaymentStatus('FAILED');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
      updatePaymentStatus('FAILED');
    } finally {
      setIsPaying(false);
    }
  };

  if (!orderState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
            </div>

            {/* Instructions */}
            <div className="bg-beige p-4 rounded-lg border border-brown-light">
              <h4 className="font-semibold text-brown-dark mb-2">Payment Instructions:</h4>
              <ul className="text-sm text-brown space-y-1">
                <li>• Click the "Pay Now" button below</li>
                <li>• You will receive a payment prompt on your phone</li>
                <li>• Follow the instructions to complete payment</li>
                <li>• Your order will be processed after payment</li>
              </ul>
            </div>

            {/* Success Message */}
            {paymentResponse?.success && (
              <div className="p-3 bg-cream border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 text-center">
                  ✓ Payment initiated successfully! Check your phone for payment prompt.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              disabled={isPaying || paymentResponse?.success}
              className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-brown"
              style={{
                backgroundColor: isPaying || paymentResponse?.success ? '#9CA3AF' : '#7C5A3C',
                cursor: isPaying || paymentResponse?.success ? 'not-allowed' : 'pointer',
                minHeight: '48px'
              }}
            >
              {isPaying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : paymentResponse?.success ? (
                <>
                  <i className="bi bi-check-circle"></i>
                  Payment Initiated
                </>
              ) : (
                <>
                  <i className="bi bi-credit-card"></i>
                  Pay Now
                </>
              )}
            </button>

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-2">
                Debug: isPaying={String(isPaying)}, paymentSuccess={String(paymentResponse?.success)}
              </div>
            )}

            {/* Help Text */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                Don't close this window after clicking "Pay Now"
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

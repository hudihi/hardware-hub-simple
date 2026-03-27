import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useOrderFlow, usePaymentSimulation } from '../hooks/useOrderFlow';

const PaymentProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState, updatePaymentStatus } = useOrderFlow();
  const { simulatePaymentProcessing } = usePaymentSimulation();
  const [progress, setProgress] = useState(0);

  // Redirect if no active order
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

    // Simulate payment processing
    const timer = setTimeout(() => {
      updatePaymentStatus('PENDING');
      navigate('/payment-status');
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [orderState, navigate, updatePaymentStatus]);

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (!orderState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 border-t-2 border-green-300 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <CardTitle className="text-xl">Processing Payment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your payment
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Success Indicators */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">Phone Verified</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">Order Placed Successfully</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                </div>
                <span className="text-sm font-medium text-blue-600">Initiating Payment...</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Processing Payment</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-mono font-semibold">{orderState.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  ${orderState.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm">{orderState.phone}</span>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            {/* Help Text */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                Please don't close this window
              </p>
              <p className="text-xs text-gray-500">
                You will be redirected to payment status shortly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;

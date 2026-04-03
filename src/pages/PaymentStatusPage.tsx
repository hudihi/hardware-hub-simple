import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useOrderFlow } from '../hooks/useOrderFlow';

const PaymentStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState } = useOrderFlow();
  const [timeRemaining, setTimeRemaining] = useState(15); // 15 seconds
  const [paymentCompleted, setPaymentCompleted] = useState(false);

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

    // Simulate payment completion after 15 seconds
    const timer = setTimeout(() => {
      setPaymentCompleted(true);
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2000); // 2 seconds delay before redirect
    }, 15000);

    return () => clearTimeout(timer);
  }, [orderState, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && !paymentCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, paymentCompleted]);

  if (!orderState) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleCancelPayment = () => {
    // Cancel and go back to checkout
    navigate('/checkout');
  };

  return (
    <div className="page-container flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl animate-pulse">⏱️</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <CardTitle className="text-xl text-yellow-600">Payment Pending</CardTitle>
            <p className="text-sm text-muted-foreground">
              Check your phone and complete the payment
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
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
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-semibold text-yellow-600">
                  Awaiting Payment
                </span>
              </div>
            </div>

            {/* USSD Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 text-blue-800">USSD Instructions:</h3>
              <div className="text-xs space-y-1 text-blue-700">
                <p>1. Dial *150*00# on your phone</p>
                <p>2. Select "Payments" (Option 3)</p>
                <p>3. Select "Pay Merchant" (Option 4)</p>
                <p>4. Enter merchant code: 123456</p>
                <p>5. Enter amount: ${orderState.amount.toFixed(2)}</p>
                <p>6. Enter your PIN to confirm</p>
                <p>7. Wait for confirmation message</p>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm font-medium text-yellow-800">
                  Checking payment status... {timeRemaining}s
                </span>
              </div>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={handleCancelPayment}
              >
                Cancel Payment
              </Button>
            </div>

            {/* Important Notes */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                • Keep your phone handy for payment confirmation
              </p>
              <p className="text-xs text-gray-500">
                • Do not close this window until payment is complete
              </p>
              <p className="text-xs text-gray-500">
                • Payment verification may take up to 15 seconds
              </p>
            </div>

            {/* Success Message (when completed) */}
            {paymentCompleted && (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
                <p className="text-green-600 font-semibold">Payment Completed!</p>
                <p className="text-sm text-gray-600">Redirecting to confirmation...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

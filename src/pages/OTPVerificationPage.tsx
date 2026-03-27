import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useOrderFlow } from '../hooks/useOrderFlow';

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState, verifyOTP } = useOrderFlow();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Redirect if no active order
  useEffect(() => {
    if (!orderState) {
      navigate('/checkout');
    }
  }, [orderState, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await verifyOTP(otp);
      
      if (success) {
        // OTP verified, redirect to payment processing
        navigate('/payment-processing');
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    // Mock resend OTP
    setCountdown(300);
    setCanResend(false);
    setError('');
    console.log('OTP resent to:', orderState?.phone);
  };

  const handleBack = () => {
    navigate('/checkout');
  };

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
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <CardTitle className="text-xl">Verify OTP</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your phone
            </p>
            <p className="text-sm font-medium text-blue-600 mt-1">
              {orderState.phone}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-mono font-semibold">{orderState.order_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  ${orderState.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">
                  Enter OTP Code
                </label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={otp.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResendOTP}
                disabled={!canResend || isLoading}
              >
                {canResend 
                  ? 'Resend OTP' 
                  : `Resend in ${formatTime(countdown)}`
                }
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                • Check your SMS inbox for the OTP
              </p>
              <p className="text-xs text-gray-500">
                • OTP is valid for 5 minutes
              </p>
              <p className="text-xs text-gray-500">
                • Any 6-digit code will work for testing
              </p>
            </div>

            {/* Back Button */}
            <div className="text-center pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
              >
                ← Back to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerificationPage;

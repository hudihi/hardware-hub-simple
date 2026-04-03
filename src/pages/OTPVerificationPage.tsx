import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { formatOrderDisplayCode } from '../utils/format';

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderState, verifyOTP, requestOTP } = useOrderFlow();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [serverError, setServerError] = useState(false);

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
      setIsTimeout(true);
      setError('OTP has expired. Please request a new one.');
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
        // Reset error states on successful verification
        setRetryCount(0);
        setServerError(false);
        // OTP verified, redirect to payment processing
        navigate('/payment-processing');
      } else {
        setError('Invalid OTP code. Please try again.');
        setServerError(false);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('timeout') || err.message?.includes('expired')) {
        setError('OTP verification timed out. Please request a new OTP.');
        setIsTimeout(true);
        setCanResend(true);
        setServerError(false);
      } else if (err.message?.includes('500') || err.response?.status === 500) {
        setRetryCount(prev => prev + 1);
        if (retryCount < 2) {
          setError('Server is busy. Retrying...');
          setServerError(true);
          // Auto-retry after 2 seconds for server errors
          setTimeout(() => {
            handleSubmit(e as any); // Retry the same request
          }, 2000);
          return; // Don't set loading to false for auto-retry
        } else {
          setError('Server is experiencing issues. Please try again later.');
          setServerError(true);
          setCanResend(true); // Allow resend after max retries
        }
      } else if (err.message?.includes('401') || err.response?.status === 401) {
        setError('Invalid OTP code. Please check and try again.');
        setServerError(false);
      } else if (err.message?.includes('400') || err.response?.status === 400) {
        setError('Invalid OTP format. Please enter a 6-digit code.');
        setServerError(false);
      } else if (err.message?.includes('429') || err.response?.status === 429) {
        setError('Too many attempts. Please wait before trying again.');
        setServerError(false);
      } else {
        setError(err.message || 'OTP verification failed. Please try again.');
        setServerError(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!orderState?.phone) {
      setError('No phone number available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await requestOTP(orderState.phone);
      setCountdown(300);
      setCanResend(false);
      setIsTimeout(false);
      setRetryCount(0);
      setServerError(false);
      setError('');
      console.log('OTP resent to:', orderState.phone);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      
      // Handle specific error cases for resend
      if (err.message?.includes('500') || err.response?.status === 500) {
        setError('Server is experiencing issues. Please try again in a moment.');
      } else if (err.message?.includes('429') || err.response?.status === 429) {
        setError('Too many OTP requests. Please wait before trying again.');
      } else if (err.message?.includes('400') || err.response?.status === 400) {
        setError('Invalid phone number. Please go back and check your details.');
      } else {
        setError(err.message || 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/checkout');
  };

  if (!orderState) {
    return (
      <div className="page-container flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C5A3C] mx-auto mb-4"></div>
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
            <div className="mx-auto mb-4 w-16 h-16 bg-[#F5EDE4] rounded-full flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <CardTitle className="text-xl text-[#5C3D2E]">Verify OTP</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your phone
            </p>
            <p className="text-sm font-medium text-[#7C5A3C] mt-1">
              {orderState.phone}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-cream p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-mono font-semibold" title={orderState.order_id}>
                  {formatOrderDisplayCode(orderState.order_id)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-[#7C5A3C]">
                  TZS {orderState.amount.toFixed(2)}
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
                <div className={`p-3 rounded-lg border ${
                  serverError 
                    ? 'bg-orange-50 border-orange-200' 
                    : isTimeout 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm text-center ${
                    serverError 
                      ? 'text-orange-600' 
                      : isTimeout 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                  }`}>
                    {error}
                    {serverError && retryCount > 0 && (
                      <span className="block text-xs mt-1">
                        Retry attempt {retryCount}/3
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-[#7C5A3C] hover:bg-[#5C3D2E] border-[#7C5A3C]" 
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
                className={`text-[#7C5A3C] hover:bg-[#F5EDE4] ${
                  isTimeout ? 'font-semibold' : ''
                }`}
                onClick={handleResendOTP}
                disabled={!canResend || isLoading}
              >
                {canResend 
                  ? (isTimeout ? 'Request New OTP' : 'Resend OTP')
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
                • Enter the exact code received via SMS
              </p>
            </div>

            {/* Back Button */}
            <div className="text-center pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#6C757D] hover:bg-[#F8F9FA]"
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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

interface OTPVerificationProps {
  phoneNumber?: string;
  onVerify: (otpCode: string) => Promise<void>;
  onResend?: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  resendDisabled?: boolean;
  resendCountdown?: number;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerify,
  onResend,
  isLoading = false,
  error,
  className,
  resendDisabled = false,
  resendCountdown = 0
}) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && !isLoading) {
      await onVerify(otp);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const isSubmitDisabled = otp.length !== 6 || isLoading;

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="text-4xl">🔐</div>
        </div>
        <CardTitle className="text-xl">Verify OTP</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Enter the 6-digit code sent to your phone
        </p>
        {phoneNumber && (
          <p className="text-sm font-medium text-primary mt-1">
            {phoneNumber}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-center block">
              Enter OTP Code
            </Label>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
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
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitDisabled}
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
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onResend}
            disabled={resendDisabled || isLoading}
          >
            {resendDisabled 
              ? `Resend in ${resendCountdown}s` 
              : 'Resend OTP'
            }
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            • Check your SMS inbox for the OTP
          </p>
          <p className="text-xs text-muted-foreground">
            • OTP is valid for 5 minutes
          </p>
          <p className="text-xs text-muted-foreground">
            • Make sure you have good network coverage
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;

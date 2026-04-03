import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Label } from '../components/ui/label';
import { useOrderFlow } from '../hooks/useOrderFlow';

type TrackOrderStep = 'phone' | 'otp';

const TrackOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP, fetchCustomerOrders } = useOrderFlow();

  const [currentStep, setCurrentStep] = useState<TrackOrderStep>('phone');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [otp, setOtp] = useState('');

  const [resending, setResending] = useState(false);

  const isStep1Active = currentStep === 'phone';
  const isStep1Completed = currentStep === 'otp';
  const isStep2Active = currentStep === 'otp';

  const stepCircle = useMemo(() => ({
    active: 'bg-[var(--pahala-brown)] border-[var(--pahala-brown)] text-white ring-4 ring-[rgba(124,90,60,0.2)]',
    completed: 'bg-[var(--pahala-brown)] border-[var(--pahala-brown)] text-white',
    pending: 'bg-white border-gray-300 text-gray-500',
  }), []);

  const handleSendOTP = async () => {
    if (!isPhoneValid || !normalizedPhone) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');
    setOtp('');

    try {
      await requestOTP(normalizedPhone);
      // Only after a successful send, allow moving to step 2.
      setCurrentStep('otp');
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // This app currently expects a full 6-digit OTP.
    if (otp.length !== 6) {
      setError('Please enter the full OTP code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await verifyOTP(otp);
      if (!success) {
        setError('Invalid OTP code. Please try again.');
        return;
      }

      try {
        await fetchCustomerOrders();
      } catch (ordersError) {
        // Even if orders can’t be fetched, still route the user to orders page.
        console.warn('Orders fetch failed after OTP verification:', ordersError);
      }

      navigate('/orders');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!normalizedPhone || resending || isLoading) return;
    setResending(true);
    setError('');
    try {
      await requestOTP(normalizedPhone);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-container min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </Button>
          <p className="font-semibold text-[#5C3D2E]">Track Order</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-[#5C3D2E]">Verify Your Identity</h1>
          <p className="text-sm text-muted-foreground">Enter your phone number to access your orders</p>
        </div>

        {/* 2-step indicator */}
        <div className="relative">
          <div className="absolute top-5 left-[22%] right-[22%] h-[2px] bg-gray-200" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1 flex flex-col items-center">
              <div
                aria-current={currentStep === 'phone'}
                className={[
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition',
                  isStep1Active ? stepCircle.active : isStep1Completed ? stepCircle.completed : stepCircle.pending,
                ].join(' ')}
              >
                {isStep1Completed ? <Check size={16} /> : '1'}
              </div>
              <div className="mt-2 text-xs sm:text-sm font-semibold text-gray-700 text-center">
                Phone Number
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div
                aria-current={currentStep === 'otp'}
                className={[
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition',
                  isStep2Active ? stepCircle.active : stepCircle.pending,
                ].join(' ')}
              >
                2
              </div>
              <div className="mt-2 text-xs sm:text-sm font-semibold text-gray-700 text-center">
                Verify OTP
              </div>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl border bg-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-[#5C3D2E]">
              {currentStep === 'phone' ? 'Phone Number' : 'Verify OTP'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            {currentStep === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <PhoneInput
                    value={normalizedPhone}
                    onChange={(phone, isValid) => {
                      setNormalizedPhone(phone);
                      setIsPhoneValid(isValid);
                    }}
                    defaultCountryCode="TZ"
                    required
                    showValidation
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 mt-1">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full h-11 text-base bg-[var(--pahala-brown)] text-white hover:bg-[var(--pahala-brown-dark)]"
                  disabled={!isPhoneValid || isLoading}
                  onClick={handleSendOTP}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  OTP sent to <span className="font-semibold">{normalizedPhone}</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">OTP Code</Label>
                  <div className="text-xs text-gray-500">Enter 4-6 digit code sent</div>

                  <div className="flex justify-start">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
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

                {error && (
                  <div className="text-sm text-red-600 mt-1">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full h-11 text-base bg-[var(--pahala-brown)] text-white hover:bg-[var(--pahala-brown-dark)]"
                  disabled={otp.length !== 6 || isLoading}
                  onClick={handleVerifyOTP}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  className="text-sm text-[var(--pahala-brown)] underline-offset-2 hover:underline disabled:opacity-50"
                  disabled={resending || isLoading}
                  onClick={handleResendOTP}
                >
                  {resending ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <style>{`
          @keyframes fadeInUpTrack {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeInUpTrack 280ms ease-out;
          }
        `}</style>
      </main>
    </div>
  );
};

export default TrackOrderPage;

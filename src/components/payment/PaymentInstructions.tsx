import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface PaymentInstructionsProps {
  instructions?: string | null;
  phoneNumber?: string;
  amount?: number;
  expiresAt?: string | null;
  onCopyInstructions?: () => void;
  className?: string;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  instructions,
  phoneNumber,
  amount,
  expiresAt,
  onCopyInstructions,
  className
}) => {
  // Default USSD instructions if none provided
  const defaultInstructions = `1. Dial *150*00# on your phone
2. Select "Payments" (Option 3)
3. Select "Pay Merchant" (Option 4)
4. Enter merchant code: 123456
5. Enter amount: $${amount?.toFixed(2) || '0.00'}
6. Enter your PIN to confirm
7. Wait for confirmation message`;

  const displayInstructions = instructions || defaultInstructions;

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="text-lg text-center">
          📱 USSD Payment Instructions
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Follow these steps to complete your payment
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Phone Number Display */}
        {phoneNumber && (
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Payment Phone</p>
            <p className="font-mono text-lg font-semibold">{phoneNumber}</p>
          </div>
        )}

        {/* Amount Display */}
        {amount && (
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              ${amount.toFixed(2)}
            </p>
          </div>
        )}

        {/* Time Remaining */}
        {timeRemaining && (
          <div className={cn(
            'text-center p-2 rounded-lg',
            timeRemaining === 'Expired' 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-yellow-100 text-yellow-800'
          )}>
            <p className="text-sm font-medium">
              {timeRemaining === 'Expired' ? 'Payment Expired' : `Expires in: ${timeRemaining}`}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Instructions:</h4>
            {onCopyInstructions && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onCopyInstructions}
                className="text-xs"
              >
                📋 Copy
              </Button>
            )}
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
              {displayInstructions}
            </pre>
          </div>
        </div>

        {/* Important Notes */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Important Notes:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Keep your phone handy for the payment confirmation</li>
            <li>• Do not close this window until payment is complete</li>
            <li>• You will receive an SMS confirmation after successful payment</li>
            <li>• Payment verification may take up to 2 minutes</li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Having trouble? Contact support at{' '}
            <a href="tel:+255123456789" className="text-primary hover:underline">
              +255 123 456 789
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInstructions;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { PaymentState } from '../../hooks/usePaymentFlow';
import { cn } from '@/lib/utils';

interface PaymentStatusCardProps {
  state: PaymentState;
  transactionId?: string | null;
  amount?: number;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

// Status configuration
const statusConfig = {
  idle: {
    color: 'bg-gray-100 text-gray-800',
    icon: '⏳',
    title: 'Ready to Pay',
    description: 'Click "Pay Now" to start the payment process'
  },
  initiating: {
    color: 'bg-blue-100 text-blue-800',
    icon: '🔄',
    title: 'Initiating Payment',
    description: 'Please wait while we set up your payment...'
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏱️',
    title: 'Payment Pending',
    description: 'Please complete the payment using your phone'
  },
  verifying_otp: {
    color: 'bg-blue-100 text-blue-800',
    icon: '🔐',
    title: 'Verifying OTP',
    description: 'Please wait while we verify your OTP...'
  },
  success: {
    color: 'bg-green-100 text-green-800',
    icon: '✅',
    title: 'Payment Successful',
    description: 'Your payment has been completed successfully'
  },
  failed: {
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    title: 'Payment Failed',
    description: 'There was an issue with your payment'
  },
  timeout: {
    color: 'bg-orange-100 text-orange-800',
    icon: '⏰',
    title: 'Payment Timeout',
    description: 'Payment timed out. Please try again.'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    icon: '🚫',
    title: 'Payment Cancelled',
    description: 'Payment was cancelled successfully'
  }
};

const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  state,
  transactionId,
  amount,
  error,
  onRetry,
  onCancel,
  className
}) => {
  const config = statusConfig[state];

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="text-4xl">{config.icon}</div>
        </div>
        <CardTitle className="text-xl">{config.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {config.description}
        </p>
        <Badge className={cn('mt-3', config.color)}>
          {state.toUpperCase()}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transaction ID */}
        {transactionId && (
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
            <p className="font-mono text-sm font-semibold">{transactionId}</p>
          </div>
        )}

        {/* Amount */}
        {amount && (
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              ${amount.toFixed(2)}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          {state === 'failed' && onRetry && (
            <Button onClick={onRetry} variant="default">
              Retry Payment
            </Button>
          )}
          
          {(state === 'pending' || state === 'initiating') && onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusCard;

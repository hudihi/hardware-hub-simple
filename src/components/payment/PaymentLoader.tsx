import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

interface PaymentLoaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const PaymentLoader: React.FC<PaymentLoaderProps> = ({
  message = 'Processing payment...',
  showProgress = false,
  progress = 0,
  className
}) => {
  return (
    <Card className={cn('w-full max-w-sm mx-auto', className)}>
      <CardContent className="p-6 text-center">
        {/* Animated Spinner */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 border-t-2 border-primary/30 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your request
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Animated Dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentLoader;

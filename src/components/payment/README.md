# Payment Components Architecture

This directory contains reusable payment components built with clean architecture and SOLID principles.

## 📁 Structure

```
src/components/payment/
├── PaymentStatusCard.tsx    # Status display with retry/cancel actions
├── PaymentLoader.tsx         # Animated loading states
├── PaymentInstructions.tsx   # USSD payment instructions
├── OTPVerification.tsx      # OTP input and verification
├── index.ts                 # Component exports
└── README.md               # This file
```

## 🎯 Components

### PaymentStatusCard
Displays payment status with appropriate actions based on state.

**Props:**
- `state: PaymentState` - Current payment state
- `transactionId?: string` - Transaction identifier
- `amount?: number` - Payment amount
- `error?: string` - Error message
- `onRetry?: () => void` - Retry callback
- `onCancel?: () => void` - Cancel callback
- `className?: string` - Additional CSS classes

**States:**
- `idle`, `initiating`, `pending`, `verifying_otp`
- `success`, `failed`, `timeout`, `cancelled`

### PaymentLoader
Animated loading component for payment processing.

**Props:**
- `message?: string` - Loading message
- `showProgress?: boolean` - Show progress bar
- `progress?: number` - Progress percentage (0-100)
- `className?: string` - Additional CSS classes

### PaymentInstructions
Displays USSD payment instructions with copy functionality.

**Props:**
- `instructions?: string` - Custom instructions
- `phoneNumber?: string` - Payment phone number
- `amount?: number` - Payment amount
- `expiresAt?: string` - Expiration timestamp
- `onCopyInstructions?: () => void` - Copy callback
- `className?: string` - Additional CSS classes

### OTPVerification
OTP input component with resend functionality.

**Props:**
- `phoneNumber?: string` - Phone number for context
- `onVerify: (otp: string) => Promise<void>` - Verification callback
- `onResend?: () => void` - Resend callback
- `isLoading?: boolean` - Loading state
- `error?: string` - Error message
- `className?: string` - Additional CSS classes
- `resendDisabled?: boolean` - Disable resend button
- `resendCountdown?: number` - Countdown timer

## 🔄 Usage Example

```tsx
import { PaymentStatusCard, PaymentLoader, PaymentInstructions, OTPVerification } from '@/components/payment';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

const PaymentComponent = () => {
  const {
    state,
    transactionId,
    error,
    isLoading,
    initiatePayment,
    verifyOTP,
    retryPayment,
    cancelPayment
  } = usePaymentFlow();

  if (state === 'success') {
    return <PaymentStatusCard state="success" transactionId={transactionId} />;
  }

  if (state === 'pending') {
    return (
      <div className="space-y-6">
        <PaymentStatusCard 
          state="pending" 
          transactionId={transactionId}
          onCancel={cancelPayment}
        />
        <PaymentInstructions 
          phoneNumber="+255123456789"
          amount={100}
        />
      </div>
    );
  }

  if (state === 'verifying_otp') {
    return (
      <OTPVerification
        phoneNumber="+255123456789"
        onVerify={verifyOTP}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (state === 'initiating') {
    return <PaymentLoader message="Initiating payment..." />;
  }

  return <PaymentStatusCard state="failed" error={error} onRetry={retryPayment} />;
};
```

## 🎨 Design Principles

### SOLID Principles Applied

1. **Single Responsibility**: Each component has one clear purpose
2. **Open/Closed**: Components are extensible via props
3. **Liskov Substitution**: Components are interchangeable
4. **Interface Segregation**: Focused, minimal props interfaces
5. **Dependency Inversion**: No direct API calls in components

### Clean Code Guidelines

- **Small Functions**: Each function does one thing
- **Clear Naming**: Descriptive component and prop names
- **No Deep Nesting**: Flat component structure
- **Separation of Concerns**: UI, state, and logic separated

## 🧩 Integration

### With Payment Hook
```tsx
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

const payment = usePaymentFlow();
```

### With Payment Service
```tsx
import { paymentService } from '@/services/payment.service';

await paymentService.initiatePayment(paymentData);
```

### With Error Handler
```tsx
import { useErrorHandler } from '@/utils/errorHandler';

const { handleError } = useErrorHandler();
```

## 🎯 Best Practices

1. **Always use the payment hook** for state management
2. **Reuse existing components** before creating new ones
3. **Handle loading states** properly
4. **Provide meaningful error messages**
5. **Test all payment states** and edge cases
6. **Follow accessibility guidelines** for all components

## 🔄 State Flow

```
idle → initiating → pending → verifying_otp → success
  ↓         ↓          ↓            ↓
failed ← failed ← failed ← failed
```

## 📱 Responsive Design

All components are fully responsive and work across:
- Desktop (≥1024px)
- Tablet (768px-1023px)
- Mobile (<768px)

## 🎨 Theming

Components use the existing design system:
- Colors from `tailwind.config.js`
- Typography from the design system
- Spacing follows the 8px grid
- Consistent border radius and shadows

## 🔧 Customization

Components are customizable via props:
- Override default messages
- Add custom actions
- Apply custom styling
- Extend functionality

## 🚀 Performance

- **Memoized components** prevent unnecessary re-renders
- **Optimized polling** with proper cleanup
- **Efficient state management** with minimal re-renders
- **Lazy loading** for heavy components

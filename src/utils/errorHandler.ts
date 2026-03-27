// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
}

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  INVALID_OTP: 'INVALID_OTP',
  CART_EMPTY: 'CART_EMPTY',
  CHECKOUT_FAILED: 'CHECKOUT_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.PAYMENT_FAILED]: 'Payment failed. Please try again or use a different payment method.',
  [ERROR_CODES.PAYMENT_TIMEOUT]: 'Payment timed out. Please try again.',
  [ERROR_CODES.INVALID_OTP]: 'Invalid OTP code. Please check and try again.',
  [ERROR_CODES.CART_EMPTY]: 'Your cart is empty. Add items to proceed.',
  [ERROR_CODES.CHECKOUT_FAILED]: 'Checkout failed. Please try again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
} as const;

// Error Handler Class
class ErrorHandler {
  // Parse API error response
  static parseAPIError(error: any): AppError {
    const timestamp = new Date();
    
    // Handle Axios errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: data?.detail || data?.message || ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
            details: data,
            timestamp
          };
          
        case 401:
          return {
            code: ERROR_CODES.UNAUTHORIZED,
            message: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
            details: data,
            timestamp
          };
          
        case 404:
          return {
            code: ERROR_CODES.NOT_FOUND,
            message: data?.detail || data?.message || 'Resource not found',
            details: data,
            timestamp
          };
          
        case 429:
          return {
            code: ERROR_CODES.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            details: data,
            timestamp
          };
          
        case 500:
        case 502:
        case 503:
          return {
            code: ERROR_CODES.SERVER_ERROR,
            message: ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
            details: data,
            timestamp
          };
          
        default:
          return {
            code: ERROR_CODES.UNKNOWN_ERROR,
            message: data?.detail || data?.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
            details: data,
            timestamp
          };
      }
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        details: error,
        timestamp
      };
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        code: ERROR_CODES.PAYMENT_TIMEOUT,
        message: ERROR_MESSAGES[ERROR_CODES.PAYMENT_TIMEOUT],
        details: error,
        timestamp
      };
    }
    
    // Handle payment specific errors
    if (error.message?.toLowerCase().includes('payment')) {
      return {
        code: ERROR_CODES.PAYMENT_FAILED,
        message: error.message || ERROR_MESSAGES[ERROR_CODES.PAYMENT_FAILED],
        details: error,
        timestamp
      };
    }
    
    // Handle OTP specific errors
    if (error.message?.toLowerCase().includes('otp')) {
      return {
        code: ERROR_CODES.INVALID_OTP,
        message: error.message || ERROR_MESSAGES[ERROR_CODES.INVALID_OTP],
        details: error,
        timestamp
      };
    }
    
    // Default unknown error
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details: error,
      timestamp
    };
  }
  
  // Handle error with options
  static handleError(error: any, options: ErrorHandlerOptions = {}) {
    const {
      showToast = true,
      logToConsole = true,
      fallbackMessage = ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
    } = options;
    
    const appError = this.parseAPIError(error);
    
    // Log to console
    if (logToConsole) {
      console.group('🚨 Application Error');
      console.error('Error Code:', appError.code);
      console.error('Message:', appError.message);
      console.error('Details:', appError.details);
      console.error('Timestamp:', appError.timestamp);
      console.groupEnd();
    }
    
    // Show toast notification (if toast system is available)
    if (showToast && typeof window !== 'undefined') {
      // This would integrate with your toast system
      // For now, we'll just log it
      console.log('Toast would show:', appError.message);
    }
    
    return appError;
  }
  
  // Get user-friendly error message
  static getUserMessage(error: AppError): string {
    return error.message;
  }
  
  // Check if error is recoverable
  static isRecoverable(error: AppError): boolean {
    const recoverableErrors = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.PAYMENT_FAILED,
      ERROR_CODES.PAYMENT_TIMEOUT,
      ERROR_CODES.INVALID_OTP,
      ERROR_CODES.SERVER_ERROR
    ];
    
    return recoverableErrors.includes(error.code as any);
  }
  
  // Check if error should trigger retry
  static shouldRetry(error: AppError): boolean {
    const retryableErrors = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.PAYMENT_TIMEOUT,
      ERROR_CODES.SERVER_ERROR
    ];
    
    return retryableErrors.includes(error.code as any);
  }
}

// React Hook for Error Handling
export const useErrorHandler = () => {
  const handleError = (error: any, options?: ErrorHandlerOptions) => {
    return ErrorHandler.handleError(error, options);
  };
  
  const getUserMessage = (error: AppError) => {
    return ErrorHandler.getUserMessage(error);
  };
  
  const isRecoverable = (error: AppError) => {
    return ErrorHandler.isRecoverable(error);
  };
  
  const shouldRetry = (error: AppError) => {
    return ErrorHandler.shouldRetry(error);
  };
  
  return {
    handleError,
    getUserMessage,
    isRecoverable,
    shouldRetry
  };
};

export default ErrorHandler;

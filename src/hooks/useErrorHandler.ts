import { useState, useCallback } from 'react';
import { ErrorType } from '../../lib/errors';

export interface ErrorState {
  message: string;
  type: ErrorType;
  timestamp?: number;
}

/**
 * Custom hook for handling errors consistently across components
 * Provides methods for setting, clearing, and handling errors
 */
export function useErrorHandler() {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  /**
   * Sets an error with the given message and type
   */
  const setError = useCallback((message: string, type: ErrorType = ErrorType.UNKNOWN_ERROR) => {
    setErrorState({
      message,
      type,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  /**
   * Handles an error from a try/catch block
   * @param error The caught error
   */
  const handleError = useCallback((error: unknown) => {
    console.error('Error caught:', error);
    
    // Default error message and type
    let message = 'An unexpected error occurred. Please try again later.';
    let type = ErrorType.UNKNOWN_ERROR;
    
    // Handle different error types
    if (error instanceof Error) {
      message = error.message;
      
      // Use the cause if it's an ErrorType
      if (error.cause && Object.values(ErrorType).includes(error.cause as ErrorType)) {
        type = error.cause as ErrorType;
      }
    } else if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null) {
      // Try to extract error message from response object
      if ('message' in error) {
        message = (error as any).message;
      }
      
      // Try to extract error type from response object
      if ('type' in error && Object.values(ErrorType).includes((error as any).type)) {
        type = (error as any).type;
      } else if ('error' in error && typeof (error as any).error === 'object' && (error as any).error !== null) {
        if ('type' in (error as any).error && Object.values(ErrorType).includes((error as any).error.type)) {
          type = (error as any).error.type;
        }
        if ('message' in (error as any).error && !message) {
          message = (error as any).error.message;
        }
      }
    }
    
    // Set the error state
    setError(message, type);
    
    return { message, type };
  }, [setError]);

  /**
   * Returns user-friendly messages based on error types
   */
  const getFriendlyErrorMessage = useCallback((errorType: ErrorType): string => {
    switch (errorType) {
      case ErrorType.AUTHENTICATION_ERROR:
        return 'You need to sign in to access this feature.';
      case ErrorType.AUTHORIZATION_ERROR:
        return 'You don\'t have permission to perform this action.';
      case ErrorType.NETWORK_ERROR:
        return 'Network error. Please check your internet connection and try again.';
      case ErrorType.NOT_FOUND_ERROR:
        return 'The requested resource was not found.';
      case ErrorType.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      case ErrorType.RATE_LIMIT_ERROR:
        return 'You\'ve made too many requests. Please wait a moment and try again.';
      case ErrorType.DATABASE_ERROR:
      case ErrorType.INTERNAL_SERVER_ERROR:
        return 'Something went wrong on our end. We\'re working to fix it.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }, []);

  return {
    error,
    setError,
    clearError,
    handleError,
    getFriendlyErrorMessage,
  };
}
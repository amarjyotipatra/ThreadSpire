'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorAlert from './ErrorAlert';
import { ErrorType } from '../../../lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error boundary caught error:', error, errorInfo);
    // Here you could also log to an error reporting service
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorAlert 
          message={this.state.error?.message || 'An unexpected error occurred'}
          type={ErrorType.UNKNOWN_ERROR}
          variant="standard"
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export enum ErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INPUT_ERROR = 'INPUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: number;
  public readonly type: ErrorType;
  public readonly details?: unknown;

  constructor(message: string, type: ErrorType, code: number, details?: unknown) {
    super(message);
    this.name = 'AppError'; // Useful for instanceof checks and logging
    this.type = type;
    this.code = code;
    this.details = details;
    // This is necessary to restore the prototype chain,
    // allowing instanceof to work correctly with custom errors in TypeScript.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  message: string;
  type: ErrorType;
  status?: number;
  details?: unknown;
}

/**
 * Create a standard error response object (payload for the response body)
 */
export function createErrorPayload(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN_ERROR,
  status = 500, // This status is part of the payload if not an AppError
  details?: unknown
): ErrorResponse {
  return { message, type, status, details };
}

/**
 * Formats an AppError into a payload for JSON responses.
 */
export function formatErrorPayload(error: AppError): { message: string, type: ErrorType, details?: unknown } {
  return {
    message: error.message,
    type: error.type,
    details: error.details,
  };
}

/**
 * Create an Error instance with additional context
 */
export function createError(message: string, type: ErrorType = ErrorType.UNKNOWN_ERROR): Error {
  const error = new Error(message);
  error.cause = type;
  return error;
}

/**
 * Parse an error and return a standardized error response object
 */
export function parseError(error: unknown): ErrorResponse {
  console.error('Error caught by parseError:', error); // Added more specific logging
  
  let message = 'An unexpected error occurred';
  let type = ErrorType.UNKNOWN_ERROR;
  let status = 500;
  let details: unknown;
  
  if (error instanceof AppError) {
    message = error.message;
    type = error.type;
    status = error.code;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    
    // Use the cause if it's an ErrorType
    if (error.cause && Object.values(ErrorType).includes(error.cause as ErrorType)) {
      type = error.cause as ErrorType;
    }
    
    details = {
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null) {
    // Try to extract information from an object
    const errorObj = error as any;
    
    if ('message' in errorObj) {
      message = errorObj.message;
    }
    
    if ('type' in errorObj && Object.values(ErrorType).includes(errorObj.type)) {
      type = errorObj.type;
    }
    
    if ('status' in errorObj && typeof errorObj.status === 'number') {
      status = errorObj.status;
    }
    
    details = errorObj;
  }
  
  // Map status to error type if not already set
  if (type === ErrorType.UNKNOWN_ERROR && status) {
    switch (true) {
      case status === 400:
        type = ErrorType.VALIDATION_ERROR;
        break;
      case status === 401:
        type = ErrorType.AUTHENTICATION_ERROR;
        break;
      case status === 403:
        type = ErrorType.AUTHORIZATION_ERROR;
        break;
      case status === 404:
        type = ErrorType.NOT_FOUND_ERROR;
        break;
      case status === 429:
        type = ErrorType.RATE_LIMIT_ERROR;
        break;
      case status >= 500:
        type = ErrorType.INTERNAL_SERVER_ERROR;
        break;
    }
  }
  
  return { message, type, status, details };
}

/**
 * Logs server errors with context.
 */
export function logServerError(error: unknown, contextInfo?: string): void {
  const context = contextInfo ? `[${contextInfo}] ` : '';
  if (error instanceof AppError) {
    console.error(`${context}AppError: ${error.message} (Type: ${error.type}, Code: ${error.code})`, error.details, error.stack && process.env.NODE_ENV === 'development' ? error.stack : '');
  } else if (error instanceof Error) {
    console.error(`${context}Error: ${error.message}`, error.stack && process.env.NODE_ENV === 'development' ? error.stack : '');
  } else {
    console.error(`${context}Unknown error:`, error);
  }
}

/**
 * Handle and format errors in API routes, returning a Response object.
 */
export function handleApiError(error: unknown): Response {
  const { message, type, status } = parseError(error);
  
  // Create response object with the parsed error
  const responseBody = JSON.stringify({
    error: { message, type },
    success: false,
  });
  
  return new Response(responseBody, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
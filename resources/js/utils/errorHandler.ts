import { ApiError } from '../types';

// Error message mappings for user-friendly display
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR:
    'Tidak dapat menyambung ke pelayan. Sila semak sambungan internet anda.',
  TIMEOUT_ERROR: 'Permintaan telah tamat masa. Sila cuba lagi.',

  // Authentication errors
  UNAUTHORIZED: 'Sesi anda telah tamat tempoh. Sila log masuk semula.',
  FORBIDDEN: 'Anda tidak mempunyai kebenaran untuk melakukan tindakan ini.',
  INVALID_CREDENTIALS: 'Alamat e-mel atau kata laluan tidak betul.',

  // Validation errors
  VALIDATION_ERROR: 'Sila semak medan yang ditandakan dan cuba lagi.',
  INVALID_IC_FORMAT: 'Format nombor kad pengenalan tidak sah.',
  INVALID_SSM_FORMAT: 'Format nombor SSM tidak sah.',
  INVALID_EMAIL_FORMAT: 'Format alamat e-mel tidak sah.',
  PASSWORD_TOO_WEAK:
    'Kata laluan terlalu lemah. Sila gunakan kata laluan yang lebih kuat.',

  // Business logic errors
  USER_ALREADY_EXISTS: 'Pengguna dengan alamat e-mel ini sudah wujud.',
  USER_NOT_FOUND: 'Pengguna tidak dijumpai.',
  COMPANY_NOT_FOUND: 'Syarikat tidak dijumpai.',
  ALREADY_VERIFIED: 'Identiti anda sudah disahkan.',
  ALREADY_LINKED: 'Syarikat ini sudah dipautkan ke akaun anda.',

  // Server errors
  SERVER_ERROR: 'Ralat pelayan. Sila cuba lagi kemudian.',
  SERVICE_UNAVAILABLE:
    'Perkhidmatan tidak tersedia buat masa ini. Sila cuba lagi kemudian.',

  // Generic fallback
  UNKNOWN_ERROR: 'Ralat tidak dijangka berlaku. Sila cuba lagi.',
} as const;

// Error types for categorization
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  BUSINESS = 'business',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Enhanced error interface
export interface EnhancedError extends ApiError {
  type: ErrorType;
  retryable: boolean;
  userMessage: string;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, unknown>;
}

// Error categorization based on status codes and messages
export function categorizeError(error: ApiError): ErrorType {
  if (error.status === 0) return ErrorType.NETWORK;
  if (error.status === 401) return ErrorType.AUTHENTICATION;
  if (error.status === 403) return ErrorType.AUTHENTICATION;
  if (error.status === 422) return ErrorType.VALIDATION;
  if (error.status >= 400 && error.status < 500) return ErrorType.BUSINESS;
  if (error.status >= 500) return ErrorType.SERVER;
  return ErrorType.UNKNOWN;
}

// Determine if error is retryable
export function isRetryableError(error: ApiError): boolean {
  // Network errors are retryable
  if (error.status === 0) return true;

  // Server errors (5xx) are retryable
  if (error.status >= 500) return true;

  // Timeout errors are retryable
  if (error.message.toLowerCase().includes('timeout')) return true;

  // Rate limiting is retryable
  if (error.status === 429) return true;

  // Client errors (4xx) are generally not retryable
  return false;
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: ApiError): string {
  // Check for specific error messages first
  const message = error.message.toLowerCase();

  if (message.includes('network') || error.status === 0) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (message.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  if (error.status === 401) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  if (error.status === 403) {
    return ERROR_MESSAGES.FORBIDDEN;
  }

  if (error.status === 422) {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  if (error.status === 404) {
    if (message.includes('user')) return ERROR_MESSAGES.USER_NOT_FOUND;
    if (message.includes('company')) return ERROR_MESSAGES.COMPANY_NOT_FOUND;
    return 'Sumber yang diminta tidak dijumpai.';
  }

  if (error.status >= 500) {
    if (error.status === 503) return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  // Check for specific business logic errors
  if (message.includes('already exists'))
    return ERROR_MESSAGES.USER_ALREADY_EXISTS;
  if (message.includes('already verified'))
    return ERROR_MESSAGES.ALREADY_VERIFIED;
  if (message.includes('already linked')) return ERROR_MESSAGES.ALREADY_LINKED;
  if (message.includes('invalid credentials'))
    return ERROR_MESSAGES.INVALID_CREDENTIALS;

  // Return original message if it's already user-friendly, otherwise use generic message
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Enhanced error handler
export function enhanceError(
  error: ApiError,
  context?: Record<string, unknown>
): EnhancedError {
  const type = categorizeError(error);
  const retryable = isRetryableError(error);
  const userMessage = getUserFriendlyMessage(error);

  return {
    ...error,
    type,
    retryable,
    userMessage,
    timestamp: new Date(),
    context,
  };
}

// Error logging utility
export function logError(error: EnhancedError): void {
  // Always log errors in development-like environments
  // In production, you might want to send to error tracking service
  console.group(`🚨 Error [${error.type.toUpperCase()}]`);
  console.error('User Message:', error.userMessage);
  console.error('Technical Message:', error.message);
  console.error('Status:', error.status);
  console.error('Retryable:', error.retryable);
  if (error.context) console.error('Context:', error.context);
  if (error.originalError?.stack)
    console.error('Stack:', error.originalError.stack);
  console.groupEnd();

  // In production, you might want to send to error tracking service
  // Example: Sentry, LogRocket, etc.
  // sendToErrorTrackingService(logData);
}

// Validation error formatter
export function formatValidationErrors(
  errors: Record<string, string[]> | undefined
): Record<string, string> {
  if (!errors) return {};

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : messages,
    ])
  );
}

// Error boundary helper
export function handleErrorBoundary(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  const enhancedError: EnhancedError = {
    message: error.message,
    status: 0,
    type: ErrorType.UNKNOWN,
    retryable: false,
    userMessage: 'Ralat tidak dijangka berlaku. Sila muat semula halaman.',
    originalError: error,
    timestamp: new Date(),
    context: {
      componentStack: errorInfo.componentStack,
    },
  };

  logError(enhancedError);
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

// Calculate retry delay with exponential backoff
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

// Retry utility function
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context?: Record<string, unknown>
): Promise<T> {
  let lastError: ApiError;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as ApiError;
      const enhancedError = enhanceError(lastError, { ...context, attempt });

      // Don't retry if error is not retryable
      if (!enhancedError.retryable) {
        logError(enhancedError);
        throw enhancedError;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        logError(enhancedError);
        throw enhancedError;
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Log retry attempt
      console.warn(
        `🔄 Retrying operation (attempt ${attempt + 1}/${config.maxRetries}) after ${delay}ms`
      );
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError!;
}

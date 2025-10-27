import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ApiError } from '../types';
import {
  enhanceError,
  logError,
  formatValidationErrors,
  EnhancedError,
  withRetry,
  RetryConfig,
  DEFAULT_RETRY_CONFIG,
} from '../utils/errorHandler';

export interface UseErrorHandlerReturn {
  handleError: (
    error: ApiError,
    context?: Record<string, unknown>
  ) => EnhancedError;
  handleValidationErrors: (
    errors: Record<string, string[]> | undefined
  ) => Record<string, string>;
  showErrorNotification: (
    error: ApiError | EnhancedError,
    context?: Record<string, unknown>
  ) => void;
  executeWithRetry: <T>(
    operation: () => Promise<T>,
    config?: RetryConfig,
    context?: Record<string, unknown>
  ) => Promise<T>;
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    options?: {
      showNotification?: boolean;
      retryConfig?: RetryConfig;
      context?: Record<string, unknown>;
      onError?: (error: EnhancedError) => void;
    }
  ) => Promise<T>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const { addNotification } = useNotification();

  const handleError = useCallback(
    (error: ApiError, context?: Record<string, unknown>): EnhancedError => {
      const enhancedError = enhanceError(error, context);
      logError(enhancedError);
      return enhancedError;
    },
    []
  );

  const handleValidationErrors = useCallback(
    (errors: Record<string, string[]> | undefined): Record<string, string> => {
      return formatValidationErrors(errors);
    },
    []
  );

  const showErrorNotification = useCallback(
    (error: ApiError | EnhancedError, context?: Record<string, unknown>) => {
      const enhancedError =
        'type' in error ? error : enhanceError(error, context);

      addNotification({
        type: 'error',
        message: enhancedError.userMessage,
        dismissible: true,
      });
    },
    [addNotification]
  );

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      config: RetryConfig = DEFAULT_RETRY_CONFIG,
      context?: Record<string, unknown>
    ): Promise<T> => {
      return withRetry(operation, config, context);
    },
    []
  );

  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        showNotification?: boolean;
        retryConfig?: RetryConfig;
        context?: Record<string, unknown>;
        onError?: (error: EnhancedError) => void;
      } = {}
    ): Promise<T> => {
      const {
        showNotification = true,
        retryConfig,
        context,
        onError,
      } = options;

      try {
        if (retryConfig) {
          return await executeWithRetry(operation, retryConfig, context);
        } else {
          return await operation();
        }
      } catch (error) {
        const enhancedError = handleError(error as ApiError, context);

        if (showNotification) {
          showErrorNotification(enhancedError);
        }

        if (onError) {
          onError(enhancedError);
        }

        throw enhancedError;
      }
    },
    [handleError, showErrorNotification, executeWithRetry]
  );

  return {
    handleError,
    handleValidationErrors,
    showErrorNotification,
    executeWithRetry,
    executeWithErrorHandling,
  };
}

// Specialized hooks for common error handling patterns

export function useApiErrorHandler() {
  const { executeWithErrorHandling, handleValidationErrors } =
    useErrorHandler();

  return {
    executeApiCall: executeWithErrorHandling,
    handleValidationErrors,
  };
}

export function useFormErrorHandler() {
  const { handleError, handleValidationErrors } = useErrorHandler();

  const handleFormError = useCallback(
    (
      error: ApiError
    ): { fieldErrors: Record<string, string>; generalError: string | null } => {
      const enhancedError = handleError(error);

      if (enhancedError.status === 422 && enhancedError.errors) {
        return {
          fieldErrors: handleValidationErrors(enhancedError.errors),
          generalError: null,
        };
      }

      return {
        fieldErrors: {},
        generalError: enhancedError.userMessage,
      };
    },
    [handleError, handleValidationErrors]
  );

  return { handleFormError };
}

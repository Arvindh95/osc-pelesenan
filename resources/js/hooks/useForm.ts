import { useReducer, useCallback, useEffect } from 'react';
import {
  ValidationRules,
  ValidationErrors,
  validateField,
  validateForm,
  debounce,
  formReducer,
  createInitialFormState,
} from '../utils/validation';
import { useFormErrorHandler } from './useErrorHandler';
import { ApiError } from '../types';

export interface UseFormOptions<T extends Record<string, string>> {
  initialData: T;
  validationRules: ValidationRules;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  onSubmit?: (data: T) => Promise<void>;
}

export interface UseFormReturn<T extends Record<string, string>> {
  // Form state
  data: T;
  errors: ValidationErrors;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;

  // Form actions
  setValue: (field: keyof T, value: string) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  setErrors: (errors: ValidationErrors) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T) => void;
  reset: (newData?: T) => void;

  // Validation
  validateField: (field: keyof T) => string;
  validateForm: () => boolean;

  // Event handlers
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;

  // Utilities
  getFieldProps: (field: keyof T) => {
    name: string;
    value: string;
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => void;
    onBlur: (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => void;
    error?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  };
  getFieldError: (field: keyof T) => string | undefined;
  hasFieldError: (field: keyof T) => boolean;
  isFieldTouched: (field: keyof T) => boolean;
}

export function useForm<T extends Record<string, string>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialData,
    validationRules,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    onSubmit,
  } = options;

  const [state, dispatch] = useReducer(
    formReducer<T>,
    createInitialFormState(initialData)
  );

  const { handleFormError } = useFormErrorHandler();

  // Debounced validation for onChange
  const debouncedValidateField = useCallback(
    debounce((field: keyof T, value: string) => {
      const rule = validationRules[field as string];
      if (rule) {
        const error = validateField(field as string, value, rule, state.data);
        if (error) {
          dispatch({ type: 'SET_ERROR', field, error });
        } else {
          dispatch({ type: 'CLEAR_ERROR', field });
        }
      }
    }, debounceMs),
    [validationRules, state.data, debounceMs]
  );

  // Form actions
  const setValue = useCallback(
    (field: keyof T, value: string) => {
      dispatch({ type: 'SET_FIELD', field, value });

      if (validateOnChange) {
        debouncedValidateField(field, value);
      }
    },
    [validateOnChange, debouncedValidateField]
  );

  const setError = useCallback((field: keyof T, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const clearError = useCallback((field: keyof T) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const setErrors = useCallback((errors: ValidationErrors) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setTouched = useCallback((field: keyof T) => {
    dispatch({ type: 'SET_TOUCHED', field });
  }, []);

  const reset = useCallback(
    (newData?: T) => {
      dispatch({ type: 'RESET', data: newData || initialData });
    },
    [initialData]
  );

  // Validation functions
  const validateSingleField = useCallback(
    (field: keyof T): string => {
      const value = state.data[field] || '';
      const rule = validationRules[field as string];

      if (!rule) return '';

      return validateField(field as string, value, rule, state.data);
    },
    [state.data, validationRules]
  );

  const validateEntireForm = useCallback((): boolean => {
    const errors = validateForm(state.data, validationRules);
    dispatch({ type: 'SET_ERRORS', errors });

    // Mark all fields as touched
    Object.keys(state.data).forEach(field => {
      dispatch({ type: 'SET_TOUCHED', field: field as keyof T });
    });

    return Object.keys(errors).length === 0;
  }, [state.data, validationRules]);

  // Event handlers
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setValue(name as keyof T, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      const field = name as keyof T;

      setTouched(field);

      if (validateOnBlur) {
        const rule = validationRules[name];
        if (rule) {
          const error = validateField(name, value, rule, state.data);
          if (error) {
            setError(field, error);
          } else {
            clearError(field);
          }
        }
      }
    },
    [
      validateOnBlur,
      validationRules,
      state.data,
      setTouched,
      setError,
      clearError,
    ]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!onSubmit) return;

      // Validate form
      const isValid = validateEntireForm();
      if (!isValid) return;

      dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });

      try {
        await onSubmit(state.data);
      } catch (error) {
        const { fieldErrors, generalError } = handleFormError(
          error as ApiError
        );

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }

        if (generalError) {
          // You might want to show this as a notification or general form error
          console.error('Form submission error:', generalError);
        }
      } finally {
        dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
      }
    },
    [onSubmit, validateEntireForm, state.data, handleFormError, setErrors]
  );

  // Utility functions
  const getFieldProps = useCallback(
    (field: keyof T) => {
      const fieldName = field as string;
      const hasError = state.touched[field] && state.errors[fieldName];

      return {
        name: fieldName,
        value: state.data[field] || '',
        onChange: handleChange,
        onBlur: handleBlur,
        error: hasError ? state.errors[fieldName] : undefined,
        'aria-invalid': hasError ? true : undefined,
        'aria-describedby': hasError ? `${fieldName}-error` : undefined,
      };
    },
    [state.data, state.errors, state.touched, handleChange, handleBlur]
  );

  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return state.touched[field] ? state.errors[field as string] : undefined;
    },
    [state.errors, state.touched]
  );

  const hasFieldError = useCallback(
    (field: keyof T): boolean => {
      return !!(state.touched[field] && state.errors[field as string]);
    },
    [state.errors, state.touched]
  );

  const isFieldTouched = useCallback(
    (field: keyof T): boolean => {
      return !!state.touched[field];
    },
    [state.touched]
  );

  // Update form validity when errors change
  useEffect(() => {
    const isValid = Object.keys(state.errors).length === 0;
    if (state.isValid !== isValid) {
      // This will be handled by the reducer, but we need to ensure consistency
    }
  }, [state.errors, state.isValid]);

  return {
    // State
    data: state.data,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,

    // Actions
    setValue,
    setError,
    clearError,
    setErrors,
    clearErrors,
    setTouched,
    reset,

    // Validation
    validateField: validateSingleField,
    validateForm: validateEntireForm,

    // Event handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Utilities
    getFieldProps,
    getFieldError,
    hasFieldError,
    isFieldTouched,
  };
}

import { ReactNode, forwardRef } from 'react';
import { createFormFieldAria, generateId } from '../../utils/accessibility';
import { useFormValidation } from '../../hooks/useAccessibility';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
  helpText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      required = false,
      autoComplete,
      maxLength,
      className = '',
      helpText,
      leftIcon,
      rightIcon,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const hasError = !!error;
    const fieldId = generateId(`field-${name}`);
    const errorId = generateId(`${name}-error`);
    const helpId = generateId(`${name}-help`);
    const { announceValidationError } = useFormValidation();

    const getInputClasses = (): string => {
      const baseClasses =
        'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors duration-200';

      if (hasError) {
        return `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500`;
      }

      return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    };

    const getLabelClasses = (): string => {
      const baseClasses = 'block text-sm font-medium mb-1';

      if (hasError) {
        return `${baseClasses} text-red-700`;
      }

      return `${baseClasses} text-gray-700`;
    };

    const getContainerClasses = (): string => {
      let classes = 'relative';

      if (leftIcon || rightIcon) {
        classes += ' flex items-center';
      }

      return classes;
    };

    const getInputWithIconClasses = (): string => {
      let classes = getInputClasses();

      if (leftIcon) {
        classes += ' pl-10';
      }

      if (rightIcon) {
        classes += ' pr-10';
      }

      return classes;
    };

    // Create comprehensive ARIA attributes
    const ariaAttributes = createFormFieldAria(
      name,
      hasError,
      helpText,
      required
    );
    const describedBy =
      [
        ariaDescribedBy,
        hasError ? errorId : undefined,
        helpText ? helpId : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    // Announce validation errors to screen readers
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
      if (hasError && error) {
        announceValidationError(label, error);
      }
    };

    return (
      <div className={className}>
        <label htmlFor={fieldId} className={getLabelClasses()}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required field">
              *
            </span>
          )}
        </label>

        <div className="mt-1">
          <div className={getContainerClasses()}>
            {leftIcon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className={hasError ? 'text-red-400' : 'text-gray-400'}>
                  {leftIcon}
                </div>
              </div>
            )}

            <input
              ref={ref}
              id={fieldId}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              autoComplete={autoComplete}
              maxLength={maxLength}
              className={
                leftIcon || rightIcon
                  ? getInputWithIconClasses()
                  : getInputClasses()
              }
              aria-invalid={ariaInvalid || hasError}
              aria-describedby={describedBy}
              aria-label={ariaLabel}
              {...ariaAttributes}
            />

            {rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className={hasError ? 'text-red-400' : 'text-gray-400'}>
                  {rightIcon}
                </div>
              </div>
            )}

            {/* Error icon */}
            {hasError && !rightIcon && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  role="img"
                  aria-label="Error indicator"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Help text */}
          {helpText && !hasError && (
            <p id={helpId} className="mt-1 text-xs text-gray-500">
              {helpText}
            </p>
          )}

          {/* Error message */}
          {hasError && (
            <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;

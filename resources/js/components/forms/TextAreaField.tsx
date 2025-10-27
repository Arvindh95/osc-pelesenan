import { forwardRef } from 'react';

export interface TextAreaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  helpText?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      label,
      name,
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      required = false,
      rows = 3,
      maxLength,
      className = '',
      helpText,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    },
    ref
  ) => {
    const hasError = !!error;
    const fieldId = `field-${name}`;
    const errorId = `${name}-error`;
    const helpId = `${name}-help`;

    const getTextAreaClasses = (): string => {
      const baseClasses =
        'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors duration-200 resize-vertical';

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

    const describedBy =
      [
        ariaDescribedBy,
        hasError ? errorId : undefined,
        helpText ? helpId : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    const characterCount = value.length;
    const showCharacterCount = maxLength && maxLength > 0;

    return (
      <div className={className}>
        <div className="flex justify-between items-center">
          <label htmlFor={fieldId} className={getLabelClasses()}>
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>

          {showCharacterCount && (
            <span
              className={`text-xs ${characterCount > maxLength ? 'text-red-500' : 'text-gray-500'}`}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>

        <div className="mt-1">
          <textarea
            ref={ref}
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            className={getTextAreaClasses()}
            aria-invalid={ariaInvalid || hasError}
            aria-describedby={describedBy}
          />

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

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;

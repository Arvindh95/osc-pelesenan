import { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  helpText?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      options,
      error,
      disabled = false,
      required = false,
      placeholder,
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

    const getSelectClasses = (): string => {
      const baseClasses =
        'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-200 bg-white';

      if (hasError) {
        return `${baseClasses} border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500`;
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

    return (
      <div className={className}>
        <label htmlFor={fieldId} className={getLabelClasses()}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <div className="mt-1 relative">
          <select
            ref={ref}
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={getSelectClasses()}
            aria-invalid={ariaInvalid || hasError}
            aria-describedby={describedBy}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Error icon */}
          {hasError && (
            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
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
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;

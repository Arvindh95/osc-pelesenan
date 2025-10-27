import { forwardRef, InputHTMLAttributes } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  validation?: ValidationRule;
  helpText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      error,
      touched = false,
      validation,
      helpText,
      className = '',
      disabled = false,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    const getFieldClasses = (): string => {
      const baseClasses =
        'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors';

      if (hasError) {
        return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
      }

      if (disabled) {
        return `${baseClasses} border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed`;
      }

      return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    };

    return (
      <div className={`space-y-1 ${className}`}>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={name}
            name={name}
            className={getFieldClasses()}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              hasError ? `${name}-error` : helpText ? `${name}-help` : undefined
            }
            {...props}
          />
        </div>

        {hasError && (
          <p id={`${name}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helpText && !hasError && (
          <p id={`${name}-help`} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;

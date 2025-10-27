import { forwardRef, useCallback } from 'react';
import { formatSSMNumber } from '../../utils/validation';
import FormField from './FormField';

export interface SSMNumberFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helpText?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const SSMNumberField = forwardRef<HTMLInputElement, SSMNumberFieldProps>(
  (
    {
      label = 'Nombor SSM',
      name,
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      required = false,
      className = '',
      helpText = 'Masukkan nombor pendaftaran SSM syarikat',
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const formattedValue = formatSSMNumber(inputValue);

        // Limit to reasonable length
        if (formattedValue.length <= 20) {
          // Create a new event with the formatted value
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: formattedValue,
            },
          };
          onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
      },
      [onChange]
    );

    const ssmIcon = (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    );

    return (
      <FormField
        ref={ref}
        label={label}
        name={name}
        type="text"
        placeholder="123456-A atau 123456789012"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        disabled={disabled}
        required={required}
        maxLength={20}
        className={className}
        helpText={helpText}
        leftIcon={ssmIcon}
        autoComplete="off"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
    );
  }
);

SSMNumberField.displayName = 'SSMNumberField';

export default SSMNumberField;

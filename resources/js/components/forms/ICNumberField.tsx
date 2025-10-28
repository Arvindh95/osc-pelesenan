import { forwardRef, useCallback } from 'react';
import { formatICNumber } from '../../utils/validation';
import FormField from './FormField';

export interface ICNumberFieldProps {
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

const ICNumberField = forwardRef<HTMLInputElement, ICNumberFieldProps>(
  (
    {
      label = 'Nombor Kad Pengenalan',
      name,
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      required = false,
      className = '',
      helpText = 'Masukkan nombor kad pengenalan 12 digit anda',
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Remove all non-digits
        const digitsOnly = inputValue.replace(/\D/g, '');
        
        // Only format and update if the number of digits is not more than 12
        const limitedDigits = digitsOnly.substring(0, 12);
        const formattedValue = formatICNumber(limitedDigits);

        // Instead of creating a synthetic event, directly modify the target value
        // This preserves all event properties and works with React's controlled inputs
        e.target.value = formattedValue;
        onChange(e);
      },
      [onChange]
    );

    const icIcon = (
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
          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-2 2v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    );

    return (
      <FormField
        ref={ref}
        label={label}
        name={name}
        type="text"
        placeholder="XXXXXX-XX-XXXX"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        disabled={disabled}
        required={required}
        maxLength={14}
        className={className}
        helpText={helpText}
        leftIcon={icIcon}
        autoComplete="off"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      />
    );
  }
);

ICNumberField.displayName = 'ICNumberField';

export default ICNumberField;
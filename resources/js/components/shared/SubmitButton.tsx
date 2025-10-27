import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useMobilePerformance } from '../../hooks/useMobilePerformance';

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const SubmitButton = ({
  isLoading = false,
  loadingText = 'Processing...',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}: SubmitButtonProps) => {
  const { isMobile, shouldReduceAnimations } = useMobilePerformance();
  const getVariantClasses = (): string => {
    const variants = {
      primary:
        'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white border-transparent',
      secondary:
        'bg-white hover:bg-gray-50 focus:ring-blue-500 text-gray-700 border-gray-300',
      danger:
        'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white border-transparent',
      success:
        'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border-transparent',
    };

    return variants[variant];
  };

  const getSizeClasses = (): string => {
    const sizes = {
      sm: isMobile ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-sm',
      md: isMobile ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
      lg: isMobile ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base',
    };

    return sizes[size];
  };

  const getWidthClasses = (): string => {
    return fullWidth
      ? 'w-full flex justify-center'
      : 'inline-flex justify-center';
  };

  const isDisabled = disabled || isLoading;

  const baseClasses = `
    ${getWidthClasses()}
    ${getSizeClasses()}
    ${getVariantClasses()}
    border rounded-md shadow-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${!shouldReduceAnimations ? 'transition-colors duration-200' : ''}
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isMobile ? 'touch-manipulation min-h-[44px]' : ''}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={baseClasses}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;

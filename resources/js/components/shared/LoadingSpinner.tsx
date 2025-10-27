import { ReactNode } from 'react';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'green' | 'red' | 'yellow';
  text?: string;
  overlay?: boolean;
  className?: string;
  children?: ReactNode;
}

const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  text,
  overlay = false,
  className = '',
  children,
}: LoadingSpinnerProps) => {
  const getSizeClasses = (): string => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    return sizes[size];
  };

  const getColorClasses = (): string => {
    const colors = {
      blue: 'text-blue-600',
      gray: 'text-gray-600',
      white: 'text-white',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
    };

    return colors[color];
  };

  const getTextSizeClasses = (): string => {
    const textSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    return textSizes[size];
  };

  const spinner = (
    <svg
      className={`animate-spin ${getSizeClasses()} ${getColorClasses()}`}
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
  );

  const content = (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {spinner}
      {text && (
        <span className={`${getTextSizeClasses()} ${getColorClasses()}`}>
          {text}
        </span>
      )}
      {children}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-xl">{content}</div>
      </div>
    );
  }

  return content;
};

// Inline spinner for use within other components
export const InlineSpinner = ({
  size = 'sm',
  color = 'blue',
  className = '',
}: Pick<LoadingSpinnerProps, 'size' | 'color' | 'className'>) => {
  const getSizeClasses = (): string => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    return sizes[size];
  };

  const getColorClasses = (): string => {
    const colors = {
      blue: 'text-blue-600',
      gray: 'text-gray-600',
      white: 'text-white',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
    };

    return colors[color];
  };

  return (
    <svg
      className={`animate-spin ${getSizeClasses()} ${getColorClasses()} ${className}`}
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
  );
};

export default LoadingSpinner;

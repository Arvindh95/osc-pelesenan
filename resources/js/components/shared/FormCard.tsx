import { ReactNode } from 'react';

export interface FormCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const FormCard = ({
  title,
  subtitle,
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
}: FormCardProps) => {
  const getPaddingClasses = (): string => {
    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return paddings[padding];
  };

  const getShadowClasses = (): string => {
    const shadows = {
      sm: 'shadow-sm',
      md: 'shadow',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    return shadows[shadow];
  };

  const cardClasses = `
    bg-white rounded-lg border border-gray-200
    ${getShadowClasses()}
    ${getPaddingClasses()}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}

      {children}
    </div>
  );
};

export default FormCard;

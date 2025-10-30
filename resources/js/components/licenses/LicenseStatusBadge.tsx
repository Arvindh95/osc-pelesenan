import React from 'react';
import { LicenseStatus } from '../../types/license';

interface LicenseStatusBadgeProps {
  status: LicenseStatus;
  showNewLabel?: boolean;
}

/**
 * LicenseStatusBadge Component
 * Displays license application status with appropriate styling
 * 
 * @param status - Current license status
 * @param showNewLabel - If true, shows "Permohonan Baru" for Diserahkan status (list view)
 */
const LicenseStatusBadge: React.FC<LicenseStatusBadgeProps> = ({
  status,
  showNewLabel = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Draf':
        return {
          label: 'Draf',
          className: 'bg-gray-100 text-gray-800',
        };
      case 'Diserahkan':
        return {
          label: showNewLabel ? 'Permohonan Baru' : 'Diserahkan',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'Dibatalkan':
        return {
          label: 'Dibatalkan',
          className: 'bg-red-100 text-red-800',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const { label, className } = getStatusConfig();

  return (
    <span
      role="status"
      aria-label={`Status permohonan: ${label}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default LicenseStatusBadge;

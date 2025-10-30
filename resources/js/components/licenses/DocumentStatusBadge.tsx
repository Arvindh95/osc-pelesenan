import React from 'react';
import { DocumentStatus } from '../../types/license';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

/**
 * DocumentStatusBadge Component
 * Displays document validation status with appropriate styling
 * 
 * @param status - Document validation status (BelumSah or Disahkan)
 */
const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'BelumSah':
        return {
          label: 'Belum Disahkan',
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'Disahkan':
        return {
          label: 'Disahkan',
          className: 'bg-green-100 text-green-800',
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
      aria-label={`Status dokumen: ${label}`}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

export default DocumentStatusBadge;

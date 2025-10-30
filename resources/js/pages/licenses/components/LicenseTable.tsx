import React from 'react';
import { License } from '../../../types/license';
import LicenseStatusBadge from '../../../components/licenses/LicenseStatusBadge';
import { formatDate } from '../../../utils/dateHelpers';

interface LicenseTableProps {
  licenses: License[];
  onRowClick: (id: string) => void;
  onEdit: (id: string) => void;
}

/**
 * LicenseTable Component
 * Displays license applications in a table format
 * Supports row click navigation and edit button for drafts
 * 
 * @param licenses - Array of license applications to display
 * @param onRowClick - Callback when row is clicked
 * @param onEdit - Callback when edit button is clicked
 */
const LicenseTable: React.FC<LicenseTableProps> = ({
  licenses,
  onRowClick,
  onEdit,
}) => {
  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Don't trigger row click if clicking on the edit button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onRowClick(id);
  };

  const handleEditClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(id);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jenis Lesen
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tarikh Serahan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nama Perniagaan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenses.map((license) => (
              <tr
                key={license.id}
                onClick={(e) => handleRowClick(license.id, e)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(license.id);
                  }
                }}
                aria-label={`View details for ${license.jenis_lesen_nama}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {license.jenis_lesen_nama}
                  </div>
                  <div className="text-xs text-gray-500">
                    {license.kategori}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LicenseStatusBadge
                    status={license.status}
                    showNewLabel={true}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(license.tarikh_serahan)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {license.butiran_operasi?.nama_perniagaan || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {license.status === 'Draf' && (
                    <button
                      onClick={(e) => handleEditClick(license.id, e)}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      aria-label={`Edit ${license.jenis_lesen_nama}`}
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LicenseTable;

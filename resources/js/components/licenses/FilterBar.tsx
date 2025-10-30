import React from 'react';
import { LicenseFilters } from '../../types/license';

interface FilterBarProps {
  filters: LicenseFilters;
  onFilterChange: (filters: LicenseFilters) => void;
}

/**
 * FilterBar Component
 * Provides filtering controls for license list
 * Supports keyword search, status filter, and date range
 * 
 * @param filters - Current filter values
 * @param onFilterChange - Callback when filters change
 */
const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (
    field: keyof LicenseFilters,
    value: string
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      status: '',
      keyword: '',
      tarikh_dari: '',
      tarikh_hingga: '',
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.keyword ||
    filters.tarikh_dari ||
    filters.tarikh_hingga;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="filter-keyword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cari
          </label>
          <input
            id="filter-keyword"
            type="text"
            placeholder="Cari jenis lesen..."
            value={filters.keyword}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            aria-label="Cari jenis lesen"
          />
        </div>

        <div>
          <label
            htmlFor="filter-status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            aria-label="Tapis mengikut status"
          >
            <option value="">Semua Status</option>
            <option value="Draf">Draf</option>
            <option value="Diserahkan">Diserahkan</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-date-from"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tarikh Dari
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.tarikh_dari}
            onChange={(e) => handleInputChange('tarikh_dari', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            aria-label="Tarikh dari"
          />
        </div>

        <div>
          <label
            htmlFor="filter-date-to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tarikh Hingga
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.tarikh_hingga}
            onChange={(e) => handleInputChange('tarikh_hingga', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            aria-label="Tarikh hingga"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Reset semua penapis"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Reset Penapis
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;

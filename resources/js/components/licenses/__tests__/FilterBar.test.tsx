import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../FilterBar';
import { LicenseFilters } from '../../../types/license';

describe('FilterBar', () => {
  const mockOnFilterChange = vi.fn();

  const defaultFilters: LicenseFilters = {
    status: '',
    keyword: '',
    tarikh_dari: '',
    tarikh_hingga: '',
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  describe('rendering', () => {
    it('should render all filter inputs', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      expect(screen.getByLabelText('Cari jenis lesen')).toBeInTheDocument();
      expect(screen.getByLabelText('Tapis mengikut status')).toBeInTheDocument();
      expect(screen.getByLabelText('Tarikh dari')).toBeInTheDocument();
      expect(screen.getByLabelText('Tarikh hingga')).toBeInTheDocument();
    });

    it('should display current filter values', () => {
      const filters: LicenseFilters = {
        status: 'Draf',
        keyword: 'test',
        tarikh_dari: '2025-01-01',
        tarikh_hingga: '2025-12-31',
      };

      render(<FilterBar filters={filters} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('Cari jenis lesen')).toHaveValue('test');
      expect(screen.getByLabelText('Tapis mengikut status')).toHaveValue('Draf');
      expect(screen.getByLabelText('Tarikh dari')).toHaveValue('2025-01-01');
      expect(screen.getByLabelText('Tarikh hingga')).toHaveValue('2025-12-31');
    });

    it('should show reset button when filters are active', () => {
      const filters: LicenseFilters = {
        ...defaultFilters,
        keyword: 'test',
      };

      render(<FilterBar filters={filters} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('Reset semua penapis')).toBeInTheDocument();
    });

    it('should not show reset button when no filters are active', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      expect(
        screen.queryByLabelText('Reset semua penapis')
      ).not.toBeInTheDocument();
    });
  });

  describe('filter interactions', () => {
    it('should call onFilterChange when keyword changes', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      const keywordInput = screen.getByLabelText('Cari jenis lesen');
      fireEvent.change(keywordInput, { target: { value: 'perniagaan' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        keyword: 'perniagaan',
      });
    });

    it('should call onFilterChange when status changes', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      const statusSelect = screen.getByLabelText('Tapis mengikut status');
      fireEvent.change(statusSelect, { target: { value: 'Diserahkan' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        status: 'Diserahkan',
      });
    });

    it('should call onFilterChange when date from changes', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      const dateFromInput = screen.getByLabelText('Tarikh dari');
      fireEvent.change(dateFromInput, { target: { value: '2025-01-01' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        tarikh_dari: '2025-01-01',
      });
    });

    it('should call onFilterChange when date to changes', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      const dateToInput = screen.getByLabelText('Tarikh hingga');
      fireEvent.change(dateToInput, { target: { value: '2025-12-31' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        tarikh_hingga: '2025-12-31',
      });
    });

    it('should reset all filters when reset button is clicked', () => {
      const filters: LicenseFilters = {
        status: 'Draf',
        keyword: 'test',
        tarikh_dari: '2025-01-01',
        tarikh_hingga: '2025-12-31',
      };

      render(<FilterBar filters={filters} onFilterChange={mockOnFilterChange} />);

      const resetButton = screen.getByLabelText('Reset semua penapis');
      fireEvent.click(resetButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        status: '',
        keyword: '',
        tarikh_dari: '',
        tarikh_hingga: '',
      });
    });
  });

  describe('status options', () => {
    it('should have all status options', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      const statusSelect = screen.getByLabelText('Tapis mengikut status');
      const options = Array.from(statusSelect.querySelectorAll('option'));

      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('Semua Status');
      expect(options[1]).toHaveTextContent('Draf');
      expect(options[2]).toHaveTextContent('Diserahkan');
      expect(options[3]).toHaveTextContent('Dibatalkan');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      expect(screen.getByLabelText('Cari jenis lesen')).toBeInTheDocument();
      expect(screen.getByLabelText('Tapis mengikut status')).toBeInTheDocument();
      expect(screen.getByLabelText('Tarikh dari')).toBeInTheDocument();
      expect(screen.getByLabelText('Tarikh hingga')).toBeInTheDocument();
    });

    it('should have proper input types', () => {
      render(
        <FilterBar filters={defaultFilters} onFilterChange={mockOnFilterChange} />
      );

      expect(screen.getByLabelText('Cari jenis lesen')).toHaveAttribute(
        'type',
        'text'
      );
      expect(screen.getByLabelText('Tarikh dari')).toHaveAttribute('type', 'date');
      expect(screen.getByLabelText('Tarikh hingga')).toHaveAttribute(
        'type',
        'date'
      );
    });
  });
});

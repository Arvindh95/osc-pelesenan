import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LicenseStatusBadge from '../LicenseStatusBadge';

describe('LicenseStatusBadge', () => {
  describe('Draf status', () => {
    it('should render Draf status correctly', () => {
      render(<LicenseStatusBadge status="Draf" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Draf');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should have correct aria-label for Draf', () => {
      render(<LicenseStatusBadge status="Draf" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Status permohonan: Draf');
    });
  });

  describe('Diserahkan status', () => {
    it('should render Diserahkan status without showNewLabel', () => {
      render(<LicenseStatusBadge status="Diserahkan" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Diserahkan');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should render Permohonan Baru when showNewLabel is true', () => {
      render(<LicenseStatusBadge status="Diserahkan" showNewLabel={true} />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Permohonan Baru');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should have correct aria-label when showNewLabel is true', () => {
      render(<LicenseStatusBadge status="Diserahkan" showNewLabel={true} />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Status permohonan: Permohonan Baru');
    });

    it('should render Diserahkan when showNewLabel is false', () => {
      render(<LicenseStatusBadge status="Diserahkan" showNewLabel={false} />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Diserahkan');
    });
  });

  describe('Dibatalkan status', () => {
    it('should render Dibatalkan status correctly', () => {
      render(<LicenseStatusBadge status="Dibatalkan" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Dibatalkan');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should have correct aria-label for Dibatalkan', () => {
      render(<LicenseStatusBadge status="Dibatalkan" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Status permohonan: Dibatalkan');
    });
  });

  describe('styling', () => {
    it('should have common badge classes', () => {
      render(<LicenseStatusBadge status="Draf" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'px-2.5', 'py-0.5', 'rounded-full', 'text-xs', 'font-medium');
    });
  });
});

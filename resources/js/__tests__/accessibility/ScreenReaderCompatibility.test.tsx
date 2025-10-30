/**
 * Screen Reader Compatibility Tests
 * Tests ARIA labels, roles, and screen reader announcements for M02 pages
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import LicensesListPage from '../../pages/licenses/LicensesListPage';
import LicenseCreatePage from '../../pages/licenses/LicenseCreatePage';
import LicenseEditPage from '../../pages/licenses/LicenseEditPage';
import LicenseDetailsPage from '../../pages/licenses/LicenseDetailsPage';
import LicenseStatusBadge from '../../components/licenses/LicenseStatusBadge';
import DocumentUploadSlot from '../../components/licenses/DocumentUploadSlot';
import CompletenessChecklist from '../../components/licenses/CompletenessChecklist';
import apiClient from '../../services/apiClient';

// Mock API client
vi.mock('../../services/apiClient');

const mockAuthContext = {
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

const mockNotificationContext = {
  showToast: vi.fn(),
  showNotification: vi.fn(),
};

const mockCompanyContext = {
  selectedCompany: { id: '1', name: 'Test Company', ssm_number: '123456-A' },
  companies: [],
  loading: false,
  selectCompany: vi.fn(),
  refreshCompanies: vi.fn(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationContext.Provider value={mockNotificationContext}>
          <CompanyContext.Provider value={mockCompanyContext}>
            {component}
          </CompanyContext.Provider>
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Screen Reader - ARIA Labels', () => {
  it('should have proper ARIA labels on LicensesListPage', async () => {
    (apiClient.getLicenses as any).mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, total: 0 },
    });

    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    // Check main content area
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Senarai permohonan lesen');

    // Check search input
    const searchInput = screen.getByPlaceholderText(/cari/i);
    expect(searchInput).toHaveAttribute('aria-label', 'Cari jenis lesen');

    // Check filter controls
    const statusSelect = screen.getByRole('combobox', { name: /status/i });
    expect(statusSelect).toHaveAttribute('aria-label', 'Tapis mengikut status');
  });

  it('should have proper ARIA labels on LicenseCreatePage', async () => {
    (apiClient.getJenisLesen as any).mockResolvedValue([
      { id: '1', nama: 'Lesen Perniagaan', kategori: 'Berisiko', yuran_proses: 100 },
    ]);

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    // Check wizard navigation
    const wizard = screen.getByRole('navigation', { name: /wizard/i });
    expect(wizard).toHaveAttribute('aria-label', 'Langkah permohonan');

    // Check form fields
    const jenisLesenSelect = screen.getByLabelText(/jenis lesen/i);
    expect(jenisLesenSelect).toHaveAttribute('aria-required', 'true');
    expect(jenisLesenSelect).toHaveAttribute('aria-invalid', 'false');
  });

  it('should have proper ARIA labels on LicenseEditPage tabs', async () => {
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Draf',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [],
    });
    (apiClient.getLicenseRequirements as any).mockResolvedValue([]);

    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    // Check tab list
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Tab navigasi permohonan');

    // Check individual tabs
    const maklumatTab = screen.getByRole('tab', { name: /maklumat/i });
    expect(maklumatTab).toHaveAttribute('aria-selected');
    expect(maklumatTab).toHaveAttribute('aria-controls');

    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    expect(dokumenTab).toHaveAttribute('aria-selected');
    expect(dokumenTab).toHaveAttribute('aria-controls');

    const serahanTab = screen.getByRole('tab', { name: /serahan/i });
    expect(serahanTab).toHaveAttribute('aria-selected');
    expect(serahanTab).toHaveAttribute('aria-controls');
  });

  it('should have proper ARIA labels on file upload controls', async () => {
    const mockRequirement = {
      id: '1',
      nama: 'Dokumen Perniagaan',
      keterangan: 'Salinan dokumen perniagaan',
      wajib: true,
    };

    const { container } = render(
      <DocumentUploadSlot
        requirement={mockRequirement}
        onUpload={vi.fn()}
        maxFileSize={10485760}
        allowedTypes={['pdf', 'jpg', 'jpeg', 'png']}
      />
    );

    // Check upload button
    const uploadButton = screen.getByRole('button', { name: /muat naik/i });
    expect(uploadButton).toHaveAttribute('aria-label', 'Muat naik Dokumen Perniagaan');

    // Check file input
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('aria-label', 'Pilih fail untuk Dokumen Perniagaan');
  });

  it('should have proper ARIA labels on status badges', () => {
    const { rerender } = render(
      <LicenseStatusBadge status="Draf" />
    );

    let badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Status permohonan: Draf');

    rerender(<LicenseStatusBadge status="Diserahkan" />);
    badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Status permohonan: Diserahkan');

    rerender(<LicenseStatusBadge status="Dibatalkan" />);
    badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Status permohonan: Dibatalkan');
  });
});

describe('Screen Reader - ARIA Roles', () => {
  it('should have proper semantic roles on list page', async () => {
    (apiClient.getLicenses as any).mockResolvedValue({
      data: [
        {
          id: '1',
          jenis_lesen_nama: 'Lesen Perniagaan',
          status: 'Draf',
          created_at: '2025-01-01',
        },
      ],
      meta: { current_page: 1, last_page: 1, total: 1 },
    });

    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Check table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(4); // Adjust based on actual columns
    expect(screen.getAllByRole('row')).toHaveLength(2); // Header + 1 data row
  });

  it('should have proper navigation role on breadcrumbs', async () => {
    (apiClient.getLicenses as any).mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, total: 0 },
    });

    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(breadcrumb).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('should have proper alert role for error messages', async () => {
    (apiClient.getLicenses as any).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('should have proper dialog role for confirmation modals', async () => {
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Draf',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [],
    });

    renderWithProviders(<LicenseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /batal permohonan/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should have proper list role for completeness checklist', () => {
    const mockLicense = {
      id: '1',
      jenis_lesen_id: '1',
      company_id: '1',
      status: 'Draf' as const,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test',
          bandar: 'Test',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test',
      },
      documents: [],
    };

    render(
      <CompletenessChecklist
        license={mockLicense}
        requirements={[]}
      />
    );

    const checklist = screen.getByRole('list', { name: /semakan kelengkapan/i });
    expect(checklist).toBeInTheDocument();
    expect(checklist).toHaveAttribute('aria-label', 'Semakan kelengkapan permohonan');

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });
});

describe('Screen Reader - Live Regions', () => {
  it('should announce loading state', async () => {
    (apiClient.getLicenses as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<LicensesListPage />);

    // Check for loading indicator with aria-live
    const loadingIndicator = screen.getByRole('status', { name: /loading/i });
    expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    expect(loadingIndicator).toHaveAttribute('aria-busy', 'true');
  });

  it('should announce form validation errors', async () => {
    (apiClient.getJenisLesen as any).mockResolvedValue([
      { id: '1', nama: 'Lesen Perniagaan', kategori: 'Berisiko', yuran_proses: 100 },
    ]);

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /seterusnya/i })).toBeInTheDocument();
    });

    // Try to proceed without selecting jenis lesen
    const nextButton = screen.getByRole('button', { name: /seterusnya/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      expect(errorMessage).toHaveTextContent(/jenis lesen/i);
    });
  });

  it('should announce successful form submission', async () => {
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Draf',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [],
    });
    (apiClient.getLicenseRequirements as any).mockResolvedValue([]);
    (apiClient.updateLicense as any).mockResolvedValue({});

    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockNotificationContext.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          message: expect.stringContaining(/berjaya/i),
        })
      );
    });
  });

  it('should announce file upload progress', async () => {
    const mockRequirement = {
      id: '1',
      nama: 'Dokumen Perniagaan',
      keterangan: 'Salinan dokumen perniagaan',
      wajib: true,
    };

    const mockOnUpload = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { container } = render(
      <DocumentUploadSlot
        requirement={mockRequirement}
        onUpload={mockOnUpload}
        maxFileSize={10485760}
        allowedTypes={['pdf', 'jpg', 'jpeg', 'png']}
      />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const uploadStatus = screen.getByRole('status', { name: /uploading/i });
      expect(uploadStatus).toHaveAttribute('aria-live', 'polite');
      expect(uploadStatus).toHaveAttribute('aria-busy', 'true');
    });
  });
});

describe('Screen Reader - Form Field Descriptions', () => {
  it('should associate error messages with form fields', async () => {
    (apiClient.getJenisLesen as any).mockResolvedValue([
      { id: '1', nama: 'Lesen Perniagaan', kategori: 'Berisiko', yuran_proses: 100 },
    ]);

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/jenis lesen/i)).toBeInTheDocument();
    });

    const jenisLesenSelect = screen.getByLabelText(/jenis lesen/i);
    const nextButton = screen.getByRole('button', { name: /seterusnya/i });

    // Try to proceed without selection
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(jenisLesenSelect).toHaveAttribute('aria-invalid', 'true');
      expect(jenisLesenSelect).toHaveAttribute('aria-describedby');
      
      const errorId = jenisLesenSelect.getAttribute('aria-describedby');
      const errorElement = document.getElementById(errorId!);
      expect(errorElement).toHaveTextContent(/diperlukan/i);
    });
  });

  it('should associate help text with form fields', async () => {
    (apiClient.getJenisLesen as any).mockResolvedValue([
      { id: '1', nama: 'Lesen Perniagaan', kategori: 'Berisiko', yuran_proses: 100 },
    ]);

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/jenis lesen/i)).toBeInTheDocument();
    });

    const jenisLesenSelect = screen.getByLabelText(/jenis lesen/i);
    
    // Check for help text association
    const describedBy = jenisLesenSelect.getAttribute('aria-describedby');
    if (describedBy) {
      const helpText = document.getElementById(describedBy);
      expect(helpText).toBeInTheDocument();
    }
  });

  it('should mark required fields appropriately', async () => {
    (apiClient.getJenisLesen as any).mockResolvedValue([
      { id: '1', nama: 'Lesen Perniagaan', kategori: 'Berisiko', yuran_proses: 100 },
    ]);

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/jenis lesen/i)).toBeInTheDocument();
    });

    const jenisLesenSelect = screen.getByLabelText(/jenis lesen/i);
    expect(jenisLesenSelect).toHaveAttribute('aria-required', 'true');

    // Check for visual indicator
    const label = screen.getByText(/jenis lesen/i);
    expect(label.textContent).toMatch(/\*/); // Should have asterisk
  });
});

describe('Screen Reader - Dynamic Content Updates', () => {
  it('should announce when filters are applied', async () => {
    (apiClient.getLicenses as any).mockResolvedValue({
      data: [
        {
          id: '1',
          jenis_lesen_nama: 'Lesen Perniagaan',
          status: 'Draf',
          created_at: '2025-01-01',
        },
      ],
      meta: { current_page: 1, last_page: 1, total: 1 },
    });

    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      // Check for live region update
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  it('should announce pagination changes', async () => {
    (apiClient.getLicenses as any).mockResolvedValue({
      data: Array(10).fill(null).map((_, i) => ({
        id: `${i + 1}`,
        jenis_lesen_nama: `Lesen ${i + 1}`,
        status: 'Draf',
        created_at: '2025-01-01',
      })),
      meta: { current_page: 1, last_page: 3, total: 30 },
    });

    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Check for page change announcement
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent(/page 2/i);
    });
  });

  it('should announce tab changes', async () => {
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Draf',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [],
    });
    (apiClient.getLicenseRequirements as any).mockResolvedValue([]);

    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /dokumen/i })).toBeInTheDocument();
    });

    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    fireEvent.click(dokumenTab);

    await waitFor(() => {
      // Check for tab change announcement
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toHaveTextContent(/dokumen/i);
    });
  });
});

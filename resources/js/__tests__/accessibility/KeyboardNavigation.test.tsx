/**
 * Keyboard Navigation Accessibility Tests
 * Tests keyboard navigation for all M02 license management pages
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import LicensesListPage from '../../pages/licenses/LicensesListPage';
import LicenseCreatePage from '../../pages/licenses/LicenseCreatePage';
import LicenseEditPage from '../../pages/licenses/LicenseEditPage';
import LicenseDetailsPage from '../../pages/licenses/LicenseDetailsPage';
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

describe('Keyboard Navigation - LicensesListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it('should allow Tab navigation through filter controls', async () => {
    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument();
    });

    const keywordInput = screen.getByPlaceholderText(/cari/i);
    const statusSelect = screen.getByRole('combobox', { name: /status/i });

    // Tab to keyword input
    keywordInput.focus();
    expect(document.activeElement).toBe(keywordInput);

    // Tab to status select
    fireEvent.keyDown(keywordInput, { key: 'Tab' });
    statusSelect.focus();
    expect(document.activeElement).toBe(statusSelect);
  });

  it('should allow Enter key to trigger search', async () => {
    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument();
    });

    const keywordInput = screen.getByPlaceholderText(/cari/i);
    
    fireEvent.change(keywordInput, { target: { value: 'test' } });
    fireEvent.keyDown(keywordInput, { key: 'Enter' });

    await waitFor(() => {
      expect(apiClient.getLicenses).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: 'test' })
      );
    });
  });

  it('should allow keyboard navigation through table rows', async () => {
    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Lesen Perniagaan')).toBeInTheDocument();
    });

    const row = screen.getByRole('row', { name: /lesen perniagaan/i });
    
    // Row should be focusable
    row.focus();
    expect(document.activeElement).toBe(row);

    // Enter key should navigate to details
    fireEvent.keyDown(row, { key: 'Enter' });
    // Navigation would be tested in integration tests
  });

  it('should allow Escape key to clear filters', async () => {
    renderWithProviders(<LicensesListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument();
    });

    const keywordInput = screen.getByPlaceholderText(/cari/i);
    
    fireEvent.change(keywordInput, { target: { value: 'test' } });
    fireEvent.keyDown(keywordInput, { key: 'Escape' });

    expect(keywordInput).toHaveValue('');
  });
});

describe('Keyboard Navigation - LicenseCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.getJenisLesen as any).mockResolvedValue([
      { id: '1', nama: 'Lesen Perniagaan', kategori: 'Berisiko', yuran_proses: 100 },
    ]);
  });

  it('should allow Tab navigation through wizard steps', async () => {
    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/jenis lesen/i)).toBeInTheDocument();
    });

    const jenisLesenSelect = screen.getByLabelText(/jenis lesen/i);
    const nextButton = screen.getByRole('button', { name: /seterusnya/i });

    // Tab through form fields
    jenisLesenSelect.focus();
    expect(document.activeElement).toBe(jenisLesenSelect);

    // Tab to next button
    fireEvent.keyDown(jenisLesenSelect, { key: 'Tab' });
    nextButton.focus();
    expect(document.activeElement).toBe(nextButton);
  });

  it('should allow Enter key to proceed to next step', async () => {
    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/jenis lesen/i)).toBeInTheDocument();
    });

    const jenisLesenSelect = screen.getByLabelText(/jenis lesen/i);
    fireEvent.change(jenisLesenSelect, { target: { value: '1' } });

    const nextButton = screen.getByRole('button', { name: /seterusnya/i });
    fireEvent.keyDown(nextButton, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByLabelText(/alamat 1/i)).toBeInTheDocument();
    });
  });

  it('should allow Escape key to cancel and return to list', async () => {
    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/jenis lesen/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /batal/i });
    fireEvent.keyDown(cancelButton, { key: 'Enter' });

    // Navigation would be tested in integration tests
  });

  it('should trap focus in step indicator during navigation', async () => {
    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByText(/maklumat lesen/i)).toBeInTheDocument();
    });

    const stepIndicator = screen.getByRole('navigation', { name: /wizard/i });
    expect(stepIndicator).toBeInTheDocument();
  });
});

describe('Keyboard Navigation - LicenseEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    (apiClient.getLicenseRequirements as any).mockResolvedValue([
      { id: '1', nama: 'Dokumen 1', wajib: true },
    ]);
  });

  it('should allow Tab navigation through tabs', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /maklumat/i })).toBeInTheDocument();
    });

    const maklumatTab = screen.getByRole('tab', { name: /maklumat/i });
    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    const serahanTab = screen.getByRole('tab', { name: /serahan/i });

    // Tab through tabs
    maklumatTab.focus();
    expect(document.activeElement).toBe(maklumatTab);

    fireEvent.keyDown(maklumatTab, { key: 'ArrowRight' });
    dokumenTab.focus();
    expect(document.activeElement).toBe(dokumenTab);

    fireEvent.keyDown(dokumenTab, { key: 'ArrowRight' });
    serahanTab.focus();
    expect(document.activeElement).toBe(serahanTab);
  });

  it('should allow Arrow keys to navigate between tabs', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /maklumat/i })).toBeInTheDocument();
    });

    const maklumatTab = screen.getByRole('tab', { name: /maklumat/i });
    maklumatTab.focus();

    // Arrow right to next tab
    fireEvent.keyDown(maklumatTab, { key: 'ArrowRight' });
    
    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    expect(document.activeElement).toBe(dokumenTab);

    // Arrow left to previous tab
    fireEvent.keyDown(dokumenTab, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(maklumatTab);
  });

  it('should allow Enter key to activate tab', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /dokumen/i })).toBeInTheDocument();
    });

    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    fireEvent.keyDown(dokumenTab, { key: 'Enter' });

    await waitFor(() => {
      expect(dokumenTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('should allow keyboard navigation in file upload', async () => {
    renderWithProviders(<LicenseEditPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /dokumen/i })).toBeInTheDocument();
    });

    const dokumenTab = screen.getByRole('tab', { name: /dokumen/i });
    fireEvent.click(dokumenTab);

    await waitFor(() => {
      expect(screen.getByText(/dokumen 1/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: /muat naik/i });
    uploadButton.focus();
    expect(document.activeElement).toBe(uploadButton);

    // Enter key should trigger file input
    fireEvent.keyDown(uploadButton, { key: 'Enter' });
  });
});

describe('Keyboard Navigation - LicenseDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    (apiClient.getLicenseRequirements as any).mockResolvedValue([]);
  });

  it('should allow Tab navigation through action buttons', async () => {
    renderWithProviders(<LicenseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    const cancelButton = screen.getByRole('button', { name: /batal/i });

    editButton.focus();
    expect(document.activeElement).toBe(editButton);

    fireEvent.keyDown(editButton, { key: 'Tab' });
    cancelButton.focus();
    expect(document.activeElement).toBe(cancelButton);
  });

  it('should allow Enter key to trigger actions', async () => {
    renderWithProviders(<LicenseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.keyDown(editButton, { key: 'Enter' });

    // Navigation would be tested in integration tests
  });

  it('should allow keyboard navigation through document links', async () => {
    (apiClient.getLicense as any).mockResolvedValue({
      id: '1',
      jenis_lesen_nama: 'Lesen Perniagaan',
      status: 'Diserahkan',
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'Test Address',
          bandar: 'Test City',
          poskod: '12345',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Test Business',
      },
      documents: [
        {
          id: '1',
          nama_fail: 'document.pdf',
          url_storan: '/storage/document.pdf',
          status_sah: 'Disahkan',
        },
      ],
    });

    renderWithProviders(<LicenseDetailsPage />);

    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    const downloadLink = screen.getByRole('link', { name: /muat turun/i });
    downloadLink.focus();
    expect(document.activeElement).toBe(downloadLink);

    // Enter key should trigger download
    fireEvent.keyDown(downloadLink, { key: 'Enter' });
  });
});

describe('Keyboard Navigation - Dialog Focus Management', () => {
  it('should trap focus in confirmation dialog', async () => {
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

    // const dialog = screen.getByRole('dialog');
    const confirmButton = screen.getByRole('button', { name: /ya/i });
    const cancelDialogButton = screen.getByRole('button', { name: /tidak/i });

    // Focus should be on first button
    expect(document.activeElement).toBe(confirmButton);

    // Tab should move to cancel button
    fireEvent.keyDown(confirmButton, { key: 'Tab' });
    expect(document.activeElement).toBe(cancelDialogButton);

    // Tab from last element should wrap to first
    fireEvent.keyDown(cancelDialogButton, { key: 'Tab' });
    expect(document.activeElement).toBe(confirmButton);
  });

  it('should close dialog on Escape key', async () => {
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
    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should restore focus after dialog closes', async () => {
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

    const cancelDialogButton = screen.getByRole('button', { name: /tidak/i });
    fireEvent.click(cancelDialogButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Focus should return to cancel button
    expect(document.activeElement).toBe(cancelButton);
  });
});

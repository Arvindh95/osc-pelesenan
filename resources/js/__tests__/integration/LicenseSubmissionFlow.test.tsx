import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LicenseEditPage from '../../pages/licenses/LicenseEditPage';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import * as apiClient from '../../services/apiClient';
import type { License } from '../../types/license';

vi.mock('../../services/apiClient', () => ({
  default: {
    getLicense: vi.fn(),
    getLicenseRequirements: vi.fn(),
    getJenisLesen: vi.fn(),
    submitLicense: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('License Submission Flow Integration Tests', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    ic_number: '900101011234',
    phone_number: '0123456789',
    is_verified: true,
  };

  const mockCompany = {
    id: 'company-1',
    ssm_number: '202301234567',
    company_name: 'Test Company Sdn Bhd',
    is_verified: true,
  };

  const mockRequirements = [
    {
      id: 'req-1',
      jenis_lesen_id: 'jl-1',
      nama: 'Salinan IC Pemilik',
      keterangan: 'Salinan kad pengenalan pemilik perniagaan',
      wajib: true,
    },
    {
      id: 'req-2',
      jenis_lesen_id: 'jl-1',
      nama: 'Pelan Premis',
      keterangan: 'Pelan lokasi premis perniagaan',
      wajib: true,
    },
  ];

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const renderWithProviders = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: mockUser,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
            loading: false,
          }}
        >
          <CompanyContext.Provider
            value={{
              selectedCompany: mockCompany,
              companies: [mockCompany],
              selectCompany: vi.fn(),
              refreshCompanies: vi.fn(),
              loading: false,
            }}
          >
            <NotificationContext.Provider value={mockToast}>
              <Routes>
                <Route path="/licenses/:id/edit" element={<LicenseEditPage />} />
              </Routes>
            </NotificationContext.Provider>
          </CompanyContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(apiClient.default.getLicenseRequirements).mockResolvedValue(mockRequirements);
    vi.mocked(apiClient.default.getJenisLesen).mockResolvedValue([]);
  });

  it('should show incomplete checklist when documents are missing', async () => {
    const incompleteLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 123, Jalan Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
      },
      documents: [], // No documents uploaded
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(incompleteLicense);

    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // Maklumat lesen should be complete
    const maklumatCheck = screen.getByText(/Maklumat lesen lengkap/i).closest('li');
    expect(within(maklumatCheck!).getByTestId('check-icon')).toBeInTheDocument();

    // Alamat premis should be complete
    const alamatCheck = screen.getByText(/Alamat premis diisi/i).closest('li');
    expect(within(alamatCheck!).getByTestId('check-icon')).toBeInTheDocument();

    // Documents should be incomplete
    const dokumenCheck = screen.getByText(/Semua dokumen wajib dimuat naik/i).closest('li');
    expect(within(dokumenCheck!).getByTestId('x-icon')).toBeInTheDocument();

    // Submit button should be disabled
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    expect(submitButton).toBeDisabled();

    // Warning message should be shown
    expect(
      screen.getByText(/Sila lengkapkan semua keperluan sebelum menghantar permohonan/i)
    ).toBeInTheDocument();
  });

  it('should show complete checklist when all requirements are met', async () => {
    const completeLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 123, Jalan Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
      },
      documents: [
        {
          id: 'doc-1',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-1',
          nama_fail: 'ic_pemilik.pdf',
          mime: 'application/pdf',
          saiz_bait: 1024000,
          url_storan: '/storage/documents/ic_pemilik.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
        {
          id: 'doc-2',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-2',
          nama_fail: 'pelan_premis.pdf',
          mime: 'application/pdf',
          saiz_bait: 2048000,
          url_storan: '/storage/documents/pelan_premis.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(completeLicense);

    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // All checks should be complete
    const checkItems = screen.getAllByTestId('check-icon');
    expect(checkItems).toHaveLength(3);

    // Submit button should be enabled
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    expect(submitButton).not.toBeDisabled();

    // Warning message should not be shown
    expect(
      screen.queryByText(/Sila lengkapkan semua keperluan sebelum menghantar permohonan/i)
    ).not.toBeInTheDocument();
  });

  it('should show confirmation dialog when submitting', async () => {
    const completeLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 123, Jalan Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
      },
      documents: [
        {
          id: 'doc-1',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-1',
          nama_fail: 'ic_pemilik.pdf',
          mime: 'application/pdf',
          saiz_bait: 1024000,
          url_storan: '/storage/documents/ic_pemilik.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
        {
          id: 'doc-2',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-2',
          nama_fail: 'pelan_premis.pdf',
          mime: 'application/pdf',
          saiz_bait: 2048000,
          url_storan: '/storage/documents/pelan_premis.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(completeLicense);

    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    await user.click(submitButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/Sahkan Penghantaran/i)).toBeInTheDocument();
    });

    // Dialog should show warning message
    expect(
      screen.getByText(/Setelah dihantar, permohonan tidak boleh diedit/i)
    ).toBeInTheDocument();

    // Dialog should have confirm and cancel buttons
    expect(screen.getByRole('button', { name: /Ya, Hantar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();
  });

  it('should submit application when confirmed', async () => {
    const completeLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 123, Jalan Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
      },
      documents: [
        {
          id: 'doc-1',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-1',
          nama_fail: 'ic_pemilik.pdf',
          mime: 'application/pdf',
          saiz_bait: 1024000,
          url_storan: '/storage/documents/ic_pemilik.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
        {
          id: 'doc-2',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-2',
          nama_fail: 'pelan_premis.pdf',
          mime: 'application/pdf',
          saiz_bait: 2048000,
          url_storan: '/storage/documents/pelan_premis.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(completeLicense);
    vi.mocked(apiClient.default.submitLicense).mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    await user.click(submitButton);

    // Wait for dialog and confirm
    await waitFor(() => {
      expect(screen.getByText(/Sahkan Penghantaran/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Ya, Hantar/i });
    await user.click(confirmButton);

    // Should call submit API
    await waitFor(() => {
      expect(apiClient.default.submitLicense).toHaveBeenCalledWith('license-1');
    });

    // Should navigate to details page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses/license-1');

    // Should show success toast
    expect(mockToast.success).toHaveBeenCalledWith('Permohonan berjaya dihantar');
  });

  it('should not submit when dialog is cancelled', async () => {
    const completeLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 123, Jalan Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
      },
      documents: [
        {
          id: 'doc-1',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-1',
          nama_fail: 'ic_pemilik.pdf',
          mime: 'application/pdf',
          saiz_bait: 1024000,
          url_storan: '/storage/documents/ic_pemilik.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
        {
          id: 'doc-2',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-2',
          nama_fail: 'pelan_premis.pdf',
          mime: 'application/pdf',
          saiz_bait: 2048000,
          url_storan: '/storage/documents/pelan_premis.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(completeLicense);

    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    await user.click(submitButton);

    // Wait for dialog and cancel
    await waitFor(() => {
      expect(screen.getByText(/Sahkan Penghantaran/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Batal/i });
    await user.click(cancelButton);

    // Should not call submit API
    expect(apiClient.default.submitLicense).not.toHaveBeenCalled();

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(/Sahkan Penghantaran/i)).not.toBeInTheDocument();
    });
  });

  it('should handle submission errors', async () => {
    const completeLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 123, Jalan Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
      },
      documents: [
        {
          id: 'doc-1',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-1',
          nama_fail: 'ic_pemilik.pdf',
          mime: 'application/pdf',
          saiz_bait: 1024000,
          url_storan: '/storage/documents/ic_pemilik.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
        {
          id: 'doc-2',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-2',
          nama_fail: 'pelan_premis.pdf',
          mime: 'application/pdf',
          saiz_bait: 2048000,
          url_storan: '/storage/documents/pelan_premis.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-10-29T10:00:00Z',
        },
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(completeLicense);
    vi.mocked(apiClient.default.submitLicense).mockRejectedValue(
      new Error('Submission failed')
    );

    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // Click submit and confirm
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Sahkan Penghantaran/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Ya, Hantar/i });
    await user.click(confirmButton);

    // Should show error toast
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Gagal')
      );
    });

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

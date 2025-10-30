import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LicenseDetailsPage from '../../pages/licenses/LicenseDetailsPage';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import * as apiClient from '../../services/apiClient';
import type { License } from '../../types/license';

vi.mock('../../services/apiClient', () => ({
  default: {
    getLicense: vi.fn(),
    getLicenseRequirements: vi.fn(),
  },
}));

describe('License Details Flow Integration Tests', () => {
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
                <Route path="/licenses/:id" element={<LicenseDetailsPage />} />
              </Routes>
            </NotificationContext.Provider>
          </CompanyContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.default.getLicenseRequirements).mockResolvedValue(mockRequirements);
  });

  it('should display draft application details correctly', async () => {
    const draftLicense: License = {
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
          alamat_2: 'Taman Test',
          bandar: 'Kuala Lumpur',
          poskod: '50000',
          negeri: 'Wilayah Persekutuan',
        },
        nama_perniagaan: 'Restoran Test',
        jenis_operasi: 'Restoran',
        bilangan_pekerja: 10,
      },
      documents: [],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(draftLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Should show license type
    expect(screen.getByText('Lesen Perniagaan Makanan')).toBeInTheDocument();

    // Should show kategori badge
    expect(screen.getByText('Berisiko')).toBeInTheDocument();

    // Should show status badge (without "Permohonan Baru" label)
    expect(screen.getByText('Draf')).toBeInTheDocument();

    // Should show company name
    expect(screen.getByText('Test Company Sdn Bhd')).toBeInTheDocument();

    // Should show business name
    expect(screen.getByText('Restoran Test')).toBeInTheDocument();

    // Should show address
    expect(screen.getByText(/No 123, Jalan Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Taman Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Kuala Lumpur/i)).toBeInTheDocument();
    expect(screen.getByText(/50000/i)).toBeInTheDocument();

    // Should show business details
    expect(screen.getByText('Restoran')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Should show "—" for submission date (draft)
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should display submitted application details correctly', async () => {
    const submittedLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Diserahkan',
      tarikh_serahan: '2025-10-29T12:00:00Z',
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
          status_sah: 'Disahkan',
          created_at: '2025-10-29T10:00:00Z',
        },
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(submittedLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Should show status badge (true backend status, not "Permohonan Baru")
    expect(screen.getByText('Diserahkan')).toBeInTheDocument();
    expect(screen.queryByText('Permohonan Baru')).not.toBeInTheDocument();

    // Should show submission date
    expect(screen.getByText(/29 Okt 2025/i)).toBeInTheDocument();

    // Should show info banner
    expect(
      screen.getByText(/Permohonan anda sedang dalam proses semakan PBT/i)
    ).toBeInTheDocument();

    // Should not show action buttons
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Batal Permohonan/i })).not.toBeInTheDocument();
  });

  it('should display cancelled application details correctly', async () => {
    const cancelledLicense: License = {
      id: 'license-1',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-1',
      jenis_lesen_nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko',
      status: 'Dibatalkan',
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
      documents: [],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(cancelledLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Should show cancelled status badge
    expect(screen.getByText('Dibatalkan')).toBeInTheDocument();

    // Should not show action buttons
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Batal Permohonan/i })).not.toBeInTheDocument();
  });

  it('should display uploaded documents correctly', async () => {
    const licenseWithDocuments: License = {
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
          status_sah: 'Disahkan',
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

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(licenseWithDocuments);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Should show documents section
    expect(screen.getByText('Dokumen')).toBeInTheDocument();

    // Should show requirement names
    expect(screen.getByText('Salinan IC Pemilik')).toBeInTheDocument();
    expect(screen.getByText('Pelan Premis')).toBeInTheDocument();

    // Should show file names
    expect(screen.getByText('ic_pemilik.pdf')).toBeInTheDocument();
    expect(screen.getByText('pelan_premis.pdf')).toBeInTheDocument();

    // Should show file sizes
    expect(screen.getByText(/1\.00 MB/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.00 MB/i)).toBeInTheDocument();

    // Should show status badges
    expect(screen.getByText('Disahkan')).toBeInTheDocument();
    expect(screen.getByText('Belum Disahkan')).toBeInTheDocument();

    // Should show download links
    const downloadLinks = screen.getAllByRole('link', { name: /Muat Turun/i });
    expect(downloadLinks).toHaveLength(2);
    expect(downloadLinks[0]).toHaveAttribute('href', '/storage/documents/ic_pemilik.pdf');
    expect(downloadLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('should show placeholder for missing documents', async () => {
    const licenseWithMissingDocs: License = {
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
          status_sah: 'Disahkan',
          created_at: '2025-10-29T10:00:00Z',
        },
        // req-2 is missing
      ],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(licenseWithMissingDocs);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Should show requirement name
    expect(screen.getByText('Pelan Premis')).toBeInTheDocument();

    // Should show placeholder for missing document
    const pelanPremisSection = screen.getByText('Pelan Premis').closest('div');
    expect(within(pelanPremisSection!).getByText('—')).toBeInTheDocument();
  });

  it('should show loading state while fetching license', async () => {
    // Mock slow API call
    vi.mocked(apiClient.default.getLicense).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        id: 'license-1',
        user_id: 'user-1',
        company_id: 'company-1',
        jenis_lesen_id: 'jl-1',
        jenis_lesen_nama: 'Lesen Perniagaan Makanan',
        kategori: 'Berisiko' as const,
        status: 'Draf' as const,
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
        documents: [],
        created_at: '2025-10-29T10:00:00Z',
        updated_at: '2025-10-29T10:00:00Z',
      }), 1000))
    );

    renderWithProviders();

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle API errors', async () => {
    vi.mocked(apiClient.default.getLicense).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders();

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat data permohonan/i)).toBeInTheDocument();
    });
  });

  it('should display breadcrumb navigation', async () => {
    const draftLicense: License = {
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
      documents: [],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(draftLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Should show breadcrumb
    expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
  });
});

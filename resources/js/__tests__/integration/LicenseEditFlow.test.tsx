import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LicenseEditPage from '../../pages/licenses/LicenseEditPage';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import * as apiClient from '../../services/apiClient';
import type { License } from '../../types/license';

// Mock API client
vi.mock('../../services/apiClient', () => ({
  default: {
    getLicense: vi.fn(),
    updateLicense: vi.fn(),
    getLicenseRequirements: vi.fn(),
    getJenisLesen: vi.fn(),
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

describe('License Edit Flow Integration Tests', () => {
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

  const mockDraftLicense: License = {
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

  const mockJenisLesen = [
    {
      id: 'jl-1',
      kod: 'LESEN-001',
      nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko' as const,
      yuran_proses: 50.0,
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
    vi.mocked(apiClient.default.getLicense).mockResolvedValue(mockDraftLicense);
    vi.mocked(apiClient.default.getLicenseRequirements).mockResolvedValue(mockRequirements);
    vi.mocked(apiClient.default.getJenisLesen).mockResolvedValue(mockJenisLesen);
  });

  it('should navigate through all tabs in edit page', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Should start on Maklumat tab
    expect(screen.getByRole('tab', { name: /Maklumat/i, selected: true })).toBeInTheDocument();

    // Navigate to Dokumen tab
    const dokumenTab = screen.getByRole('tab', { name: /Dokumen/i });
    await user.click(dokumenTab);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Dokumen/i, selected: true })).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Serahan/i, selected: true })).toBeInTheDocument();
    });

    // Navigate back to Maklumat tab
    const maklumatTab = screen.getByRole('tab', { name: /Maklumat/i });
    await user.click(maklumatTab);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Maklumat/i, selected: true })).toBeInTheDocument();
    });
  });

  it('should update license information in Maklumat tab', async () => {
    const user = userEvent.setup();
    
    const updatedLicense = {
      ...mockDraftLicense,
      butiran_operasi: {
        ...mockDraftLicense.butiran_operasi,
        nama_perniagaan: 'Restoran Test Updated',
      },
    };
    
    vi.mocked(apiClient.default.updateLicense).mockResolvedValue(updatedLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Should be on Maklumat tab
    expect(screen.getByLabelText(/Nama Perniagaan/i)).toBeInTheDocument();

    // Update business name
    const namaPerniagaanInput = screen.getByLabelText(/Nama Perniagaan/i);
    await user.clear(namaPerniagaanInput);
    await user.type(namaPerniagaanInput, 'Restoran Test Updated');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /Simpan Perubahan/i });
    await user.click(saveButton);

    // Verify API was called
    await waitFor(() => {
      expect(apiClient.default.updateLicense).toHaveBeenCalledWith(
        'license-1',
        expect.objectContaining({
          butiran_operasi: expect.objectContaining({
            nama_perniagaan: 'Restoran Test Updated',
          }),
        })
      );
    });

    // Verify success toast
    expect(mockToast.success).toHaveBeenCalledWith('Perubahan berjaya disimpan');
  });

  it('should redirect non-draft applications to details page', async () => {
    const submittedLicense: License = {
      ...mockDraftLicense,
      status: 'Diserahkan',
      tarikh_serahan: '2025-10-29T12:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(submittedLicense);

    renderWithProviders();

    // Should redirect to details page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/licenses/license-1');
    });
  });

  it('should display document requirements in Dokumen tab', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Dokumen tab
    const dokumenTab = screen.getByRole('tab', { name: /Dokumen/i });
    await user.click(dokumenTab);

    // Wait for requirements to load
    await waitFor(() => {
      expect(screen.getByText('Salinan IC Pemilik')).toBeInTheDocument();
      expect(screen.getByText('Pelan Premis')).toBeInTheDocument();
    });

    // Verify requirement details are shown
    expect(screen.getByText('Salinan kad pengenalan pemilik perniagaan')).toBeInTheDocument();
    expect(screen.getByText('Pelan lokasi premis perniagaan')).toBeInTheDocument();
  });

  it('should show completeness checklist in Serahan tab', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Navigate to Serahan tab
    const serahanTab = screen.getByRole('tab', { name: /Serahan/i });
    await user.click(serahanTab);

    // Wait for checklist to appear
    await waitFor(() => {
      expect(screen.getByText('Semakan Kelengkapan')).toBeInTheDocument();
    });

    // Verify checklist items
    expect(screen.getByText(/Maklumat lesen lengkap/i)).toBeInTheDocument();
    expect(screen.getByText(/Alamat premis diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Semua dokumen wajib dimuat naik/i)).toBeInTheDocument();
  });

  it('should disable submit button when application is incomplete', async () => {
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

    // Submit button should be disabled (no documents uploaded)
    const submitButton = screen.getByRole('button', { name: /Hantar Permohonan/i });
    expect(submitButton).toBeDisabled();
  });

  it('should handle validation errors when updating', async () => {
    const user = userEvent.setup();
    
    // Mock validation error
    vi.mocked(apiClient.default.updateLicense).mockRejectedValue({
      errors: {
        'butiran_operasi.nama_perniagaan': ['Nama perniagaan diperlukan'],
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Edit Permohonan')).toBeInTheDocument();
    });

    // Clear business name
    const namaPerniagaanInput = screen.getByLabelText(/Nama Perniagaan/i);
    await user.clear(namaPerniagaanInput);

    // Try to save
    const saveButton = screen.getByRole('button', { name: /Simpan Perubahan/i });
    await user.click(saveButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Nama perniagaan diperlukan')).toBeInTheDocument();
    });
  });
});

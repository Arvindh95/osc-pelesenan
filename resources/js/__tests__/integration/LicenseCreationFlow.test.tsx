import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LicenseCreatePage from '../../pages/licenses/LicenseCreatePage';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import * as apiClient from '../../services/apiClient';

// Mock API client
vi.mock('../../services/apiClient', () => ({
  default: {
    getJenisLesen: vi.fn(),
    createLicense: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('License Creation Flow Integration Tests', () => {
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

  const mockJenisLesen = [
    {
      id: 'jl-1',
      kod: 'LESEN-001',
      nama: 'Lesen Perniagaan Makanan',
      kategori: 'Berisiko' as const,
      yuran_proses: 50.0,
    },
    {
      id: 'jl-2',
      kod: 'LESEN-002',
      nama: 'Lesen Kedai Runcit',
      kategori: 'Tidak Berisiko' as const,
      yuran_proses: 30.0,
    },
  ];

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const renderWithProviders = (component: React.ReactElement) => {
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
              {component}
            </NotificationContext.Provider>
          </CompanyContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(apiClient.default.getJenisLesen).mockResolvedValue(mockJenisLesen);
  });

  it('should complete the full application creation wizard flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful creation
    const mockCreatedLicense = {
      id: 'license-1',
      user_id: mockUser.id,
      company_id: mockCompany.id,
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
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    };
    
    vi.mocked(apiClient.default.createLicense).mockResolvedValue(mockCreatedLicense);

    renderWithProviders(<LicenseCreatePage />);

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Permohonan Lesen Baharu')).toBeInTheDocument();
    });

    // Step 1: Maklumat Lesen
    expect(screen.getByText('Maklumat Lesen')).toBeInTheDocument();
    
    // Select Jenis Lesen
    const jenisLesenSelect = screen.getByLabelText(/Jenis Lesen/i);
    await user.click(jenisLesenSelect);
    await user.click(screen.getByText('Lesen Perniagaan Makanan'));

    // Verify kategori and yuran are displayed
    expect(screen.getByText('Berisiko')).toBeInTheDocument();
    expect(screen.getByText('RM 50.00')).toBeInTheDocument();

    // Click next
    const nextButton = screen.getByRole('button', { name: /Seterusnya/i });
    await user.click(nextButton);

    // Step 2: Butiran Premis
    await waitFor(() => {
      expect(screen.getByText('Butiran Premis')).toBeInTheDocument();
    });

    // Fill in premise address
    await user.type(screen.getByLabelText(/Alamat 1/i), 'No 123, Jalan Test');
    await user.type(screen.getByLabelText(/Bandar/i), 'Kuala Lumpur');
    await user.type(screen.getByLabelText(/Poskod/i), '50000');
    
    const negeriSelect = screen.getByLabelText(/Negeri/i);
    await user.click(negeriSelect);
    await user.click(screen.getByText('Wilayah Persekutuan'));

    // Fill in business details
    await user.type(screen.getByLabelText(/Nama Perniagaan/i), 'Restoran Test');

    // Click next
    const nextButton2 = screen.getByRole('button', { name: /Seterusnya/i });
    await user.click(nextButton2);

    // Step 3: Semak & Simpan
    await waitFor(() => {
      expect(screen.getByText('Semak & Simpan')).toBeInTheDocument();
    });

    // Verify summary displays correct information
    expect(screen.getByText('Lesen Perniagaan Makanan')).toBeInTheDocument();
    expect(screen.getByText('No 123, Jalan Test')).toBeInTheDocument();
    expect(screen.getByText('Restoran Test')).toBeInTheDocument();

    // Save draft
    const saveButton = screen.getByRole('button', { name: /Simpan Draf/i });
    await user.click(saveButton);

    // Verify API was called with correct data
    await waitFor(() => {
      expect(apiClient.default.createLicense).toHaveBeenCalledWith({
        company_id: mockCompany.id,
        jenis_lesen_id: 'jl-1',
        butiran_operasi: {
          alamat_premis: {
            alamat_1: 'No 123, Jalan Test',
            bandar: 'Kuala Lumpur',
            poskod: '50000',
            negeri: 'Wilayah Persekutuan',
          },
          nama_perniagaan: 'Restoran Test',
        },
      });
    });

    // Verify navigation to edit page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses/license-1/edit');
    
    // Verify success toast
    expect(mockToast.success).toHaveBeenCalledWith('Draf permohonan berjaya disimpan');
  });

  it('should validate required fields before allowing navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByText('Permohonan Lesen Baharu')).toBeInTheDocument();
    });

    // Try to proceed without selecting Jenis Lesen
    const nextButton = screen.getByRole('button', { name: /Seterusnya/i });
    await user.click(nextButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Sila pilih jenis lesen/i)).toBeInTheDocument();
    });

    // Should still be on step 1
    expect(screen.getByText('Maklumat Lesen')).toBeInTheDocument();
  });

  it('should allow navigation back to previous steps', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByText('Permohonan Lesen Baharu')).toBeInTheDocument();
    });

    // Complete step 1
    const jenisLesenSelect = screen.getByLabelText(/Jenis Lesen/i);
    await user.click(jenisLesenSelect);
    await user.click(screen.getByText('Lesen Perniagaan Makanan'));
    
    const nextButton = screen.getByRole('button', { name: /Seterusnya/i });
    await user.click(nextButton);

    // Now on step 2
    await waitFor(() => {
      expect(screen.getByText('Butiran Premis')).toBeInTheDocument();
    });

    // Click back
    const backButton = screen.getByRole('button', { name: /Kembali/i });
    await user.click(backButton);

    // Should be back on step 1
    await waitFor(() => {
      expect(screen.getByText('Maklumat Lesen')).toBeInTheDocument();
    });
  });

  it('should handle API errors during creation', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    vi.mocked(apiClient.default.createLicense).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders(<LicenseCreatePage />);

    await waitFor(() => {
      expect(screen.getByText('Permohonan Lesen Baharu')).toBeInTheDocument();
    });

    // Complete all steps quickly
    const jenisLesenSelect = screen.getByLabelText(/Jenis Lesen/i);
    await user.click(jenisLesenSelect);
    await user.click(screen.getByText('Lesen Perniagaan Makanan'));
    await user.click(screen.getByRole('button', { name: /Seterusnya/i }));

    await waitFor(() => {
      expect(screen.getByText('Butiran Premis')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Alamat 1/i), 'No 123, Jalan Test');
    await user.type(screen.getByLabelText(/Bandar/i), 'Kuala Lumpur');
    await user.type(screen.getByLabelText(/Poskod/i), '50000');
    
    const negeriSelect = screen.getByLabelText(/Negeri/i);
    await user.click(negeriSelect);
    await user.click(screen.getByText('Wilayah Persekutuan'));
    await user.type(screen.getByLabelText(/Nama Perniagaan/i), 'Restoran Test');
    await user.click(screen.getByRole('button', { name: /Seterusnya/i }));

    await waitFor(() => {
      expect(screen.getByText('Semak & Simpan')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Simpan Draf/i });
    await user.click(saveButton);

    // Should show error message
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Gagal')
      );
    });

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LicensesListPage from '../../pages/licenses/LicensesListPage';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import * as apiClient from '../../services/apiClient';
import type { License } from '../../types/license';

vi.mock('../../services/apiClient', () => ({
  default: {
    getLicenses: vi.fn(),
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

describe('License List Flow Integration Tests', () => {
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

  const mockLicenses: License[] = [
    {
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
      documents: [],
      created_at: '2025-10-29T10:00:00Z',
      updated_at: '2025-10-29T10:00:00Z',
    },
    {
      id: 'license-2',
      user_id: 'user-1',
      company_id: 'company-1',
      jenis_lesen_id: 'jl-2',
      jenis_lesen_nama: 'Lesen Kedai Runcit',
      kategori: 'Tidak Berisiko',
      status: 'Draf',
      tarikh_serahan: null,
      butiran_operasi: {
        alamat_premis: {
          alamat_1: 'No 456, Jalan Test 2',
          bandar: 'Petaling Jaya',
          poskod: '46000',
          negeri: 'Selangor',
        },
        nama_perniagaan: 'Kedai Test',
      },
      documents: [],
      created_at: '2025-10-28T10:00:00Z',
      updated_at: '2025-10-28T10:00:00Z',
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
              <LicensesListPage />
            </NotificationContext.Provider>
          </CompanyContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(apiClient.default.getLicenses).mockResolvedValue({
      data: mockLicenses,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
      },
    });
  });

  it('should display list of licenses', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Should show both licenses
    expect(screen.getByText('Lesen Perniagaan Makanan')).toBeInTheDocument();
    expect(screen.getByText('Lesen Kedai Runcit')).toBeInTheDocument();

    // Should show status badges
    expect(screen.getByText('Permohonan Baru')).toBeInTheDocument(); // Diserahkan with showNewLabel
    expect(screen.getByText('Draf')).toBeInTheDocument();
  });

  it('should filter licenses by keyword', async () => {
    const user = userEvent.setup();

    // Mock filtered results
    vi.mocked(apiClient.default.getLicenses).mockResolvedValue({
      data: [mockLicenses[0]],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1,
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Cari jenis lesen/i);
    await user.type(searchInput, 'Makanan');

    // Should call API with keyword filter
    await waitFor(() => {
      expect(apiClient.default.getLicenses).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'Makanan',
        })
      );
    });
  });

  it('should filter licenses by status', async () => {
    const user = userEvent.setup();

    // Mock filtered results
    vi.mocked(apiClient.default.getLicenses).mockResolvedValue({
      data: [mockLicenses[1]],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1,
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Select status filter
    const statusSelect = screen.getByLabelText(/Status/i);
    await user.click(statusSelect);
    await user.click(screen.getByText('Draf'));

    // Should call API with status filter
    await waitFor(() => {
      expect(apiClient.default.getLicenses).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Draf',
        })
      );
    });
  });

  it('should filter licenses by date range', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Set date range
    const dateFromInput = screen.getByLabelText(/Tarikh Dari/i);
    await user.type(dateFromInput, '2025-10-28');

    const dateToInput = screen.getByLabelText(/Tarikh Hingga/i);
    await user.type(dateToInput, '2025-10-29');

    // Should call API with date filters
    await waitFor(() => {
      expect(apiClient.default.getLicenses).toHaveBeenCalledWith(
        expect.objectContaining({
          tarikh_dari: '2025-10-28',
          tarikh_hingga: '2025-10-29',
        })
      );
    });
  });

  it('should handle pagination', async () => {
    const user = userEvent.setup();

    // Mock paginated results
    vi.mocked(apiClient.default.getLicenses).mockResolvedValue({
      data: mockLicenses,
      meta: {
        current_page: 1,
        last_page: 3,
        per_page: 10,
        total: 25,
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Should show pagination controls
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();

    // Click next page
    const nextButton = screen.getByRole('button', { name: /Next/i });
    await user.click(nextButton);

    // Should call API with page 2
    await waitFor(() => {
      expect(apiClient.default.getLicenses).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it('should navigate to details page when row is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Click on a license row
    const licenseRow = screen.getByText('Lesen Perniagaan Makanan').closest('tr');
    await user.click(licenseRow!);

    // Should navigate to details page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses/license-1');
  });

  it('should navigate to edit page when edit button is clicked for draft', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Find edit button for draft license
    const draftRow = screen.getByText('Lesen Kedai Runcit').closest('tr');
    const editButton = within(draftRow!).getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    // Should navigate to edit page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses/license-2/edit');
  });

  it('should not show edit button for submitted licenses', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Find submitted license row
    const submittedRow = screen.getByText('Lesen Perniagaan Makanan').closest('tr');
    
    // Should not have edit button
    expect(within(submittedRow!).queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
  });

  it('should show empty state when no licenses exist', async () => {
    vi.mocked(apiClient.default.getLicenses).mockResolvedValue({
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Should show empty state
    expect(screen.getByText(/Tiada permohonan lesen/i)).toBeInTheDocument();
    expect(screen.getByText(/Mulakan permohonan lesen baharu/i)).toBeInTheDocument();

    // Should show CTA button
    expect(screen.getByRole('button', { name: /Mohon Lesen Baharu/i })).toBeInTheDocument();
  });

  it('should navigate to create page when create button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Click create button
    const createButton = screen.getByRole('button', { name: /Mohon Lesen Baharu/i });
    await user.click(createButton);

    // Should navigate to create page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses/new');
  });

  it('should show loading state while fetching licenses', async () => {
    // Mock slow API call
    vi.mocked(apiClient.default.getLicenses).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        data: mockLicenses,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 2,
        },
      }), 1000))
    );

    renderWithProviders();

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Lesen Perniagaan Makanan')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle API errors', async () => {
    vi.mocked(apiClient.default.getLicenses).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders();

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat data/i)).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByRole('button', { name: /Cuba Lagi/i })).toBeInTheDocument();
  });

  it('should retry fetching licenses when retry button is clicked', async () => {
    const user = userEvent.setup();

    // First call fails
    vi.mocked(apiClient.default.getLicenses).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Second call succeeds
    vi.mocked(apiClient.default.getLicenses).mockResolvedValueOnce({
      data: mockLicenses,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
      },
    });

    renderWithProviders();

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat data/i)).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByRole('button', { name: /Cuba Lagi/i });
    await user.click(retryButton);

    // Should show licenses after retry
    await waitFor(() => {
      expect(screen.getByText('Lesen Perniagaan Makanan')).toBeInTheDocument();
    });
  });

  it('should reset to page 1 when filters change', async () => {
    const user = userEvent.setup();

    // Start on page 2
    vi.mocked(apiClient.default.getLicenses).mockResolvedValue({
      data: mockLicenses,
      meta: {
        current_page: 2,
        last_page: 3,
        per_page: 10,
        total: 25,
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Lesen Saya')).toBeInTheDocument();
    });

    // Change filter
    const searchInput = screen.getByPlaceholderText(/Cari jenis lesen/i);
    await user.type(searchInput, 'Makanan');

    // Should call API with page 1
    await waitFor(() => {
      expect(apiClient.default.getLicenses).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          keyword: 'Makanan',
        })
      );
    });
  });
});

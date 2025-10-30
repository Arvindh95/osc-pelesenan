import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    cancelLicense: vi.fn(),
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

describe('License Cancellation Flow Integration Tests', () => {
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
    mockNavigate.mockClear();
    vi.mocked(apiClient.default.getLicense).mockResolvedValue(mockDraftLicense);
    vi.mocked(apiClient.default.getLicenseRequirements).mockResolvedValue([]);
  });

  it('should show cancel button for draft applications', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Cancel button should be visible
    expect(screen.getByRole('button', { name: /Batal Permohonan/i })).toBeInTheDocument();
  });

  it('should not show cancel button for submitted applications', async () => {
    const submittedLicense: License = {
      ...mockDraftLicense,
      status: 'Diserahkan',
      tarikh_serahan: '2025-10-29T12:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(submittedLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Cancel button should not be visible
    expect(screen.queryByRole('button', { name: /Batal Permohonan/i })).not.toBeInTheDocument();

    // Info banner should be shown
    expect(
      screen.getByText(/Permohonan anda sedang dalam proses semakan PBT/i)
    ).toBeInTheDocument();
  });

  it('should show confirmation dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Batal Permohonan/i });
    await user.click(cancelButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/Batal Permohonan/i)).toBeInTheDocument();
    });

    // Dialog should show warning message
    expect(
      screen.getByText(/Adakah anda pasti untuk membatalkan permohonan ini/i)
    ).toBeInTheDocument();

    // Dialog should have confirm and cancel buttons
    expect(screen.getByRole('button', { name: /Ya, Batal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tidak/i })).toBeInTheDocument();
  });

  it('should cancel application when confirmed', async () => {
    const user = userEvent.setup();

    vi.mocked(apiClient.default.cancelLicense).mockResolvedValue(undefined);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Batal Permohonan/i });
    await user.click(cancelButton);

    // Wait for dialog and confirm
    await waitFor(() => {
      expect(screen.getByText(/Batal Permohonan/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Ya, Batal/i });
    await user.click(confirmButton);

    // Should call cancel API
    await waitFor(() => {
      expect(apiClient.default.cancelLicense).toHaveBeenCalledWith(
        'license-1',
        'Dibatalkan oleh pemohon'
      );
    });

    // Should navigate to list page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses');

    // Should show success toast
    expect(mockToast.success).toHaveBeenCalledWith('Permohonan berjaya dibatalkan');
  });

  it('should not cancel when dialog is cancelled', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Batal Permohonan/i });
    await user.click(cancelButton);

    // Wait for dialog and click cancel
    await waitFor(() => {
      expect(screen.getByText(/Batal Permohonan/i)).toBeInTheDocument();
    });

    const cancelDialogButton = screen.getByRole('button', { name: /Tidak/i });
    await user.click(cancelDialogButton);

    // Should not call cancel API
    expect(apiClient.default.cancelLicense).not.toHaveBeenCalled();

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(/Adakah anda pasti untuk membatalkan permohonan ini/i)).not.toBeInTheDocument();
    });
  });

  it('should handle cancellation errors', async () => {
    const user = userEvent.setup();

    vi.mocked(apiClient.default.cancelLicense).mockRejectedValue(
      new Error('Cancellation failed')
    );

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Batal Permohonan/i });
    await user.click(cancelButton);

    // Wait for dialog and confirm
    await waitFor(() => {
      expect(screen.getByText(/Batal Permohonan/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /Ya, Batal/i });
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

  it('should show edit button for draft applications', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Edit button should be visible
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('should navigate to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    // Should navigate to edit page
    expect(mockNavigate).toHaveBeenCalledWith('/licenses/license-1/edit');
  });

  it('should not show edit button for submitted applications', async () => {
    const submittedLicense: License = {
      ...mockDraftLicense,
      status: 'Diserahkan',
      tarikh_serahan: '2025-10-29T12:00:00Z',
    };

    vi.mocked(apiClient.default.getLicense).mockResolvedValue(submittedLicense);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Butiran Permohonan')).toBeInTheDocument();
    });

    // Edit button should not be visible
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
  });
});

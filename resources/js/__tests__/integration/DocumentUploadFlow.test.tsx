import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DocumentUploadSlot from '../../components/licenses/DocumentUploadSlot';
import { NotificationContext } from '../../contexts/NotificationContext';
import type { Requirement, LicenseDocument } from '../../types/license';

describe('Document Upload Flow Integration Tests', () => {
  const mockRequirement: Requirement = {
    id: 'req-1',
    jenis_lesen_id: 'jl-1',
    nama: 'Salinan IC Pemilik',
    keterangan: 'Salinan kad pengenalan pemilik perniagaan',
    wajib: true,
  };

  const mockExistingDocument: LicenseDocument = {
    id: 'doc-1',
    permohonan_id: 'license-1',
    keperluan_dokumen_id: 'req-1',
    nama_fail: 'ic_pemilik.pdf',
    mime: 'application/pdf',
    saiz_bait: 1024000,
    url_storan: '/storage/documents/ic_pemilik.pdf',
    status_sah: 'BelumSah',
    created_at: '2025-10-29T10:00:00Z',
  };

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const mockOnUpload = vi.fn();
  const mockOnDelete = vi.fn();

  const renderWithProviders = (props: any) => {
    return render(
      <BrowserRouter>
        <NotificationContext.Provider value={mockToast}>
          <DocumentUploadSlot {...props} />
        </NotificationContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate file type before upload', async () => {
    const user = userEvent.setup();

    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760, // 10MB
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Create invalid file (txt)
    const invalidFile = new File(['test content'], 'document.txt', {
      type: 'text/plain',
    });

    // Get file input
    const fileInput = screen.getByLabelText(/Muat Naik/i);

    // Upload invalid file
    await user.upload(fileInput, invalidFile);

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/Jenis fail tidak dibenarkan/i)
      ).toBeInTheDocument();
    });

    // Should not call onUpload
    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it('should validate file size before upload', async () => {
    const user = userEvent.setup();

    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 1048576, // 1MB
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Create oversized file (2MB)
    const oversizedFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const fileInput = screen.getByLabelText(/Muat Naik/i);
    await user.upload(fileInput, oversizedFile);

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/Saiz fail melebihi had maksimum/i)
      ).toBeInTheDocument();
    });

    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it('should successfully upload valid file', async () => {
    const user = userEvent.setup();

    mockOnUpload.mockResolvedValue(undefined);

    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Create valid file
    const validFile = new File(['test content'], 'ic_pemilik.pdf', {
      type: 'application/pdf',
    });

    const fileInput = screen.getByLabelText(/Muat Naik/i);
    await user.upload(fileInput, validFile);

    // Should call onUpload with correct parameters
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(validFile, 'req-1');
    });
  });

  it('should show loading state during upload', async () => {
    const user = userEvent.setup();

    // Mock slow upload
    mockOnUpload.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    const validFile = new File(['test content'], 'ic_pemilik.pdf', {
      type: 'application/pdf',
    });

    const fileInput = screen.getByLabelText(/Muat Naik/i);
    await user.upload(fileInput, validFile);

    // Should show loading text
    expect(screen.getByText(/Memuat naik/i)).toBeInTheDocument();

    // Button should be disabled
    const uploadButton = screen.getByRole('button', { name: /Memuat naik/i });
    expect(uploadButton).toBeDisabled();
  });

  it('should handle upload errors', async () => {
    const user = userEvent.setup();

    mockOnUpload.mockRejectedValue(new Error('Network error'));

    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    const validFile = new File(['test content'], 'ic_pemilik.pdf', {
      type: 'application/pdf',
    });

    const fileInput = screen.getByLabelText(/Muat Naik/i);
    await user.upload(fileInput, validFile);

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/Gagal memuat naik fail/i)
      ).toBeInTheDocument();
    });
  });

  it('should display existing document information', () => {
    renderWithProviders({
      requirement: mockRequirement,
      existingDocument: mockExistingDocument,
      onUpload: mockOnUpload,
      onDelete: mockOnDelete,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Should show document name
    expect(screen.getByText('ic_pemilik.pdf')).toBeInTheDocument();

    // Should show file size
    expect(screen.getByText(/1\.00 MB/i)).toBeInTheDocument();

    // Should show status badge
    expect(screen.getByText('Belum Disahkan')).toBeInTheDocument();

    // Should show replace button
    expect(screen.getByRole('button', { name: /Ganti/i })).toBeInTheDocument();

    // Should show delete button (status is BelumSah)
    expect(screen.getByRole('button', { name: /Padam/i })).toBeInTheDocument();
  });

  it('should allow replacing existing document', async () => {
    const user = userEvent.setup();

    mockOnUpload.mockResolvedValue(undefined);

    renderWithProviders({
      requirement: mockRequirement,
      existingDocument: mockExistingDocument,
      onUpload: mockOnUpload,
      onDelete: mockOnDelete,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    const newFile = new File(['new content'], 'ic_pemilik_new.pdf', {
      type: 'application/pdf',
    });

    // Click replace button and upload new file
    const replaceButton = screen.getByRole('button', { name: /Ganti/i });
    const fileInput = replaceButton.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(fileInput, newFile);

    // Should call onUpload with new file
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(newFile, 'req-1');
    });
  });

  it('should allow deleting unvalidated document', async () => {
    const user = userEvent.setup();

    mockOnDelete.mockResolvedValue(undefined);

    renderWithProviders({
      requirement: mockRequirement,
      existingDocument: mockExistingDocument,
      onUpload: mockOnUpload,
      onDelete: mockOnDelete,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    const deleteButton = screen.getByRole('button', { name: /Padam/i });
    await user.click(deleteButton);

    // Should call onDelete with document ID
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('doc-1');
    });
  });

  it('should not show delete button for validated documents', () => {
    const validatedDocument: LicenseDocument = {
      ...mockExistingDocument,
      status_sah: 'Disahkan',
    };

    renderWithProviders({
      requirement: mockRequirement,
      existingDocument: validatedDocument,
      onUpload: mockOnUpload,
      onDelete: mockOnDelete,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Should not show delete button
    expect(screen.queryByRole('button', { name: /Padam/i })).not.toBeInTheDocument();

    // Should still show replace button
    expect(screen.getByRole('button', { name: /Ganti/i })).toBeInTheDocument();
  });

  it('should display file type and size constraints', () => {
    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Should show allowed file types
    expect(screen.getByText(/PDF, JPG, JPEG, PNG/i)).toBeInTheDocument();

    // Should show max file size
    expect(screen.getByText(/10\.00 MB/i)).toBeInTheDocument();
  });

  it('should show required indicator for mandatory documents', () => {
    renderWithProviders({
      requirement: mockRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Should show required indicator
    expect(screen.getByText(/\* Wajib/i)).toBeInTheDocument();
  });

  it('should not show required indicator for optional documents', () => {
    const optionalRequirement: Requirement = {
      ...mockRequirement,
      wajib: false,
    };

    renderWithProviders({
      requirement: optionalRequirement,
      onUpload: mockOnUpload,
      maxFileSize: 10485760,
      allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    });

    // Should not show required indicator
    expect(screen.queryByText(/\* Wajib/i)).not.toBeInTheDocument();
  });
});

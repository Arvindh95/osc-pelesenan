import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentUploadSlot from '../DocumentUploadSlot';
import { Requirement, LicenseDocument } from '../../../types/license';

describe('DocumentUploadSlot', () => {
  const mockOnUpload = vi.fn();
  const mockOnDelete = vi.fn();

  const mockRequirement: Requirement = {
    id: 'req-1',
    jenis_lesen_id: 'jl-1',
    nama: 'Salinan IC',
    keterangan: 'Salinan kad pengenalan pemohon',
    wajib: true,
  };

  const mockDocument: LicenseDocument = {
    id: 'doc-1',
    permohonan_id: 'lic-1',
    keperluan_dokumen_id: 'req-1',
    nama_fail: 'ic.pdf',
    mime: 'application/pdf',
    saiz_bait: 1024000,
    url_storan: '/storage/ic.pdf',
    status_sah: 'BelumSah',
    created_at: '2025-10-29T00:00:00Z',
  };

  const defaultProps = {
    requirement: mockRequirement,
    onUpload: mockOnUpload,
    onDelete: mockOnDelete,
    maxFileSize: 10485760, // 10 MB
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
  };

  beforeEach(() => {
    mockOnUpload.mockClear();
    mockOnDelete.mockClear();
  });

  describe('rendering', () => {
    it('should render requirement name and description', () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      expect(screen.getByText('Salinan IC')).toBeInTheDocument();
      expect(
        screen.getByText('Salinan kad pengenalan pemohon')
      ).toBeInTheDocument();
    });

    it('should show required indicator for mandatory requirements', () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      const requiredIndicator = screen.getByLabelText('Wajib');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('should not show required indicator for optional requirements', () => {
      const optionalRequirement = { ...mockRequirement, wajib: false };
      render(
        <DocumentUploadSlot {...defaultProps} requirement={optionalRequirement} />
      );

      expect(screen.queryByLabelText('Wajib')).not.toBeInTheDocument();
    });

    it('should display file constraints', () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      expect(screen.getByText(/PDF, JPG, JPEG, PNG/i)).toBeInTheDocument();
      expect(screen.getByText(/10 MB/i)).toBeInTheDocument();
    });

    it('should show upload button when no document exists', () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      expect(
        screen.getByLabelText('Muat naik dokumen Salinan IC')
      ).toBeInTheDocument();
    });

    it('should show existing document details when document exists', () => {
      render(
        <DocumentUploadSlot {...defaultProps} existingDocument={mockDocument} />
      );

      expect(screen.getByText('ic.pdf')).toBeInTheDocument();
      expect(screen.getByText('1000 KB')).toBeInTheDocument();
    });

    it('should show replace button when document exists', () => {
      render(
        <DocumentUploadSlot {...defaultProps} existingDocument={mockDocument} />
      );

      expect(
        screen.getByLabelText('Ganti dokumen Salinan IC')
      ).toBeInTheDocument();
    });

    it('should show delete button for unvalidated documents', () => {
      render(
        <DocumentUploadSlot {...defaultProps} existingDocument={mockDocument} />
      );

      expect(
        screen.getByLabelText('Padam dokumen Salinan IC')
      ).toBeInTheDocument();
    });

    it('should not show delete button for validated documents', () => {
      const validatedDoc = { ...mockDocument, status_sah: 'Disahkan' as const };
      render(
        <DocumentUploadSlot {...defaultProps} existingDocument={validatedDoc} />
      );

      expect(
        screen.queryByLabelText('Padam dokumen Salinan IC')
      ).not.toBeInTheDocument();
    });
  });

  describe('file validation', () => {
    it('should accept valid PDF file', async () => {
      mockOnUpload.mockResolvedValue(undefined);
      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(file, 'req-1');
      });
    });

    it('should accept valid JPG file', async () => {
      mockOnUpload.mockResolvedValue(undefined);
      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(file, 'req-1');
      });
    });

    it('should reject file with invalid extension', async () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /Jenis fail tidak dibenarkan/i
        );
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it('should reject file exceeding size limit', async () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /Saiz fail melebihi had maksimum/i
        );
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  describe('upload interactions', () => {
    it('should show loading state during upload', async () => {
      let resolveUpload: () => void;
      const uploadPromise = new Promise<void>((resolve) => {
        resolveUpload = resolve;
      });
      mockOnUpload.mockReturnValue(uploadPromise);

      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Memuat naik...')).toBeInTheDocument();
      });

      resolveUpload!();
    });

    it('should show success message after successful upload', async () => {
      mockOnUpload.mockResolvedValue(undefined);
      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText('Dokumen berjaya dimuat naik')
        ).toBeInTheDocument();
      });
    });

    it('should show error message on upload failure', async () => {
      mockOnUpload.mockRejectedValue(new Error('Network error'));
      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Network error/i);
      });
    });

    it('should disable upload button when disabled prop is true', () => {
      render(<DocumentUploadSlot {...defaultProps} disabled={true} />);

      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');
      expect(input).toBeDisabled();
    });
  });

  describe('delete interactions', () => {
    it('should call onDelete when delete button is clicked', async () => {
      mockOnDelete.mockResolvedValue(undefined);
      render(
        <DocumentUploadSlot {...defaultProps} existingDocument={mockDocument} />
      );

      const deleteButton = screen.getByLabelText('Padam dokumen Salinan IC');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith('doc-1');
      });
    });

    it('should show error message on delete failure', async () => {
      mockOnDelete.mockRejectedValue(new Error('Delete failed'));
      render(
        <DocumentUploadSlot {...defaultProps} existingDocument={mockDocument} />
      );

      const deleteButton = screen.getByLabelText('Padam dokumen Salinan IC');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Delete failed/i);
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DocumentUploadSlot {...defaultProps} />);

      expect(
        screen.getByLabelText('Muat naik dokumen Salinan IC')
      ).toBeInTheDocument();
    });

    it('should announce upload status to screen readers', async () => {
      mockOnUpload.mockResolvedValue(undefined);
      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        const statusElements = screen.getAllByRole('status', { hidden: true });
        const srOnlyStatus = statusElements.find(el => 
          el.className.includes('sr-only')
        );
        expect(srOnlyStatus).toHaveTextContent(
          /Dokumen Salinan IC berjaya dimuat naik/i
        );
      });
    });

    it('should have aria-busy attribute during upload', async () => {
      let resolveUpload: () => void;
      const uploadPromise = new Promise<void>((resolve) => {
        resolveUpload = resolve;
      });
      mockOnUpload.mockReturnValue(uploadPromise);

      render(<DocumentUploadSlot {...defaultProps} />);

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('Muat naik dokumen Salinan IC');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'true');
      });

      resolveUpload!();
    });
  });
});

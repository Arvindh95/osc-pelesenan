import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CompletenessChecklist from '../CompletenessChecklist';
import { License, Requirement } from '../../../types/license';

describe('CompletenessChecklist', () => {
  const mockRequirements: Requirement[] = [
    {
      id: 'req-1',
      jenis_lesen_id: 'jl-1',
      nama: 'Salinan IC',
      keterangan: 'Salinan kad pengenalan',
      wajib: true,
    },
    {
      id: 'req-2',
      jenis_lesen_id: 'jl-1',
      nama: 'Pelan Tapak',
      keterangan: 'Pelan lokasi premis',
      wajib: true,
    },
    {
      id: 'req-3',
      jenis_lesen_id: 'jl-1',
      nama: 'Gambar Premis',
      keterangan: 'Gambar premis perniagaan',
      wajib: false,
    },
  ];

  const createMockLicense = (overrides?: Partial<License>): License => ({
    id: 'lic-1',
    user_id: 'user-1',
    company_id: 'comp-1',
    jenis_lesen_id: 'jl-1',
    jenis_lesen_nama: 'Lesen Perniagaan',
    kategori: 'Tidak Berisiko',
    status: 'Draf',
    tarikh_serahan: null,
    butiran_operasi: {
      alamat_premis: {
        alamat_1: 'Jalan Test',
        bandar: 'Kuala Lumpur',
        poskod: '50000',
        negeri: 'Wilayah Persekutuan',
      },
      nama_perniagaan: 'Test Business',
    },
    documents: [],
    created_at: '2025-10-29T00:00:00Z',
    updated_at: '2025-10-29T00:00:00Z',
    ...overrides,
  });

  describe('validation checks', () => {
    it('should show all checks passed when license is complete', () => {
      const license = createMockLicense({
        documents: [
          {
            id: 'doc-1',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-1',
            nama_fail: 'ic.pdf',
            mime: 'application/pdf',
            saiz_bait: 1024,
            url_storan: '/storage/ic.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
          {
            id: 'doc-2',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-2',
            nama_fail: 'pelan.pdf',
            mime: 'application/pdf',
            saiz_bait: 2048,
            url_storan: '/storage/pelan.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
        ],
      });

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      expect(screen.getByText('Maklumat lesen lengkap')).toBeInTheDocument();
      expect(screen.getByText('Alamat premis diisi')).toBeInTheDocument();
      expect(screen.getByText('Semua dokumen wajib dimuat naik')).toBeInTheDocument();
      expect(
        screen.getByText('Permohonan anda lengkap dan bersedia untuk dihantar')
      ).toBeInTheDocument();
    });

    it('should show incomplete when basic info is missing', () => {
      const license = createMockLicense({
        jenis_lesen_id: '',
      });

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      expect(
        screen.getByText('Sila lengkapkan semua keperluan sebelum menghantar permohonan')
      ).toBeInTheDocument();
    });

    it('should show incomplete when premise address is missing', () => {
      const license = createMockLicense({
        butiran_operasi: {
          alamat_premis: {
            alamat_1: '',
            bandar: '',
            poskod: '',
            negeri: '',
          },
          nama_perniagaan: 'Test Business',
        },
      });

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      expect(
        screen.getByText('Sila lengkapkan semua keperluan sebelum menghantar permohonan')
      ).toBeInTheDocument();
    });

    it('should show incomplete when required documents are missing', () => {
      const license = createMockLicense({
        documents: [
          {
            id: 'doc-1',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-1',
            nama_fail: 'ic.pdf',
            mime: 'application/pdf',
            saiz_bait: 1024,
            url_storan: '/storage/ic.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
          // Missing req-2 document
        ],
      });

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      expect(
        screen.getByText('Sila lengkapkan semua keperluan sebelum menghantar permohonan')
      ).toBeInTheDocument();
    });

    it('should not require optional documents', () => {
      const license = createMockLicense({
        documents: [
          {
            id: 'doc-1',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-1',
            nama_fail: 'ic.pdf',
            mime: 'application/pdf',
            saiz_bait: 1024,
            url_storan: '/storage/ic.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
          {
            id: 'doc-2',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-2',
            nama_fail: 'pelan.pdf',
            mime: 'application/pdf',
            saiz_bait: 2048,
            url_storan: '/storage/pelan.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
          // req-3 is optional, not included
        ],
      });

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      expect(
        screen.getByText('Permohonan anda lengkap dan bersedia untuk dihantar')
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const license = createMockLicense();

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      const list = screen.getByRole('list', {
        name: 'Semakan kelengkapan permohonan',
      });
      expect(list).toBeInTheDocument();
    });

    it('should render list items with proper role', () => {
      const license = createMockLicense();

      render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('visual indicators', () => {
    it('should show check icons for passed checks', () => {
      const license = createMockLicense({
        documents: [
          {
            id: 'doc-1',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-1',
            nama_fail: 'ic.pdf',
            mime: 'application/pdf',
            saiz_bait: 1024,
            url_storan: '/storage/ic.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
          {
            id: 'doc-2',
            permohonan_id: 'lic-1',
            keperluan_dokumen_id: 'req-2',
            nama_fail: 'pelan.pdf',
            mime: 'application/pdf',
            saiz_bait: 2048,
            url_storan: '/storage/pelan.pdf',
            status_sah: 'BelumSah',
            created_at: '2025-10-29T00:00:00Z',
          },
        ],
      });

      const { container } = render(
        <CompletenessChecklist license={license} requirements={mockRequirements} />
      );

      const checkIcons = container.querySelectorAll('.text-green-600');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });
});

// M02 License Application Types

// Status types
export type LicenseStatus = 'Draf' | 'Diserahkan' | 'Dibatalkan';

export type DocumentStatus = 'BelumSah' | 'Disahkan';

// Address structure
export interface AlamatPremis {
  alamat_1: string;
  alamat_2?: string;
  bandar: string;
  poskod: string;
  negeri: string;
}

// Business operation details
export interface ButiranOperasi {
  alamat_premis: AlamatPremis;
  nama_perniagaan: string;
  jenis_operasi?: string;
  bilangan_pekerja?: number;
  catatan?: string;
}

// License type catalog
export interface JenisLesen {
  id: string;
  kod: string;
  nama: string;
  kategori: 'Berisiko' | 'Tidak Berisiko';
  yuran_proses: number;
}

// Document requirement
export interface Requirement {
  id: string;
  jenis_lesen_id: string;
  nama: string;
  keterangan?: string;
  wajib: boolean;
}

// License document
export interface LicenseDocument {
  id: string;
  permohonan_id: string;
  keperluan_dokumen_id: string;
  nama_fail: string;
  mime: string;
  saiz_bait: number;
  url_storan: string;
  status_sah: DocumentStatus;
  created_at: string;
}

// License application
export interface License {
  id: string;
  user_id: string;
  company_id: string;
  company_name?: string;
  jenis_lesen_id: string;
  jenis_lesen_nama: string;
  kategori: 'Berisiko' | 'Tidak Berisiko';
  yuran_proses?: number;
  status: LicenseStatus;
  tarikh_serahan: string | null;
  butiran_operasi: ButiranOperasi;
  documents?: LicenseDocument[];
  created_at: string;
  updated_at: string;
}

// API request/response types
export interface CreateLicenseRequest {
  company_id: string;
  jenis_lesen_id: string;
  butiran_operasi: ButiranOperasi;
}

export interface UpdateLicenseRequest {
  company_id?: string;
  jenis_lesen_id?: string;
  butiran_operasi?: Partial<ButiranOperasi>;
}

export interface LicenseListParams {
  status?: LicenseStatus;
  jenis_lesen_id?: string;
  tarikh_dari?: string;
  tarikh_hingga?: string;
  keyword?: string;
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface LicenseListResponse {
  data: License[];
  meta: PaginationMeta;
}

export interface UploadDocumentRequest {
  file: File;
  keperluan_dokumen_id: string;
}

export interface CancelLicenseRequest {
  reason: string;
}

// Filter state for list page
export interface LicenseFilters {
  status: string;
  keyword: string;
  tarikh_dari: string;
  tarikh_hingga: string;
}

// Form data for create wizard
export interface LicenseFormData {
  jenis_lesen_id: string;
  company_id: string;
  butiran_operasi: ButiranOperasi;
}

// Completeness check result
export interface CompletenessCheck {
  label: string;
  passed: boolean;
}

# Design Document

## Module M02 Frontend – License Application Management

---

## Overview

The M02 Frontend extends the existing React application to provide a complete user interface for license application management. It integrates with the M02 Backend API to enable applicants to create, edit, submit, and track license applications through an intuitive multi-step workflow.

**Key Features:**
- Multi-step application creation wizard
- Document upload with client-side validation
- Draft management with auto-save capability
- Completeness checking before submission
- Application list with filtering and search
- Read-only details view for submitted applications

**Technology Stack:**
- React 18 with TypeScript
- React Router v6 for routing
- React Hook Form for form management
- Axios for HTTP requests
- Tailwind CSS for styling
- Vite for build tooling

---

## Architecture

### High-Level Component Structure

```
App
├── AppLayout (from M01)
│   ├── Sidebar (with "Lesen Saya" link)
│   └── Main Content Area
│       ├── LicensesListPage
│       ├── LicenseCreatePage
│       ├── LicenseEditPage
│       └── LicenseDetailsPage
```

### Data Flow

```
User Action → Page Component → API Client → Backend API
                    ↓
              State Update
                    ↓
            UI Re-render
```


### Routing Structure

| Route | Component | Protection | Description |
|:--|:--|:--|:--|
| `/licenses` | LicensesListPage | Protected | List all applications |
| `/licenses/new` | LicenseCreatePage | Protected | Create new application |
| `/licenses/:id` | LicenseDetailsPage | Protected | View application details |
| `/licenses/:id/edit` | LicenseEditPage | Protected | Edit draft application |

All routes use the `ProtectedRoute` wrapper from M01 to ensure authentication.

---

## Type Definitions

### Core Types

```typescript
// resources/js/types/license.ts

export type LicenseStatus = 'Draf' | 'Diserahkan' | 'Dibatalkan';

export type DocumentStatus = 'BelumSah' | 'Disahkan';

export interface AlamatPremis {
  alamat_1: string;
  alamat_2?: string;
  bandar: string;
  poskod: string;
  negeri: string;
}

export interface ButiranOperasi {
  alamat_premis: AlamatPremis;
  nama_perniagaan: string;
  jenis_operasi?: string;
  bilangan_pekerja?: number;
  catatan?: string;
}

export interface License {
  id: string;
  user_id: string;
  company_id: string;
  jenis_lesen_id: string;
  jenis_lesen_nama: string;
  kategori: 'Berisiko' | 'Tidak Berisiko';
  status: LicenseStatus;
  tarikh_serahan: string | null;
  butiran_operasi: ButiranOperasi;
  documents?: LicenseDocument[];
  created_at: string;
  updated_at: string;
}

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

export interface Requirement {
  id: string;
  jenis_lesen_id: string;
  nama: string;
  keterangan?: string;
  wajib: boolean;
}

export interface JenisLesen {
  id: string;
  kod: string;
  nama: string;
  kategori: 'Berisiko' | 'Tidak Berisiko';
  yuran_proses: number;
}
```


---

## API Client Extension

### New Methods in ApiClient

```typescript
// resources/js/services/apiClient.ts

class ApiClient {
  // ... existing M01 methods ...

  // License CRUD
  async getLicenses(params?: {
    status?: LicenseStatus;
    jenis_lesen_id?: string;
    tarikh_dari?: string;
    tarikh_hingga?: string;
    keyword?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: License[]; meta: PaginationMeta }> {
    const response = await this.client.get('/api/m02/permohonan', { params });
    return response.data;
  }

  async getLicense(id: string): Promise<License> {
    const response = await this.client.get(`/api/m02/permohonan/${id}`);
    return response.data;
  }

  async createLicense(data: {
    company_id: string;
    jenis_lesen_id: string;
    butiran_operasi: ButiranOperasi;
  }): Promise<License> {
    const response = await this.client.post('/api/m02/permohonan', data);
    return response.data;
  }

  async updateLicense(id: string, data: Partial<{
    company_id: string;
    jenis_lesen_id: string;
    butiran_operasi: ButiranOperasi;
  }>): Promise<License> {
    const response = await this.client.put(`/api/m02/permohonan/${id}`, data);
    return response.data;
  }

  async submitLicense(id: string): Promise<void> {
    await this.client.post(`/api/m02/permohonan/${id}/submit`);
  }

  async cancelLicense(id: string, reason: string): Promise<void> {
    await this.client.post(`/api/m02/permohonan/${id}/cancel`, { reason });
  }

  // Document Management
  async uploadLicenseDocument(
    licenseId: string,
    file: File,
    keperluanDokumenId: string
  ): Promise<LicenseDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keperluan_dokumen_id', keperluanDokumenId);

    const response = await this.client.post(
      `/api/m02/permohonan/${licenseId}/dokumen`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  }

  async deleteLicenseDocument(
    licenseId: string,
    documentId: string
  ): Promise<void> {
    await this.client.delete(`/api/m02/permohonan/${licenseId}/dokumen/${documentId}`);
  }

  // Catalog Data
  async getJenisLesen(): Promise<JenisLesen[]> {
    const response = await this.client.get('/api/m02/jenis-lesen');
    return response.data;
  }

  async getLicenseRequirements(jenisLesenId: string): Promise<Requirement[]> {
    const response = await this.client.get(`/api/m02/jenis-lesen/${jenisLesenId}/keperluan`);
    return response.data;
  }
}
```

### Error Handling Strategy

```typescript
// Axios interceptor (already in M01)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show toast
      toast.error('Tidak dibenarkan');
    } else if (error.response?.status === 422) {
      // Return validation errors for form handling
      return Promise.reject(error.response.data);
    } else {
      // Network or server error
      return Promise.reject(error);
    }
  }
);
```


---

## Page Components

### 1. LicensesListPage

**Route:** `/licenses`

**Purpose:** Display all applications with filtering and search capabilities

**Component Structure:**
```tsx
<AppLayout>
  <Breadcrumb items={[{ label: 'Lesen Saya', href: '/licenses' }]} />
  
  <div className="header">
    <h1>Lesen Saya</h1>
    <Button onClick={() => navigate('/licenses/new')}>
      Mohon Lesen Baharu
    </Button>
  </div>

  <FilterBar
    onFilterChange={handleFilterChange}
    filters={{ status, keyword, dateRange }}
  />

  {loading && <LoadingSpinner />}
  {error && <Alert type="error">{error}</Alert>}
  
  {!loading && !error && licenses.length === 0 && (
    <EmptyState
      title="Tiada permohonan lesen"
      description="Mulakan permohonan lesen baharu"
      action={
        <Button onClick={() => navigate('/licenses/new')}>
          Mohon Lesen Baharu
        </Button>
      }
    />
  )}

  {!loading && !error && licenses.length > 0 && (
    <>
      <LicenseTable
        licenses={licenses}
        onRowClick={(id) => navigate(`/licenses/${id}`)}
        onEdit={(id) => navigate(`/licenses/${id}/edit`)}
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  )}
</AppLayout>
```

**State Management:**
```typescript
const [licenses, setLicenses] = useState<License[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [filters, setFilters] = useState({
  status: '',
  keyword: '',
  tarikh_dari: '',
  tarikh_hingga: '',
});
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
```

**Key Functions:**
- `fetchLicenses()`: Fetch licenses with current filters and pagination
- `handleFilterChange()`: Update filters and reset to page 1
- `handlePageChange()`: Update current page and fetch new data


### 2. LicenseCreatePage

**Route:** `/licenses/new`

**Purpose:** Multi-step wizard for creating new license application

**Component Structure:**
```tsx
<AppLayout>
  <Breadcrumb items={[
    { label: 'Lesen Saya', href: '/licenses' },
    { label: 'Permohonan Baru', href: '/licenses/new' }
  ]} />

  <StepIndicator
    steps={['Maklumat Lesen', 'Butiran Premis', 'Semak & Simpan']}
    currentStep={currentStep}
  />

  {currentStep === 0 && (
    <Step1MaklumatLesen
      data={formData}
      jenisLesenOptions={jenisLesenOptions}
      onNext={(data) => {
        setFormData({ ...formData, ...data });
        setCurrentStep(1);
      }}
    />
  )}

  {currentStep === 1 && (
    <Step2ButiranPremis
      data={formData}
      onNext={(data) => {
        setFormData({ ...formData, ...data });
        setCurrentStep(2);
      }}
      onBack={() => setCurrentStep(0)}
    />
  )}

  {currentStep === 2 && (
    <Step3SemakSimpan
      data={formData}
      onSubmit={handleSaveDraft}
      onBack={() => setCurrentStep(1)}
      loading={saving}
    />
  )}
</AppLayout>
```

**Step 1: Maklumat Lesen**
- Select Jenis Lesen (dropdown with search)
- Display kategori (read-only badge)
- Display yuran proses (read-only, formatted currency)
- Validation: Jenis Lesen required

**Step 2: Butiran Premis**
- Alamat Premis fields (structured input, composed into `butiran_operasi.alamat_premis` object):
  - Alamat 1 (required)
  - Alamat 2 (optional)
  - Bandar (required)
  - Poskod (required)
  - Negeri (required, dropdown)
- Nama Perniagaan (required)
- Jenis Operasi (optional)
- Bilangan Pekerja (optional, number)
- Catatan (optional, textarea)

**Note:** The UI captures structured address fields separately, but composes them into the `butiran_operasi.alamat_premis` object before sending to the backend. This ensures the backend completeness validation for `butiran_operasi.alamat_premis` passes correctly.

**Step 3: Semak & Simpan**
- Summary card showing all entered data
- "Simpan Draf" button
- On success: navigate to `/licenses/:id/edit` with toast

**State Management:**
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({
  jenis_lesen_id: '',
  company_id: '', // from CompanyContext
  butiran_operasi: {
    alamat_premis: {
      alamat_1: '',
      alamat_2: '',
      bandar: '',
      poskod: '',
      negeri: '',
    },
    nama_perniagaan: '',
    jenis_operasi: '',
    bilangan_pekerja: null,
    catatan: '',
  },
});
const [jenisLesenOptions, setJenisLesenOptions] = useState<JenisLesen[]>([]);
const [saving, setSaving] = useState(false);
```


### 3. LicenseEditPage

**Route:** `/licenses/:id/edit`

**Purpose:** Edit draft application and manage documents

**Component Structure:**
```tsx
<AppLayout>
  <Breadcrumb items={[
    { label: 'Lesen Saya', href: '/licenses' },
    { label: 'Edit Permohonan', href: `/licenses/${id}/edit` }
  ]} />

  {loading && <LoadingSpinner />}
  {error && <Alert type="error">{error}</Alert>}

  {!loading && !error && (
    <>
      <TabNavigation
        tabs={['Maklumat', 'Dokumen', 'Serahan']}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'Maklumat' && (
        <MaklumatTab
          license={license}
          onSave={handleUpdateLicense}
          jenisLesenOptions={jenisLesenOptions}
        />
      )}

      {activeTab === 'Dokumen' && (
        <DokumenTab
          license={license}
          requirements={requirements}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
        />
      )}

      {activeTab === 'Serahan' && (
        <SerahanTab
          license={license}
          requirements={requirements}
          onSubmit={handleSubmitLicense}
        />
      )}
    </>
  )}
</AppLayout>
```

**Guard Logic:**
```typescript
useEffect(() => {
  if (license && license.status !== 'Draf') {
    navigate(`/licenses/${id}`);
  }
}, [license]);
```

**Tab 1: Maklumat**
- Editable form with same fields as create wizard
- Jenis Lesen field disabled if documents uploaded
- "Simpan Perubahan" button
- On success: show toast, refresh license data

**Tab 2: Dokumen**
- List of required documents from Module 4
- For each requirement:
  - Requirement name and description
  - Upload slot with file input
  - File type/size constraints displayed
  - If document exists:
    - Show file name, size, status badge
    - "Ganti" button to replace
    - "Padam" button (if status is BelumSah)
  - If no document:
    - "Muat Naik" button
- Client-side validation before upload
- Upload progress indicator
- Success/error feedback per document

**Tab 3: Serahan**
- Completeness checklist:
  - ✓ Maklumat lesen lengkap
  - ✓ Alamat premis diisi
  - ✓ Semua dokumen wajib dimuat naik
- "Hantar Permohonan" button (enabled only if complete)
- Confirmation dialog on click
- On success: navigate to details page with toast

**State Management:**
```typescript
const { id } = useParams();
const [license, setLicense] = useState<License | null>(null);
const [requirements, setRequirements] = useState<Requirement[]>([]);
const [activeTab, setActiveTab] = useState('Maklumat');
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
```


### 4. LicenseDetailsPage

**Route:** `/licenses/:id`

**Purpose:** Read-only view of application details

**Component Structure:**
```tsx
<AppLayout>
  <Breadcrumb items={[
    { label: 'Lesen Saya', href: '/licenses' },
    { label: 'Butiran Permohonan', href: `/licenses/${id}` }
  ]} />

  {loading && <LoadingSpinner />}
  {error && <Alert type="error">{error}</Alert>}

  {!loading && !error && license && (
    <>
      <div className="header">
        <h1>Butiran Permohonan</h1>
        <div className="actions">
          {license.status === 'Draf' && (
            <>
              <Button
                variant="secondary"
                onClick={() => navigate(`/licenses/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelClick}
              >
                Batal Permohonan
              </Button>
            </>
          )}
        </div>
      </div>

      {license.status === 'Diserahkan' && (
        <Alert type="info">
          Permohonan anda sedang dalam proses semakan PBT
        </Alert>
      )}

      <SummaryCard license={license} />
      
      <DocumentsSection
        documents={license.documents}
        requirements={requirements}
      />
    </>
  )}

  <ConfirmDialog
    open={showCancelDialog}
    title="Batal Permohonan"
    message="Adakah anda pasti untuk membatalkan permohonan ini?"
    onConfirm={handleCancelConfirm}
    onCancel={() => setShowCancelDialog(false)}
  />
</AppLayout>
```

**Summary Card:**
- Jenis Lesen name
- Kategori badge
- Status badge (true backend status, no "Permohonan Baru" label)
- Tarikh Serahan (or "—" if draft)
- Company name
- Premise address
- Business details

**Documents Section:**
- List each requirement
- Show uploaded document with:
  - File name
  - File size
  - Status badge (BelumSah/Disahkan)
  - Download link (opens in new tab)
- Show "—" for missing documents

**State Management:**
```typescript
const { id } = useParams();
const [license, setLicense] = useState<License | null>(null);
const [requirements, setRequirements] = useState<Requirement[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [showCancelDialog, setShowCancelDialog] = useState(false);
const [cancelling, setCancelling] = useState(false);
```


---

## Reusable Components

### LicenseStatusBadge

**Purpose:** Display status with appropriate styling

```tsx
interface LicenseStatusBadgeProps {
  status: LicenseStatus;
  showNewLabel?: boolean; // For list view "Permohonan Baru" label
}

const LicenseStatusBadge: React.FC<LicenseStatusBadgeProps> = ({
  status,
  showNewLabel = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Draf':
        return { label: 'Draf', className: 'bg-gray-100 text-gray-800' };
      case 'Diserahkan':
        return {
          label: showNewLabel ? 'Permohonan Baru' : 'Diserahkan',
          className: 'bg-blue-100 text-blue-800',
        };
      case 'Dibatalkan':
        return { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' };
    }
  };

  const { label, className } = getStatusConfig();

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};
```

### DocumentUploadSlot

**Purpose:** Handle single document upload with validation

```tsx
interface DocumentUploadSlotProps {
  requirement: Requirement;
  existingDocument?: LicenseDocument;
  onUpload: (file: File, requirementId: string) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  maxFileSize: number; // in bytes
  allowedTypes: string[]; // ['pdf', 'jpg', 'jpeg', 'png']
  disabled?: boolean;
}

const DocumentUploadSlot: React.FC<DocumentUploadSlotProps> = ({
  requirement,
  existingDocument,
  onUpload,
  onDelete,
  maxFileSize,
  allowedTypes,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      return `Jenis fail tidak dibenarkan. Sila muat naik ${allowedTypes.join(', ').toUpperCase()}`;
    }
    if (file.size > maxFileSize) {
      return `Saiz fail melebihi had maksimum ${formatFileSize(maxFileSize)}`;
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await onUpload(file, requirement.id);
    } catch (err) {
      setError('Gagal memuat naik fail. Sila cuba lagi.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{requirement.nama}</h4>
          {requirement.keterangan && (
            <p className="text-sm text-gray-600">{requirement.keterangan}</p>
          )}
          {requirement.wajib && (
            <span className="text-xs text-red-600">* Wajib</span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Jenis fail: {allowedTypes.join(', ').toUpperCase()} | 
        Saiz maksimum: {formatFileSize(maxFileSize)}
      </div>

      {existingDocument ? (
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{existingDocument.nama_fail}</p>
              <p className="text-xs text-gray-600">
                {formatFileSize(existingDocument.saiz_bait)}
              </p>
              <DocumentStatusBadge status={existingDocument.status_sah} />
            </div>
            <div className="flex gap-2">
              <label className="btn btn-secondary btn-sm">
                Ganti
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={disabled || uploading}
                  accept={allowedTypes.map(t => `.${t}`).join(',')}
                />
              </label>
              {onDelete && existingDocument.status_sah === 'BelumSah' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(existingDocument.id)}
                  disabled={disabled}
                >
                  Padam
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <label className="btn btn-primary">
          {uploading ? 'Memuat naik...' : 'Muat Naik'}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            accept={allowedTypes.map(t => `.${t}`).join(',')}
          />
        </label>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};
```


### CompletenessChecklist

**Purpose:** Display validation status before submission

```tsx
interface CompletenessChecklistProps {
  license: License;
  requirements: Requirement[];
}

const CompletenessChecklist: React.FC<CompletenessChecklistProps> = ({
  license,
  requirements,
}) => {
  const checks = [
    {
      label: 'Maklumat lesen lengkap',
      passed: !!license.jenis_lesen_id && !!license.company_id,
    },
    {
      label: 'Alamat premis diisi',
      passed: !!license.butiran_operasi?.alamat_premis?.alamat_1 &&
              !!license.butiran_operasi?.alamat_premis?.bandar &&
              !!license.butiran_operasi?.alamat_premis?.poskod &&
              !!license.butiran_operasi?.alamat_premis?.negeri,
    },
    {
      label: 'Semua dokumen wajib dimuat naik',
      passed: requirements
        .filter(r => r.wajib)
        .every(r => license.documents?.some(d => d.keperluan_dokumen_id === r.id)),
    },
  ];

  const allPassed = checks.every(c => c.passed);

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-medium mb-4">Semakan Kelengkapan</h3>
      <ul className="space-y-2">
        {checks.map((check, index) => (
          <li key={index} className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            <span className={check.passed ? 'text-gray-900' : 'text-gray-500'}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
      {!allPassed && (
        <Alert type="warning" className="mt-4">
          Sila lengkapkan semua keperluan sebelum menghantar permohonan
        </Alert>
      )}
    </div>
  );
};
```

### FilterBar

**Purpose:** Provide filtering controls for license list

```tsx
interface FilterBarProps {
  filters: {
    status: string;
    keyword: string;
    tarikh_dari: string;
    tarikh_hingga: string;
  };
  onFilterChange: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Cari jenis lesen..."
          value={filters.keyword}
          onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
          className="form-input"
        />
        
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="form-select"
        >
          <option value="">Semua Status</option>
          <option value="Draf">Draf</option>
          <option value="Diserahkan">Diserahkan</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>

        <input
          type="date"
          placeholder="Tarikh Dari"
          value={filters.tarikh_dari}
          onChange={(e) => onFilterChange({ ...filters, tarikh_dari: e.target.value })}
          className="form-input"
        />

        <input
          type="date"
          placeholder="Tarikh Hingga"
          value={filters.tarikh_hingga}
          onChange={(e) => onFilterChange({ ...filters, tarikh_hingga: e.target.value })}
          className="form-input"
        />
      </div>
    </div>
  );
};
```


---

## Custom Hooks

### useLicense

**Purpose:** Fetch and manage single license data

```typescript
// resources/js/hooks/useLicense.ts

export const useLicense = (id: string) => {
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicense = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getLicense(id);
      setLicense(data);
    } catch (err) {
      setError('Gagal memuat data permohonan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, [id]);

  return { license, loading, error, refetch: fetchLicense };
};
```

### useLicenseRequirements

**Purpose:** Fetch document requirements for a license type

```typescript
// resources/js/hooks/useLicenseRequirements.ts

export const useLicenseRequirements = (jenisLesenId: string | null) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jenisLesenId) {
      setRequirements([]);
      return;
    }

    const fetchRequirements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getLicenseRequirements(jenisLesenId);
        setRequirements(data);
      } catch (err) {
        setError('Gagal memuat keperluan dokumen');
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [jenisLesenId]);

  return { requirements, loading, error };
};
```

### useFileUpload

**Purpose:** Handle file upload with progress and validation

```typescript
// resources/js/hooks/useFileUpload.ts

interface UseFileUploadOptions {
  maxFileSize: number;
  allowedTypes: string[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedTypes.includes(extension)) {
      return `Jenis fail tidak dibenarkan`;
    }
    if (file.size > options.maxFileSize) {
      return `Saiz fail melebihi had maksimum`;
    }
    return null;
  };

  const upload = async (
    licenseId: string,
    file: File,
    requirementId: string
  ) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      options.onError?.(validationError);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      await apiClient.uploadLicenseDocument(licenseId, file, requirementId);
      
      setProgress(100);
      options.onSuccess?.();
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal memuat naik fail';
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
};
```


---

## Navigation Integration

### Update Sidebar Navigation

**File:** `resources/js/components/layouts/AppLayout.tsx`

Add "Lesen Saya" link to sidebar navigation:

```tsx
const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Profil Saya', href: '/account', icon: UserIcon },
  { label: 'Syarikat', href: '/companies', icon: BuildingIcon },
  { label: 'Lesen Saya', href: '/licenses', icon: DocumentIcon }, // NEW
  // ... other items
];
```

### Update Router Configuration

**File:** `resources/js/App.tsx`

Add M02 routes:

```tsx
<Routes>
  {/* Existing M01 routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/account" element={<AccountSettingsPage />} />
    <Route path="/companies" element={<CompanyManagementPage />} />
    
    {/* NEW M02 routes */}
    <Route path="/licenses" element={<LicensesListPage />} />
    <Route path="/licenses/new" element={<LicenseCreatePage />} />
    <Route path="/licenses/:id" element={<LicenseDetailsPage />} />
    <Route path="/licenses/:id/edit" element={<LicenseEditPage />} />
  </Route>
</Routes>
```

---

## Utility Functions

### File Formatting

```typescript
// resources/js/utils/fileHelpers.ts

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isAllowedFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};
```

### Date Formatting

```typescript
// resources/js/utils/dateHelpers.ts

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

### Currency Formatting

```typescript
// resources/js/utils/currencyHelpers.ts

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
};
```


---

## Form Validation

### Client-Side Validation Rules

**Create/Update Application:**
```typescript
const validationSchema = {
  jenis_lesen_id: {
    required: 'Sila pilih jenis lesen',
  },
  company_id: {
    required: 'Sila pilih syarikat',
  },
  'butiran_operasi.alamat_premis.alamat_1': {
    required: 'Alamat 1 diperlukan',
    maxLength: { value: 255, message: 'Alamat terlalu panjang' },
  },
  'butiran_operasi.alamat_premis.bandar': {
    required: 'Bandar diperlukan',
    maxLength: { value: 100, message: 'Nama bandar terlalu panjang' },
  },
  'butiran_operasi.alamat_premis.poskod': {
    required: 'Poskod diperlukan',
    pattern: { value: /^\d{5}$/, message: 'Poskod tidak sah' },
  },
  'butiran_operasi.alamat_premis.negeri': {
    required: 'Negeri diperlukan',
  },
  'butiran_operasi.nama_perniagaan': {
    required: 'Nama perniagaan diperlukan',
    maxLength: { value: 255, message: 'Nama terlalu panjang' },
  },
};
```

**File Upload Validation:**
```typescript
const FILE_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10 MB (should be fetched from config API)
  allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
};
```

---

## Error Handling Patterns

### API Error Response Handling

```typescript
// In page components

try {
  await apiClient.createLicense(data);
  toast.success('Permohonan berjaya disimpan');
  navigate(`/licenses/${response.id}/edit`);
} catch (error: any) {
  if (error.errors) {
    // 422 Validation errors
    Object.keys(error.errors).forEach(field => {
      setError(field, { message: error.errors[field][0] });
    });
  } else if (error.response?.status === 403) {
    // Already handled by interceptor (toast shown)
  } else if (error.response?.status === 401) {
    // Already handled by interceptor (redirect to login)
  } else {
    // Network or server error
    setGlobalError('Ralat berlaku. Sila cuba lagi.');
  }
}
```

### Form Submission Pattern

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    setSubmitting(true);
    setError(null);
    
    await apiClient.updateLicense(licenseId, data);
    
    toast.success('Perubahan berjaya disimpan');
    refetch(); // Refresh license data
  } catch (error: any) {
    if (error.errors) {
      // Set field-level errors
      Object.keys(error.errors).forEach(field => {
        setError(field, { message: error.errors[field][0] });
      });
    } else {
      setError('Gagal menyimpan perubahan. Sila cuba lagi.');
    }
  } finally {
    setSubmitting(false);
  }
};
```

---

## Performance Considerations

### Code Splitting

Use React lazy loading for page components:

```typescript
// resources/js/App.tsx

const LicensesListPage = lazy(() => import('./pages/licenses/LicensesListPage'));
const LicenseCreatePage = lazy(() => import('./pages/licenses/LicenseCreatePage'));
const LicenseEditPage = lazy(() => import('./pages/licenses/LicenseEditPage'));
const LicenseDetailsPage = lazy(() => import('./pages/licenses/LicenseDetailsPage'));

// Wrap routes with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    {/* ... routes */}
  </Routes>
</Suspense>
```

### Caching Strategy

- Cache Jenis Lesen list in component state (fetched once per session)
- Cache requirements per license type (refetch only when license type changes)
- Use React Query or SWR for automatic caching and revalidation (optional enhancement)

### Optimistic Updates

For better UX, implement optimistic updates for non-critical operations:

```typescript
const handleDeleteDocument = async (documentId: string) => {
  // Optimistically update UI
  setLicense(prev => ({
    ...prev,
    documents: prev.documents?.filter(d => d.id !== documentId),
  }));

  try {
    await apiClient.deleteLicenseDocument(licenseId, documentId);
    toast.success('Dokumen berjaya dipadam');
  } catch (error) {
    // Revert on error
    refetch();
    toast.error('Gagal memadam dokumen');
  }
};
```


---

## Accessibility Guidelines

### Keyboard Navigation

- All interactive elements must be keyboard accessible (Tab, Enter, Escape)
- Modal dialogs must trap focus and return focus on close
- File upload inputs must be accessible via keyboard
- Form validation errors must be announced to screen readers

### ARIA Labels

```tsx
// Example: Document upload button
<button
  aria-label={`Muat naik dokumen ${requirement.nama}`}
  aria-busy={uploading}
  disabled={uploading}
>
  {uploading ? 'Memuat naik...' : 'Muat Naik'}
</button>

// Example: Status badge
<span
  role="status"
  aria-label={`Status permohonan: ${status}`}
  className={badgeClassName}
>
  {statusLabel}
</span>

// Example: Completeness checklist
<ul role="list" aria-label="Semakan kelengkapan permohonan">
  {checks.map((check, index) => (
    <li key={index} role="listitem">
      <span aria-hidden="true">{check.passed ? '✓' : '✗'}</span>
      <span>{check.label}</span>
    </li>
  ))}
</ul>
```

### Color Contrast

- Ensure all text meets WCAG AA standards (4.5:1 for normal text)
- Status badges must have sufficient contrast
- Error messages must be clearly visible

### Screen Reader Support

- Use semantic HTML elements (nav, main, section, article)
- Provide descriptive labels for form inputs
- Announce dynamic content changes (toast notifications, loading states)
- Use aria-live regions for status updates

---

## Testing Strategy

### Unit Tests

**Components to Test:**
- LicenseStatusBadge: Verify correct styling and labels
- DocumentUploadSlot: Test file validation logic
- CompletenessChecklist: Test validation logic
- FilterBar: Test filter state management

**Hooks to Test:**
- useLicense: Mock API calls, test loading/error states
- useLicenseRequirements: Test caching behavior
- useFileUpload: Test validation and upload flow

### Integration Tests

**User Flows to Test:**
1. Create new application (full wizard flow)
2. Edit draft application (all tabs)
3. Upload documents (validation, success, error)
4. Submit application (completeness check, confirmation)
5. Cancel application (confirmation dialog)
6. Filter and search licenses
7. View application details

### E2E Tests (Optional)

**Critical Paths:**
1. Complete application submission flow (create → upload → submit)
2. Error handling (network errors, validation errors)
3. Authorization (redirect on 401, toast on 403)

---

## Security Considerations

### File Upload Security

- Validate file types on client-side (user experience)
- Validate file size on client-side (prevent large uploads)
- Backend performs authoritative validation
- Use Content-Type header for multipart/form-data
- Display file names safely (escape HTML)

### XSS Prevention

- React automatically escapes content
- Use `dangerouslySetInnerHTML` only when necessary
- Sanitize user input before display

### CSRF Protection

- Sanctum handles CSRF tokens automatically
- Ensure credentials are included in requests

### Authentication

- Store tokens securely (httpOnly cookies via Sanctum)
- Redirect to login on 401 responses
- Clear auth state on logout

---

## Deployment Checklist

- [ ] Add M02 routes to router configuration
- [ ] Update sidebar navigation with "Lesen Saya" link
- [ ] Extend ApiClient with M02 methods
- [ ] Create all page components
- [ ] Create reusable components (badges, upload slots, etc.)
- [ ] Implement custom hooks
- [ ] Add utility functions (file, date, currency formatting)
- [ ] Configure file upload constraints (read from backend config)
- [ ] Test all user flows
- [ ] Verify accessibility compliance
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Verify error handling for all API calls
- [ ] Test with real backend API
- [ ] Verify document download links work correctly
- [ ] Test file upload with various file types and sizes

---

## Future Enhancements

1. **Real-time Updates**: Use WebSockets for status updates
2. **Drag-and-Drop Upload**: Enhance file upload UX
3. **Bulk Operations**: Select multiple applications for bulk actions
4. **Advanced Filtering**: Save filter presets, export filtered results
5. **Document Preview**: Show PDF/image previews inline
6. **Application Templates**: Save common data as templates
7. **Progress Indicators**: Show application progress through workflow stages
8. **Notifications**: In-app notifications for status changes
9. **Mobile App**: React Native version for mobile devices
10. **Offline Support**: PWA with offline capabilities

---

## Component File Structure

```
resources/js/
├── pages/
│   └── licenses/
│       ├── LicensesListPage.tsx
│       ├── LicenseCreatePage.tsx
│       ├── LicenseEditPage.tsx
│       ├── LicenseDetailsPage.tsx
│       └── components/
│           ├── Step1MaklumatLesen.tsx
│           ├── Step2ButiranPremis.tsx
│           ├── Step3SemakSimpan.tsx
│           ├── MaklumatTab.tsx
│           ├── DokumenTab.tsx
│           ├── SerahanTab.tsx
│           ├── LicenseTable.tsx
│           ├── LicenseSummaryCard.tsx
│           └── DocumentsSection.tsx
├── components/
│   └── licenses/
│       ├── LicenseStatusBadge.tsx
│       ├── DocumentUploadSlot.tsx
│       ├── DocumentStatusBadge.tsx
│       ├── CompletenessChecklist.tsx
│       ├── FilterBar.tsx
│       ├── StepIndicator.tsx
│       └── TabNavigation.tsx
├── hooks/
│   ├── useLicense.ts
│   ├── useLicenseRequirements.ts
│   └── useFileUpload.ts
├── types/
│   └── license.ts
├── utils/
│   ├── fileHelpers.ts
│   ├── dateHelpers.ts
│   └── currencyHelpers.ts
└── services/
    └── apiClient.ts (extended)
```


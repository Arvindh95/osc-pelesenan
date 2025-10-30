import { useState, useEffect, useMemo } from 'react';
import { License, JenisLesen } from '../../../types/license';
import FormField from '../../../components/forms/FormField';
import SelectField from '../../../components/forms/SelectField';
import { useNotification } from '../../../contexts/NotificationContext';
import apiClient from '../../../services/apiClient';
import { formatCurrency } from '../../../utils/currencyHelpers';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ApiError } from '../../../types';
import { useNavigate } from 'react-router-dom';
import { MAKLUMAT_TAB_VALIDATION_RULES } from '../../../utils/licenseValidation';
import { validateForm } from '../../../utils/validation';

interface MaklumatTabProps {
  license: License;
  jenisLesenOptions: JenisLesen[];
  onSave: () => Promise<void>;
}

// Malaysian states
const NEGERI_OPTIONS = [
  { value: 'Johor', label: 'Johor' },
  { value: 'Kedah', label: 'Kedah' },
  { value: 'Kelantan', label: 'Kelantan' },
  { value: 'Melaka', label: 'Melaka' },
  { value: 'Negeri Sembilan', label: 'Negeri Sembilan' },
  { value: 'Pahang', label: 'Pahang' },
  { value: 'Pulau Pinang', label: 'Pulau Pinang' },
  { value: 'Perak', label: 'Perak' },
  { value: 'Perlis', label: 'Perlis' },
  { value: 'Sabah', label: 'Sabah' },
  { value: 'Sarawak', label: 'Sarawak' },
  { value: 'Selangor', label: 'Selangor' },
  { value: 'Terengganu', label: 'Terengganu' },
  { value: 'Wilayah Persekutuan Kuala Lumpur', label: 'W.P. Kuala Lumpur' },
  { value: 'Wilayah Persekutuan Labuan', label: 'W.P. Labuan' },
  { value: 'Wilayah Persekutuan Putrajaya', label: 'W.P. Putrajaya' },
];

/**
 * MaklumatTab Component
 * Editable form for license application information
 * Disables Jenis Lesen field if documents already uploaded
 */
const MaklumatTab: React.FC<MaklumatTabProps> = ({
  license,
  jenisLesenOptions,
  onSave,
}) => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { handleError, handleValidationErrors, showErrorNotification } = useErrorHandler();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    jenis_lesen_id: license.jenis_lesen_id,
    alamat_1: license.butiran_operasi.alamat_premis.alamat_1,
    alamat_2: license.butiran_operasi.alamat_premis.alamat_2 || '',
    bandar: license.butiran_operasi.alamat_premis.bandar,
    poskod: license.butiran_operasi.alamat_premis.poskod,
    negeri: license.butiran_operasi.alamat_premis.negeri,
    nama_perniagaan: license.butiran_operasi.nama_perniagaan,
    jenis_operasi: license.butiran_operasi.jenis_operasi || '',
    bilangan_pekerja: license.butiran_operasi.bilangan_pekerja?.toString() || '',
    catatan: license.butiran_operasi.catatan || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if documents have been uploaded (disable Jenis Lesen field)
  const hasDocuments = license.documents && license.documents.length > 0;

  // Update form data when license changes
  useEffect(() => {
    setFormData({
      jenis_lesen_id: license.jenis_lesen_id,
      alamat_1: license.butiran_operasi.alamat_premis.alamat_1,
      alamat_2: license.butiran_operasi.alamat_premis.alamat_2 || '',
      bandar: license.butiran_operasi.alamat_premis.bandar,
      poskod: license.butiran_operasi.alamat_premis.poskod,
      negeri: license.butiran_operasi.alamat_premis.negeri,
      nama_perniagaan: license.butiran_operasi.nama_perniagaan,
      jenis_operasi: license.butiran_operasi.jenis_operasi || '',
      bilangan_pekerja: license.butiran_operasi.bilangan_pekerja?.toString() || '',
      catatan: license.butiran_operasi.catatan || '',
    });
  }, [license]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const validationErrors = validateForm(formData, MAKLUMAT_TAB_VALIDATION_RULES);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      // Compose structured data for API
      const updateData = {
        jenis_lesen_id: formData.jenis_lesen_id,
        butiran_operasi: {
          alamat_premis: {
            alamat_1: formData.alamat_1.trim(),
            alamat_2: formData.alamat_2.trim() || undefined,
            bandar: formData.bandar.trim(),
            poskod: formData.poskod.trim(),
            negeri: formData.negeri,
          },
          nama_perniagaan: formData.nama_perniagaan.trim(),
          jenis_operasi: formData.jenis_operasi.trim() || undefined,
          bilangan_pekerja: formData.bilangan_pekerja
            ? Number(formData.bilangan_pekerja)
            : undefined,
          catatan: formData.catatan.trim() || undefined,
        },
      };

      await apiClient.updateLicense(license.id, updateData);

      addNotification({
        type: 'success',
        message: 'Perubahan berjaya disimpan',
      });

      // Refresh license data
      await onSave();
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'MaklumatTab.handleSubmit',
        licenseId: license.id,
      });
      
      // Handle specific error types
      if (enhancedError.status === 401) {
        navigate('/login');
      } else if (enhancedError.status === 403) {
        showErrorNotification(enhancedError);
      } else if (enhancedError.status === 422 && enhancedError.errors) {
        // Handle validation errors with inline field errors
        const backendErrors = handleValidationErrors(enhancedError.errors);
        const mappedErrors: Record<string, string> = {};
        
        // Map backend field names to form field names
        Object.keys(backendErrors).forEach(field => {
          const fieldName = field
            .replace('butiran_operasi.alamat_premis.', '')
            .replace('butiran_operasi.', '');
          mappedErrors[fieldName] = backendErrors[field];
        });
        
        setErrors(mappedErrors);
        
        addNotification({
          type: 'error',
          message: 'Sila semak medan yang ditandakan dan cuba lagi.',
        });
      } else {
        // Network or server errors
        addNotification({
          type: 'error',
          message: enhancedError.userMessage,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Get selected Jenis Lesen details
  // Use useMemo to prevent unnecessary recalculations and ensure stable reference
  const selectedJenisLesen = useMemo(() => {
    // Convert both to strings for comparison to handle type mismatch
    // (form data comes as string from select, but initial license data may be number)
    return jenisLesenOptions.find(
      jl => String(jl.id) === String(formData.jenis_lesen_id)
    );
  }, [jenisLesenOptions, formData.jenis_lesen_id]);

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Maklumat Permohonan
      </h2>

      <div className="space-y-6">
        {/* License Type Section */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Jenis Lesen
          </h3>
          <SelectField
            label="Jenis Lesen"
            name="jenis_lesen_id"
            value={formData.jenis_lesen_id}
            onChange={handleChange}
            options={jenisLesenOptions.map(jl => ({
              value: jl.id,
              label: `${jl.nama} (${jl.kategori})`,
            }))}
            error={errors.jenis_lesen_id}
            required
            disabled={hasDocuments}
            helpText={
              hasDocuments
                ? 'Jenis lesen tidak boleh diubah selepas dokumen dimuat naik'
                : undefined
            }
          />

          {selectedJenisLesen && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Kategori:
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedJenisLesen.kategori === 'Berisiko'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedJenisLesen.kategori}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Yuran Proses:
                  </span>
                  <span className="ml-2 text-sm text-gray-900">
                    {formatCurrency(selectedJenisLesen.yuran_proses)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premise Address Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Alamat Premis
          </h3>
          <div className="space-y-4">
            <FormField
              label="Alamat 1"
              name="alamat_1"
              type="text"
              value={formData.alamat_1}
              onChange={handleChange}
              error={errors.alamat_1}
              required
              placeholder="Contoh: No. 123, Jalan Merdeka"
              maxLength={255}
            />

            <FormField
              label="Alamat 2"
              name="alamat_2"
              type="text"
              value={formData.alamat_2}
              onChange={handleChange}
              error={errors.alamat_2}
              placeholder="Contoh: Taman Sejahtera (Pilihan)"
              maxLength={255}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Bandar"
                name="bandar"
                type="text"
                value={formData.bandar}
                onChange={handleChange}
                error={errors.bandar}
                required
                placeholder="Contoh: Kuala Lumpur"
                maxLength={100}
              />

              <FormField
                label="Poskod"
                name="poskod"
                type="text"
                value={formData.poskod}
                onChange={handleChange}
                error={errors.poskod}
                required
                placeholder="Contoh: 50000"
                maxLength={5}
                helpText="5 digit"
              />
            </div>

            <SelectField
              label="Negeri"
              name="negeri"
              value={formData.negeri}
              onChange={handleChange}
              options={NEGERI_OPTIONS}
              error={errors.negeri}
              required
              placeholder="Pilih negeri"
            />
          </div>
        </div>

        {/* Business Details Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Butiran Perniagaan
          </h3>
          <div className="space-y-4">
            <FormField
              label="Nama Perniagaan"
              name="nama_perniagaan"
              type="text"
              value={formData.nama_perniagaan}
              onChange={handleChange}
              error={errors.nama_perniagaan}
              required
              placeholder="Contoh: Restoran Nasi Lemak Sedap"
              maxLength={255}
            />

            <FormField
              label="Jenis Operasi"
              name="jenis_operasi"
              type="text"
              value={formData.jenis_operasi}
              onChange={handleChange}
              error={errors.jenis_operasi}
              placeholder="Contoh: Restoran (Pilihan)"
              maxLength={255}
            />

            <FormField
              label="Bilangan Pekerja"
              name="bilangan_pekerja"
              type="text"
              value={formData.bilangan_pekerja}
              onChange={handleChange}
              error={errors.bilangan_pekerja}
              placeholder="Contoh: 10 (Pilihan)"
              helpText="Masukkan nombor sahaja"
            />

            <div>
              <label
                htmlFor="catatan"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Catatan
              </label>
              <textarea
                id="catatan"
                name="catatan"
                rows={4}
                value={formData.catatan}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Maklumat tambahan (Pilihan)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maklumat tambahan mengenai operasi perniagaan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </button>
      </div>
    </form>
  );
};

export default MaklumatTab;

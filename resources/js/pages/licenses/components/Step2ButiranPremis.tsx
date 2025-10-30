import { useState } from 'react';
import FormField from '../../../components/forms/FormField';
import SelectField from '../../../components/forms/SelectField';
import { LicenseFormData } from '../../../types/license';
import { STEP2_VALIDATION_RULES } from '../../../utils/licenseValidation';
import { validateForm } from '../../../utils/validation';

interface Step2ButiranPremisProps {
  data: LicenseFormData;
  onNext: (data: Partial<LicenseFormData>) => void;
  onBack: () => void;
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
 * Step2ButiranPremis Component
 * Second step of license creation wizard
 * Captures premise address and business operation details
 */
const Step2ButiranPremis: React.FC<Step2ButiranPremisProps> = ({
  data,
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState({
    alamat_1: data.butiran_operasi.alamat_premis.alamat_1,
    alamat_2: data.butiran_operasi.alamat_premis.alamat_2 || '',
    bandar: data.butiran_operasi.alamat_premis.bandar,
    poskod: data.butiran_operasi.alamat_premis.poskod,
    negeri: data.butiran_operasi.alamat_premis.negeri,
    nama_perniagaan: data.butiran_operasi.nama_perniagaan,
    jenis_operasi: data.butiran_operasi.jenis_operasi || '',
    bilangan_pekerja: data.butiran_operasi.bilangan_pekerja?.toString() || '',
    catatan: data.butiran_operasi.catatan || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const validationErrors = validateForm(formData, STEP2_VALIDATION_RULES);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // Compose structured address and business details
      const butiran_operasi = {
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
      };

      onNext({ butiran_operasi });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Butiran Premis & Operasi
      </h2>

      <div className="space-y-6">
        {/* Premise Address Section */}
        <div>
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

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="mr-2 -ml-1 w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Seterusnya
          <svg
            className="ml-2 -mr-1 w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step2ButiranPremis;

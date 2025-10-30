import { useState, useMemo } from 'react';
import SelectField from '../../../components/forms/SelectField';
import { JenisLesen, LicenseFormData } from '../../../types/license';
import { Company } from '../../../types';
import { formatCurrency } from '../../../utils/currencyHelpers';
import { STEP1_VALIDATION_RULES } from '../../../utils/licenseValidation';
import { validateForm } from '../../../utils/validation';

interface Step1MaklumatLesenProps {
  data: LicenseFormData;
  jenisLesenOptions: JenisLesen[];
  companies: Company[];
  onNext: (data: Partial<LicenseFormData>) => void;
}

/**
 * Step1MaklumatLesen Component
 * First step of license creation wizard
 * Allows user to select license type and company
 */
const Step1MaklumatLesen: React.FC<Step1MaklumatLesenProps> = ({
  data,
  jenisLesenOptions,
  companies,
  onNext,
}) => {
  const [formData, setFormData] = useState({
    jenis_lesen_id: data.jenis_lesen_id,
    company_id: data.company_id,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ensure jenisLesenOptions is an array before calling .find()
  // Use useMemo to prevent unnecessary recalculations and ensure stable reference
  const selectedJenisLesen = useMemo(() => {
    const safeJenisLesenOptions = Array.isArray(jenisLesenOptions) ? jenisLesenOptions : [];
    // Convert both to strings for comparison to handle type mismatch
    return safeJenisLesenOptions.find(
      jl => String(jl.id) === String(formData.jenis_lesen_id)
    );
  }, [jenisLesenOptions, formData.jenis_lesen_id]);

  // Memoize safeJenisLesenOptions for rendering
  const safeJenisLesenOptions = useMemo(() => {
    return Array.isArray(jenisLesenOptions) ? jenisLesenOptions : [];
  }, [jenisLesenOptions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const validationErrors = validateForm(formData, STEP1_VALIDATION_RULES);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Maklumat Lesen
      </h2>

      <div className="space-y-6">
        {/* Company Selection */}
        <SelectField
          label="Syarikat"
          name="company_id"
          value={formData.company_id}
          onChange={handleChange}
          options={companies.map(company => ({
            value: company.id.toString(),
            label: `${company.name} (${company.ssm_no})`,
          }))}
          error={errors.company_id}
          required
          placeholder="Pilih syarikat"
          helpText="Pilih syarikat yang akan memohon lesen ini"
        />

        {/* License Type Selection */}
        <SelectField
          label="Jenis Lesen"
          name="jenis_lesen_id"
          value={formData.jenis_lesen_id}
          onChange={handleChange}
          options={safeJenisLesenOptions.map(jl => ({
            value: jl.id,
            label: `${jl.nama} (${jl.kod})`,
          }))}
          error={errors.jenis_lesen_id}
          required
          placeholder="Pilih jenis lesen"
          helpText="Pilih jenis lesen yang ingin dipohon"
        />

        {/* License Details Display */}
        {selectedJenisLesen && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Butiran Lesen
            </h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Kod:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedJenisLesen.kod}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Nama:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedJenisLesen.nama}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Kategori:</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedJenisLesen.kategori === 'Berisiko'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedJenisLesen.kategori}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Yuran Proses:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(selectedJenisLesen.yuran_proses)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!formData.jenis_lesen_id || !formData.company_id}
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

export default Step1MaklumatLesen;

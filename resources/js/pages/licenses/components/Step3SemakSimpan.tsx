import { useMemo } from 'react';
import { JenisLesen, LicenseFormData } from '../../../types/license';
import { Company } from '../../../types';
import { formatCurrency } from '../../../utils/currencyHelpers';

interface Step3SemakSimpanProps {
  data: LicenseFormData;
  jenisLesenOptions: JenisLesen[];
  companies: Company[];
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

/**
 * Step3SemakSimpan Component
 * Third and final step of license creation wizard
 * Displays summary of entered data and allows saving as draft
 */
const Step3SemakSimpan: React.FC<Step3SemakSimpanProps> = ({
  data,
  jenisLesenOptions,
  companies,
  onSubmit,
  onBack,
  loading,
}) => {
  // Ensure jenisLesenOptions is an array before calling .find()
  // Use useMemo to prevent unnecessary recalculations and ensure stable reference
  const selectedJenisLesen = useMemo(() => {
    const safeJenisLesenOptions = Array.isArray(jenisLesenOptions) ? jenisLesenOptions : [];
    // Convert both to strings for comparison to handle type mismatch
    return safeJenisLesenOptions.find(
      jl => String(jl.id) === String(data.jenis_lesen_id)
    );
  }, [jenisLesenOptions, data.jenis_lesen_id]);

  const selectedCompany = companies.find(
    c => c.id.toString() === data.company_id
  );

  const formatAddress = () => {
    const { alamat_premis } = data.butiran_operasi;
    const parts = [
      alamat_premis.alamat_1,
      alamat_premis.alamat_2,
      alamat_premis.bandar,
      `${alamat_premis.poskod} ${alamat_premis.negeri}`,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Semak & Simpan
      </h2>

      <div className="space-y-6">
        {/* License Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Maklumat Lesen
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Syarikat:</dt>
              <dd className="text-sm font-medium text-gray-900 text-right">
                {selectedCompany?.name}
                <div className="text-xs text-gray-500">
                  {selectedCompany?.ssm_no}
                </div>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Jenis Lesen:</dt>
              <dd className="text-sm font-medium text-gray-900 text-right">
                {selectedJenisLesen?.nama}
                <div className="text-xs text-gray-500">
                  {selectedJenisLesen?.kod}
                </div>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Kategori:</dt>
              <dd>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedJenisLesen?.kategori === 'Berisiko'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedJenisLesen?.kategori}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Yuran Proses:</dt>
              <dd className="text-sm font-medium text-gray-900">
                {selectedJenisLesen &&
                  formatCurrency(selectedJenisLesen.yuran_proses)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Premise Address */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Alamat Premis
          </h3>
          <p className="text-sm text-gray-900">{formatAddress()}</p>
        </div>

        {/* Business Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Butiran Perniagaan
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Nama Perniagaan:</dt>
              <dd className="text-sm font-medium text-gray-900 text-right">
                {data.butiran_operasi.nama_perniagaan}
              </dd>
            </div>
            {data.butiran_operasi.jenis_operasi && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Jenis Operasi:</dt>
                <dd className="text-sm font-medium text-gray-900 text-right">
                  {data.butiran_operasi.jenis_operasi}
                </dd>
              </div>
            )}
            {data.butiran_operasi.bilangan_pekerja !== undefined && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Bilangan Pekerja:</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {data.butiran_operasi.bilangan_pekerja}
                </dd>
              </div>
            )}
            {data.butiran_operasi.catatan && (
              <div>
                <dt className="text-sm text-gray-600 mb-1">Catatan:</dt>
                <dd className="text-sm text-gray-900">
                  {data.butiran_operasi.catatan}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Information Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Maklumat Penting
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Permohonan akan disimpan sebagai draf. Anda boleh mengedit
                  maklumat dan memuat naik dokumen yang diperlukan sebelum
                  menghantar permohonan untuk semakan PBT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
            <>
              Simpan Draf
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3SemakSimpan;

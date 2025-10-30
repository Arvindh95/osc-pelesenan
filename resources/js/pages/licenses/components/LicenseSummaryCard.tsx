import React from 'react';
import { License } from '../../../types/license';
import LicenseStatusBadge from '../../../components/licenses/LicenseStatusBadge';
import { formatDate } from '../../../utils/dateHelpers';
import { formatCurrency } from '../../../utils/currencyHelpers';

interface LicenseSummaryCardProps {
  license: License;
}

/**
 * LicenseSummaryCard Component
 * Displays a summary of license application information
 * 
 * @param license - License application data
 */
const LicenseSummaryCard: React.FC<LicenseSummaryCardProps> = ({ license }) => {
  const renderAddress = () => {
    const addr = license.butiran_operasi?.alamat_premis;
    if (!addr) return '—';

    const parts = [
      addr.alamat_1,
      addr.alamat_2,
      addr.bandar,
      `${addr.poskod} ${addr.negeri}`,
    ].filter(Boolean);

    return parts.join(', ');
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Ringkasan Permohonan
        </h2>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Jenis Lesen */}
        <div>
          <dt className="text-sm font-medium text-gray-500">Jenis Lesen</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {license.jenis_lesen_nama || '—'}
          </dd>
        </div>

        {/* Kategori */}
        <div>
          <dt className="text-sm font-medium text-gray-500">Kategori</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                license.kategori === 'Berisiko'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {license.kategori}
            </span>
          </dd>
        </div>

        {/* Status */}
        <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1">
            <LicenseStatusBadge status={license.status} showNewLabel={false} />
          </dd>
        </div>

        {/* Tarikh Serahan */}
        <div>
          <dt className="text-sm font-medium text-gray-500">Tarikh Serahan</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formatDate(license.tarikh_serahan)}
          </dd>
        </div>

        {/* Yuran Proses */}
        {license.yuran_proses !== undefined && license.yuran_proses !== null && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Yuran Proses</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatCurrency(license.yuran_proses)}
            </dd>
          </div>
        )}

        {/* Company Name */}
        {license.company_name && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Syarikat</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.company_name}
            </dd>
          </div>
        )}

        {/* Nama Perniagaan */}
        {license.butiran_operasi?.nama_perniagaan && (
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Nama Perniagaan
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.butiran_operasi.nama_perniagaan}
            </dd>
          </div>
        )}

        {/* Alamat Premis */}
        <div>
          <dt className="text-sm font-medium text-gray-500">Alamat Premis</dt>
          <dd className="mt-1 text-sm text-gray-900">{renderAddress()}</dd>
        </div>

        {/* Jenis Operasi */}
        {license.butiran_operasi?.jenis_operasi && (
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Jenis Operasi
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {license.butiran_operasi.jenis_operasi}
            </dd>
          </div>
        )}

        {/* Bilangan Pekerja */}
        {license.butiran_operasi?.bilangan_pekerja !== undefined &&
          license.butiran_operasi?.bilangan_pekerja !== null && (
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Bilangan Pekerja
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {license.butiran_operasi.bilangan_pekerja}
              </dd>
            </div>
          )}

        {/* Catatan */}
        {license.butiran_operasi?.catatan && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Catatan</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {license.butiran_operasi.catatan}
            </dd>
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseSummaryCard;

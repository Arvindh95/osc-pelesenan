import React from 'react';
import { License, Requirement } from '../../types/license';
import Alert from '../shared/Alert';
import { isLicenseFormComplete } from '../../utils/licenseValidation';

interface CompletenessChecklistProps {
  license: License;
  requirements: Requirement[];
}

/**
 * CompletenessChecklist Component
 * Displays validation status before submission
 * Checks required fields and document uploads
 * 
 * @param license - License application data
 * @param requirements - Document requirements for the license type
 */
const CompletenessChecklist: React.FC<CompletenessChecklistProps> = ({
  license,
  requirements,
}) => {
  // Check if basic license information is complete
  const hasBasicInfo =
    !!license.jenis_lesen_id && !!license.company_id;

  // Check if premise address is complete using centralized validation
  const hasPremiseAddress = isLicenseFormComplete({
    jenis_lesen_id: license.jenis_lesen_id,
    company_id: license.company_id,
    butiran_operasi: license.butiran_operasi,
  });

  // Check if all required documents are uploaded
  const requiredDocs = requirements.filter((r) => r.wajib);
  const hasAllRequiredDocs = requiredDocs.every((req) =>
    license.documents?.some((doc) => doc.keperluan_dokumen_id === req.id)
  );

  const checks = [
    {
      label: 'Maklumat lesen lengkap',
      passed: hasBasicInfo,
    },
    {
      label: 'Alamat premis diisi',
      passed: hasPremiseAddress,
    },
    {
      label: 'Semua dokumen wajib dimuat naik',
      passed: hasAllRequiredDocs,
    },
  ];

  const allPassed = checks.every((c) => c.passed);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Semakan Kelengkapan
      </h3>
      <ul
        role="list"
        aria-label="Semakan kelengkapan permohonan"
        className="space-y-3"
      >
        {checks.map((check, index) => (
          <li key={index} role="listitem" className="flex items-center gap-3">
            {check.passed ? (
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`text-sm ${
                check.passed ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {check.label}
            </span>
          </li>
        ))}
      </ul>

      {!allPassed && (
        <div className="mt-4">
          <Alert
            type="warning"
            message="Sila lengkapkan semua keperluan sebelum menghantar permohonan"
          />
        </div>
      )}

      {allPassed && (
        <div className="mt-4">
          <Alert
            type="success"
            message="Permohonan anda lengkap dan bersedia untuk dihantar"
          />
        </div>
      )}
    </div>
  );
};

export default CompletenessChecklist;

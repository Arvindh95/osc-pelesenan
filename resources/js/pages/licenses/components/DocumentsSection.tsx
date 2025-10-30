import React from 'react';
import { LicenseDocument, Requirement } from '../../../types/license';
import DocumentStatusBadge from '../../../components/licenses/DocumentStatusBadge';
import { formatFileSize } from '../../../utils/fileHelpers';

interface DocumentsSectionProps {
  documents?: LicenseDocument[];
  requirements: Requirement[];
}

/**
 * DocumentsSection Component
 * Displays uploaded documents with their requirements
 * 
 * @param documents - Array of uploaded documents
 * @param requirements - Array of document requirements
 */
const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents = [],
  requirements,
}) => {
  const getDocumentForRequirement = (
    requirementId: string
  ): LicenseDocument | undefined => {
    return documents.find((doc) => doc.keperluan_dokumen_id === requirementId);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Dokumen</h2>
      </div>

      <div className="px-6 py-4">
        {requirements.length === 0 ? (
          <p className="text-sm text-gray-500">Tiada keperluan dokumen</p>
        ) : (
          <div className="space-y-4">
            {requirements.map((requirement) => {
              const document = getDocumentForRequirement(requirement.id);

              return (
                <div
                  key={requirement.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {requirement.nama}
                        {requirement.wajib && (
                          <span className="ml-1 text-red-600">*</span>
                        )}
                      </h3>
                      {requirement.keterangan && (
                        <p className="mt-1 text-xs text-gray-500">
                          {requirement.keterangan}
                        </p>
                      )}
                    </div>
                  </div>

                  {document ? (
                    <div className="mt-3 bg-gray-50 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {document.nama_fail}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="text-xs text-gray-500">
                              {formatFileSize(document.saiz_bait)}
                            </p>
                            <DocumentStatusBadge status={document.status_sah} />
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href={document.url_storan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-label={`Muat turun ${document.nama_fail}`}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Muat Turun
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-gray-500">
                      <span>—</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsSection;

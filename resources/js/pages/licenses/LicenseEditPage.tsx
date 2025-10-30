import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layouts/AppLayout';
import TabNavigation from '../../components/licenses/TabNavigation';
import MaklumatTab from './components/MaklumatTab';
import DokumenTab from './components/DokumenTab';
import SerahanTab from './components/SerahanTab';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import { useLicense } from '../../hooks/useLicense';
import { useLicenseRequirements } from '../../hooks/useLicenseRequirements';
import { JenisLesen } from '../../types/license';
import apiClient from '../../services/apiClient';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ApiError } from '../../types';

type TabType = 'Maklumat' | 'Dokumen' | 'Serahan';

/**
 * LicenseEditPage Component
 * Edit page for draft license applications with tabbed interface
 * Redirects non-draft applications to details page
 */
const LicenseEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError, showErrorNotification } = useErrorHandler();
  const { license, loading, error, refetch } = useLicense(id!);
  const { requirements, loading: requirementsLoading } = useLicenseRequirements(
    license?.jenis_lesen_id || null
  );

  const [activeTab, setActiveTab] = useState<TabType>('Maklumat');
  const [jenisLesenOptions, setJenisLesenOptions] = useState<JenisLesen[]>([]);
  const [loadingJenisLesen, setLoadingJenisLesen] = useState(true);
  const [jenisLesenError, setJenisLesenError] = useState<string | null>(null);

  // Fetch Jenis Lesen options on mount
  useEffect(() => {
    const fetchJenisLesen = async () => {
      try {
        setLoadingJenisLesen(true);
        setJenisLesenError(null);
        const data = await apiClient.getJenisLesen();
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setJenisLesenOptions(data);
        } else {
          console.error('getJenisLesen returned non-array data:', data);
          setJenisLesenOptions([]);
          setJenisLesenError('Format data tidak sah. Sila hubungi pentadbir sistem.');
        }
      } catch (err) {
        const enhancedError = handleError(err as ApiError, {
          context: 'LicenseEditPage.fetchJenisLesen',
        });
        
        setJenisLesenError(enhancedError.userMessage);
        
        // Handle specific error types
        if (enhancedError.status === 401) {
          navigate('/login');
        } else if (enhancedError.status === 403) {
          showErrorNotification(enhancedError);
        }
      } finally {
        setLoadingJenisLesen(false);
      }
    };

    fetchJenisLesen();
  }, [handleError, showErrorNotification, navigate]);

  // Guard: Redirect non-draft applications to details page
  useEffect(() => {
    if (license && license.status !== 'Draf') {
      navigate(`/licenses/${id}`);
    }
  }, [license, id, navigate]);

  const breadcrumbItems = [
    { name: 'Lesen Saya', href: '/licenses' },
    { name: 'Edit Permohonan', current: true },
  ];

  // Show loading state
  if (loading || loadingJenisLesen) {
    return (
      <AppLayout
        title="Edit Permohonan Lesen"
        breadcrumbs={breadcrumbItems}
        showBreadcrumbs={true}
      >
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Memuatkan data permohonan..." />
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error || jenisLesenError || !license) {
    return (
      <AppLayout
        title="Edit Permohonan Lesen"
        breadcrumbs={breadcrumbItems}
        showBreadcrumbs={true}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert
            type="error"
            message={
              <div>
                <p className="font-medium">Ralat memuat data permohonan</p>
                <p className="mt-1">{error || jenisLesenError || 'Permohonan tidak dijumpai'}</p>
                <button
                  onClick={() => navigate('/licenses')}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Kembali ke senarai permohonan
                </button>
              </div>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const tabs: TabType[] = ['Maklumat', 'Dokumen', 'Serahan'];

  return (
    <AppLayout
      title="Edit Permohonan Lesen"
      breadcrumbs={breadcrumbItems}
      showBreadcrumbs={true}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* License Type Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {license.jenis_lesen_nama}
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as TabType)}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'Maklumat' && (
            <MaklumatTab
              license={license}
              jenisLesenOptions={jenisLesenOptions}
              onSave={refetch}
            />
          )}

          {activeTab === 'Dokumen' && (
            <>
              {requirementsLoading ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <LoadingSpinner text="Memuatkan keperluan dokumen..." />
                </div>
              ) : (
                <DokumenTab
                  license={license}
                  requirements={requirements}
                  onUploadSuccess={refetch}
                />
              )}
            </>
          )}

          {activeTab === 'Serahan' && (
            <>
              {requirementsLoading ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <LoadingSpinner text="Memuatkan keperluan dokumen..." />
                </div>
              ) : (
                <SerahanTab license={license} requirements={requirements} />
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LicenseEditPage;

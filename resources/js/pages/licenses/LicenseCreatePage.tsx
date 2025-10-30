import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layouts/AppLayout';
import StepIndicator from '../../components/licenses/StepIndicator';
import Step1MaklumatLesen from './components/Step1MaklumatLesen';
import Step2ButiranPremis from './components/Step2ButiranPremis';
import Step3SemakSimpan from './components/Step3SemakSimpan';
import { useCompany } from '../../contexts/CompanyContext';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../services/apiClient';
import { JenisLesen, LicenseFormData } from '../../types/license';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ApiError } from '../../types';

/**
 * LicenseCreatePage Component
 * Multi-step wizard for creating new license applications
 * 
 * Steps:
 * 1. Maklumat Lesen - Select license type
 * 2. Butiran Premis - Enter premise and business details
 * 3. Semak & Simpan - Review and save draft
 */
const LicenseCreatePage = () => {
  const navigate = useNavigate();
  const { companies, getMyCompanies } = useCompany();
  const { addNotification } = useNotification();
  const { handleError, showErrorNotification } = useErrorHandler();

  const [currentStep, setCurrentStep] = useState(0);
  const [jenisLesenOptions, setJenisLesenOptions] = useState<JenisLesen[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data with first company if available
  const [formData, setFormData] = useState<LicenseFormData>({
    jenis_lesen_id: '',
    company_id: companies.length > 0 ? companies[0].id.toString() : '',
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
      bilangan_pekerja: undefined,
      catatan: '',
    },
  });

  const steps = ['Maklumat Lesen', 'Butiran Premis', 'Semak & Simpan'];

  // Fetch initial data (companies and jenis lesen) on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both companies and jenis lesen in parallel
        const [jenisLesenData] = await Promise.all([
          apiClient.getJenisLesen(),
          companies.length === 0 ? getMyCompanies() : Promise.resolve(),
        ]);

        // Ensure jenis lesen data is an array
        if (Array.isArray(jenisLesenData)) {
          setJenisLesenOptions(jenisLesenData);
        } else {
          console.error('getJenisLesen returned non-array data:', jenisLesenData);
          setJenisLesenOptions([]);
          setError('Format data tidak sah. Sila hubungi pentadbir sistem.');
        }
      } catch (err) {
        const enhancedError = handleError(err as ApiError, {
          context: 'LicenseCreatePage.fetchInitialData',
        });

        setError(enhancedError.userMessage);

        // Handle specific error types
        if (enhancedError.status === 401) {
          navigate('/login');
        } else if (enhancedError.status === 403) {
          showErrorNotification(enhancedError);
        } else {
          addNotification({
            type: 'error',
            message: enhancedError.userMessage,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update company_id when companies are loaded
  useEffect(() => {
    if (companies.length > 0 && !formData.company_id) {
      setFormData(prev => ({
        ...prev,
        company_id: companies[0].id.toString(),
      }));
    }
  }, [companies, formData.company_id]);

  const handleStep1Next = (data: Partial<LicenseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(1);
  };

  const handleStep2Next = (data: Partial<LicenseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Back = () => {
    setCurrentStep(0);
  };

  const handleStep3Back = () => {
    setCurrentStep(1);
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await apiClient.createLicense({
        company_id: formData.company_id,
        jenis_lesen_id: formData.jenis_lesen_id,
        butiran_operasi: formData.butiran_operasi,
      });

      addNotification({
        type: 'success',
        message: 'Permohonan berjaya disimpan sebagai draf',
      });

      navigate(`/licenses/${response.id}/edit`);
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'LicenseCreatePage.handleSaveDraft',
        formData,
      });
      
      setError(enhancedError.userMessage);
      
      // Handle specific error types
      if (enhancedError.status === 401) {
        navigate('/login');
      } else if (enhancedError.status === 403) {
        showErrorNotification(enhancedError);
      } else if (enhancedError.status === 422) {
        // Validation errors - show in notification
        addNotification({
          type: 'error',
          message: enhancedError.userMessage,
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

  const breadcrumbs = [
    { name: 'Lesen Saya', href: '/licenses' },
    { name: 'Permohonan Baru', current: true },
  ];

  return (
    <AppLayout title="Permohonan Lesen Baharu" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto">
        <StepIndicator steps={steps} currentStep={currentStep} />

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {currentStep === 0 && (
              <Step1MaklumatLesen
                data={formData}
                jenisLesenOptions={jenisLesenOptions}
                companies={companies}
                onNext={handleStep1Next}
              />
            )}

            {currentStep === 1 && (
              <Step2ButiranPremis
                data={formData}
                onNext={handleStep2Next}
                onBack={handleStep2Back}
              />
            )}

            {currentStep === 2 && (
              <Step3SemakSimpan
                data={formData}
                jenisLesenOptions={jenisLesenOptions}
                companies={companies}
                onSubmit={handleSaveDraft}
                onBack={handleStep3Back}
                loading={saving}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default LicenseCreatePage;

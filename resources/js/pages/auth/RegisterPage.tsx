import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types';
import { useForm } from '../../hooks/useForm';
import { COMMON_RULES } from '../../utils/validation';
import FormField from '../../components/forms/FormField';
import ICNumberField from '../../components/forms/ICNumberField';
import SubmitButton from '../../components/shared/SubmitButton';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const form = useForm<RegisterData>({
    initialData: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      ic_no: '',
    },
    validationRules: {
      name: COMMON_RULES.name,
      email: COMMON_RULES.email,
      password: COMMON_RULES.password,
      password_confirmation: COMMON_RULES.passwordConfirmation,
      ic_no: COMMON_RULES.icNumber,
    },
    onSubmit: async data => {
      await register(data);
      navigate('/dashboard');
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Daftar Akaun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Atau{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            log masuk ke akaun sedia ada
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={form.handleSubmit}>
            <FormField
              {...form.getFieldProps('name')}
              label="Nama Penuh"
              type="text"
              autoComplete="name"
              required
              disabled={form.isSubmitting}
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />

            <FormField
              {...form.getFieldProps('email')}
              label="Alamat E-mel"
              type="email"
              autoComplete="email"
              required
              disabled={form.isSubmitting}
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <ICNumberField
              {...form.getFieldProps('ic_no')}
              required
              disabled={form.isSubmitting}
            />

            <FormField
              {...form.getFieldProps('password')}
              label="Kata Laluan"
              type="password"
              autoComplete="new-password"
              required
              disabled={form.isSubmitting}
              helpText="Mestilah mengandungi huruf besar, huruf kecil, dan nombor"
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <FormField
              {...form.getFieldProps('password_confirmation')}
              label="Sahkan Kata Laluan"
              type="password"
              autoComplete="new-password"
              required
              disabled={form.isSubmitting}
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            <SubmitButton
              isLoading={form.isSubmitting}
              disabled={!form.isValid}
              loadingText="Sedang mendaftar..."
              className="w-full"
            >
              Daftar Akaun
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

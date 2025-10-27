import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginData } from '../../types';
import { useForm } from '../../hooks/useForm';
import { COMMON_RULES } from '../../utils/validation';
import FormField from '../../components/forms/FormField';
import SubmitButton from '../../components/shared/SubmitButton';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const form = useForm<LoginData>({
    initialData: {
      email: '',
      password: '',
    },
    validationRules: {
      email: COMMON_RULES.email,
      password: {
        required: true,
        minLength: 6,
      },
    },
    onSubmit: async data => {
      await login(data);
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
          Log Masuk ke Akaun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Atau{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            daftar akaun baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={form.handleSubmit}>
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

            <FormField
              {...form.getFieldProps('password')}
              label="Kata Laluan"
              type="password"
              autoComplete="current-password"
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <SubmitButton
              isLoading={form.isSubmitting}
              disabled={!form.isValid}
              loadingText="Sedang log masuk..."
              className="w-full"
            >
              Log Masuk
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

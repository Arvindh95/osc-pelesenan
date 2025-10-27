import { useForm } from '../../hooks/useForm';
import { COMMON_RULES } from '../../utils/validation';
import ICNumberField from './ICNumberField';
import SubmitButton from '../shared/SubmitButton';

interface VerificationFormProps {
  onSubmit: (icNo: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  onClearError?: () => void;
}

interface VerificationFormData extends Record<string, string> {
  ic_no: string;
}

function VerificationForm({
  onSubmit,
  isLoading,
  error,
  onClearError,
}: VerificationFormProps) {
  const form = useForm<VerificationFormData>({
    initialData: {
      ic_no: '',
    },
    validationRules: {
      ic_no: COMMON_RULES.icNumber,
    },
    onSubmit: async data => {
      // Remove dashes before sending to API
      const cleanIcNo = data.ic_no.replace(/\D/g, '');
      await onSubmit(cleanIcNo);
    },
  });

  // Clear API error when form data changes
  if (error && onClearError && form.data.ic_no) {
    onClearError();
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <ICNumberField
        {...form.getFieldProps('ic_no')}
        required
        disabled={isLoading || form.isSubmitting}
        error={form.getFieldError('ic_no') || error || undefined}
      />

      <SubmitButton
        isLoading={isLoading || form.isSubmitting}
        disabled={!form.isValid || !form.data.ic_no.trim()}
        loadingText="Sedang mengesahkan..."
        className="w-full"
      >
        Sahkan Identiti
      </SubmitButton>
    </form>
  );
}

export default VerificationForm;

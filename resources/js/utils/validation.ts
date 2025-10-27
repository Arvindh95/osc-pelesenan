// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  email?: boolean;
  icNumber?: boolean;
  ssmNumber?: boolean;
  password?: boolean;
  confirmPassword?: string; // field name to match against
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

// Validation messages in Malay
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} diperlukan`,
  minLength: (field: string, min: number) =>
    `${field} mestilah sekurang-kurangnya ${min} aksara`,
  maxLength: (field: string, max: number) =>
    `${field} tidak boleh melebihi ${max} aksara`,
  email: 'Format alamat e-mel tidak sah',
  icNumber: 'Format nombor kad pengenalan tidak sah (contoh: 123456-78-9012)',
  ssmNumber: 'Format nombor SSM tidak sah',
  password:
    'Kata laluan mesti mengandungi huruf besar, huruf kecil, dan nombor',
  confirmPassword: 'Kata laluan tidak sepadan',
  pattern: (field: string) => `Format ${field} tidak sah`,
} as const;

// Field name translations for better error messages
export const FIELD_LABELS = {
  name: 'Nama penuh',
  email: 'Alamat e-mel',
  password: 'Kata laluan',
  password_confirmation: 'Pengesahan kata laluan',
  ic_no: 'Nombor kad pengenalan',
  ssm_no: 'Nombor SSM',
  company_name: 'Nama syarikat',
  phone: 'Nombor telefon',
  address: 'Alamat',
} as const;

// Get field label or fallback to field name
export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName as keyof typeof FIELD_LABELS] || fieldName;
}

// IC Number validation
export function validateICNumber(icNo: string): boolean {
  // Remove any non-digit characters for validation
  const cleanIC = icNo.replace(/\D/g, '');

  // Must be exactly 12 digits
  if (cleanIC.length !== 12) return false;

  // Basic format validation (YYMMDD-PB-XXXX)
  const month = parseInt(cleanIC.substring(2, 4));
  const day = parseInt(cleanIC.substring(4, 6));

  // Validate month (01-12)
  if (month < 1 || month > 12) return false;

  // Validate day (01-31)
  if (day < 1 || day > 31) return false;

  return true;
}

// Format IC Number with dashes
export function formatICNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 12 digits
  const limited = digits.substring(0, 12);

  // Format as XXXXXX-XX-XXXX
  if (limited.length >= 8) {
    return `${limited.substring(0, 6)}-${limited.substring(6, 8)}-${limited.substring(8)}`;
  } else if (limited.length >= 6) {
    return `${limited.substring(0, 6)}-${limited.substring(6)}`;
  } else {
    return limited;
  }
}

// SSM Number validation
export function validateSSMNumber(ssmNo: string): boolean {
  // Remove any non-alphanumeric characters
  const cleanSSM = ssmNo.replace(/[^A-Za-z0-9]/g, '');

  // SSM format: 123456-A or 123456789012 (12 digits) or other variations
  // For now, we'll accept alphanumeric strings between 8-15 characters
  return cleanSSM.length >= 8 && cleanSSM.length <= 15;
}

// Format SSM Number
export function formatSSMNumber(value: string): string {
  // Keep alphanumeric characters and dashes
  return value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password strength validation
export function validatePassword(password: string): boolean {
  // At least 8 characters, contains uppercase, lowercase, and number
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUppercase && hasLowercase && hasNumber;
}

// Single field validation
export function validateField(
  fieldName: string,
  value: string,
  rule: ValidationRule,
  formData?: Record<string, string>
): string {
  const fieldLabel = getFieldLabel(fieldName);

  // Required validation
  if (rule.required && !value.trim()) {
    return VALIDATION_MESSAGES.required(fieldLabel);
  }

  // Skip other validations if field is empty and not required
  if (!value.trim() && !rule.required) {
    return '';
  }

  // Min length validation
  if (rule.minLength && value.length < rule.minLength) {
    return VALIDATION_MESSAGES.minLength(fieldLabel, rule.minLength);
  }

  // Max length validation
  if (rule.maxLength && value.length > rule.maxLength) {
    return VALIDATION_MESSAGES.maxLength(fieldLabel, rule.maxLength);
  }

  // Email validation
  if (rule.email && !validateEmail(value)) {
    return VALIDATION_MESSAGES.email;
  }

  // IC Number validation
  if (rule.icNumber && !validateICNumber(value)) {
    return VALIDATION_MESSAGES.icNumber;
  }

  // SSM Number validation
  if (rule.ssmNumber && !validateSSMNumber(value)) {
    return VALIDATION_MESSAGES.ssmNumber;
  }

  // Password strength validation
  if (rule.password && !validatePassword(value)) {
    return VALIDATION_MESSAGES.password;
  }

  // Confirm password validation
  if (rule.confirmPassword && formData) {
    const passwordValue = formData[rule.confirmPassword];
    if (value !== passwordValue) {
      return VALIDATION_MESSAGES.confirmPassword;
    }
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return VALIDATION_MESSAGES.pattern(fieldLabel);
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) return customError;
  }

  return '';
}

// Validate entire form
export function validateForm(
  formData: Record<string, string>,
  rules: ValidationRules
): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(fieldName => {
    const value = formData[fieldName] || '';
    const rule = rules[fieldName];
    const error = validateField(fieldName, value, rule, formData);

    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
}

// Real-time validation debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

// Common validation rule sets
export const COMMON_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  email: {
    required: true,
    email: true,
    maxLength: 255,
  },
  password: {
    required: true,
    password: true,
    minLength: 8,
    maxLength: 255,
  },
  passwordConfirmation: {
    required: true,
    confirmPassword: 'password',
  },
  icNumber: {
    required: true,
    icNumber: true,
  },
  ssmNumber: {
    required: true,
    ssmNumber: true,
  },
  phone: {
    pattern: /^(\+?6?01[0-46-9]-*[0-9]{7,8}|(\+?603|06[0-9])-*[0-9]{7,8})$/,
    maxLength: 20,
  },
} as const;

// Form state management helper
export interface FormState<T extends Record<string, string>> {
  data: T;
  errors: ValidationErrors;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export function createInitialFormState<T extends Record<string, string>>(
  initialData: T
): FormState<T> {
  return {
    data: initialData,
    errors: {},
    touched: {} as Record<keyof T, boolean>,
    isValid: false,
    isSubmitting: false,
  };
}

// Form action types
export type FormAction<T extends Record<string, string>> =
  | { type: 'SET_FIELD'; field: keyof T; value: string }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'CLEAR_ERROR'; field: keyof T }
  | { type: 'SET_ERRORS'; errors: ValidationErrors }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_TOUCHED'; field: keyof T }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET'; data: T };

// Form reducer
export function formReducer<T extends Record<string, string>>(
  state: FormState<T>,
  action: FormAction<T>
): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error,
        },
        isValid: false,
      };

    case 'CLEAR_ERROR': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.field]: _removed, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
        isValid: Object.keys(remainingErrors).length === 0,
      };
    }

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
        isValid: Object.keys(action.errors).length === 0,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
        isValid: true,
      };

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true,
        },
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };

    case 'RESET':
      return createInitialFormState(action.data);

    default:
      return state;
  }
}

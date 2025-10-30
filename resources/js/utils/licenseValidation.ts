/**
 * License Form Validation Utilities
 * Validation schemas and helpers for M02 license application forms
 */

import {
  ValidationRules,
  ValidationErrors,
  validateField as baseValidateField,
  VALIDATION_MESSAGES,
} from './validation';

// Extended validation messages for license forms
export const LICENSE_VALIDATION_MESSAGES = {
  ...VALIDATION_MESSAGES,
  poskod: 'Poskod tidak sah (5 digit diperlukan)',
  fileType: (allowedTypes: string[]) =>
    `Jenis fail tidak dibenarkan. Sila muat naik ${allowedTypes.join(', ').toUpperCase()}`,
  fileSize: (maxSize: string) =>
    `Saiz fail melebihi had maksimum ${maxSize}`,
  jenisLesen: 'Sila pilih jenis lesen',
  company: 'Sila pilih syarikat',
  alamatPremis: 'Alamat premis diperlukan',
  namaPerniagaan: 'Nama perniagaan diperlukan',
  bilangan: 'Sila masukkan nombor yang sah',
} as const;

// Field labels for license forms
export const LICENSE_FIELD_LABELS = {
  jenis_lesen_id: 'Jenis Lesen',
  company_id: 'Syarikat',
  alamat_1: 'Alamat 1',
  alamat_2: 'Alamat 2',
  bandar: 'Bandar',
  poskod: 'Poskod',
  negeri: 'Negeri',
  nama_perniagaan: 'Nama Perniagaan',
  jenis_operasi: 'Jenis Operasi',
  bilangan_pekerja: 'Bilangan Pekerja',
  catatan: 'Catatan',
} as const;

/**
 * Validate poskod format (5 digits)
 */
export function validatePoskod(poskod: string): boolean {
  return /^\d{5}$/.test(poskod.trim());
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return !!extension && allowedTypes.includes(extension);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate alamat_premis structure
 */
export function validateAlamatPremis(alamatPremis: {
  alamat_1?: string;
  alamat_2?: string;
  bandar?: string;
  poskod?: string;
  negeri?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!alamatPremis.alamat_1?.trim()) {
    errors.alamat_1 = 'Alamat 1 diperlukan';
  } else if (alamatPremis.alamat_1.length > 255) {
    errors.alamat_1 = 'Alamat terlalu panjang (maksimum 255 aksara)';
  }

  if (alamatPremis.alamat_2 && alamatPremis.alamat_2.length > 255) {
    errors.alamat_2 = 'Alamat terlalu panjang (maksimum 255 aksara)';
  }

  if (!alamatPremis.bandar?.trim()) {
    errors.bandar = 'Bandar diperlukan';
  } else if (alamatPremis.bandar.length > 100) {
    errors.bandar = 'Nama bandar terlalu panjang (maksimum 100 aksara)';
  }

  if (!alamatPremis.poskod?.trim()) {
    errors.poskod = 'Poskod diperlukan';
  } else if (!validatePoskod(alamatPremis.poskod)) {
    errors.poskod = LICENSE_VALIDATION_MESSAGES.poskod;
  }

  if (!alamatPremis.negeri?.trim()) {
    errors.negeri = 'Negeri diperlukan';
  }

  return errors;
}

/**
 * Validation rules for Step 1: Maklumat Lesen
 */
export const STEP1_VALIDATION_RULES: ValidationRules = {
  jenis_lesen_id: {
    required: true,
    custom: (value: string) => {
      if (!value || value.trim() === '') {
        return LICENSE_VALIDATION_MESSAGES.jenisLesen;
      }
      return null;
    },
  },
  company_id: {
    required: true,
    custom: (value: string) => {
      if (!value || value.trim() === '') {
        return LICENSE_VALIDATION_MESSAGES.company;
      }
      return null;
    },
  },
};

/**
 * Validation rules for Step 2: Butiran Premis
 */
export const STEP2_VALIDATION_RULES: ValidationRules = {
  alamat_1: {
    required: true,
    maxLength: 255,
  },
  alamat_2: {
    maxLength: 255,
  },
  bandar: {
    required: true,
    maxLength: 100,
  },
  poskod: {
    required: true,
    pattern: /^\d{5}$/,
    custom: (value: string) => {
      if (!validatePoskod(value)) {
        return LICENSE_VALIDATION_MESSAGES.poskod;
      }
      return null;
    },
  },
  negeri: {
    required: true,
  },
  nama_perniagaan: {
    required: true,
    maxLength: 255,
  },
  jenis_operasi: {
    maxLength: 255,
  },
  bilangan_pekerja: {
    custom: (value: string) => {
      if (value && value.trim() !== '') {
        if (isNaN(Number(value))) {
          return LICENSE_VALIDATION_MESSAGES.bilangan;
        }
        const num = Number(value);
        if (num < 0) {
          return 'Bilangan pekerja tidak boleh negatif';
        }
      }
      return null;
    },
  },
};

/**
 * Validation rules for Maklumat Tab (Edit page)
 */
export const MAKLUMAT_TAB_VALIDATION_RULES: ValidationRules = {
  jenis_lesen_id: STEP1_VALIDATION_RULES.jenis_lesen_id,
  ...STEP2_VALIDATION_RULES,
};

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeBytes: number;
    allowedTypes: string[];
  }
): string | null {
  // Check file type
  if (!validateFileType(file, options.allowedTypes)) {
    return LICENSE_VALIDATION_MESSAGES.fileType(options.allowedTypes);
  }

  // Check file size
  if (!validateFileSize(file, options.maxSizeBytes)) {
    return LICENSE_VALIDATION_MESSAGES.fileSize(
      formatFileSize(options.maxSizeBytes)
    );
  }

  return null;
}

/**
 * Validate entire license form data
 */
export function validateLicenseForm(formData: {
  jenis_lesen_id?: string;
  company_id?: string;
  alamat_1?: string;
  alamat_2?: string;
  bandar?: string;
  poskod?: string;
  negeri?: string;
  nama_perniagaan?: string;
  jenis_operasi?: string;
  bilangan_pekerja?: string;
  catatan?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate Step 1 fields
  if (!formData.jenis_lesen_id?.trim()) {
    errors.jenis_lesen_id = LICENSE_VALIDATION_MESSAGES.jenisLesen;
  }

  if (!formData.company_id?.trim()) {
    errors.company_id = LICENSE_VALIDATION_MESSAGES.company;
  }

  // Validate alamat_premis structure
  const alamatErrors = validateAlamatPremis({
    alamat_1: formData.alamat_1,
    alamat_2: formData.alamat_2,
    bandar: formData.bandar,
    poskod: formData.poskod,
    negeri: formData.negeri,
  });
  Object.assign(errors, alamatErrors);

  // Validate nama_perniagaan
  if (!formData.nama_perniagaan?.trim()) {
    errors.nama_perniagaan = LICENSE_VALIDATION_MESSAGES.namaPerniagaan;
  } else if (formData.nama_perniagaan.length > 255) {
    errors.nama_perniagaan = 'Nama terlalu panjang (maksimum 255 aksara)';
  }

  // Validate optional fields
  if (formData.jenis_operasi && formData.jenis_operasi.length > 255) {
    errors.jenis_operasi = 'Jenis operasi terlalu panjang (maksimum 255 aksara)';
  }

  if (formData.bilangan_pekerja && formData.bilangan_pekerja.trim() !== '') {
    if (isNaN(Number(formData.bilangan_pekerja))) {
      errors.bilangan_pekerja = LICENSE_VALIDATION_MESSAGES.bilangan;
    } else {
      const num = Number(formData.bilangan_pekerja);
      if (num < 0) {
        errors.bilangan_pekerja = 'Bilangan pekerja tidak boleh negatif';
      }
    }
  }

  return errors;
}

/**
 * Validate single field with license-specific rules
 */
export function validateLicenseField(
  fieldName: string,
  value: string,
  formData?: Record<string, string>
): string {
  const rules = MAKLUMAT_TAB_VALIDATION_RULES[fieldName];
  if (!rules) return '';

  return baseValidateField(fieldName, value, rules, formData);
}

/**
 * Check if license form is complete for submission
 */
export function isLicenseFormComplete(formData: {
  jenis_lesen_id?: string;
  company_id?: string;
  butiran_operasi?: {
    alamat_premis?: {
      alamat_1?: string;
      bandar?: string;
      poskod?: string;
      negeri?: string;
    };
    nama_perniagaan?: string;
  };
}): boolean {
  return !!(
    formData.jenis_lesen_id &&
    formData.company_id &&
    formData.butiran_operasi?.alamat_premis?.alamat_1 &&
    formData.butiran_operasi?.alamat_premis?.bandar &&
    formData.butiran_operasi?.alamat_premis?.poskod &&
    formData.butiran_operasi?.alamat_premis?.negeri &&
    formData.butiran_operasi?.nama_perniagaan
  );
}

/**
 * Get field label for error messages
 */
export function getLicenseFieldLabel(fieldName: string): string {
  return (
    LICENSE_FIELD_LABELS[fieldName as keyof typeof LICENSE_FIELD_LABELS] ||
    fieldName
  );
}

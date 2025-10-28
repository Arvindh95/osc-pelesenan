// User types
export interface User {
  id: number;
  name: string;
  email: string;
  ic_no: string;
  status_verified_person: boolean;
  role: 'PEMOHON' | 'PENTADBIR_SYS';
  created_at: string;
  updated_at: string;
}

// User profile update types
export interface UserProfileUpdate {
  name?: string;
  email?: string;
}

// Company types
export interface Company {
  id: number;
  ssm_no: string;
  name: string;
  status: 'active' | 'inactive' | 'unknown';
  owner_user_id: number | null;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginData extends Record<string, string> {
  email: string;
  password: string;
}

export interface RegisterData extends Record<string, string> {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  ic_no: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Verification types
export interface VerificationResponse {
  verified: boolean;
  message: string;
  user?: User;
}

export interface CompanyVerificationResponse {
  company: Company;
  message: string;
}

export interface CompanyLinkResponse {
  company: Company;
  message: string;
  linked: boolean;
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  error?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
}

// Context types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  verifyIdentity: (icNo: string) => Promise<VerificationResponse>;
  updateProfile: (data: UserProfileUpdate) => Promise<User>;
  deactivateAccount: () => Promise<void>;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
// Company management types
export interface CompanyContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  verifyCompany: (ssmNo: string) => Promise<CompanyVerificationResponse>;
  linkCompany: (companyId: number) => Promise<CompanyLinkResponse>;
  getMyCompanies: () => Promise<Company[]>;
  getAllCompanies: () => Promise<Company[]>;
  getAvailableCompanies: () => Promise<Company[]>;
  clearError: () => void;
}

// Audit log types
export interface AuditLog {
  id: number;
  actor_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  meta: Record<string, any>;
  created_at: string;
  actor?: User;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Loading state types
export interface LoadingState {
  [key: string]: boolean;
}

// Validation types (enhanced)
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
  confirmPassword?: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface FormErrors {
  [fieldName: string]: string;
}

// HTTP request types
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Application state types
export interface AppState {
  auth: AuthState;
  companies: Company[];
  notifications: Notification[];
  loading: LoadingState;
}

// Route types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  adminOnly?: boolean;
  title?: string;
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

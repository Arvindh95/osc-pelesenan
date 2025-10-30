import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import {
  LoginData,
  RegisterData,
  AuthResponse,
  ApiError,
  VerificationResponse,
  CompanyVerificationResponse,
  CompanyLinkResponse,
  Company,
  User,
  RequestConfig,
} from '../types';
import {
  License,
  LicenseListParams,
  LicenseListResponse,
  CreateLicenseRequest,
  UpdateLicenseRequest,
  LicenseDocument,
  JenisLesen,
  Requirement,
} from '../types/license';
import { withRetry, RetryConfig } from '../utils/errorHandler';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private defaultRetries: number = 3;
  private defaultRetryDelay: number = 1000;
  
  // Normalize backend payloads to frontend types
  private transformLicense(raw: any): License {
    if (!raw) return raw as License;
    // Map dokumen -> documents (no casing change for fields inside)
    const { dokumen, ...rest } = raw as any;
    const documents = Array.isArray(dokumen)
      ? dokumen.map((d: any) => ({
          ...d,
          // Normalize to string to match Requirement.id type and strict compares
          keperluan_dokumen_id: String(d.keperluan_dokumen_id),
        }))
      : [];
    return {
      ...rest,
      documents,
    } as License;
  }

  constructor(config?: RequestConfig) {
    this.client = axios.create({
      baseURL: '/api',
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (config?.retries) {
      this.defaultRetries = config.retries;
    }
    if (config?.retryDelay) {
      this.defaultRetryDelay = config.retryDelay;
    }

    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Always attach token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );


    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          // Don't redirect here - let the component handle it
          // This prevents infinite redirect loops
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    // Network error
    if (!error.response) {
      return {
        message:
          'Tidak dapat menyambung ke pelayan. Sila semak sambungan internet anda.',
        status: 0,
      };
    }

    // Validation error
    if (error.response.status === 422) {
      const data = error.response.data as {
        errors?: Record<string, string[]>;
        message?: string;
      };
      return {
        message: data?.message || 'Pengesahan gagal',
        errors: data?.errors,
        status: 422,
      };
    }

    // Unauthorized
    if (error.response.status === 401) {
      return {
        message: 'Sesi anda telah tamat tempoh. Sila log masuk semula.',
        status: 401,
      };
    }

    // Forbidden
    if (error.response.status === 403) {
      return {
        message: 'Anda tidak mempunyai kebenaran untuk melakukan tindakan ini.',
        status: 403,
      };
    }

    // Not found
    if (error.response.status === 404) {
      return {
        message: 'Sumber yang diminta tidak dijumpai.',
        status: 404,
      };
    }

    // Server error
    if (error.response.status >= 500) {
      return {
        message: 'Ralat pelayan. Sila cuba lagi kemudian.',
        status: error.response.status,
      };
    }

    // Generic error
    const data = error.response.data as { message?: string };
    return {
      message: data?.message || error.message || 'Ralat tidak dijangka berlaku',
      status: error.response.status,
    };
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.defaultRetries,
    delay: number = this.defaultRetryDelay,
    silent: boolean = false
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: retries,
      baseDelay: delay,
      maxDelay: 30000,
      backoffFactor: 2,
    };

    return withRetry(async () => {
      try {
        return await requestFn();
      } catch (error) {
        const axiosError = error as AxiosError;
        if (!this.shouldRetry(axiosError)) {
          throw this.handleError(axiosError);
        }
        throw axiosError;
      }
    }, retryConfig, undefined, silent);
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  private setAuthToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }

  private clearAuthToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }

  // Authentication methods
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.retryRequest(() =>
      this.client.post<AuthResponse>('/auth/register', data)
    );
    const { user, token } = response.data;
    this.setAuthToken(token);
    return { user, token };
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.retryRequest(() =>
      this.client.post<AuthResponse>('/auth/login', credentials)
    );
    const { user, token } = response.data;
    this.setAuthToken(token);
    return { user, token };
  }

  async logout(): Promise<void> {
    try {
      await this.retryRequest(() => this.client.post('/auth/logout'));
    } finally {
      this.clearAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    // Silent mode: don't log 401 errors since they're expected when not logged in
    const response = await this.retryRequest(
      () => this.client.get<User>('/user'),
      this.defaultRetries,
      this.defaultRetryDelay,
      true // silent mode for auth checks
    );
    return response.data;
  }

  // Identity verification methods
  async verifyIdentity(icNo: string): Promise<VerificationResponse> {
    // Ensure IC number contains only digits
    const cleanIcNo = icNo.replace(/\D/g, '');

    const response = await this.retryRequest(() =>
      this.client.post<VerificationResponse>('/profile/verify-identity', {
        ic_no: cleanIcNo,
      })
    );
    return response.data;
  }

  // Company management methods
  async verifyCompany(ssmNo: string): Promise<CompanyVerificationResponse> {
    const response = await this.retryRequest(() =>
      this.client.post<CompanyVerificationResponse>('/company/verify-ssm', {
        ssm_no: ssmNo,
      })
    );
    return response.data;
  }

  async linkCompany(companyId: number): Promise<CompanyLinkResponse> {
    const response = await this.retryRequest(() =>
      this.client.post<CompanyLinkResponse>('/company/link', {
        company_id: companyId,
      })
    );
    return response.data;
  }

  async getMyCompanies(): Promise<Company[]> {
    const response = await this.retryRequest(() =>
      this.client.get<{ companies: Company[] }>('/company/my-companies')
    );
    return response.data.companies;
  }

  async getAllCompanies(): Promise<Company[]> {
    const response = await this.retryRequest(() =>
      this.client.get<{ companies: Company[] }>('/company/all')
    );
    return response.data.companies;
  }

  async getAvailableCompanies(): Promise<Company[]> {
    const response = await this.retryRequest(() =>
      this.client.get<{ companies: Company[] }>('/company/available')
    );
    return response.data.companies;
  }

  // Account management methods
  async deactivateAccount(): Promise<void> {
    await this.retryRequest(() => this.client.post('/account/deactivate'));
    this.clearAuthToken();
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
  }): Promise<{ user: User }> {
    const response = await this.retryRequest(() =>
      this.client.put<{ user: User }>('/profile', data)
    );
    return response.data;
  }

  // Audit log methods
  async getAuditLogs(
    page: number = 1,
    perPage: number = 10,
    action?: string
  ): Promise<{
    logs: Array<{
      id: number;
      actor_id: number;
      action: string;
      entity_type: string;
      entity_id: number;
      meta: Record<string, any>;
      created_at: string;
    }>;
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    let url = `/audit/logs?page=${page}&per_page=${perPage}`;
    if (action) {
      url += `&action=${encodeURIComponent(action)}`;
    }
    const response = await this.retryRequest(() =>
      this.client.get(url)
    );
    return response.data;
  }

  async getAllAuditLogs(
    page: number = 1,
    perPage: number = 10
  ): Promise<{
    logs: Array<{
      id: number;
      actor_id: number;
      action: string;
      entity_type: string;
      entity_id: number;
      meta: Record<string, any>;
      created_at: string;
      actor?: User;
    }>;
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const response = await this.retryRequest(() =>
      this.client.get(`/audit/all-logs?page=${page}&per_page=${perPage}`)
    );
    return response.data;
  }

  // M02 License Management Methods

  // License CRUD operations
  async getLicenses(params?: LicenseListParams): Promise<LicenseListResponse> {
    const response = await this.retryRequest(() =>
      this.client.get<LicenseListResponse>('/m02/permohonan', { params })
    );
    return response.data;
  }

  async getLicense(id: string): Promise<License> {
    const response = await this.retryRequest(() =>
      this.client.get<{ permohonan: any }>(`/m02/permohonan/${id}`)
    );
    console.log('[ApiClient] Raw license response:', response.data.permohonan);
    const transformed = this.transformLicense(response.data.permohonan);
    console.log('[ApiClient] Transformed license:', transformed);
    return transformed;
  }

  async createLicense(data: CreateLicenseRequest): Promise<License> {
    const response = await this.retryRequest(() =>
      this.client.post<{ message: string; permohonan: any }>(
        '/m02/permohonan',
        data
      )
    );
    return this.transformLicense(response.data.permohonan);
  }

  async updateLicense(
    id: string,
    data: UpdateLicenseRequest
  ): Promise<License> {
    const response = await this.retryRequest(() =>
      this.client.put<{ message: string; permohonan: any }>(`/m02/permohonan/${id}`, data)
    );
    return this.transformLicense(response.data.permohonan);
  }

  async submitLicense(id: string): Promise<void> {
    await this.retryRequest(() =>
      this.client.post(`/m02/permohonan/${id}/submit`)
    );
  }

  async cancelLicense(id: string, reason: string): Promise<void> {
    await this.retryRequest(() =>
      this.client.post(`/m02/permohonan/${id}/cancel`, { reason })
    );
  }

  // Document management
  async uploadLicenseDocument(
    licenseId: string,
    file: File,
    keperluanDokumenId: string
  ): Promise<LicenseDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keperluan_dokumen_id', keperluanDokumenId);

    const response = await this.retryRequest(() =>
      this.client.post<{ message: string; dokumen: LicenseDocument }>(
        `/m02/permohonan/${licenseId}/dokumen`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
    );
    return response.data.dokumen;
  }

  async deleteLicenseDocument(
    licenseId: string,
    documentId: string
  ): Promise<void> {
    await this.retryRequest(() =>
      this.client.delete(`/m02/permohonan/${licenseId}/dokumen/${documentId}`)
    );
  }

  // Catalog data
  async getJenisLesen(): Promise<JenisLesen[]> {
    const response = await this.retryRequest(() =>
      this.client.get<JenisLesen[]>('/m02/jenis-lesen')
    );

    // Normalize jenis lesen IDs to strings for consistency
    const normalized = Array.isArray(response.data)
      ? response.data.map((jenis: any) => ({
          ...jenis,
          id: String(jenis.id),
        }))
      : [];

    return normalized;
  }

  async getLicenseRequirements(jenisLesenId: string): Promise<Requirement[]> {
    const response = await this.retryRequest(() =>
      this.client.get<Requirement[]>(
        `/m02/jenis-lesen/${jenisLesenId}/keperluan`
      )
    );
    console.log('[ApiClient] Raw requirements response:', response.data);

    // Normalize requirement IDs to strings to match document keperluan_dokumen_id
    const normalized = Array.isArray(response.data)
      ? response.data.map((req: any) => ({
          ...req,
          id: String(req.id),
          jenis_lesen_id: String(req.jenis_lesen_id),
        }))
      : [];

    console.log('[ApiClient] Normalized requirements:', normalized);
    return normalized;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{
      status: string;
      timestamp: string;
    }>('/health');
    return response.data;
  }

  // Generic request method for custom endpoints
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.retryRequest(() =>
      this.client.request<T>(config)
    );
    return response.data;
  }

  // Set custom headers
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  // Remove custom headers
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }

  // Update timeout
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }
}

export default new ApiClient();

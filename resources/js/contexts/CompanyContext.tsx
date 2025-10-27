import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Company,
  CompanyVerificationResponse,
  CompanyLinkResponse,
  ApiError,
  CompanyContextType,
} from '../types';
import apiClient from '../services/apiClient';

// Company state interface
interface CompanyState {
  companies: Company[];
  allCompanies: Company[]; // For admin users
  isLoading: boolean;
  error: string | null;
}

// Company actions
type CompanyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'SET_ALL_COMPANIES'; payload: Company[] }
  | { type: 'ADD_COMPANY'; payload: Company }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: CompanyState = {
  companies: [],
  allCompanies: [],
  isLoading: false,
  error: null,
};

// Company reducer
const companyReducer = (
  state: CompanyState,
  action: CompanyAction
): CompanyState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_COMPANIES':
      return {
        ...state,
        companies: action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ALL_COMPANIES':
      return {
        ...state,
        allCompanies: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_COMPANY':
      return {
        ...state,
        companies: [...state.companies, action.payload],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? action.payload : company
        ),
        allCompanies: state.allCompanies.map(company =>
          company.id === action.payload.id ? action.payload : company
        ),
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Company provider component
interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(companyReducer, initialState);

  // Verify company
  const verifyCompany = async (
    ssmNo: string
  ): Promise<CompanyVerificationResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiClient.verifyCompany(ssmNo);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  };

  // Link company
  const linkCompany = async (
    companyId: number
  ): Promise<CompanyLinkResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await apiClient.linkCompany(companyId);

      // Add the linked company to user's companies
      dispatch({ type: 'ADD_COMPANY', payload: response.company });

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  };

  // Get user's companies
  const getMyCompanies = async (): Promise<Company[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const companies = await apiClient.getMyCompanies();
      dispatch({ type: 'SET_COMPANIES', payload: companies });
      return companies;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  };

  // Get all companies (admin only)
  const getAllCompanies = async (): Promise<Company[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const companies = await apiClient.getAllCompanies();
      dispatch({ type: 'SET_ALL_COMPANIES', payload: companies });
      return companies;
    } catch (error) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: CompanyContextType = {
    companies: state.companies,
    isLoading: state.isLoading,
    error: state.error,
    verifyCompany,
    linkCompany,
    getMyCompanies,
    getAllCompanies,
    clearError,
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook to use company context
export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export default CompanyContext;

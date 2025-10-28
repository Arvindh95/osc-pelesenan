import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginData, RegisterData } from '../types';
import api from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  deactivateAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const user = await api.getCurrentUser();
      setUser(user);
    } catch (error) {
      // If user fetch fails (e.g., 401), clear auth state
      // This is expected when user is not logged in, so we silently handle it
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (data: LoginData) => {
    await api.login(data);
    await fetchUser();
  };

  const register = async (data: RegisterData) => {
    await api.register(data);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const response = await api.updateProfile(data);
    setUser(response.user);
  };

  const deactivateAccount = async () => {
    await api.deactivateAccount();
    // Clear auth state after deactivation
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        deactivateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
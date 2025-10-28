import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface VerifiedRouteProps {
  children: ReactNode;
}

/**
 * Route wrapper that requires users to have verified their identity
 * Redirects to identity verification page if not verified
 */
function VerifiedRoute({ children }: VerifiedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to identity verification if not verified
  if (!user?.status_verified_person) {
    return (
      <Navigate
        to="/identity"
        state={{
          from: location,
          message: 'Please verify your identity to access this feature.',
        }}
        replace
      />
    );
  }

  return <>{children}</>;
}

export default VerifiedRoute;

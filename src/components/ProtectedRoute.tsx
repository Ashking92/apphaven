
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log authentication status for debugging
    console.log("Auth status:", { isAuthenticated, isAdmin, loading, userId: user?.id });
    
    if (!loading && adminOnly && !isAdmin) {
      toast.error("You don't have permission to access this page");
    }
  }, [isAuthenticated, isAdmin, loading, adminOnly, user]);

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} />;
  }

  // If admin only and user is not admin, redirect to home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  // If authenticated (and admin if required), render the children
  return <>{children}</>;
};

export default ProtectedRoute;

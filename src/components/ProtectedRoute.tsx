
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isAdmin, isLoading } = useAuth();

  // Show loading state or spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If admin only route and user is not an admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated (and is admin if required)
  return <>{children}</>;
};

export default ProtectedRoute;

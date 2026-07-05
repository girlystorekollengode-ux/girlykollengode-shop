import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/ui/Spinner.jsx';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    // If user is already authenticated, redirect them away from auth screens
    const fromPath = location.state?.from?.pathname || '/';
    return <Navigate to={fromPath} replace />;
  }

  return children;
};

export default GuestRoute;

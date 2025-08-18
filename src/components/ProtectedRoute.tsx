import React from 'react';
import { useAuth } from './AuthContext';
import DashboardLayout from './DashboardLayout';
import Auth from '../pages/Auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};
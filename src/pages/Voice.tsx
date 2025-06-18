
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import VoiceDashboard from '@/components/voice/VoiceDashboard';

const Voice = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <VoiceDashboard />
    </DashboardLayout>
  );
};

export default Voice;

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const LoginForm = React.lazy(() => import('@/components/LoginForm'));
const AdminDashboard = React.lazy(() => import('@/components/AdminDashboard'));
import '@/index.css';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Se încarcă...</div>;
  }

  if (!user || !isAdmin) {
    return <LoginForm />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Se încarcă...</div>;
  }

  if (!user || !isAdmin) {
    return <LoginForm />;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Se încarcă...</div>}>
      <Routes>
        <Route path="/*" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
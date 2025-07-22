
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import Demo from './Demo';
import { TrustedBy } from '@/components/landing/TrustedBy';

const Landing = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Demo />
      <TrustedBy />
    </div>
  );
};

export default Landing;

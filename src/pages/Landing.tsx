
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { ModernHero } from '@/components/landing/ModernHero';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel';
import { ModernFAQ } from '@/components/landing/ModernFAQ';
import { ModernFooter } from '@/components/landing/ModernFooter';

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
      <ModernHero />
      <FeaturesGrid />
      <InteractiveDemo />
      <StatsSection />
      <TestimonialsCarousel />
      <ModernFAQ />
      <ModernFooter />
    </div>
  );
};

export default Landing;

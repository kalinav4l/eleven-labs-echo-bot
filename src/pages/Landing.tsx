
import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import Demo from '../components/landing/Demo';
import Features from '../components/landing/Features';
import TrustedBy from '../components/landing/TrustedBy';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Demo />
      <Features />
      <TrustedBy />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;

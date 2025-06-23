
import React from 'react'
import HamburgerMenu from '@/components/HamburgerMenu'
import Header from '@/components/homepage/Header'
import HeroSection from '@/components/homepage/HeroSection'
import FeaturesSection from '@/components/homepage/FeaturesSection'
import TestimonialsSection from '@/components/homepage/TestimonialsSection'
import FAQSection from '@/components/homepage/FAQSection'
import FinalCTASection from '@/components/homepage/FinalCTASection'
import Footer from '@/components/homepage/Footer'

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFDFF] via-white to-gray-50 relative overflow-hidden">
      <HamburgerMenu />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}

export default Index

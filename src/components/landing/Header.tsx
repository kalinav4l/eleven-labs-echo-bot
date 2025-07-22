import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-card border-b-0 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-width px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="morph-shape-1 w-10 h-10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-gradient">
              Kalina AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('demo')}
              className="text-[var(--brand-400)] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-[var(--brand-400)] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('trusted-by')}
              className="text-[var(--brand-400)] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              Trusted By
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[var(--brand-400)] hover:text-[var(--brand-300)] transition-colors font-medium"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/auth"
              className="btn-secondary btn-magnetic"
            >
              Sign In
            </a>
            <a
              href="/auth"
              className="btn-primary btn-magnetic"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg glass-card transition-all duration-300 btn-magnetic"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[var(--brand-400)]" />
            ) : (
              <Menu className="w-6 h-6 text-[var(--brand-400)]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden transition-all duration-300 ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="glass-card mx-6 mb-4 rounded-xl">
          <nav className="flex flex-col space-y-1 p-4">
            <button
              onClick={() => scrollToSection('demo')}
              className="text-left py-3 px-4 text-[var(--brand-400)] hover:text-[var(--brand-300)] hover:bg-[var(--brand-100)] rounded-lg transition-all font-medium"
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-3 px-4 text-[var(--brand-400)] hover:text-[var(--brand-300)] hover:bg-[var(--brand-100)] rounded-lg transition-all font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('trusted-by')}
              className="text-left py-3 px-4 text-[var(--brand-400)] hover:text-[var(--brand-300)] hover:bg-[var(--brand-100)] rounded-lg transition-all font-medium"
            >
              Trusted By
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left py-3 px-4 text-[var(--brand-400)] hover:text-[var(--brand-300)] hover:bg-[var(--brand-100)] rounded-lg transition-all font-medium"
            >
              FAQ
            </button>
            
            <div className="border-t border-[var(--brand-200)] my-2"></div>
            
            <div className="flex flex-col space-y-2 pt-2">
              <a
                href="/auth"
                className="btn-secondary btn-magnetic text-center"
              >
                Sign In
              </a>
              <a
                href="/auth"
                className="btn-primary btn-magnetic text-center"
              >
                Get Started
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

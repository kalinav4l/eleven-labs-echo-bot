import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverDemo, setIsOverDemo] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleHeaderOverDemo = (event: CustomEvent) => {
      setIsOverDemo(event.detail.isOver);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('headerOverDemo', handleHeaderOverDemo as EventListener);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('headerOverDemo', handleHeaderOverDemo as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 backdrop-blur-xl ${
      isScrolled 
        ? 'bg-white/90 border-b border-gray-200/50 shadow-sm' 
        : 'bg-white/30 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className={`text-2xl font-bold transition-colors duration-300 ${
            isOverDemo ? 'text-white' : 'text-gray-900'
          }`}>
            Kalina AI
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {/* PRODUCTS DROPDOWN */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown('products')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 relative group px-4 py-2 hover:text-gray-900 ${
                  isOverDemo ? 'text-white' : 'text-gray-700'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'products'}
                type="button"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className={`absolute left-0 top-full w-56 rounded-lg bg-white shadow-lg z-[200] border border-gray-200 ${
                openDropdown === 'products' ? 'block' : 'hidden'
              }`}>
                <Link to="/products" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-t-lg">
                  Motorul AI
                </Link>
                <Link to="/products" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  Infrastructura Globală
                </Link>
                <Link to="/products" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-b-lg">
                  Suite Enterprise
                </Link>
              </div>
            </div>

            {/* SOLUTIONS DROPDOWN */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown('solutions')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 relative group px-4 py-2 hover:text-gray-900 ${
                  isOverDemo ? 'text-white' : 'text-gray-700'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'solutions'}
                type="button"
              >
                Solutions
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className={`absolute left-0 top-full w-56 rounded-lg bg-white shadow-lg z-[200] border border-gray-200 ${
                openDropdown === 'solutions' ? 'block' : 'hidden'
              }`}>
                <Link to="/solutions" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-t-lg">
                  Call Centers
                </Link>
                <Link to="/solutions" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  Remote Work
                </Link>
                <Link to="/solutions" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-b-lg">
                  Healthcare
                </Link>
              </div>
            </div>

            {/* RESEARCH DROPDOWN */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown('research')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 relative group px-4 py-2 hover:text-gray-900 ${
                  isOverDemo ? 'text-white' : 'text-gray-700'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'research'}
                type="button"
              >
                Research
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className={`absolute left-0 top-full w-56 rounded-lg bg-white shadow-lg z-[200] border border-gray-200 ${
                openDropdown === 'research' ? 'block' : 'hidden'
              }`}>
                <Link to="/research" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-t-lg">
                  Cercetare AI
                </Link>
                <Link to="/research" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  Publicații
                </Link>
                <Link to="/research" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-b-lg">
                  Inovații
                </Link>
              </div>
            </div>

            {/* RESOURCES DROPDOWN */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown('resources')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 relative group px-4 py-2 hover:text-gray-900 ${
                  isOverDemo ? 'text-white' : 'text-gray-700'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'resources'}
                type="button"
              >
                Resources
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className={`absolute left-0 top-full w-56 rounded-lg bg-white shadow-lg z-[200] border border-gray-200 ${
                openDropdown === 'resources' ? 'block' : 'hidden'
              }`}>
                <Link to="/resources" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-t-lg">
                  Documentație
                </Link>
                <Link to="/resources" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  Tutoriale
                </Link>
                <Link to="/resources" className="block px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-b-lg">
                  Suport
                </Link>
              </div>
            </div>

            <Link to="/pricing" className={`transition-all duration-300 relative group px-4 py-2 hover:text-gray-900 ${
              isOverDemo ? 'text-white' : 'text-gray-700'
            }`}>
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link to="/company" className={`transition-all duration-300 relative group px-4 py-2 hover:text-gray-900 ${
              isOverDemo ? 'text-white' : 'text-gray-700'
            }`}>
              Company
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          {/* Desktop CTA Button */}
          <Link to="/auth" className="hidden md:block">
            <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden relative z-[10000] w-10 h-10 flex flex-col justify-center items-center transition-all duration-300 ${
              isOverDemo ? 'text-white' : 'text-gray-900'
            }`}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}></span>
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 my-1 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}></span>
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg z-[9998] border-t border-gray-200">
            <nav className="p-6">
              <div className="space-y-4">
                
                {/* Mobile Menu Items */}
                <div className="py-4 border-b border-gray-200">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'products' ? null : 'products')}
                    className="flex items-center justify-between w-full text-left text-gray-900 font-semibold text-lg"
                  >
                    Products
                    <span className="text-xl">{openMobileDropdown === 'products' ? '−' : '+'}</span>
                  </button>
                  {openMobileDropdown === 'products' && (
                    <div className="mt-3 pl-4 space-y-2">
                      <Link to="/products" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Motorul AI
                      </Link>
                      <Link to="/products" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Infrastructura Globală
                      </Link>
                      <Link to="/products" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Suite Enterprise
                      </Link>
                    </div>
                  )}
                </div>

                <div className="py-4 border-b border-gray-200">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'solutions' ? null : 'solutions')}
                    className="flex items-center justify-between w-full text-left text-gray-900 font-semibold text-lg"
                  >
                    Solutions
                    <span className="text-xl">{openMobileDropdown === 'solutions' ? '−' : '+'}</span>
                  </button>
                  {openMobileDropdown === 'solutions' && (
                    <div className="mt-3 pl-4 space-y-2">
                      <Link to="/solutions" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Call Centers
                      </Link>
                      <Link to="/solutions" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Remote Work
                      </Link>
                      <Link to="/solutions" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Healthcare
                      </Link>
                    </div>
                  )}
                </div>

                <div className="py-4 border-b border-gray-200">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'research' ? null : 'research')}
                    className="flex items-center justify-between w-full text-left text-gray-900 font-semibold text-lg"
                  >
                    Research
                    <span className="text-xl">{openMobileDropdown === 'research' ? '−' : '+'}</span>
                  </button>
                  {openMobileDropdown === 'research' && (
                    <div className="mt-3 pl-4 space-y-2">
                      <Link to="/research" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Cercetare AI
                      </Link>
                      <Link to="/research" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Publicații
                      </Link>
                      <Link to="/research" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Inovații
                      </Link>
                    </div>
                  )}
                </div>

                <div className="py-4 border-b border-gray-200">
                  <button
                    onClick={() => setOpenMobileDropdown(openMobileDropdown === 'resources' ? null : 'resources')}
                    className="flex items-center justify-between w-full text-left text-gray-900 font-semibold text-lg"
                  >
                    Resources
                    <span className="text-xl">{openMobileDropdown === 'resources' ? '−' : '+'}</span>
                  </button>
                  {openMobileDropdown === 'resources' && (
                    <div className="mt-3 pl-4 space-y-2">
                      <Link to="/resources" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Documentație
                      </Link>
                      <Link to="/resources" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Tutoriale
                      </Link>
                      <Link to="/resources" className="block text-gray-600 py-1" onClick={() => setIsMobileMenuOpen(false)}>
                        Suport
                      </Link>
                    </div>
                  )}
                </div>

                <div className="py-4 border-b border-gray-200">
                  <Link to="/pricing" className="block text-gray-900 font-semibold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                    Pricing
                  </Link>
                </div>

                <div className="py-4 border-b border-gray-200">
                  <Link to="/company" className="block text-gray-900 font-semibold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                    Company
                  </Link>
                </div>

                <div className="pt-4">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>

              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
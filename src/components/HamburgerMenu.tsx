
import React, { useState } from 'react';
import { X, User, Info, DollarSign, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        onClick={toggleMenu} 
        className="fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur-xl rounded-lg touch-manipulation border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="flex flex-col space-y-1">
          <div className="w-6 h-0.5 bg-gray-900"></div>
          <div className="w-6 h-0.5 bg-gray-900"></div>
          <div className="w-6 h-0.5 bg-gray-900"></div>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
          onClick={toggleMenu} 
        />
      )}

      {/* Menu */}
      <div className={`fixed top-0 left-0 h-full ${isMobile ? 'w-full max-w-sm' : 'w-80'} bg-white/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out z-50 border-r border-gray-200/50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-900">Meniu</h2>
          <button 
            onClick={toggleMenu} 
            className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 overflow-y-auto">
          <Link 
            to="/" 
            className="flex items-center px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/70 transition-colors touch-manipulation" 
            onClick={toggleMenu}
          >
            <Home size={20} className="mr-3 flex-shrink-0" />
            <span>kalina</span>
          </Link>

          <Link 
            to="/account" 
            className="flex items-center px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/70 transition-colors touch-manipulation" 
            onClick={toggleMenu}
          >
            <User size={20} className="mr-3 flex-shrink-0" />
            <span>home</span>
          </Link>

          <Link 
            to="/pricing" 
            className="flex items-center px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/70 transition-colors touch-manipulation" 
            onClick={toggleMenu}
          >
            <DollarSign size={20} className="mr-3 flex-shrink-0" />
            <span>pricing</span>
          </Link>

          <Link 
            to="/info" 
            className="flex items-center px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/70 transition-colors touch-manipulation" 
            onClick={toggleMenu}
          >
            <Info size={20} className="mr-3 flex-shrink-0" />
            <span>info</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default HamburgerMenu;

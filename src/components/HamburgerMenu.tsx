
import React, { useState } from 'react';
import { Menu, X, User, Info, Phone, DollarSign, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2"
      >
        <div className="flex flex-col space-y-1">
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Meniu</h2>
          <button onClick={toggleMenu} className="text-white p-2">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8">
          <Link
            to="/"
            className="flex items-center px-6 py-4 text-white hover:bg-gray-900 transition-colors"
            onClick={toggleMenu}
          >
            <Home size={20} className="mr-3" />
            <span>Acasă</span>
          </Link>

          <Link
            to="/account"
            className="flex items-center px-6 py-4 text-white hover:bg-gray-900 transition-colors"
            onClick={toggleMenu}
          >
            <User size={20} className="mr-3" />
            <span>Cont</span>
          </Link>

          <Link
            to="/pricing"
            className="flex items-center px-6 py-4 text-white hover:bg-gray-900 transition-colors"
            onClick={toggleMenu}
          >
            <DollarSign size={20} className="mr-3" />
            <span>Prețuri</span>
          </Link>

          <Link
            to="/info"
            className="flex items-center px-6 py-4 text-white hover:bg-gray-900 transition-colors"
            onClick={toggleMenu}
          >
            <Info size={20} className="mr-3" />
            <span>Informații</span>
          </Link>

          <Link
            to="/calls"
            className="flex items-center px-6 py-4 text-white hover:bg-gray-900 transition-colors"
            onClick={toggleMenu}
          >
            <Phone size={20} className="mr-3" />
            <span>Telefonie</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default HamburgerMenu;

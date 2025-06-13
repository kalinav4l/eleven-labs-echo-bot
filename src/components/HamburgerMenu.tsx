
import React, { useState } from 'react';
import { X, User, Info, DollarSign, Home } from 'lucide-react';
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
        className="fixed top-4 left-4 z-50 p-2 liquid-glass rounded-lg"
      >
        <div className="flex flex-col space-y-1">
          <div className="w-6 h-0.5 bg-foreground"></div>
          <div className="w-6 h-0.5 bg-foreground"></div>
          <div className="w-6 h-0.5 bg-foreground"></div>
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
      <div
        className={`fixed top-0 left-0 h-full w-80 liquid-glass transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Meniu</h2>
          <button onClick={toggleMenu} className="text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8">
          <Link
            to="/"
            className="flex items-center px-6 py-4 text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleMenu}
          >
            <Home size={20} className="mr-3" />
            <span>Acasă</span>
          </Link>

          <Link
            to="/account"
            className="flex items-center px-6 py-4 text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleMenu}
          >
            <User size={20} className="mr-3" />
            <span>Cont</span>
          </Link>

          <Link
            to="/pricing"
            className="flex items-center px-6 py-4 text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleMenu}
          >
            <DollarSign size={20} className="mr-3" />
            <span>Prețuri</span>
          </Link>

          <Link
            to="/info"
            className="flex items-center px-6 py-4 text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleMenu}
          >
            <Info size={20} className="mr-3" />
            <span>Informații</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default HamburgerMenu;

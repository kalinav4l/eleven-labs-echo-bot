
import React, { useState } from 'react';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full liquid-glass border border-white/20 backdrop-blur-xl bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 liquid-glass border-r border-white/20 backdrop-blur-xl bg-white/80 shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <div className="space-y-6">
            {/* User Section */}
            {user ? (
              <div className="border-b border-white/20 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{user.email}</p>
                    <p className="text-muted-foreground text-sm">Utilizator autentificat</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-b border-white/20 pb-4">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <User className="w-5 h-5 text-foreground" />
                  <span className="text-foreground">Conectare / Înregistrare</span>
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-lg hover:bg-white/50 transition-colors text-foreground"
              >
                Acasă
              </Link>
              
              {user && (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="block p-3 rounded-lg hover:bg-white/50 transition-colors text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/account/kalina-agents"
                    onClick={() => setIsOpen(false)}
                    className="block p-3 rounded-lg hover:bg-white/50 transition-colors text-foreground"
                  >
                    Agenți Kalina
                  </Link>
                  <Link
                    to="/account/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors text-foreground"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Setări</span>
                  </Link>
                </>
              )}
              
              <Link
                to="/info"
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-lg hover:bg-white/50 transition-colors text-foreground"
              >
                Informații
              </Link>
              <Link
                to="/pricing"
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-lg hover:bg-white/50 transition-colors text-foreground"
              >
                Prețuri
              </Link>
            </nav>

            {/* Sign Out */}
            {user && (
              <div className="border-t border-white/20 pt-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Deconectare</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;

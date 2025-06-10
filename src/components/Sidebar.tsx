
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, BarChart3, Bot, Phone, MessageSquare, Database, Settings, CreditCard, Info } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Bot, label: 'Agents', path: '/agents' },
    { icon: Phone, label: 'Call History', path: '/call-history' },
    { icon: Database, label: 'Knowledge Base', path: '/knowledge-base' },
    { icon: MessageSquare, label: 'Phone Numbers', path: '/phone-numbers' },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Settings', path: '/account/settings' },
    { icon: CreditCard, label: 'Pricing', path: '/pricing' },
    { icon: Info, label: 'Info', path: '/info' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r-2 border-[#FFBB00] z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        shadow-lg
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#FFBB00] bg-gradient-primary">
          <h2 className="text-black text-xl font-bold">ElevenLabs</h2>
          <button
            onClick={onClose}
            className="lg:hidden text-black hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-full bg-white">
          <div className="flex-1 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-6 py-3 text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'text-black bg-[#FFBB00] border-r-4 border-black font-bold'
                      : 'text-gray-700 hover:text-black hover:bg-[#FFD666]'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Bottom menu */}
          <div className="border-t-2 border-[#FFBB00] py-4">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-6 py-3 text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'text-black bg-[#FFBB00] border-r-4 border-black font-bold'
                      : 'text-gray-700 hover:text-black hover:bg-[#FFD666]'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

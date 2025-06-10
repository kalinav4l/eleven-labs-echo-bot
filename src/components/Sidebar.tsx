
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Phone,
  Database,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bot, label: 'Agents', path: '/agents' },
    { icon: PhoneCall, label: 'Call History', path: '/call-history' },
    { icon: Database, label: 'Knowledge Base', path: '/knowledge-base' },
    { icon: Phone, label: 'Phone Numbers', path: '/phone-numbers' },
    { icon: Settings, label: 'Settings', path: '/account/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-[#0F1419] border-r border-[#2A2D35] z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:z-auto"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[#2A2D35]">
            <h2 className="text-xl font-bold text-white">ElevenLabs</h2>
            <p className="text-sm text-gray-400">Conversational AI</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-[#1F2128] text-white"
                          : "text-gray-400 hover:bg-[#1F2128] hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#2A2D35]">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-[#1F2128] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Back to ElevenLabs
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

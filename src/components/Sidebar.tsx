
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  Settings, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/account' },
    { icon: Bot, label: 'Agenți', path: '/account/agents' },
    { icon: MessageSquare, label: 'Istoric Chat', path: '/account/chat-history' },
    { icon: Settings, label: 'Setări', path: '/account/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/account') {
      return location.pathname === '/account';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay pentru mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">Cabinet Personal</h2>
            <button 
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-black"
            >
              ×
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-black 
                  transition-colors border-l-4 border-transparent
                  ${isActive(item.path) ? 'bg-gray-100 text-black border-black' : ''}
                `}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Profile section */}
          <div className="border-t border-gray-200 p-4">
            <Link
              to="/account/profile"
              className="flex items-center px-2 py-3 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors rounded"
            >
              <User size={20} className="mr-3" />
              <span>Profilul Meu</span>
            </Link>
            <button
              onClick={signOut}
              className="flex items-center w-full px-2 py-3 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors rounded"
            >
              <LogOut size={20} className="mr-3" />
              <span>Deconectare</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


import React from 'react';
import { 
  Home, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  UsersRound, 
  Zap, 
  Settings,
  Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';

interface VoiceSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const VoiceSidebar = ({ collapsed, onToggle }: VoiceSidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/voice', active: true },
    { icon: Users, label: 'Agents', path: '/voice/agents' },
    { icon: TrendingUp, label: 'Analytics', path: '/voice/analytics' },
    { icon: MessageSquare, label: 'Conversations', path: '/voice/conversations' },
    { icon: UsersRound, label: 'Team', path: '/voice/team' },
    { icon: Zap, label: 'Integrations', path: '/voice/integrations' },
    { icon: Settings, label: 'Settings', path: '/voice/settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 z-30 ${
      collapsed ? 'w-20' : 'w-70'
    }`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <span className="font-semibold text-gray-900">Voice AI</span>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className="hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-3 mb-1 rounded-lg transition-colors ${
              item.active
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <item.icon className={`w-6 h-6 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default VoiceSidebar;

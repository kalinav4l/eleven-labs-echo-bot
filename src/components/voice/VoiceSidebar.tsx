
import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  BarChart3, 
  MessageCircle, 
  Users2,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const VoiceSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Users, label: 'Agents' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: MessageCircle, label: 'Conversations' },
    { icon: Users2, label: 'Team' },
    { icon: Puzzle, label: 'Integrations' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-70'} bg-gray-50 h-screen transition-all duration-300 flex flex-col`}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Menu Items */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`
                flex items-center h-12 px-4 rounded-lg cursor-pointer transition-all duration-200
                ${item.active 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <item.icon className="w-6 h-6" />
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default VoiceSidebar;

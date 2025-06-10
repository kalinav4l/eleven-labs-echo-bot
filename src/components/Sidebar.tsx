import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Phone, Volume2, Bot, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/account" className="flex items-center text-xl font-bold text-sidebar-foreground">
          <Avatar className="mr-2 w-8 h-8">
            <AvatarImage src="https://avatars.githubusercontent.com/u/8898634?v=4" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          Kalina AI
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link
                to="/account"
                className={`${
                  location.pathname === '/account' 
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
              >
                <User className="mr-3 h-6 w-6" />
                Acasă
              </Link>
              
              <Link
                to="/account/kalina-agents"
                className={`${
                  location.pathname === '/account/kalina-agents' 
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
              >
                <Bot className="mr-3 h-6 w-6" />
                Agents
              </Link>

              <Link
                to="/account/agent-consultant"
                className={`${
                  location.pathname === '/account/agent-consultant' 
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
              >
                <MessageSquare className="mr-3 h-6 w-6" />
                Agent Consultant
              </Link>

              <Link
                to="/account/calls"
                className={`${
                  location.pathname === '/account/calls' 
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
              >
                <Phone className="mr-3 h-6 w-6" />
                Calls
              </Link>

              <Link
                to="/account/voices"
                className={`${
                  location.pathname === '/account/voices' 
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
              >
                <Volume2 className="mr-3 h-6 w-6" />
                Voices
              </Link>

              <Link
                to="/account/settings"
                className={`${
                  location.pathname === '/account/settings' 
                    ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors`}
              >
                <Settings className="mr-3 h-6 w-6" />
                Setări
              </Link>
            </div>
          </div>
    </div>
  );
};

export default Sidebar;

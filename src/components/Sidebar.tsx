
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Volume2, Bot, MessageSquare, FileText, PhoneCall, X, BarChart3, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link to="/account" className="flex items-center text-xl font-bold text-gray-900" onClick={isMobile ? onClose : undefined}>
            <Avatar className="mr-2 w-8 h-8">
              <AvatarImage alt="@shadcn" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <span className="hidden sm:block">Kalina AI</span>
          </Link>
          {isMobile && (
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-1 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        
        <div className="px-3 py-2 overflow-y-auto">
          <div className="space-y-1">
            <Link 
              to="/account" 
              className={`${location.pathname === '/account' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">home</span>
            </Link>
            
            <Link 
              to="/account/kalina-agents" 
              className={`${location.pathname === '/account/kalina-agents' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Bot className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">agents</span>
            </Link>

            <Link 
              to="/account/agent-consultant" 
              className={`${location.pathname === '/account/agent-consultant' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <MessageSquare className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">creat</span>
            </Link>

            <Link 
              to="/account/voices" 
              className={`${location.pathname === '/account/voices' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Volume2 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">voice</span>
            </Link>

            <Link 
              to="/account/conversation-analytics" 
              className={`${location.pathname === '/account/conversation-analytics' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">analytics</span>
            </Link>

            <Link 
              to="/account/team-collaboration" 
              className={`${location.pathname === '/account/team-collaboration' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Users className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">team</span>
            </Link>

            <Link 
              to="/account/transcript" 
              className={`${location.pathname === '/account/transcript' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">transcript</span>
            </Link>

            <Link 
              to="/account/outbound" 
              className={`${location.pathname === '/account/outbound' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <PhoneCall className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">outbound</span>
            </Link>

            <Link 
              to="/account/settings" 
              className={`${location.pathname === '/account/settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-2 py-3 text-base font-medium rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">setări</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

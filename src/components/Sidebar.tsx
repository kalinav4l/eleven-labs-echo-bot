
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Bot, MessageSquare, FileText, PhoneCall, X, BarChart3, Calendar } from 'lucide-react';
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
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-64 elevenlabs-sidebar transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <Link to="/account" className="flex items-center text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors" onClick={isMobile ? onClose : undefined}>
            <Avatar className="mr-3 w-8 h-8">
              <AvatarImage alt="@shadcn" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback className="bg-gray-100 text-gray-600">KA</AvatarFallback>
            </Avatar>
            <span>Kalina AI</span>
          </Link>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md p-1 transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="px-4 py-6">
          <div className="space-y-1">
            <Link 
              to="/account" 
              className={`${location.pathname === '/account' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <User className="mr-3 h-4 w-4" />
              <span>Acasă</span>
            </Link>
            
            <Link 
              to="/account/kalina-agents" 
              className={`${location.pathname === '/account/kalina-agents' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Bot className="mr-3 h-4 w-4" />
              <span>Agenți</span>
            </Link>

            <Link 
              to="/account/conversation-analytics" 
              className={`${location.pathname === '/account/conversation-analytics' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              <span>Analiză</span>
            </Link>

            <Link 
              to="/account/transcript" 
              className={`${location.pathname === '/account/transcript' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <FileText className="mr-3 h-4 w-4" />
              <span>Transcrieri</span>
            </Link>

            <Link 
              to="/account/outbound" 
              className={`${location.pathname === '/account/outbound' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <PhoneCall className="mr-3 h-4 w-4" />
              <span>Apeluri</span>
            </Link>

            <Link 
              to="/account/calendar" 
              className={`${location.pathname === '/account/calendar' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Calendar className="mr-3 h-4 w-4" />
              <span>Calendar</span>
            </Link>

            <Link 
              to="/account/settings" 
              className={`${location.pathname === '/account/settings' ? 'elevenlabs-sidebar-item-active' : 'elevenlabs-sidebar-item'} group flex items-center px-3 py-2.5 text-sm rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Settings className="mr-3 h-4 w-4" />
              <span>Setări</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

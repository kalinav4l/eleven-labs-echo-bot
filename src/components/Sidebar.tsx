
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Volume2, Bot, MessageSquare, FileText, PhoneCall, X, BarChart3, Menu, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";

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
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A5B4C]/20 rounded-lg p-1 transition-colors lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-3 py-2 overflow-y-auto">
          <div className="space-y-1">
            <Link 
              to="/account" 
              className={`${location.pathname === '/account' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">home</span>
            </Link>
            
            <Link 
              to="/account/kalina-agents" 
              className={`${location.pathname === '/account/kalina-agents' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Bot className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">agents</span>
            </Link>

            <Link 
              to="/account/conversation-analytics" 
              className={`${location.pathname === '/account/conversation-analytics' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">analytics</span>
            </Link>

            <Link 
              to="/account/transcript" 
              className={`${location.pathname === '/account/transcript' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">transcript</span>
            </Link>

            <Link 
              to="/account/outbound" 
              className={`${location.pathname === '/account/outbound' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <PhoneCall className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">outbound</span>
            </Link>

            <Link 
              to="/account/call-scheduler" 
              className={`${location.pathname === '/account/call-scheduler' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={isMobile ? onClose : undefined}
            >
              <Calendar className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">calendar</span>
            </Link>

            <Link 
              to="/account/settings" 
              className={`${location.pathname === '/account/settings' ? 'text-[#0A5B4C] font-semibold border-r-2 border-[#0A5B4C]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
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

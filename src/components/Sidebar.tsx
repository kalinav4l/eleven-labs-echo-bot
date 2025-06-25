// Locație: src/components/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Bot, BarChart3, FileText, PhoneCall, X, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const handleMobileClose = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Clasele comune pentru link-uri, fără highlight pentru link-ul activ
  const linkClasses = "text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-3 text-base rounded-md transition-colors";

  return (
    <>
      {/* Overlay pentru mobil */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Containerul principal al barei laterale */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:z-auto lg:translate-x-0 lg:transition-all lg:duration-300 
        ${isOpen ? 'lg:w-64' : 'lg:w-20'}
        relative flex flex-col`}
      >
        {/* Header-ul barei laterale cu noul buton */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 h-16">
          <Link to="/account" className="flex items-center text-xl font-bold text-gray-900" onClick={handleMobileClose}>
            <Avatar className="mr-2 w-8 h-8">
              <AvatarImage alt="@shadcn" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            {isOpen && <span className="transition-opacity duration-200">Kalina AI</span>}
          </Link>
          
          <div>
            {/* Buton vizibil doar pe DESKTOP, comută între Menu și X */}
            <button onClick={() => setIsOpen(!isOpen)} className="hidden lg:block p-1 text-gray-600 hover:text-gray-900">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            {/* Buton vizibil doar pe MOBIL, pentru a închide meniul glisant */}
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-600 hover:text-gray-900">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Navigarea principală */}
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="space-y-1">
            {/* Link-urile cu clasele simplificate */}
            <Link to="/account" className={linkClasses} onClick={handleMobileClose}>
              <User className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">home</span>}
            </Link>
            
            <Link to="/account/kalina-agents" className={linkClasses} onClick={handleMobileClose}>
              <Bot className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">agents</span>}
            </Link>

            <Link to="/account/conversation-analytics" className={linkClasses} onClick={handleMobileClose}>
              <BarChart3 className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">analytics</span>}
            </Link>

            <Link to="/account/transcript" className={linkClasses} onClick={handleMobileClose}>
              <FileText className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">transcript</span>}
            </Link>

            <Link to="/account/outbound" className={linkClasses} onClick={handleMobileClose}>
              <PhoneCall className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">outbound</span>}
            </Link>

            <Link to="/account/settings" className={linkClasses} onClick={handleMobileClose}>
              <Settings className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">setări</span>}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
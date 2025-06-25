import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Bot, BarChart3, FileText, PhoneCall, X, ChevronsLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';

// MODIFICARE: Am redenumit prop-ul 'onClose' în 'setIsOpen' pentru a reflecta ambele acțiuni (închis/deschis)
// și am adăugat 'isOpen' pentru a primi starea curentă.
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Funcție locală pentru închiderea pe mobil, pentru a păstra codul curat
  const handleMobileClose = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay-ul pentru mobil (rămâne neschimbat) */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* MODIFICARE: Am ajustat clasele pentru containerul principal.
        - Am adăugat 'transition-all' și 'duration-300' pentru desktop.
        - Am înlocuit 'w-64' static cu o lățime dinamică pentru desktop: isOpen ? 'lg:w-64' : 'lg:w-20'.
        - Am păstrat 'w-64' pentru mobil, când glisează.
      */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:z-auto lg:translate-x-0 lg:transition-all lg:duration-300 
        ${isOpen ? 'lg:w-64' : 'lg:w-20'}
        relative flex flex-col` /* Am adăugat relative și flex-col pentru butonul de toggle */}
      >

        {/* MODIFICARE: Butonul de închidere/deschidere pentru DESKTOP */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-8 w-6 h-6 bg-white border-2 border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all z-50"
        >
          <ChevronsLeft className={`h-4 w-4 transition-transform duration-300 ${!isOpen && 'rotate-180'}`} />
        </button>


        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link to="/account" className="flex items-center text-xl font-bold text-gray-900" onClick={handleMobileClose}>
            <Avatar className="mr-2 w-8 h-8">
              <AvatarImage alt="@shadcn" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            {/* MODIFICARE: Textul logo-ului se ascunde acum pe desktop când meniul e închis */}
            <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'lg:opacity-0'}`}>Kalina AI</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-600 hover:text-gray-900 rounded-lg p-1 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-3 py-2 overflow-y-auto">
          <div className="space-y-1">
            {/* Exemplu de modificare pentru un link. Aplică la toate! */}
            <Link 
              to="/account" 
              className={`${location.pathname === '/account' ? 'text-[#0A5B4C] font-semibold bg-green-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={handleMobileClose}
            >
              <User className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {/* MODIFICARE: Textul link-ului este acum condiționat de starea 'isOpen' */}
              {isOpen && <span className="truncate">home</span>}
            </Link>
            
            <Link 
              to="/account/kalina-agents" 
              className={`${location.pathname === '/account/kalina-agents' ? 'text-[#0A5B4C] font-semibold bg-green-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={handleMobileClose}
            >
              <Bot className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">agents</span>}
            </Link>

            {/* APLICĂ ACEEAȘI LOGICĂ PENTRU RESTUL LINK-URILOR */}
            <Link 
              to="/account/conversation-analytics" 
              className={`${location.pathname === '/account/conversation-analytics' ? 'text-[#0A5B4C] font-semibold bg-green-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={handleMobileClose}
            >
              <BarChart3 className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">analytics</span>}
            </Link>

            <Link 
              to="/account/transcript" 
              className={`${location.pathname === '/account/transcript' ? 'text-[#0A5B4C] font-semibold bg-green-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={handleMobileClose}
            >
              <FileText className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">transcript</span>}
            </Link>

            <Link 
              to="/account/outbound" 
              className={`${location.pathname === '/account/outbound' ? 'text-[#0A5B4C] font-semibold bg-green-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={handleMobileClose}
            >
              <PhoneCall className={`flex-shrink-0 h-5 w-5 ${isOpen && 'mr-3'}`} />
              {isOpen && <span className="truncate">outbound</span>}
            </Link>

            <Link 
              to="/account/settings" 
              className={`${location.pathname === '/account/settings' ? 'text-[#0A5B4C] font-semibold bg-green-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} group flex items-center px-2 py-3 text-base rounded-md transition-colors`}
              onClick={handleMobileClose}
            >
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
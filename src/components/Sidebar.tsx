import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Bot, FileText, PhoneCall, X, BarChart3, Calendar, Globe, Mail, Workflow } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const Sidebar = ({
  isOpen,
  onClose
}: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  return <>
      {/* Mobile overlay */}
      {isMobile && isOpen && <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-6">
          <Link to="/account" className="flex items-center text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors" onClick={isMobile ? onClose : undefined}>
            <Avatar className="mr-3 w-8 h-8">
              <AvatarImage alt="@shadcn" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback className="bg-gray-100 text-gray-600">KA</AvatarFallback>
            </Avatar>
            <span>Kalina AI</span>
          </Link>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none rounded-lg p-1 transition-colors lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="px-4 pb-6 flex flex-col h-full">
          {/* Dashboard Section */}
          <div className="space-y-1 mb-6">
            <Link to="/account" className={`${location.pathname === '/account' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <User className="mr-3 h-4 w-4" />
              <span>Home</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1 mb-6">
            <Link to="/account" className={`${location.pathname === '/account' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <User className="mr-3 h-4 w-4" />
              <span>Home</span>
            </Link>

            <Link to="/account/conversation-analytics" className={`${location.pathname === '/account/conversation-analytics' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <BarChart3 className="mr-3 h-4 w-4" />
              <span>Analytics</span>
            </Link>

            <Link to="/account/call-logs" className={`${location.pathname === '/account/call-logs' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <FileText className="mr-3 h-4 w-4" />
              <span>Call Logs</span>
            </Link>

            <Link to="/account/outbound" className={`${location.pathname === '/account/outbound' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <PhoneCall className="mr-3 h-4 w-4" />
              <span>Send Call</span>
            </Link>

            <Link to="/account/construction" className={`${location.pathname === '/account/construction' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Workflow className="mr-3 h-4 w-4" />
              <span>Conversational Pathways</span>
            </Link>

            <Link to="/account/batches" className={`${location.pathname === '/account/batches' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Bot className="mr-3 h-4 w-4" />
              <span>Batches</span>
            </Link>

            <Link to="/account/tools" className={`${location.pathname === '/account/tools' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Settings className="mr-3 h-4 w-4" />
              <span>Tools</span>
            </Link>

            <Link to="/account/billing" className={`${location.pathname === '/account/billing' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <User className="mr-3 h-4 w-4" />
              <span>Billing & Credits</span>
            </Link>

            <Link to="/account/phone-numbers" className={`${location.pathname === '/account/phone-numbers' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <PhoneCall className="mr-3 h-4 w-4" />
              <span>Phone Numbers</span>
            </Link>

            <Link to="/account/voices" className={`${location.pathname === '/account/voices' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Bot className="mr-3 h-4 w-4" />
              <span>Voices</span>
            </Link>

            <Link to="/account/knowledge-bases" className={`${location.pathname === '/account/knowledge-bases' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <FileText className="mr-3 h-4 w-4" />
              <span>Knowledge Bases</span>
            </Link>

            <Link to="/account/web-widget" className={`${location.pathname === '/account/web-widget' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Globe className="mr-3 h-4 w-4" />
              <span>Web Widget</span>
            </Link>

            <Link to="/account/sms" className={`${location.pathname === '/account/sms' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Mail className="mr-3 h-4 w-4" />
              <span>SMS</span>
            </Link>

            <Link to="/account/infrastructure" className={`${location.pathname === '/account/infrastructure' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Settings className="mr-3 h-4 w-4" />
              <span>Infrastructure</span>
            </Link>

            <Link to="/account/add-ons" className={`${location.pathname === '/account/add-ons' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Bot className="mr-3 h-4 w-4" />
              <span>Add Ons</span>
            </Link>

            <Link to="/account/documentation" className={`${location.pathname === '/account/documentation' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <FileText className="mr-3 h-4 w-4" />
              <span>Documentation</span>
            </Link>
          </div>
          
          {/* Settings in bottom corner */}
          <div className="mt-auto">
            <Link to="/account/settings" className={`${location.pathname === '/account/settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`} onClick={isMobile ? onClose : undefined}>
              <Settings className="mr-3 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>
      </div>
    </>;
};
export default Sidebar;
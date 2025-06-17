
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import CreditsDisplay from './CreditsDisplay';
import ChatWidget from './ChatWidget';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex relative overflow-hidden">
      {/* Background Glass Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-green-200/10 to-emerald-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl"></div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-0 relative z-10">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200/50 liquid-glass">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-foreground text-lg font-semibold">{t('nav.dashboard')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <CreditsDisplay />
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-end p-4 border-b border-gray-200/50 liquid-glass">
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <CreditsDisplay />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;

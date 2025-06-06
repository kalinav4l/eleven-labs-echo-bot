
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import CreditsDisplay from './CreditsDisplay';
import ChatWidget from './ChatWidget';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-black p-2 hover:bg-gray-100 rounded"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-black text-lg font-semibold">Cabinet Personal</h1>
          <CreditsDisplay />
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-end p-4 border-b border-gray-200 bg-white">
          <CreditsDisplay />
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

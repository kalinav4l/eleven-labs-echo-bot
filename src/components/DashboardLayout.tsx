
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111217] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#2A2D35] bg-[#111217]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-2 hover:bg-[#1F2128] rounded"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-white text-lg font-semibold">ElevenLabs</h1>
          <div className="w-10"></div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

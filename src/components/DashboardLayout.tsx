
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b-2 border-[#FFBB00] bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-black p-2 hover:bg-[#FFD666] rounded"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-black text-lg font-bold">ElevenLabs</h1>
          <div className="w-10"></div>
        </div>

        {/* Main content */}
        <main className="flex-1 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

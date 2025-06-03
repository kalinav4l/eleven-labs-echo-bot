
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-2 hover:bg-gray-800 rounded"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-white text-lg font-semibold">Cabinet Personal</h1>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

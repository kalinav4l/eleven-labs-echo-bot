import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('sidebar-open');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* --- MODIFICAREA ESTE AICI --- */}
      <div className="flex-1 flex flex-col"> {/* <-- Am șters 'overflow-hidden' */}
        {/* Top bar with menu toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Toggle button for desktop */}
        {!sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 bg-[#0A5B4C] hover:bg-[#084a3f] text-white rounded-lg p-2 shadow-lg lg:block hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* --- ȘI AICI --- */}
        <main className="flex-1 overflow-x-hidden"> {/* <-- Am șters 'overflow-y-auto' */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
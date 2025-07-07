
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

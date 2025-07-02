
import React, { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-gray-50/30">
        <div className="elevenlabs-container elevenlabs-section">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

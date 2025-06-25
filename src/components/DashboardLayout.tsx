// Locație: src/components/DashboardLayout.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar'; // Asigură-te că calea este corectă

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Starea care controlează meniul este definită aici
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    // Containerul principal care folosește flexbox pentru a crea cele 2 coloane
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Componenta Sidebar primește starea curentă (isOpen) și funcția 
        pentru a o modifica (setIsOpen). Aceasta este legătura cheie.
      */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Conținutul paginii (care va avea scroll) */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* VERSIUNEA MUTATĂ ÎN STÂNGA */}
      <div className="fixed bottom-4 left-5 z-50 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        v1.0.0
      </div>
      
    </div>
  );
};

export default DashboardLayout;
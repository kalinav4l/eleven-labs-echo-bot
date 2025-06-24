// Fișier: src/components/DashboardLayout.tsx (Varianta finală și corectă)

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
    // Pe desktop, meniul este mereu deschis inițial
    if (window.innerWidth >= 1024) {
      return stored ? JSON.parse(stored) : true;
    }
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    // ---- AICI ESTE MODIFICAREA CHEIE ----
    // Am schimbat 'min-h-screen' în 'h-screen' și am adăugat 'overflow-hidden'
    // Asta blochează layout-ul la dimensiunea ecranului și previne scroll-ul întregii pagini.
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        {/* Butonul de meniu pentru mobil, dacă ai nevoie de el în afara sidebar-ului */}
        {/* Poți adăuga aici un header fix dacă dorești */}
        
        {/* Zona principală de conținut care va avea scroll */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
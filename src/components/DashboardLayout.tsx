import React from 'react';
import Sidebar from './Sidebar'; // Presupunând că ai o componentă separată pentru meniu.
                                // Numele poate fi altul, ex: HamburgerMenu.

// Prop-ul 'children' este esențial. Aici va fi randată pagina ta,
// cum ar fi componenta 'Transcript'.

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // 1. CONTAINERUL PRINCIPAL: Ocupă tot ecranul și folosește flex.
    // Acesta este părintele care controlează tot.
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* 2. BARA LATERALĂ (SIDEBAR): Are lățime fixă și NU are scroll. */}
      {/* Înlocuiește <Sidebar /> cu componenta ta reală de meniu dacă are alt nume. */}
      <Sidebar />

      {/* 3. CONȚINUTUL PRINCIPAL: Ocupă restul spațiului și ARE SCROLL. */}
      {/* Clasa 'flex-1' îl face să se extindă, iar 'overflow-y-auto' îi dă scroll. */}
      {/* Aici va fi randat automat tot ce pui între <DashboardLayout> și </DashboardLayout>. */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;
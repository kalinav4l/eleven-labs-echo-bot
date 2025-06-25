// Locație: src/components/DashboardLayout.tsx

import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from './Sidebar'; // Continuăm să folosim Sidebar pentru conținut

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // PanelGroup este containerul principal care gestionează redimensionarea
    <PanelGroup direction="horizontal" className="h-screen w-screen bg-gray-50">
      
      {/* PANoul 1: Bara Laterală (Sidebar) */}
      {/* Aici setăm dimensiunea implicită și minimă/maximă a barei laterale. */}
      {/* Dimensiunile sunt în procente. */}
      <Panel defaultSize={20} minSize={15} maxSize={25}>
        {/* Componenta Sidebar este plasată în interiorul primului panou. */}
        {/* Vom simplifica Sidebar.tsx în pasul următor. */}
        <Sidebar />
      </Panel>

      {/* Mânerul de Redimensionare */}
      {/* Acesta este elementul vizibil pe care utilizatorul îl va trage. */}
      <PanelResizeHandle className="w-[4px] bg-gray-200 hover:bg-green-600 active:bg-green-700 transition-colors duration-200" />
      
      {/* PANoul 2: Conținutul Principal */}
      {/* Acest panou va ocupa restul spațiului și va avea scroll. */}
      <Panel className="overflow-y-auto">
        {/* plasăm 'children' (pagina ta) în interiorul celui de-al doilea panou */}
        <main className="h-full">
            {children}
        </main>
      </Panel>

    </PanelGroup>
  );
};

export default DashboardLayout;
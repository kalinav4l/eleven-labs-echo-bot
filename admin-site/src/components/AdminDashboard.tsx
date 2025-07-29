import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { UsersManagement } from './pages/UsersManagement';
import { DashboardOverview } from './pages/DashboardOverview';
import { CallHistory } from './pages/CallHistory';
import { AuditLogs } from './pages/AuditLogs';

export function AdminDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/calls" element={<CallHistory />} />
            <Route path="/audit" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
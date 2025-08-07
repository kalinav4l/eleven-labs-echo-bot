import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { UsersManagement } from './pages/UsersManagement';
import { DashboardOverview } from './pages/DashboardOverview';
import { CallHistory } from './pages/CallHistory';
import { AuditLogs } from './pages/AuditLogs';
import { SystemMonitor } from './pages/SystemMonitor';
import { FinancialReports } from './pages/FinancialReports';
import { AgentManagement } from './pages/AgentManagement';

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
            <Route path="/system-monitor" element={<SystemMonitor />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/agents" element={<AgentManagement />} />
            {/* Placeholder routes - would implement these components */}
            <Route path="/roles" element={<div>Roluri și Permisiuni - Coming Soon</div>} />
            <Route path="/user-activity" element={<div>Activitate Utilizatori - Coming Soon</div>} />
            <Route path="/user-stats" element={<div>Statistici Utilizatori - Coming Soon</div>} />
            <Route path="/live-calls" element={<div>Conversații Live - Coming Soon</div>} />
            <Route path="/call-quality" element={<div>Calitate Apeluri - Coming Soon</div>} />
            <Route path="/conversation-analytics" element={<div>Analiza Conversații - Coming Soon</div>} />
            <Route path="/agent-performance" element={<div>Performanța Agenților - Coming Soon</div>} />
            <Route path="/voice-config" element={<div>Configurare Voce - Coming Soon</div>} />
            <Route path="/knowledge-base" element={<div>Knowledge Base - Coming Soon</div>} />
            <Route path="/transactions" element={<div>Tranzacții - Coming Soon</div>} />
            <Route path="/billing" element={<div>Facturare - Coming Soon</div>} />
            <Route path="/pricing" element={<div>Planuri și Prețuri - Coming Soon</div>} />
            <Route path="/api-performance" element={<div>Performanță API - Coming Soon</div>} />
            <Route path="/backup" element={<div>Backup & Restore - Coming Soon</div>} />
            <Route path="/system-config" element={<div>Configurare Sistem - Coming Soon</div>} />
            <Route path="/security" element={<div>Monitor Securitate - Coming Soon</div>} />
            <Route path="/auth-settings" element={<div>Setări Autentificare - Coming Soon</div>} />
            <Route path="/security-logs" element={<div>Loguri de Securitate - Coming Soon</div>} />
            <Route path="/rate-limiting" element={<div>Rate Limiting - Coming Soon</div>} />
            <Route path="/sms" element={<div>SMS Management - Coming Soon</div>} />
            <Route path="/email" element={<div>Email Marketing - Coming Soon</div>} />
            <Route path="/notifications" element={<div>Notificări - Coming Soon</div>} />
            <Route path="/webhooks" element={<div>Webhook Manager - Coming Soon</div>} />
            <Route path="/analytics" element={<div>Dashboard Analytics - Coming Soon</div>} />
            <Route path="/custom-reports" element={<div>Rapoarte Personalizate - Coming Soon</div>} />
            <Route path="/data-export" element={<div>Export Date - Coming Soon</div>} />
            <Route path="/kpi-monitor" element={<div>KPI Monitoring - Coming Soon</div>} />
            <Route path="/settings" element={<div>Setări Generale - Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
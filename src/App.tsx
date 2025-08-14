
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { KalinaWelcomeAnimation } from "./components/KalinaWelcomeAnimation";
import UserActivityTracker from "./components/analytics/UserActivityTracker";
import LoadingSpinner from './components/LoadingSpinner';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardLayout from './components/DashboardLayout';

// Lazy-loaded route components to reduce initial bundle size
const Auth = React.lazy(() => import("./pages/Auth"));
const Account = React.lazy(() => import("./pages/Account"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AccountSettings = React.lazy(() => import("./pages/AccountSettings"));
const KalinaAgents = React.lazy(() => import("./pages/KalinaAgents"));
const AgentEdit = React.lazy(() => import("./pages/AgentEdit"));
const Transcript = React.lazy(() => import("./pages/Transcript"));
const Outbound = React.lazy(() => import("./pages/Outbound"));
const Calls = React.lazy(() => import("./pages/Calls"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const ConversationAnalytics = React.lazy(() => import("./pages/ConversationAnalytics"));
const AgentAI = React.lazy(() => import("./pages/AgentAI"));
const AgentConsultant = React.lazy(() => import("./pages/AgentConsultant"));
const Scraping = React.lazy(() => import("./pages/Scraping"));
const Gmail = React.lazy(() => import("./pages/Gmail"));
const Construction = React.lazy(() => import("./pages/Construction"));
const Documentation = React.lazy(() => import("./pages/Documentation"));
const PhoneNumbers = React.lazy(() => import("./pages/PhoneNumbers"));
const TestCall = React.lazy(() => import("./pages/TestCall"));
const ConversationDetail = React.lazy(() => import("./pages/ConversationDetail"));
const VoiceDemo = React.lazy(() => import("./pages/VoiceDemo"));
const CallbackScheduler = React.lazy(() => import("./pages/CallbackScheduler"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Contacts = React.lazy(() => import("./pages/Contacts"));
const Webhooks = React.lazy(() => import("./pages/Webhooks"));
const AgentPrompts = React.lazy(() => import("./pages/AgentPrompts"));
const WorkflowDatabase = React.lazy(() => import("./pages/WorkflowDatabase"));
const Actiuni = React.lazy(() => import("./pages/Actiuni"));
const DataPage = React.lazy(() => import("./pages/Date"));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

function AppWithWelcome() {
  const { showWelcome, setShowWelcome } = useAuth();

  return (
    <>
      <UserActivityTracker />
      {showWelcome && (
        <KalinaWelcomeAnimation
          onComplete={() => setShowWelcome(false)}
        />
      )}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" message="Se încarcă aplicația..." variant="primary" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Navigate to="/account" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/admin" element={<Admin />} />

          {/* Account routes wrapped in DashboardLayout */}
          <Route path="/account/*" element={
            <DashboardLayout>
              <Routes>
                <Route index element={<Account />} />
                <Route path="kalina-agents" element={<KalinaAgents />} />
                <Route path="agent-edit/:agentId" element={<AgentEdit />} />
                <Route path="conversation-analytics" element={<ConversationAnalytics />} />
                <Route path="actiuni" element={<Actiuni />} />
                <Route path="conversation/:conversationId" element={<ConversationDetail />} />
                <Route path="transcript" element={<Transcript />} />
                <Route path="outbound" element={<Outbound />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="calls" element={<Calls />} />
                <Route path="scraping" element={<Scraping />} />
                <Route path="phone-numbers" element={<PhoneNumbers />} />
                <Route path="test-call" element={<TestCall />} />
                <Route path="construction" element={<Construction />} />
                <Route path="webhooks" element={<Webhooks />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="agent-ai" element={<AgentAI />} />
                <Route path="gmail" element={<Gmail />} />
                <Route path="agent-consultant" element={<AgentConsultant />} />
                <Route path="callback-scheduler" element={<CallbackScheduler />} />
                <Route path="documentation" element={<Documentation />} />
                <Route path="voice-demo" element={<VoiceDemo />} />
                <Route path="agent-prompts" element={<AgentPrompts />} />
                <Route path="workflow-database" element={<WorkflowDatabase />} />
                <Route path="date" element={<DataPage />} />
                <Route path="settings" element={<AccountSettings />} />
              </Routes>
            </DashboardLayout>
          } />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <AppWithWelcome />
          </SidebarProvider>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

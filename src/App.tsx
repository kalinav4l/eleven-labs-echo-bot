
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { KalinaWelcomeAnimation } from "./components/KalinaWelcomeAnimation";
import UserActivityTracker from "./components/analytics/UserActivityTracker";

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
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/account" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/admin" element={<Admin />} />

          {/* Account routes */}
          <Route path="/account" element={<Account />} />
          <Route path="/account/*" element={<Account />} />
          <Route path="/account/kalina-agents" element={<KalinaAgents />} />
          <Route path="/account/agent-edit/:agentId" element={<AgentEdit />} />
          <Route path="/account/conversation-analytics" element={<ConversationAnalytics />} />
          <Route path="/account/conversation/:conversationId" element={<ConversationDetail />} />
          <Route path="/account/transcript" element={<Transcript />} />
          <Route path="/account/outbound" element={<Outbound />} />
          <Route path="/account/contacts" element={<Contacts />} />
          <Route path="/account/calls" element={<Calls />} />
          <Route path="/account/scraping" element={<Scraping />} />
          <Route path="/account/phone-numbers" element={<PhoneNumbers />} />
          <Route path="/account/test-call" element={<TestCall />} />
          <Route path="/account/construction" element={<Construction />} />
          <Route path="/account/webhooks" element={<Webhooks />} />
          <Route path="/account/calendar" element={<Calendar />} />
          <Route path="/account/agent-ai" element={<AgentAI />} />
          <Route path="/account/gmail" element={<Gmail />} />
          <Route path="/account/agent-consultant" element={<AgentConsultant />} />
          <Route path="/account/callback-scheduler" element={<CallbackScheduler />} />
          <Route path="/account/documentation" element={<Documentation />} />
          <Route path="/account/voice-demo" element={<VoiceDemo />} />
          <Route path="/account/agent-prompts" element={<AgentPrompts />} />
          <Route path="/account/workflow-database" element={<WorkflowDatabase />} />
          <Route path="/account/settings" element={<AccountSettings />} />

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
          <AppWithWelcome />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

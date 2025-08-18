
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { KalinaWelcomeAnimation } from "./components/KalinaWelcomeAnimation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import UserActivityTracker from "./components/analytics/UserActivityTracker";

// Lazy-loaded route components to reduce initial bundle size
const Auth = React.lazy(() => import("./pages/Auth"));
const Account = React.lazy(() => import("./pages/AccountOptimized"));
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
const Documentation = React.lazy(() => import("./pages/Documentation"));
const PhoneNumbers = React.lazy(() => import("./pages/PhoneNumbers"));
const TestCall = React.lazy(() => import("./pages/TestCall"));
const ConversationDetail = React.lazy(() => import("./pages/ConversationDetail"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Contacts = React.lazy(() => import("./pages/Contacts"));
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
          
          {/* Public routes without sidebar */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes with persistent sidebar */}
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account/*" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/account/kalina-agents" element={<ProtectedRoute><KalinaAgents /></ProtectedRoute>} />
          <Route path="/account/agent-edit/:agentId" element={<ProtectedRoute><AgentEdit /></ProtectedRoute>} />
          <Route path="/account/conversation-analytics" element={<ProtectedRoute><ConversationAnalytics /></ProtectedRoute>} />
          <Route path="/account/conversation/:conversationId" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
          <Route path="/account/transcript" element={<ProtectedRoute><Transcript /></ProtectedRoute>} />
          <Route path="/account/outbound" element={<ProtectedRoute><Outbound /></ProtectedRoute>} />
          <Route path="/account/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/account/calls" element={<ProtectedRoute><Calls /></ProtectedRoute>} />
          <Route path="/account/scraping" element={<ProtectedRoute><Scraping /></ProtectedRoute>} />
          <Route path="/account/phone-numbers" element={<ProtectedRoute><PhoneNumbers /></ProtectedRoute>} />
          <Route path="/account/test-call" element={<ProtectedRoute><TestCall /></ProtectedRoute>} />
          <Route path="/account/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/account/agent-ai" element={<ProtectedRoute><AgentAI /></ProtectedRoute>} />
          <Route path="/account/agent-consultant" element={<ProtectedRoute><AgentConsultant /></ProtectedRoute>} />
          <Route path="/account/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
          <Route path="/account/agent-prompts" element={<ProtectedRoute><AgentPrompts /></ProtectedRoute>} />
          <Route path="/account/workflow-database" element={<ProtectedRoute><WorkflowDatabase /></ProtectedRoute>} />
          <Route path="/account/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
          
          {/* Special routes */}
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

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

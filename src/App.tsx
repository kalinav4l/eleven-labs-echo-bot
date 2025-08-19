
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { KalinaWelcomeAnimation } from "./components/KalinaWelcomeAnimation";

import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AccountSettings from "./pages/AccountSettings";
import KalinaAgents from "./pages/KalinaAgents";
import AgentEdit from "./pages/AgentEdit";

import Transcript from "./pages/Transcript";
import Outbound from "./pages/Outbound";
import Calls from "./pages/Calls";
import Calendar from "./pages/Calendar";
import ConversationAnalytics from "./pages/ConversationAnalytics";
import AgentAI from "./pages/AgentAI";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AgentConsultant from "./pages/AgentConsultant";
import Scraping from "./pages/Scraping";
import Gmail from "./pages/Gmail";
import Construction from "./pages/Construction";
import Documentation from "./pages/Documentation";
import PhoneNumbers from "./pages/PhoneNumbers";
import TestCall from "./pages/TestCall";
import ConversationDetail from "./pages/ConversationDetail";
import VoiceDemo from "./pages/VoiceDemo";
import CallbackScheduler from "./pages/CallbackScheduler";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import Contacts from "./pages/Contacts";
import Webhooks from "./pages/Webhooks";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function AppWithWelcome() {
  const { showWelcome, setShowWelcome } = useAuth();

  return (
    <>
      {showWelcome && (
        <KalinaWelcomeAnimation 
          onComplete={() => setShowWelcome(false)} 
        />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/account" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Account routes */}
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
        <Route path="/account/construction" element={<ProtectedRoute><Construction /></ProtectedRoute>} />
        <Route path="/account/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
        <Route path="/account/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/account/agent-ai" element={<ProtectedRoute><AgentAI /></ProtectedRoute>} />
        <Route path="/account/gmail" element={<ProtectedRoute><Gmail /></ProtectedRoute>} />
        <Route path="/account/agent-consultant" element={<ProtectedRoute><AgentConsultant /></ProtectedRoute>} />
        <Route path="/account/callback-scheduler" element={<ProtectedRoute><CallbackScheduler /></ProtectedRoute>} />
        <Route path="/account/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
        <Route path="/account/voice-demo" element={<ProtectedRoute><VoiceDemo /></ProtectedRoute>} />
        <Route path="/account/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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

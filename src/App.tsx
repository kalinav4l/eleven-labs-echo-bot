
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
import CallbackScheduler from "./pages/CallbackScheduler";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";

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
        <Route path="/" element={<Home />} />
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
        <Route path="/account/calls" element={<Calls />} />
        <Route path="/account/scraping" element={<Scraping />} />
        <Route path="/account/phone-numbers" element={<PhoneNumbers />} />
        <Route path="/account/test-call" element={<TestCall />} />
        <Route path="/account/construction" element={<Construction />} />
        <Route path="/account/calendar" element={<Calendar />} />
        <Route path="/account/agent-ai" element={<AgentAI />} />
        <Route path="/account/gmail" element={<Gmail />} />
        <Route path="/account/agent-consultant" element={<AgentConsultant />} />
        <Route path="/account/callback-scheduler" element={<CallbackScheduler />} />
        <Route path="/account/documentation" element={<Documentation />} />
        <Route path="/account/settings" element={<AccountSettings />} />

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

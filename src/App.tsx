
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { LoadingScreen } from "./components/LoadingScreen";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import AccountSettings from "./pages/AccountSettings";
import KalinaAgents from "./pages/KalinaAgents";
import AgentEdit from "./pages/AgentEdit";

import Transcript from "./pages/Transcript";
import Outbound from "./pages/Outbound";
import Calls from "./pages/Calls";
import Calendar from "./pages/Calendar";
import ConversationAnalytics from "./pages/ConversationAnalytics";
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

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/*" element={<Account />} />
            <Route path="/account/kalina-agents" element={<KalinaAgents />} />
            <Route path="/account/agent-edit/:agentId" element={<AgentEdit />} />
            <Route path="/account/agent-consultant" element={<AgentConsultant />} />
            
            <Route path="/account/conversation-analytics" element={<ConversationAnalytics />} />
            <Route path="/account/conversation-analytics/:conversationId" element={<ConversationDetail />} />
            <Route path="/account/transcript" element={<Transcript />} />
            <Route path="/account/outbound" element={<Outbound />} />
            <Route path="/account/calls" element={<Calls />} />
            <Route path="/account/calendar" element={<Calendar />} />
            <Route path="/account/construction" element={<Construction />} />
            <Route path="/account/scraping" element={<Scraping />} />
            <Route path="/account/gmail" element={<Gmail />} />
            <Route path="/account/documentation" element={<Documentation />} />
            <Route path="/account/phone-numbers" element={<PhoneNumbers />} />
            <Route path="/account/test-call" element={<TestCall />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

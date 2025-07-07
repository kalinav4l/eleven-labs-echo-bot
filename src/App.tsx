
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { SettingsPanel } from "./components/SettingsPanel";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Info from "./pages/Info";
import AccountSettings from "./pages/AccountSettings";
import KalinaAgents from "./pages/KalinaAgents";
import AgentEdit from "./pages/AgentEdit";
import Voices from "./pages/Voices";
import Transcript from "./pages/Transcript";
import Outbound from "./pages/Outbound";
import Calendar from "./pages/Calendar";
import ConversationAnalytics from "./pages/ConversationAnalytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AgentConsultant from "./pages/AgentConsultant";
import Landing from "./pages/Landing";
import Scraping from "./pages/Scraping";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/info" element={<Info />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/kalina-agents" element={<KalinaAgents />} />
            <Route path="/account/agent-edit/:agentId" element={<AgentEdit />} />
            <Route path="/account/agent-consultant" element={<AgentConsultant />} />
            <Route path="/account/voices" element={<Voices />} />
            <Route path="/account/conversation-analytics" element={<ConversationAnalytics />} />
            <Route path="/account/transcript" element={<Transcript />} />
            <Route path="/account/outbound" element={<Outbound />} />
            <Route path="/account/calendar" element={<Calendar />} />
            <Route path="/account/scraping" element={<Scraping />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SettingsPanel />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

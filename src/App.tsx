
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import AccountSettings from '@/pages/AccountSettings';
import AccountAgents from '@/pages/AccountAgents';
import AccountChatHistory from '@/pages/AccountChatHistory';
import KalinaAgents from '@/pages/KalinaAgents';
import AgentEdit from '@/pages/AgentEdit';
import AgentConsultant from '@/pages/AgentConsultant';
import Transcript from '@/pages/Transcript';
import ConversationAnalytics from '@/pages/ConversationAnalytics';
import Outbound from '@/pages/Outbound';
import CallScheduler from '@/pages/CallScheduler';
import Pricing from '@/pages/Pricing';
import Voices from '@/pages/Voices';
import Info from '@/pages/Info';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/settings" element={<AccountSettings />} />
              <Route path="/account/kalina-agents" element={<KalinaAgents />} />
              <Route path="/account/agents" element={<AccountAgents />} />
              <Route path="/account/chat-history" element={<AccountChatHistory />} />
              <Route path="/account/agent/:agentId" element={<AgentEdit />} />
              <Route path="/account/agent-consultant" element={<AgentConsultant />} />
              <Route path="/account/transcript" element={<Transcript />} />
              <Route path="/account/conversation-analytics" element={<ConversationAnalytics />} />
              <Route path="/account/outbound" element={<Outbound />} />
              <Route path="/account/call-scheduler" element={<CallScheduler />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/voices" element={<Voices />} />
              <Route path="/info" element={<Info />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

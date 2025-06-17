
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import AccountAgents from "./pages/AccountAgents";
import AccountChatHistory from "./pages/AccountChatHistory";
import AgentEdit from "./pages/AgentEdit";
import Voices from "./pages/Voices";
import Info from "./pages/Info";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import AgentConsultant from "./pages/AgentConsultant";
import KalinaAgents from "./pages/KalinaAgents";
import Transcript from "./pages/Transcript";
import Outbound from "./pages/Outbound";
import CallDetails from "./pages/CallDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="/account/agents" element={<AccountAgents />} />
            <Route path="/account/chat-history" element={<AccountChatHistory />} />
            <Route path="/account/outbound" element={<Outbound />} />
            <Route path="/call-details/:callId" element={<CallDetails />} />
            <Route path="/agent/:agentId/edit" element={<AgentEdit />} />
            <Route path="/voices" element={<Voices />} />
            <Route path="/info" element={<Info />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/agent-consultant" element={<AgentConsultant />} />
            <Route path="/kalina-agents" element={<KalinaAgents />} />
            <Route path="/transcript/:conversationId" element={<Transcript />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

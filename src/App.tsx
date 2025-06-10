
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AccountAgents from "./pages/AccountAgents";
import KalinaAgents from "./pages/KalinaAgents";
import AccountChatHistory from "./pages/AccountChatHistory";
import AccountSettings from "./pages/AccountSettings";
import Info from "./pages/Info";
import Pricing from "./pages/Pricing";
import Calls from "./pages/Calls";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/agents" element={<AccountAgents />} />
              <Route path="/account/kalina-agents" element={<KalinaAgents />} />
              <Route path="/account/chat-history" element={<AccountChatHistory />} />
              <Route path="/account/settings" element={<AccountSettings />} />
              <Route path="/info" element={<Info />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/calls" element={<Calls />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

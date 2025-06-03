
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AccountAgents from "./pages/AccountAgents";
import AccountChatHistory from "./pages/AccountChatHistory";
import AccountSettings from "./pages/AccountSettings";
import Pricing from "./pages/Pricing";
import Info from "./pages/Info";
import Calls from "./pages/Calls";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/agents" element={<AccountAgents />} />
            <Route path="/account/chat-history" element={<AccountChatHistory />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/info" element={<Info />} />
            <Route path="/calls" element={<Calls />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

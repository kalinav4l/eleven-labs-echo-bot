
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AgentsList from "./pages/AgentsList";
import CallHistory from "./pages/CallHistory";
import KnowledgeBase from "./pages/KnowledgeBase";
import PhoneNumbers from "./pages/PhoneNumbers";
import AccountSettings from "./pages/AccountSettings";
import Info from "./pages/Info";
import Pricing from "./pages/Pricing";
import Voices from "./pages/Voices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agents" element={<AgentsList />} />
              <Route path="/call-history" element={<CallHistory />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/phone-numbers" element={<PhoneNumbers />} />
              <Route path="/account/settings" element={<AccountSettings />} />
              <Route path="/account/voices" element={<Voices />} />
              <Route path="/info" element={<Info />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Info from "./pages/Info";
import AccountSettings from "./pages/AccountSettings";
import KalinaAgents from "./pages/KalinaAgents";
import Calls from "./pages/Calls";
import Voices from "./pages/Voices";
import { QueryClient } from "react-query";
import { Toaster } from "@/components/ui/toaster";
import AgentConsultant from "./pages/AgentConsultant";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClient>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/info" element={<Info />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/kalina-agents" element={<KalinaAgents />} />
            <Route path="/account/agent-consultant" element={<AgentConsultant />} />
            <Route path="/account/calls" element={<Calls />} />
            <Route path="/account/voices" element={<Voices />} />
            <Route path="/account/settings" element={<AccountSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClient>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

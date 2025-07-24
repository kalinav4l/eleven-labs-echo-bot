import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Plus, Settings, Phone, Trash2, Power, PowerOff, Search, Copy, Files, Mic } from 'lucide-react';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useAgentOperations } from '@/hooks/useAgentOperations';
import { useClipboard } from '@/hooks/useClipboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AgentTestCallModal } from '@/components/AgentTestCallModal';
import VoiceTestButton from '@/components/VoiceTestButton';
const KalinaAgents = () => {
  const {
    data: userAgents,
    isLoading
  } = useUserAgents();
  const {
    deactivateAgent,
    activateAgent,
    deleteAgent,
    duplicateAgent,
    isDeleting,
    isDuplicating
  } = useAgentOperations();
  const {
    copyToClipboard
  } = useClipboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentForDeletion, setSelectedAgentForDeletion] = useState<any>(null);
  const [testCallAgent, setTestCallAgent] = useState<any>(null);
  const [voiceTestAgent, setVoiceTestAgent] = useState<any>(null);
  const navigate = useNavigate();

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!userAgents) return [];
    if (!searchQuery.trim()) return userAgents;
    return userAgents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) || agent.agent_id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [userAgents, searchQuery]);
  const handleToggleAgentStatus = (agent: any) => {
    if (agent.is_active) {
      deactivateAgent({
        id: agent.id,
        isActive: false
      });
    } else {
      activateAgent({
        id: agent.id,
        isActive: true
      });
    }
  };
  const handleDeleteAgent = (agent: any) => {
    deleteAgent({
      id: agent.id,
      agent_id: agent.agent_id
    });
    setSelectedAgentForDeletion(null);
  };
  const handleDuplicateAgent = (agent: any) => {
    duplicateAgent(agent);
  };
  const handleEditAgent = (agentId: string) => {
    navigate(`/account/agent-edit/${agentId}`);
  };
  const handleCopyAgentId = async (agentId: string) => {
    await copyToClipboard(agentId);
  };
  const handleTestCall = (agent: any) => {
    setTestCallAgent(agent);
  };
  if (isLoading) {
    return <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Se încarcă agenții...</div>
        </div>
      </div>
    </DashboardLayout>;
  }
  return <DashboardLayout>
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Agenții Kalina</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Gestionează agenții tăi AI pentru diverse scenarii</p>
        </div>
        <Link to="/account/agent-consultant">
          <Button className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agent Nou
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder="Caută agenți..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400" />
      </div>

      {/* Agents List - Vertical Layout like ElevenLabs */}
      <div className="space-y-3">
        {filteredAgents && filteredAgents.length > 0 ? filteredAgents.map(agent => <div key={agent.id} className="bg-white rounded-lg p-4 transition-all duration-200 hover:bg-gray-50/50 cursor-pointer" onClick={() => handleEditAgent(agent.agent_id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {agent.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {agent.is_active ? 'Activ' : 'Inactiv'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">
                        {agent.description || 'Agent personalizat pentru asistența clienților'}
                      </p>
                    </div>
                    
                    
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" disabled={!agent.is_active} onClick={e => {
                e.stopPropagation();
                setVoiceTestAgent(agent);
              }} className="text-white text-xs h-8 px-3 bg-gray-950 hover:bg-gray-800">
                    <Mic className="w-3 h-3 mr-1" />
                    Test Audio
                  </Button>
                  
                  

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" onClick={e => e.stopPropagation()}>
                        <Settings className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    handleToggleAgentStatus(agent);
                  }} className="cursor-pointer">
                        {agent.is_active ? <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Dezactivează
                          </> : <>
                            <Power className="w-4 h-4 mr-2" />
                            Activează
                          </>}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    handleDuplicateAgent(agent);
                  }} className="cursor-pointer" disabled={isDuplicating}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplică Agent
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    setSelectedAgentForDeletion(agent);
                  }} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Șterge Agent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>) : searchQuery.trim() ? <div className="bg-white rounded-lg p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Nu s-au găsit agenți</h3>
              <p className="text-xs text-gray-500 mb-4">
                Nu există agenți care să corespundă căutării "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')} className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700">
                Șterge căutarea
              </Button>
            </div> : <div className="bg-white rounded-lg p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Nu ai încă agenți creați</h3>
              <p className="text-xs text-gray-500 mb-4">Creează primul tău agent AI pentru echipa ta</p>
              <Link to="/account/agent-consultant">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Creează Agent Nou
                </Button>
              </Link>
            </div>}
      </div>

      {/* Agent Test Call Modal */}
      <AgentTestCallModal isOpen={!!testCallAgent} onClose={() => setTestCallAgent(null)} agent={testCallAgent || {
        id: '',
        agent_id: '',
        name: ''
      }} />

      {/* Voice Test Modal - Mobile Responsive */}
      {voiceTestAgent && <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="relative w-full max-w-lg mx-auto">
            {/* Close button */}
            <Button variant="ghost" size="sm" onClick={() => setVoiceTestAgent(null)} className="absolute -top-12 right-0 h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
              ×
            </Button>
            
            {/* Main modal content */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-w-sm sm:max-w-lg w-full">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-4 sm:p-8 text-center border-b border-gray-100/50">
                <h3 className="text-lg sm:text-2xl font-light text-gray-800 mb-2">
                  Test Audio
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                  {voiceTestAgent.name}
                </p>
              </div>
              
              {/* Voice test area */}
              <div className="p-6 sm:p-12 flex flex-col items-center min-h-[200px] sm:min-h-[300px] justify-center">
                <VoiceTestButton agentId={voiceTestAgent.agent_id} agentName={voiceTestAgent.name} />
              </div>
              
              {/* Agent ID footer */}
              <div className="bg-gray-50/50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-100/50">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agent ID</span>
                  <code className="text-xs text-gray-700 bg-white/80 px-3 py-1.5 rounded-full border font-mono shadow-sm break-all">
                    {voiceTestAgent.agent_id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>}

      <AlertDialog open={!!selectedAgentForDeletion} onOpenChange={open => {
        if (!open) setSelectedAgentForDeletion(null);
      }}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Ești sigur că vrei să ștergi agentul "{selectedAgentForDeletion?.name}"?
              Această acțiune nu poate fi anulată și va șterge agentul și din ElevenLabs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedAgentForDeletion && handleDeleteAgent(selectedAgentForDeletion)} className="bg-red-600 text-white hover:bg-red-700">
              {isDeleting ? 'Se șterge...' : 'Șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </DashboardLayout>;
};
export default KalinaAgents;
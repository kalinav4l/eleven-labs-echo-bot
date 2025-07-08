
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
    return userAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.agent_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Agenții Kalina</h1>
          <p className="text-gray-600 text-sm mt-1">Gestionează agenții tăi AI pentru diverse scenarii</p>
        </div>
        <Link to="/account/agent-consultant">
          <Button className="bg-black hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Agent Nou
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
            placeholder="Caută agenți..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Agents List - Vertical Layout like ElevenLabs */}
      <div className="space-y-3">
        {filteredAgents && filteredAgents.length > 0 ? filteredAgents.map(agent =>
            <div 
              key={agent.id} 
              className="bg-white rounded-lg p-4 transition-all duration-200 hover:bg-gray-50/50 cursor-pointer"
              onClick={() => handleEditAgent(agent.agent_id)}
            >
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        agent.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.is_active ? 'Activ' : 'Inactiv'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">
                        {agent.description || 'Agent personalizat pentru asistența clienților'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Provider:</span>
                        <span className="text-xs font-medium text-gray-600">{agent.provider}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Agent ID:</span>
                        <span className="text-xs font-mono text-gray-600 max-w-[120px] truncate" title={agent.agent_id}>
                          {agent.agent_id}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyAgentId(agent.agent_id);
                            }}
                            className="h-5 w-5 p-0 hover:bg-gray-100"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3" 
                    disabled={!agent.is_active}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVoiceTestAgent(agent);
                    }}
                  >
                    <Mic className="w-3 h-3 mr-1" />
                    Test Audio
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="bg-black hover:bg-gray-800 text-white text-xs h-8 px-3" 
                    disabled={!agent.is_active}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestCall(agent);
                    }}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Test Apel
                  </Button>
                </div>
              </div>
            </div>
        ) : searchQuery.trim() ? (
            <div className="bg-white rounded-lg p-12 text-center">
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
            </div>
        ) : (
            <div className="bg-white rounded-lg p-12 text-center">
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
            </div>
        )}
      </div>

      {/* Agent Test Call Modal */}
      <AgentTestCallModal
        isOpen={!!testCallAgent}
        onClose={() => setTestCallAgent(null)}
        agent={testCallAgent || { id: '', agent_id: '', name: '' }}
      />

      {/* Voice Test Modal */}
      {voiceTestAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Test Audio
                </h3>
                <p className="text-sm text-gray-500">
                  {voiceTestAgent.name}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setVoiceTestAgent(null)}
                className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                ×
              </Button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              <VoiceTestButton 
                agentId={voiceTestAgent.agent_id}
                agentName={voiceTestAgent.name}
              />
            </div>
            
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Agent ID:</span>
                  <code className="text-xs text-gray-600 bg-white px-2 py-1 rounded border font-mono">
                    {voiceTestAgent.agent_id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={!!selectedAgentForDeletion} onOpenChange={(open) => {
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
            <AlertDialogAction
                onClick={() => selectedAgentForDeletion && handleDeleteAgent(selectedAgentForDeletion)}
                className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? 'Se șterge...' : 'Șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </DashboardLayout>;
};

export default KalinaAgents;

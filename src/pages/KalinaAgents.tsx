
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Settings, Phone, Trash2, Power, PowerOff, Search, Copy, Files, Mic, Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useAgentOperations } from '@/hooks/useAgentOperations';
import { useAgentStats } from '@/hooks/useAgentStats';
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
    data: agentStats,
    isLoading: isLoadingStats
  } = useAgentStats();
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

  // Helper functions for formatting data
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCost = (cost: number) => {
    if (!cost || cost === 0) return '0 credite';
    return `${Math.round(cost)} credite`;
  };

  const getStatusBadge = (status: string, count: number) => {
    if (count === 0) return null;
    
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-500 text-white text-xs px-2 py-1">
            ✓ {count} Success
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500 text-white text-xs px-2 py-1">
            ✕ {count} Error
          </Badge>
        );
      case 'busy':
        return (
          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
            ⏳ {count} Busy
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
            ⚡ {count} Ongoing
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading || isLoadingStats) {
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

      {/* Agents List - Analytics Style Layout */}
      <div className="space-y-4">
        {filteredAgents && filteredAgents.length > 0 ? filteredAgents.map(agent => {
          const stats = agentStats?.[agent.agent_id];
          return (
            <div 
              key={agent.id} 
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              onClick={() => handleEditAgent(agent.agent_id)}
            >
              {/* Header Row */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.name}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          agent.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.is_active ? 'Activ' : 'Inactiv'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {agent.description || 'Agent personalizat pentru asistența clienților'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Provider:</span>
                          <span className="text-xs font-medium text-gray-600">{agent.provider}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Agent ID:</span>
                          <span className="text-xs font-mono text-gray-600 max-w-[150px] truncate" title={agent.agent_id}>
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAgentStatus(agent);
                          }}
                          className="cursor-pointer"
                        >
                          {agent.is_active ? (
                            <>
                              <PowerOff className="w-4 h-4 mr-2" />
                              Dezactivează
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4 mr-2" />
                              Activează
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateAgent(agent);
                          }}
                          className="cursor-pointer"
                          disabled={isDuplicating}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplică Agent
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgentForDeletion(agent);
                          }}
                          className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Șterge Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {/* Analytics Row */}
              <div className="p-4 bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Total Calls */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">Total Calls</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {stats?.totalCalls || 0}
                    </div>
                  </div>
                  
                  {/* Cost */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">Cost Total</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCost(stats?.totalCost || 0)}
                    </div>
                  </div>
                  
                  {/* Success Rate */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">Success Rate</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {stats?.successRate || 0}%
                    </div>
                  </div>
                  
                  {/* Average Duration */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">Durată Medie</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatDuration(stats?.averageDuration || 0)}
                    </div>
                  </div>
                  
                  {/* Last Call */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">Ultimul Apel</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {stats?.lastCallDate ? new Date(stats.lastCallDate).toLocaleDateString('ro-RO') : 'N/A'}
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-xs text-gray-500 font-medium">Status</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {getStatusBadge('success', stats?.successfulCalls || 0)}
                      {getStatusBadge('error', stats?.failedCalls || 0)}
                      {getStatusBadge('busy', stats?.busyCalls || 0)}
                      {getStatusBadge('ongoing', stats?.ongoingCalls || 0)}
                      {!stats?.totalCalls && (
                        <Badge className="bg-gray-200 text-gray-600 text-xs px-2 py-1">
                          Fără date
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : searchQuery.trim() ? (
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

      {/* Voice Test Modal - Minimalist Design */}
      {voiceTestAgent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-lg mx-auto">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setVoiceTestAgent(null)}
              className="absolute -top-12 right-0 h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              ×
            </Button>
            
            {/* Main modal content */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-8 text-center border-b border-gray-100/50">
                <h3 className="text-2xl font-light text-gray-800 mb-2">
                  Test Audio
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {voiceTestAgent.name}
                </p>
              </div>
              
              {/* Voice test area */}
              <div className="p-12 flex flex-col items-center min-h-[300px] justify-center">
                <VoiceTestButton 
                  agentId={voiceTestAgent.agent_id}
                  agentName={voiceTestAgent.name}
                />
              </div>
              
              {/* Agent ID footer */}
              <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100/50">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agent ID</span>
                  <code className="text-xs text-gray-700 bg-white/80 px-3 py-1.5 rounded-full border font-mono shadow-sm">
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

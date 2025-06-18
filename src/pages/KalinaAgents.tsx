import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Plus, Settings, Phone, Trash2, Power, PowerOff, Search, Copy } from 'lucide-react';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useAgentOperations } from '@/hooks/useAgentOperations';
import { useClipboard } from '@/hooks/useClipboard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import CallInitiationModal from "@/components/CallInitiationModal.tsx";

const KalinaAgents = () => {
  const {
    data: userAgents,
    isLoading
  } = useUserAgents();
  const {
    deactivateAgent,
    activateAgent,
    deleteAgent,
    isDeleting
  } = useAgentOperations();
  const {
    copyToClipboard
  } = useClipboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentForDeletion, setSelectedAgentForDeletion] = useState<any>(null);
  const [isCallInitiationModalOpen, setIsCallInitiationModalOpen] = useState(false);
  const [selectedAgentForCall, setSelectedAgentForCall] = useState<any>(null);
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

  const handleEditAgent = (agentId: string) => {
    navigate(`/account/agent-edit/${agentId}`);
  };

  const handleInitiateCall = (agent: any) => {
    setSelectedAgentForCall(agent);
    setIsCallInitiationModalOpen(true);
  };

  const handleCopyAgentId = async (agentId: string) => {
    await copyToClipboard(agentId);
  };

  if (isLoading) {
    return <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Se încarcă agenții...</div>
        </div>
      </div>
    </DashboardLayout>;
  }

  return <DashboardLayout>
    <div className="p-6 space-y-6 my-[60px]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenții Kalina</h1>
          <p className="text-muted-foreground">Gestionează agenții tăi AI pentru diverse scenarii</p>
        </div>
        <Link to="/account/agent-consultant">
          <Button className="glass-button">
            <Plus className="w-4 h-4 mr-2" />
            Agent Nou
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
            placeholder="Caută agenți..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 glass-input"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents && filteredAgents.length > 0 ? filteredAgents.map(agent =>
            <Card key={agent.id} className="liquid-glass animate-fade-in hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">{agent.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {agent.is_active ? 'Activ' : 'Inactiv'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="glass-button border-border">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onClick={() => handleToggleAgentStatus(agent)}>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setSelectedAgentForDeletion(agent)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Șterge
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {agent.description || 'Agent personalizat pentru asistența clienților'}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Provider:</span>
                      <p className="font-semibold text-foreground">{agent.provider}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agent ID:</span>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-accent text-xs truncate max-w-[120px]" title={agent.agent_id}>
                          {agent.agent_id}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyAgentId(agent.agent_id)}
                            className="h-6 w-6 p-0 hover:bg-accent/20"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 glass-button" disabled={!agent.is_active} onClick={() => handleInitiateCall(agent)}>
                      <Phone className="w-4 h-4 mr-2" />
                      Test Apel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="glass-button border-border"
                        onClick={() => handleEditAgent(agent.agent_id)}
                    >
                      Editează
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        ) : searchQuery.trim() ? (
            <Card className="liquid-glass animate-fade-in hover:shadow-lg transition-all border-dashed border-2 border-border col-span-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Nu s-au găsit agenți</h3>
                  <p className="text-sm text-muted-foreground">
                    Nu există agenți care să corespundă căutării "{searchQuery}"
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSearchQuery('')} className="glass-button border-border">
                  Șterge căutarea
                </Button>
              </CardContent>
            </Card>
        ) : (
            <Card className="liquid-glass animate-fade-in hover:shadow-lg transition-all border-dashed border-2 border-border col-span-full">
              <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Nu ai încă agenți creați</h3>
                  <p className="text-sm text-muted-foreground">Creează primul tău agent AI pentru echipa ta</p>
                </div>
                <Link to="/account/agent-consultant">
                  <Button className="glass-button">
                    Creează Agent Nou
                  </Button>
                </Link>
              </CardContent>
            </Card>
        )}
      </div>

      <AlertDialog open={!!selectedAgentForDeletion} onOpenChange={(open) => {
        if (!open) setSelectedAgentForDeletion(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi agentul "{selectedAgentForDeletion?.name}"?
              Această acțiune nu poate fi anulată și va șterge agentul și din ElevenLabs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
                onClick={() => selectedAgentForDeletion && handleDeleteAgent(selectedAgentForDeletion)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Se șterge...' : 'Șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedAgentForCall && (
          <CallInitiationModal
              isOpen={isCallInitiationModalOpen}
              onClose={() => setIsCallInitiationModalOpen(false)}
              agentId={selectedAgentForCall.agent_id}
          />
      )}
    </div>
  </DashboardLayout>;
};

export default KalinaAgents;
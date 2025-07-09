import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Bot, 
  Settings, 
  Trash2, 
  Plus, 
  Save
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

interface AgentConfigurationProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent | null) => void;
  onAgentCreate: (name: string, description: string, systemPrompt: string) => Promise<void>;
  onAgentUpdate: (id: string, name: string, description: string, systemPrompt: string) => Promise<void>;
  onAgentDelete: (id: string) => Promise<void>;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agents,
  selectedAgent,
  onAgentSelect,
  onAgentCreate,
  onAgentUpdate,
  onAgentDelete,
}) => {
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentSystemPrompt, setAgentSystemPrompt] = useState('');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const handleCreateAgent = async () => {
    if (!agentName.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un nume pentru agent.",
        variant: "destructive",
      });
      return;
    }

    await onAgentCreate(agentName, agentDescription, agentSystemPrompt || 'Ești un asistent AI util și prietenos.');
    
    // Reset form
    setAgentName('');
    setAgentDescription('');
    setAgentSystemPrompt('');
    setShowAgentConfig(false);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setAgentName(agent.name);
    setAgentDescription(agent.description);
    setAgentSystemPrompt(agent.systemPrompt);
    setShowAgentConfig(true);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !agentName.trim()) return;

    await onAgentUpdate(editingAgent.id, agentName, agentDescription, agentSystemPrompt);

    // Reset form
    setEditingAgent(null);
    setAgentName('');
    setAgentDescription('');
    setAgentSystemPrompt('');
    setShowAgentConfig(false);
  };

  const resetForm = () => {
    setShowAgentConfig(false);
    setEditingAgent(null);
    setAgentName('');
    setAgentDescription('');
    setAgentSystemPrompt('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select 
          value={selectedAgent?.id || ''} 
          onValueChange={(value) => {
            const agent = agents.find(a => a.id === value);
            onAgentSelect(agent || null);
          }}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Selectează agent" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {agents.length === 0 ? (
              <SelectItem value="no-agents" disabled>
                Nu există agenți - creează unul
              </SelectItem>
            ) : (
              agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        {selectedAgent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Agent selectat:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditAgent(selectedAgent)}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAgentDelete(selectedAgent.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
          </div>
        )}
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAgentConfig(true)}
          className="w-full"
        >
          <Plus className="h-3 w-3 mr-1" />
          {editingAgent ? 'Editează Agent' : 'Creează Agent'}
        </Button>

        {/* Agent Configuration */}
        {showAgentConfig && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {editingAgent ? 'Editează Agent' : 'Creează Agent Nou'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="agentName">Nume Agent</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Numele agentului"
                />
              </div>
              
              <div>
                <Label htmlFor="agentDescription">Descriere</Label>
                <Input
                  id="agentDescription"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Descrierea agentului"
                />
              </div>
              
              <div>
                <Label htmlFor="agentPrompt">System Prompt</Label>
                <Textarea
                  id="agentPrompt"
                  value={agentSystemPrompt}
                  onChange={(e) => setAgentSystemPrompt(e.target.value)}
                  placeholder="Instrucțiuni pentru agent..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                  className="flex-1"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {editingAgent ? 'Actualizează' : 'Creează'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetForm}
                >
                  Anulează
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
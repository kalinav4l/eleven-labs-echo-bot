import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Settings, Play, Copy, ExternalLink, Plus, Files } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AgentTestModal from '@/components/AgentTestModal';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useAgentOperations } from '@/hooks/useAgentOperations';
import { toast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const AccountAgents = () => {
  const { user } = useAuth();
  const { data: userAgents, isLoading } = useUserAgents();
  const { duplicateAgent, isDuplicating } = useAgentOperations();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleTestAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsTestModalOpen(true);
  };

  const handleDuplicateAgent = (agent: any) => {
    duplicateAgent(agent);
  };

  const copyWidgetCode = (agentId: string, agentName: string) => {
    const widgetCode = `<elevenlabs-convai agent-id="${agentId}"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/legacy.js" async type="text/javascript"></script>`;
    
    navigator.clipboard.writeText(widgetCode);
    toast({
      title: "Cod copiat!",
      description: `Codul widget pentru ${agentName} a fost copiat în clipboard.`,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Se încarcă agenții...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Agenți</h1>
            <p className="text-gray-600">Gestionează și testează agenții tăi AI</p>
          </div>
          <Link to="/account/agent-consultant">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Agent Nou
            </Button>
          </Link>
        </div>

        {userAgents && userAgents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {userAgents.map((agent) => (
                <Card key={agent.id} className="bg-white border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bot className="w-8 h-8 text-gray-700 mr-3" />
                        <div>
                          <CardTitle className="text-black text-lg">{agent.name}</CardTitle>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 rounded-full mr-2 bg-black"></div>
                            <span className="text-sm text-black">Activ</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDuplicateAgent(agent)} disabled={isDuplicating}>
                            <Files className="w-4 h-4 mr-2" />
                            {isDuplicating ? 'Se duplică...' : 'Duplică Agent'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {agent.description || 'Agent personalizat pentru asistența clienților'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Provider:</span>
                        <span className="text-black">{agent.provider}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Agent ID:</span>
                        <span className="text-black text-xs">{agent.agent_id}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Widget pentru Site-ul Tău</h4>
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                        <code className="text-gray-800">
                          {`<elevenlabs-convai agent-id="${agent.agent_id}"></elevenlabs-convai>`}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => copyWidgetCode(agent.agent_id, agent.name)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiază Codul Widget
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={() => handleTestAgent(agent)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Testează
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-black hover:bg-gray-800 text-white"
                      >
                        Configurează
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-900 font-semibold mb-2 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Integrare Widget pe Site-ul Tău
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                Copiază codul widget de mai sus și adaugă-l pe site-ul tău pentru a permite vizitatorilor să vorbească cu asistenții AI. 
                Creditele se vor deduce automat din contul tău.
              </p>
              <div className="text-blue-700 text-sm">
                <strong>Important:</strong> 1 minut de convorbire = 1.000 credite deduse din contul tău.
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nu ai încă agenți creați</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Creează primul tău agent AI pentru a începe să oferi asistență automatizată clienților tăi.
            </p>
            <Link to="/account/agent-consultant">
              <Button className="bg-black hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Creează primul agent
              </Button>
            </Link>
          </div>
        )}
      </div>

      <AgentTestModal
        agent={selectedAgent}
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </DashboardLayout>
  );
};

export default AccountAgents;


import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Settings, Play, Copy, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AgentTestModal from '@/components/AgentTestModal';
import { useUserStats } from '@/hooks/useUserStats';
import { toast } from '@/components/ui/use-toast';

const AccountAgents = () => {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const agents = [
    {
      id: 'agent_01jwryy4w5e8fsta9v9j304zzq',
      name: 'Borea',
      description: 'Agent conversational pentru asistență generală',
      status: 'active',
      language: 'Română',
      voice: 'Borea',
      conversations: Math.floor((stats?.total_conversations || 0) * 0.4),
      widgetCode: `<elevenlabs-convai agent-id="agent_01jwryy4w5e8fsta9v9j304zzq"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/legacy.js" async type="text/javascript"></script>`
    },
    {
      id: 'VfDh7pN17jYNykYNZrJb',
      name: 'Jesica',
      description: 'Assistant personal pentru întrebări diverse',
      status: 'active',
      language: 'Română',
      voice: 'Jesica',
      conversations: Math.floor((stats?.total_conversations || 0) * 0.35),
      widgetCode: `<elevenlabs-convai agent-id="VfDh7pN17jYNykYNZrJb"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/legacy.js" async type="text/javascript"></script>`
    },
    {
      id: 'agent_01jws2mjsjeh398vfnfd6k5hq0',
      name: 'Ana',
      description: 'Agent pentru support și rezolvarea problemelor',
      status: 'active',
      language: 'Română',
      voice: 'Ana',
      conversations: Math.floor((stats?.total_conversations || 0) * 0.25),
      widgetCode: `<elevenlabs-convai agent-id="agent_01jws2mjsjeh398vfnfd6k5hq0"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/legacy.js" async type="text/javascript"></script>`
    }
  ];

  const handleTestAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsTestModalOpen(true);
  };

  const copyWidgetCode = (widgetCode: string, agentName: string) => {
    navigator.clipboard.writeText(widgetCode);
    toast({
      title: "Cod copiat!",
      description: `Codul widget pentru ${agentName} a fost copiat în clipboard.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Agenți</h1>
            <p className="text-gray-600">Gestionează și testează agenții tăi AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-white border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="w-8 h-8 text-gray-700 mr-3" />
                    <div>
                      <CardTitle className="text-black text-lg">{agent.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          agent.status === 'active' ? 'bg-black' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-sm ${
                          agent.status === 'active' ? 'text-black' : 'text-gray-600'
                        }`}>
                          {agent.status === 'active' ? 'Activ' : 'Inactiv'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Limbă:</span>
                    <span className="text-black">{agent.language}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Voce:</span>
                    <span className="text-black">{agent.voice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversații:</span>
                    <span className="text-black">{agent.conversations}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Widget pentru Site-ul Tău</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <code className="text-gray-800">
                      {agent.widgetCode}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => copyWidgetCode(agent.widgetCode, agent.name)}
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

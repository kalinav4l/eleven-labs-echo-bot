
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Settings, Play, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AgentTestModal from '@/components/AgentTestModal';

const AccountAgents = () => {
  const { user } = useAuth();
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
      conversations: 124
    },
    {
      id: 'VfDh7pN17jYNykYNZrJb',
      name: 'Jesica',
      description: 'Assistant personal pentru întrebări diverse',
      status: 'active',
      language: 'Română',
      voice: 'Jesica',
      conversations: 89
    },
    {
      id: 'agent_01jws2mjsjeh398vfnfd6k5hq0',
      name: 'Ana',
      description: 'Agent pentru support și rezolvarea problemelor',
      status: 'active',
      language: 'Română',
      voice: 'Ana',
      conversations: 45
    }
  ];

  const handleTestAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsTestModalOpen(true);
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

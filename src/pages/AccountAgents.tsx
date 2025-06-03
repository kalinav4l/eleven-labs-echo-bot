
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Settings, Play, Pause } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const AccountAgents = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const agents = [
    {
      id: 1,
      name: 'Assistant Personal',
      description: 'Agent pentru asistență generală și răspunsuri la întrebări',
      status: 'active',
      language: 'Română',
      voice: 'Aria',
      conversations: 124
    },
    {
      id: 2,
      name: 'Support Client',
      description: 'Agent specializat în support și rezolvarea problemelor',
      status: 'active',
      language: 'Română/Engleză',
      voice: 'Sarah',
      conversations: 89
    },
    {
      id: 3,
      name: 'Vânzări',
      description: 'Agent pentru vânzări și promovarea produselor',
      status: 'inactive',
      language: 'Română',
      voice: 'George',
      conversations: 45
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Agenți</h1>
            <p className="text-gray-400">Gestionează agenții tăi AI conversaționali</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Agent Nou
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        <span className={`text-sm ${
                          agent.status === 'active' ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {agent.status === 'active' ? 'Activ' : 'Inactiv'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">{agent.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Limbă:</span>
                    <span className="text-white">{agent.language}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Voce:</span>
                    <span className="text-white">{agent.voice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Conversații:</span>
                    <span className="text-white">{agent.conversations}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    {agent.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Oprește
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Pornește
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Configurează
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountAgents;

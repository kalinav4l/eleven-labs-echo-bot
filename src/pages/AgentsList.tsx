
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Settings } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Agent {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

const AgentsList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const agents: Agent[] = [
    { id: '1', name: 'JLC', createdBy: 'Mega Promoting', createdAt: '10 iun. 2025, 16:15' },
    { id: '2', name: 'Casa della pizza', createdBy: 'Mega Promoting', createdAt: '7 iun. 2025, 13:09' },
    { id: '3', name: 'Cipauto', createdBy: 'Mega Promoting', createdAt: '7 iun. 2025, 12:19' },
    { id: '4', name: 'Moldcell', createdBy: 'Mega Promoting', createdAt: '4 iun. 2025, 11:05' },
    { id: '5', name: 'speek 2', createdBy: 'Mega Promoting', createdAt: '3 iun. 2025, 19:47' },
    { id: '6', name: 'speek', createdBy: 'Mega Promoting', createdAt: '3 iun. 2025, 18:56' },
    { id: '7', name: 'testjip', createdBy: 'Mega Promoting', createdAt: '3 iun. 2025, 17:35' },
    { id: '8', name: 'kalina 02', createdBy: 'Mega Promoting', createdAt: '2 iun. 2025, 22:42' },
    { id: '9', name: 'kalina 0.1', createdBy: 'Mega Promoting', createdAt: '2 iun. 2025, 21:37' },
    { id: '10', name: 'credit', createdBy: 'Mega Promoting', createdAt: '27 mai 2025, 14:41' },
    { id: '11', name: 'Valeria', createdBy: 'Mega Promoting', createdAt: '19 mai 2025, 17:32' },
    { id: '12', name: 'instrumentool', createdBy: 'Mega Promoting', createdAt: '17 mai 2025, 12:33' }
  ];

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#111217] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2">Agents</h1>
              <p className="text-gray-400 text-sm">Create and manage your AI agents</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
                Playground
              </Button>
              <Button className="bg-white text-black hover:bg-gray-100 font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New agent
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1F2128] border-[#2A2D35] text-white placeholder-gray-400 focus:border-white"
              />
            </div>
            <Button variant="outline" className="bg-transparent border-[#2A2D35] text-white hover:bg-[#1F2128] hover:border-white">
              Creator
            </Button>
          </div>

          {/* Table */}
          <Card className="bg-[#181A1F] border-[#2A2D35]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2D35]">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Name</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Created by</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Created at</th>
                      <th className="w-12 py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="border-b border-[#2A2D35] hover:bg-[#1F2128] transition-colors">
                        <td className="py-4 px-6 text-white font-medium">{agent.name}</td>
                        <td className="py-4 px-6 text-white">{agent.createdBy}</td>
                        <td className="py-4 px-6 text-gray-400">{agent.createdAt}</td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#2A2D35]">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentsList;

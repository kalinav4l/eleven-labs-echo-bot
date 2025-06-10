
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
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Agents</h1>
              <p className="text-gray-600 text-sm">Create and manage your AI agents</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white border-2 border-[#FFBB00] text-black hover:bg-[#FFD666] hover:border-[#E6A600]">
                Playground
              </Button>
              <Button className="bg-[#FFBB00] text-black hover:bg-[#E6A600] font-bold border-2 border-black">
                <Plus className="w-4 h-4 mr-2" />
                New agent
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-2 border-[#FFBB00] text-black placeholder-gray-500 focus:border-[#E6A600]"
              />
            </div>
            <Button variant="outline" className="bg-white border-2 border-[#FFBB00] text-black hover:bg-[#FFD666] hover:border-[#E6A600]">
              Creator
            </Button>
          </div>

          {/* Table */}
          <Card className="bg-white border-2 border-[#FFBB00] shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#FFBB00] bg-gradient-primary">
                      <th className="text-left py-4 px-6 text-black font-bold text-sm">Name</th>
                      <th className="text-left py-4 px-6 text-black font-bold text-sm">Created by</th>
                      <th className="text-left py-4 px-6 text-black font-bold text-sm">Created at</th>
                      <th className="w-12 py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="border-b border-gray-200 hover:bg-[#FFD666] transition-colors">
                        <td className="py-4 px-6 text-black font-bold">{agent.name}</td>
                        <td className="py-4 px-6 text-black">{agent.createdBy}</td>
                        <td className="py-4 px-6 text-gray-600">{agent.createdAt}</td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black hover:bg-[#FFBB00]">
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

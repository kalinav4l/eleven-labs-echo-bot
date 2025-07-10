
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, Search, Plus, ArrowDown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { useUserAgents } from '@/hooks/useUserAgents';

const AccountAgents = () => {
  const { user } = useAuth();
  const { data: userAgents, isLoading } = useUserAgents();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const mockAgents = [
    { id: 1, name: "Moldova Security", creator: "Miss Lili", createdAt: "2 Jul. 2025, 13:36" },
    { id: 2, name: "Med", creator: "Miss Lili", createdAt: "2 Jul. 2025, 13:01" },
    { id: 3, name: "domic.md Kalina", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:44" },
    { id: 4, name: "Credit 365 Kalina", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:37" },
    { id: 5, name: "Lactis Kalina", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:33" },
    { id: 6, name: "La Ion Kalina", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:27" },
    { id: 7, name: "JLC Kalina", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:20" },
    { id: 8, name: "MOLTELECOM", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:09" },
    { id: 9, name: "EasyReserv Kalina", creator: "Miss Lili", createdAt: "2 Jul. 2025, 11:03" },
    { id: 10, name: "Moldova GAZ Kalina 2", creator: "Miss Lili", createdAt: "2 Jul. 2025, 10:52" },
    { id: 11, name: "Moldova GAZ Kalina 1", creator: "Miss Lili", createdAt: "2 Jul. 2025, 10:48" },
    { id: 12, name: "xpress-auto kalina", creator: "Miss Lili", createdAt: "1 Jul. 2025, 16:45" },
    { id: 13, name: "Connect Imobil", creator: "Miss Lili", createdAt: "30 Jun. 2025, 15:54" },
    { id: 14, name: "Cargo2b", creator: "Miss Lili", createdAt: "30 Jun. 2025, 15:26" },
    { id: 15, name: "wergegt", creator: "Miss Lili", createdAt: "30 Jun. 2025, 14:58" }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading agents...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Agents</h1>
              <p className="text-gray-600 text-sm">Create and manage your AI agents</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                Playground
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New agent
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search agents..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200" 
              />
            </div>
            <Button variant="outline" size="sm" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
              <Plus className="w-4 h-4 mr-2" />
              Creator
            </Button>
          </div>

          {/* Table Header */}
          <div className="border-b border-gray-200 pb-2 mb-1">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Created by</div>
              <div className="col-span-4 flex items-center cursor-pointer hover:text-gray-700">
                Created at
                <ArrowDown className="w-3 h-3 ml-1" />
              </div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* Agents List */}
          <div className="space-y-0">
            {mockAgents.map((agent, index) => (
              <div 
                key={agent.id} 
                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{agent.name}</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-gray-600 text-sm">{agent.creator}</span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-gray-600 text-sm">{agent.createdAt}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-1">
                    •••
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {mockAgents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents created yet</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Create your first AI agent to start providing automated assistance to your customers.
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create first agent
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountAgents;

import React, { useState } from 'react';
import { useUserAgents } from '@/hooks/useUserAgents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Play, MoreHorizontal, Bot, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AgentSelectorElegantProps {
  selectedAgentId: string;
  onAgentSelect: (agentId: string) => void;
}

const agentColors = [
  'bg-emerald-500',
  'bg-blue-500', 
  'bg-purple-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-violet-500',
  'bg-rose-500'
];

const getRandomStats = () => ({
  usage: Math.floor(Math.random() * 200) + 50,
  period: '2y',
  rating: (Math.random() * 2 + 3).toFixed(1)
});

export const AgentSelectorElegant: React.FC<AgentSelectorElegantProps> = ({
  selectedAgentId,
  onAgentSelect,
}) => {
  const { data: agents, isLoading } = useUserAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredAgents = agents?.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm border border-gray-200">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Selectează Agent AI</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {filteredAgents.length} / {agents?.length || 0} agenți disponibili
              </Badge>
              <Button variant="outline" size="sm" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Creează Agent
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Caută agenți AI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtrează
              <Badge variant="secondary" className="ml-1">1</Badge>
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-600">Categorie</span>
            <Badge 
              variant={categoryFilter === 'Conversational' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategoryFilter(categoryFilter === 'Conversational' ? 'All' : 'Conversational')}
            >
              Conversational {categoryFilter === 'Conversational' && '✕'}
            </Badge>
            {categoryFilter !== 'All' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setCategoryFilter('All')}
              >
                Reset filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-900">Rezultate</h4>
        </div>

        {/* Agents List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredAgents.length === 0 ? (
            <div className="p-8 text-center">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nu au fost găsiți agenți</p>
              <p className="text-sm text-gray-400 mt-1">Încearcă să modifici termenii de căutare</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAgents.map((agent, index) => {
                const stats = getRandomStats();
                const isSelected = selectedAgentId === agent.id;
                const colorClass = agentColors[index % agentColors.length];
                
                return (
                  <div 
                    key={agent.id}
                    className={`p-4 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => onAgentSelect(agent.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-white font-medium text-lg relative`}>
                        {agent.name.charAt(0).toUpperCase()}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {agent.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            Română +1
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {agent.description || 'Agent conversațional inteligent pentru interacțiuni naturale și eficiente cu clienții.'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Română</span>
                          <span>Standard</span>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="text-sm text-gray-600">
                        Conversational
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-sm text-gray-900 font-medium mb-1">{stats.period}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {stats.rating}
                        </div>
                      </div>

                      {/* Usage */}
                      <div className="text-right">
                        <div className="text-sm text-gray-900 font-medium">{stats.usage}K</div>
                        <div className="text-xs text-gray-500">utilizări</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Grid, List, Star, CheckCircle, Settings, Activity } from 'lucide-react';

const IntegrationsMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { id: 'all', label: 'Toate' },
    { id: 'crm', label: 'CRM' },
    { id: 'communication', label: 'Comunicare' },
    { id: 'analytics', label: 'Analiză' },
    { id: 'productivity', label: 'Productivitate' },
  ];

  const integrations = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      tagline: 'CRM-ul tău pentru vânzări',
      logo: '🔷',
      rating: 4.8,
      reviews: 1245,
      connected: true,
      category: 'crm',
      features: ['Sincronizare contacte', 'Lead tracking', 'Rapoarte automate'],
    },
    {
      id: 'slack',
      name: 'Slack',
      tagline: 'Comunicare în echipă',
      logo: '💬',
      rating: 4.6,
      reviews: 892,
      connected: false,
      category: 'communication',
      features: ['Notificări instant', 'Canale dedicate', 'Bot integrare'],
    },
    {
      id: 'zapier',
      name: 'Zapier',
      tagline: 'Automatizează workflow-urile',
      logo: '⚡',
      rating: 4.7,
      reviews: 2156,
      connected: false,
      category: 'productivity',
      features: ['1000+ integrări', 'Trigger automat', 'Workflow vizual'],
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      tagline: 'Marketing & CRM',
      logo: '🎯',
      rating: 4.5,
      reviews: 1876,
      connected: true,
      category: 'crm',
      features: ['Email marketing', 'Lead scoring', 'Pipeline management'],
    },
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Caută integrări..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtre
          </Button>
          <div className="flex border border-gray-200 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="text-4xl">{integration.logo}</div>
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                {integration.name}
                {integration.connected && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">{integration.tagline}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-1 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(integration.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {integration.rating} ({integration.reviews})
                </span>
              </div>

              <ul className="space-y-1 mb-4 text-sm">
                {integration.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    {integration.connected ? 'Configurează' : 'Conectează'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-2xl">{integration.logo}</span>
                      {integration.name}
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="overview">Prezentare</TabsTrigger>
                      <TabsTrigger value="setup">Setup</TabsTrigger>
                      <TabsTrigger value="permissions">Permisiuni</TabsTrigger>
                      <TabsTrigger value="mapping">Mapare</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                      <p className="text-gray-600">{integration.tagline}</p>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Funcționalități principale:</h4>
                        <ul className="space-y-1">
                          {integration.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="setup">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Pași de configurare:</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</div>
                            <span>Conectează-te la contul tău {integration.name}</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</div>
                            <span>Configurează permisiunile</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</div>
                            <span>Testează conexiunea</span>
                          </div>
                        </div>
                        <Button className="w-full">
                          {integration.connected ? 'Reconfigurează' : 'Începe configurarea'}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsMarketplace;

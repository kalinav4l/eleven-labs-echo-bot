
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Settings, Trash2, BarChart3 } from 'lucide-react';

const ConnectedServices = () => {
  const [services] = useState([
    {
      id: 'salesforce',
      name: 'Salesforce',
      logo: '🔷',
      status: 'healthy',
      lastSync: '2 minute ago',
      dataVolume: '1.2K records',
      connections: ['contacts', 'leads', 'opportunities'],
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      logo: '🎯',
      status: 'warning',
      lastSync: '1 hour ago',
      dataVolume: '856 records',
      connections: ['contacts', 'deals'],
    },
    {
      id: 'slack',
      name: 'Slack',
      logo: '💬',
      status: 'error',
      lastSync: 'Failed',
      dataVolume: '0 messages',
      connections: [],
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Servicii Conectate</h2>
          <p className="text-gray-600">Vizualizează și gestionează toate integrările active</p>
        </div>
        <Button className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Raport detaliat
        </Button>
      </div>

      {/* Visual Data Flow Map */}
      <Card>
        <CardHeader>
          <CardTitle>Harta fluxului de date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="relative flex items-center space-x-8">
              {/* Kalina Hub in center */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                  K
                </div>
                <span className="text-sm font-medium">Kalina AI Hub</span>
              </div>

              {/* Connected services around */}
              <div className="grid grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <div key={service.id} className="flex flex-col items-center relative">
                    {/* Connection line */}
                    <div className={`absolute top-8 ${index % 2 === 0 ? 'right-full' : 'left-full'} w-8 h-0.5 ${
                      service.status === 'healthy' ? 'bg-green-500' : 
                      service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${getStatusColor(service.status)}`}>
                      {service.logo}
                    </div>
                    <span className="text-xs text-center">{service.name}</span>
                    <div className="text-xs text-gray-500 mt-1">{service.dataVolume}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{service.logo}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      {getStatusIcon(service.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Ultima sincronizare: {service.lastSync}</span>
                      <span>•</span>
                      <span>{service.dataVolume}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status === 'healthy' ? 'Sănătos' : 
                     service.status === 'warning' ? 'Atenție' : 'Eroare'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {service.connections.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Conexiuni active:</span>
                    <div className="flex gap-2">
                      {service.connections.map((connection) => (
                        <Badge key={connection} variant="outline" className="text-xs">
                          {connection}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConnectedServices;

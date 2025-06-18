
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CreditCard, TrendingUp, Calendar, Download, AlertTriangle, Zap } from 'lucide-react';

const BillingUsage = () => {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 99,
    currency: 'USD',
    billing: 'lunar',
    features: [
      '10,000 minute convorbiri/lună',
      '50 agenți vocali',
      'Suport prioritar',
      'Analiză avansată',
      'Integrări nelimitate'
    ]
  });

  const [usage] = useState({
    minutes: 7450,
    totalMinutes: 10000,
    agents: 23,
    totalAgents: 50,
    apiCalls: 45230,
    storage: 2.3,
    totalStorage: 10,
  });

  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      date: '2024-01-01',
      amount: 99,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-01',
      amount: 99,
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-01',
      amount: 99,
      status: 'paid',
      downloadUrl: '#'
    },
  ]);

  const getUsagePercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facturare și utilizare</h2>
          <p className="text-gray-600">Monitorizează planul și consumul de resurse</p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Upgrade plan
        </Button>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Planul curent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{currentPlan.name}</h3>
              <p className="text-gray-600">Facturare {currentPlan.billing}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${currentPlan.price}</div>
              <div className="text-sm text-gray-600">/{currentPlan.billing}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <h4 className="font-medium mb-2">Funcționalități incluse:</h4>
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {feature}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline">Modifică plan</Button>
            <Button variant="outline">Anulează abonament</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Minute convorbiri</span>
              <Badge variant="outline" className={getUsageColor(getUsagePercentage(usage.minutes, usage.totalMinutes))}>
                {getUsagePercentage(usage.minutes, usage.totalMinutes)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">{usage.minutes.toLocaleString()}</div>
            <Progress value={getUsagePercentage(usage.minutes, usage.totalMinutes)} className="mb-2" />
            <div className="text-xs text-gray-500">din {usage.totalMinutes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Agenți activi</span>
              <Badge variant="outline" className={getUsageColor(getUsagePercentage(usage.agents, usage.totalAgents))}>
                {getUsagePercentage(usage.agents, usage.totalAgents)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">{usage.agents}</div>
            <Progress value={getUsagePercentage(usage.agents, usage.totalAgents)} className="mb-2" />
            <div className="text-xs text-gray-500">din {usage.totalAgents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Apeluri API</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-2">{usage.apiCalls.toLocaleString()}</div>
            <div className="text-xs text-gray-500">această lună</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Stocare (GB)</span>
              <Badge variant="outline" className={getUsageColor(getUsagePercentage(usage.storage, usage.totalStorage))}>
                {getUsagePercentage(usage.storage, usage.totalStorage)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold mb-2">{usage.storage}</div>
            <Progress value={getUsagePercentage(usage.storage, usage.totalStorage)} className="mb-2" />
            <div className="text-xs text-gray-500">din {usage.totalStorage} GB</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alerte utilizare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Apropiat de limita de minute</p>
                <p className="text-sm text-yellow-700">Ai folosit 74% din minutele disponibile pentru această lună.</p>
              </div>
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Istoric facturi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount}</p>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Plătită
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingUsage;


import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import IntegrationsMarketplace from '../components/settings/IntegrationsMarketplace';
import ConnectedServices from '../components/settings/ConnectedServices';
import AccountSettings from '../components/settings/AccountSettings';
import VoiceAgentDefaults from '../components/settings/VoiceAgentDefaults';
import TeamManagement from '../components/settings/TeamManagement';
import BillingUsage from '../components/settings/BillingUsage';
import SecurityCenter from '../components/settings/SecurityCenter';
import WebhookManager from '../components/settings/WebhookManager';
import { Button } from '@/components/ui/button';
import { Settings, Plug, Shield, Users, CreditCard, Bot, Webhook, Save } from 'lucide-react';

const IntegrationsSettings = () => {
  const [activeCategory, setActiveCategory] = useState('integrations');
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    { id: 'integrations', label: 'Integrări', icon: Plug },
    { id: 'connected', label: 'Servicii Conectate', icon: Settings },
    { id: 'account', label: 'Cont', icon: Users },
    { id: 'voice', label: 'Agenți Vocali', icon: Bot },
    { id: 'team', label: 'Echipă', icon: Users },
    { id: 'billing', label: 'Facturare', icon: CreditCard },
    { id: 'security', label: 'Securitate', icon: Shield },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case 'integrations':
        return <IntegrationsMarketplace />;
      case 'connected':
        return <ConnectedServices />;
      case 'account':
        return <AccountSettings onChanges={setHasChanges} />;
      case 'voice':
        return <VoiceAgentDefaults onChanges={setHasChanges} />;
      case 'team':
        return <TeamManagement onChanges={setHasChanges} />;
      case 'billing':
        return <BillingUsage />;
      case 'security':
        return <SecurityCenter onChanges={setHasChanges} />;
      case 'webhooks':
        return <WebhookManager onChanges={setHasChanges} />;
      default:
        return <IntegrationsMarketplace />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <div className="h-20 bg-gradient-to-r from-white to-gray-100 border-b px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Setări & Integrări</h1>
            <p className="text-gray-600">Centrul de control pentru configurări și integrări</p>
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-60 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)]">
            <div className="p-4">
              <nav className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-10 overflow-y-auto">
            {renderContent()}
          </div>
        </div>

        {/* Sticky Action Bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-between max-w-4xl">
              <span className="text-sm text-gray-600">Aveți modificări nesalvate</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setHasChanges(false)}>
                  Anulează
                </Button>
                <Button onClick={() => setHasChanges(false)} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvează modificările
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default IntegrationsSettings;

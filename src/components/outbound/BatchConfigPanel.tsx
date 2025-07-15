import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentSelector } from './AgentSelector';
import { PhoneSelector } from './PhoneSelector';
import { SMSConfigSection } from './SMSConfigSection';
import { Settings, Users, Phone } from 'lucide-react';

interface SMSConfig {
  enabled: boolean;
  apiToken: string;
  senderId: string;
  message: string;
  delay: number;
}

interface BatchConfigPanelProps {
  selectedAgentId: string;
  onAgentSelect: (agentId: string) => void;
  selectedPhoneId: string;
  onPhoneSelect: (phoneId: string) => void;
  totalRecipients: number;
  selectedRecipients: number;
  smsConfig: SMSConfig;
  onSMSConfigChange: (config: SMSConfig) => void;
}

export const BatchConfigPanel: React.FC<BatchConfigPanelProps> = ({
  selectedAgentId,
  onAgentSelect,
  selectedPhoneId,
  onPhoneSelect,
  totalRecipients,
  selectedRecipients,
  smsConfig,
  onSMSConfigChange,
}) => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Settings className="w-5 h-5" />
            <span>Configurație Batch</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <span>Agent AI</span>
              <Badge variant={selectedAgentId ? "default" : "secondary"} className="text-xs">
                {selectedAgentId ? "Selectat" : "Neselectat"}
              </Badge>
            </label>
            <AgentSelector
              selectedAgentId={selectedAgentId}
              onAgentSelect={onAgentSelect}
            />
          </div>

          {/* Phone Number Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <span>Număr de Contact</span>
              <Badge variant={selectedPhoneId ? "default" : "secondary"} className="text-xs">
                {selectedPhoneId ? "Selectat" : "Neselectat"}
              </Badge>
            </label>
            <PhoneSelector
              selectedPhoneId={selectedPhoneId}
              onPhoneSelect={onPhoneSelect}
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{totalRecipients}</div>
                <div className="text-xs text-gray-500">Total Contacte</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{selectedRecipients}</div>
                <div className="text-xs text-gray-500">Selectate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Configuration */}
      <SMSConfigSection
        config={smsConfig}
        onConfigChange={onSMSConfigChange}
      />
    </div>
  );
};
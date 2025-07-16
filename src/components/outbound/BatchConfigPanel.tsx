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
    <div className="space-y-4">
      {/* Agent Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Agent AI
        </label>
        <AgentSelector
          selectedAgentId={selectedAgentId}
          onAgentSelect={onAgentSelect}
        />
      </div>

      {/* Phone Number Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Număr
        </label>
        <PhoneSelector
          selectedPhoneId={selectedPhoneId}
          onPhoneSelect={onPhoneSelect}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div className="text-lg font-medium">{totalRecipients}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div>
          <div className="text-lg font-medium">{selectedRecipients}</div>
          <div className="text-xs text-gray-500">Selectate</div>
        </div>
      </div>

      {/* SMS Configuration */}
      <SMSConfigSection
        config={smsConfig}
        onConfigChange={onSMSConfigChange}
      />
    </div>
  );
};
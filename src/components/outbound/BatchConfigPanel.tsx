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
  onSMSConfigChange
}) => {
  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Configurații</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {/* Agent Selection */}
        <div className="space-y-2">
          <AgentSelector selectedAgentId={selectedAgentId} onAgentSelect={onAgentSelect} />
        </div>

        {/* Phone Number Selection */}
        <div className="space-y-2">
          <PhoneSelector selectedPhoneId={selectedPhoneId} onPhoneSelect={onPhoneSelect} />
        </div>

        {/* SMS Configuration */}
        <SMSConfigSection config={smsConfig} onConfigChange={onSMSConfigChange} />
      </CardContent>
    </Card>
  );
};
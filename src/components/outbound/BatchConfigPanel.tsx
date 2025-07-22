import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AgentSelector } from './AgentSelector';
import { PhoneSelector } from './PhoneSelector';

interface BatchConfigPanelProps {
  selectedAgentId: string;
  onAgentSelect: (agentId: string) => void;
  selectedPhoneId: string;
  onPhoneSelect: (phoneId: string) => void;
  totalRecipients: number;
  selectedRecipients: number;
}

export const BatchConfigPanel: React.FC<BatchConfigPanelProps> = ({
  selectedAgentId,
  onAgentSelect,
  selectedPhoneId,
  onPhoneSelect,
  totalRecipients,
  selectedRecipients
}) => {
  return (
    <Card className="p-6">
      <CardContent className="px-0 space-y-6">
        {/* Agent Selection */}
        <div className="space-y-2">
          <AgentSelector selectedAgentId={selectedAgentId} onAgentSelect={onAgentSelect} />
        </div>

        {/* Phone Number Selection */}
        <div className="space-y-2">
          <PhoneSelector selectedPhoneId={selectedPhoneId} onPhoneSelect={onPhoneSelect} />
        </div>

        {/* Recipients Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Contacte selectate</span>
            <span className="text-sm font-medium">
              {selectedRecipients} din {totalRecipients}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
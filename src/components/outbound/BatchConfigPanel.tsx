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
  // Enhanced validation status
  const agentValid = selectedAgentId && selectedAgentId.trim() !== '';
  const phoneValid = selectedPhoneId && selectedPhoneId.trim() !== '';
  const contactsValid = selectedRecipients > 0;
  
  const getValidationIcon = (isValid: boolean) => 
    isValid ? '✅' : '⚠️';
  
  const getValidationText = (isValid: boolean, validText: string, invalidText: string) =>
    isValid ? validText : invalidText;

  console.log('🔧 BatchConfigPanel - Validation Status:', {
    selectedAgentId,
    agentValid,
    selectedPhoneId, 
    phoneValid,
    selectedRecipients,
    contactsValid,
    allValid: agentValid && phoneValid && contactsValid
  });

  return (
    <Card className="p-6">
      <CardContent className="px-0 space-y-6">
        {/* Agent Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Agent AI {getValidationIcon(agentValid)}
            </label>
            <span className="text-xs text-gray-500">
              {getValidationText(agentValid, 'Agent selectat', 'Selectează un agent')}
            </span>
          </div>
          <AgentSelector selectedAgentId={selectedAgentId} onAgentSelect={onAgentSelect} />
        </div>

        {/* Phone Number Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Număr telefon {getValidationIcon(phoneValid)}
            </label>
            <span className="text-xs text-gray-500">
              {getValidationText(phoneValid, 'Număr selectat', 'Selectează numărul')}
            </span>
          </div>
          <PhoneSelector selectedPhoneId={selectedPhoneId} onPhoneSelect={onPhoneSelect} />
        </div>

        {/* Recipients Summary with Validation */}
        <div className={`rounded-lg p-4 ${contactsValid ? 'bg-green-50' : 'bg-orange-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              {getValidationIcon(contactsValid)} Contacte selectate
            </span>
            <span className={`text-sm font-medium ${contactsValid ? 'text-green-700' : 'text-orange-700'}`}>
              {selectedRecipients} din {totalRecipients}
            </span>
          </div>
          {!contactsValid && (
            <p className="text-xs text-orange-600 mt-1">
              Selectează cel puțin un contact pentru a începe campania
            </p>
          )}
        </div>

        {/* Overall Status Indicator */}
        <div className={`rounded-lg p-3 border-2 ${
          agentValid && phoneValid && contactsValid 
            ? 'border-green-200 bg-green-50' 
            : 'border-orange-200 bg-orange-50'
        }`}>
          <div className="text-sm font-medium text-center">
            {agentValid && phoneValid && contactsValid ? (
              <span className="text-green-700">✅ Gata pentru lansare!</span>
            ) : (
              <span className="text-orange-700">⚠️ Completează configurarea</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
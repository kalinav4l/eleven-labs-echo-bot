import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ValidationStatusProps {
  agentValid: boolean;
  phoneValid: boolean;
  contactsValid: boolean;
  selectedAgentId: string;
  selectedPhoneId: string;
  selectedContactsCount: number;
}

export const EnhancedValidationStatus: React.FC<ValidationStatusProps> = ({
  agentValid,
  phoneValid,
  contactsValid,
  selectedAgentId,
  selectedPhoneId,
  selectedContactsCount
}) => {
  const allValid = agentValid && phoneValid && contactsValid;

  const getIcon = (valid: boolean) => {
    if (valid) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusColor = (valid: boolean) => {
    return valid ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  console.log('🔍 EnhancedValidationStatus - Render:', {
    agentValid,
    phoneValid,
    contactsValid,
    allValid,
    selectedAgentId,
    selectedPhoneId,
    selectedContactsCount,
    timestamp: new Date().toISOString()
  });

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {allValid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            Status Configurare
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Agent Status */}
            <div className={`p-3 rounded-lg border ${getStatusColor(agentValid)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getIcon(agentValid)}
                <span className="font-medium">Agent AI</span>
              </div>
              <div className="text-sm">
                {agentValid ? (
                  <>
                    <span className="text-green-600">✓ Agent selectat</span>
                    <div className="text-xs text-gray-600 mt-1">
                      ID: {selectedAgentId.substring(0, 20)}...
                    </div>
                  </>
                ) : (
                  <span className="text-red-600">⚠ Selectează un agent</span>
                )}
              </div>
            </div>

            {/* Phone Status */}
            <div className={`p-3 rounded-lg border ${getStatusColor(phoneValid)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getIcon(phoneValid)}
                <span className="font-medium">Telefon</span>
              </div>
              <div className="text-sm">
                {phoneValid ? (
                  <>
                    <span className="text-green-600">✓ Număr configurat</span>
                    <div className="text-xs text-gray-600 mt-1">
                      ID: {selectedPhoneId.substring(0, 20)}...
                    </div>
                  </>
                ) : (
                  <span className="text-red-600">⚠ Configurează numărul</span>
                )}
              </div>
            </div>

            {/* Contacts Status */}
            <div className={`p-3 rounded-lg border ${getStatusColor(contactsValid)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getIcon(contactsValid)}
                <span className="font-medium">Contacte</span>
              </div>
              <div className="text-sm">
                {contactsValid ? (
                  <>
                    <span className="text-green-600">✓ {selectedContactsCount} selectate</span>
                    <div className="text-xs text-gray-600 mt-1">
                      Gata pentru apeluri
                    </div>
                  </>
                ) : (
                  <span className="text-red-600">⚠ Selectează contacte</span>
                )}
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`p-3 rounded-lg border-2 text-center ${
            allValid 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-orange-50 border-orange-300 text-orange-800'
          }`}>
            <div className="font-semibold">
              {allValid ? (
                <>
                  🎉 Campania este gata pentru lansare!
                </>
              ) : (
                <>
                  📋 Completează configurarea pentru a continua
                </>
              )}
            </div>
            {!allValid && (
              <div className="text-sm mt-1">
                {!agentValid && '• Selectează un agent AI '}
                {!phoneValid && '• Configurează numărul de telefon '}
                {!contactsValid && '• Selectează contacte din listă'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
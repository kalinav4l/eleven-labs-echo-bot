
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';
import { CSVUploadSection } from './CSVUploadSection';
import { ContactsList } from './ContactsList';
import { BatchCallProgress } from './BatchCallProgress';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

interface CallStatus {
  contactId: string;
  contactName: string;
  status: 'waiting' | 'calling' | 'in-progress' | 'processing' | 'completed' | 'failed';
  conversationId?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  cost?: number;
}

interface BatchTabProps {
  contacts: Contact[];
  selectedContacts: Set<string>;
  onContactSelect: (contactId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onFileSelect: () => void;
  onDownloadTemplate: () => void;
  onBatchProcess: () => void;
  agentId: string;
  isProcessingBatch: boolean;
  currentProgress: number;
  totalCalls: number;
  currentCallStatus: string;
  callStatuses: CallStatus[];
}

export const BatchTab: React.FC<BatchTabProps> = ({
  contacts,
  selectedContacts,
  onContactSelect,
  onSelectAll,
  onFileSelect,
  onDownloadTemplate,
  onBatchProcess,
  agentId,
  isProcessingBatch,
  currentProgress,
  totalCalls,
  currentCallStatus,
  callStatuses,
}) => {
  // Enhanced validation with detailed logging
  const agentValid = agentId && agentId.trim() !== '';
  const contactsValid = selectedContacts.size > 0;
  const canProcessBatch = agentValid && contactsValid && !isProcessingBatch;

  // Enhanced debug logging
  console.log('📋 BatchTab - Enhanced Debug Info:', {
    agentId: agentId,
    agentIdLength: agentId?.length || 0,
    agentIdTrimmed: agentId?.trim() || '',
    agentValid: agentValid,
    selectedContactsSize: selectedContacts.size,
    contactsValid: contactsValid,
    isProcessingBatch: isProcessingBatch,
    canProcessBatch: canProcessBatch,
    contactsArray: Array.from(selectedContacts),
    timestamp: new Date().toISOString()
  });

  // Function to get detailed button state
  const getButtonState = () => {
    if (isProcessingBatch) return 'processing';
    if (!agentValid) return 'no_agent';
    if (!contactsValid) return 'no_contacts';
    return 'ready';
  };

  const buttonState = getButtonState();

  // Enhanced button text and styling
  const getButtonConfig = () => {
    switch (buttonState) {
      case 'processing':
        return {
          text: `Monitorizează... (${currentProgress}/${totalCalls})`,
          icon: <Loader2 className="w-4 h-4 mr-2 animate-spin" />,
          className: "w-full bg-blue-600 hover:bg-blue-700 text-white"
        };
      case 'no_agent':
        return {
          text: "⚠️ Selectează un agent mai întâi",
          icon: <Phone className="w-4 h-4 mr-2" />,
          className: "w-full bg-gray-400 text-white cursor-not-allowed"
        };
      case 'no_contacts':
        return {
          text: "⚠️ Selectează contacte pentru apeluri",
          icon: <Phone className="w-4 h-4 mr-2" />,
          className: "w-full bg-gray-400 text-white cursor-not-allowed"
        };
      case 'ready':
        return {
          text: `🚀 Procesează cu Monitorizare (${selectedContacts.size} contacte)`,
          icon: <Phone className="w-4 h-4 mr-2" />,
          className: "w-full bg-green-600 hover:bg-green-700 text-white"
        };
      default:
        return {
          text: "Procesează cu Monitorizare",
          icon: <Phone className="w-4 h-4 mr-2" />,
          className: "w-full bg-gray-900 hover:bg-gray-800 text-white"
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="space-y-6">
      <CSVUploadSection
        onFileSelect={onFileSelect}
        onDownloadTemplate={onDownloadTemplate}
      />

      {contacts.length > 0 && (
        <div className="space-y-4">
          <ContactsList
            contacts={contacts}
            selectedContacts={selectedContacts}
            onContactSelect={onContactSelect}
            onSelectAll={onSelectAll}
            isProcessingBatch={isProcessingBatch}
          />

          {/* Enhanced Real-time Status Display */}
          {isProcessingBatch && (
            <BatchCallProgress
              currentProgress={currentProgress}
              totalCalls={totalCalls}
              currentCallStatus={currentCallStatus}
              callStatuses={callStatuses}
              isProcessing={isProcessingBatch}
              isPaused={false}
              isStopped={false}
            />
          )}

          <Button
            onClick={() => {
              console.log('🎯 Button clicked - Enhanced logging:', {
                buttonState,
                canProcessBatch,
                agentValid,
                contactsValid,
                isProcessingBatch,
                selectedContacts: Array.from(selectedContacts),
                agentId,
                timestamp: new Date().toISOString()
              });
              
              if (canProcessBatch) {
                console.log('✅ Proceeding with batch process...');
                onBatchProcess();
              } else {
                console.log('❌ Cannot process batch - validation failed');
              }
            }}
            disabled={!canProcessBatch}
            className={buttonConfig.className + (canProcessBatch ? '' : ' disabled:opacity-50 disabled:cursor-not-allowed')}
          >
            {buttonConfig.icon}
            {buttonConfig.text}
          </Button>

          {/* Enhanced Validation Status Display */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className={`p-2 rounded ${agentValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {agentValid ? '✅' : '❌'} Agent: {agentValid ? 'Valid' : 'Lipsește'}
              </div>
              <div className={`p-2 rounded ${contactsValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {contactsValid ? '✅' : '❌'} Contacte: {contactsValid ? selectedContacts.size : '0'}
              </div>
            </div>
            
            {/* Debug Info Enhanced */}
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              <div>🔧 Debug: Agent ID: "{agentId}" ({agentId?.length || 0} chars)</div>
              <div>📋 Selected: {selectedContacts.size} | Processing: {isProcessingBatch.toString()}</div>
              <div>🎯 State: {buttonState} | Can Process: {canProcessBatch.toString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

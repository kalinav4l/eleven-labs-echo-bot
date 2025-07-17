
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
  // Check if we can process batch calls
  const canProcessBatch = agentId.trim() !== '' && selectedContacts.size > 0 && !isProcessingBatch;

  console.log('BatchTab - Debug info:', {
    agentId: agentId,
    agentIdTrimmed: agentId.trim(),
    selectedContactsSize: selectedContacts.size,
    isProcessingBatch: isProcessingBatch,
    canProcessBatch: canProcessBatch
  });

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
            onClick={onBatchProcess}
            disabled={!canProcessBatch}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingBatch ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Monitorizează... ({currentProgress}/{totalCalls})
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Procesează cu Monitorizare ({selectedContacts.size} contacte)
              </>
            )}
          </Button>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Debug: Agent ID: "{agentId}" | Selected: {selectedContacts.size} | Processing: {isProcessingBatch.toString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

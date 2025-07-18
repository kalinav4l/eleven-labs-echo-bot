import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SingleCallTab } from '@/components/outbound/SingleCallTab';
import { BatchTab } from '@/components/outbound/BatchTab';
import { CallHistoryTab } from '@/components/outbound/CallHistoryTab';
import { OutboundHeader } from '@/components/outbound/OutboundHeader';
import { AutoRedialPanel } from '@/components/outbound/AutoRedialPanel';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useCallHistory } from '@/hooks/useCallHistory';

export default function Outbound() {
  const [activeTab, setActiveTab] = useState('single');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const { initiateCall, isInitiating } = useCallInitiation({
    agentId: selectedAgentId,
    phoneNumber: phoneNumber
  });

  const { callHistory, isLoading: historyLoading } = useCallHistory();

  const handleSingleCall = async () => {
    if (!selectedAgentId || !phoneNumber.trim()) {
      return;
    }
    
    const result = await initiateCall(selectedAgentId, phoneNumber, contactName || 'Contact necunoscut');
    if (result) {
      // Reset form on success
      setContactName('');
      setPhoneNumber('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <OutboundHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Call</TabsTrigger>
          <TabsTrigger value="batch">Batch Calls</TabsTrigger>
          <TabsTrigger value="redial">Auto Redial</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-4">
          <SingleCallTab 
            contactName={contactName}
            setContactName={setContactName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleSingleCall={handleSingleCall}
            agentId={selectedAgentId}
            isInitiating={isInitiating}
          />
        </TabsContent>
        
        <TabsContent value="batch" className="space-y-4">
          <BatchTab />
        </TabsContent>
        
        <TabsContent value="redial" className="space-y-4">
          <AutoRedialPanel />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <CallHistoryTab 
            callHistory={callHistory}
            isLoading={historyLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
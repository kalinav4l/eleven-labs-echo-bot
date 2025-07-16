import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Play, 
  Pause, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  total_contacts: number | null;
  called_contacts: number | null;
  successful_calls: number | null;
  failed_calls: number | null;
  agent_id: string | null;
  sms_enabled: boolean | null;
}

interface Contact {
  id: string;
  phone_number: string;
  contact_name: string | null;
  call_status: string | null;
  call_attempts: number | null;
  last_call_attempt: string | null;
}

interface LiveCampaignCardProps {
  campaign: Campaign;
}

interface CallStatus {
  contactId: string;
  contactName: string;
  phoneNumber: string;
  status: 'waiting' | 'calling' | 'completed' | 'failed';
  startTime?: Date;
  duration?: number;
}

export const LiveCampaignCard: React.FC<LiveCampaignCardProps> = ({ campaign }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentCallStatuses, setCurrentCallStatuses] = useState<CallStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaignContacts();
  }, [campaign.id]);

  const loadCampaignContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_contacts')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
      
      // Initialize call statuses for pending contacts
      const pendingContacts = (data || []).filter(c => c.call_status === 'pending');
      setCurrentCallStatuses(
        pendingContacts.map(contact => ({
          contactId: contact.id,
          contactName: contact.contact_name || 'Necunoscut',
          phoneNumber: contact.phone_number,
          status: 'waiting'
        }))
      );
    } catch (error) {
      console.error('Error loading campaign contacts:', error);
    }
  };

  const startCampaignCalls = async () => {
    if (!campaign.agent_id) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Campania nu are un agent asignat"
      });
      return;
    }

    setIsProcessing(true);
    const pendingContacts = contacts.filter(c => c.call_status === 'pending');
    
    for (let i = 0; i < pendingContacts.length; i++) {
      const contact = pendingContacts[i];
      setCurrentContactIndex(i);
      
      // Update status to calling
      setCurrentCallStatuses(prev => 
        prev.map(status => 
          status.contactId === contact.id 
            ? { ...status, status: 'calling', startTime: new Date() }
            : status
        )
      );

      try {
        // Simulate call initiation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Call the initiate-scheduled-call function
        const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
          body: {
            agent_id: campaign.agent_id,
            phone_number: contact.phone_number,
            contact_name: contact.contact_name || 'Necunoscut',
            batch_processing: true
          }
        });

        if (error) throw error;

        const callResult = data.success ? 'completed' : 'failed';
        
        // Update contact status in database
        await supabase
          .from('campaign_contacts')
          .update({
            call_status: callResult,
            call_attempts: (contact.call_attempts || 0) + 1,
            last_call_attempt: new Date().toISOString()
          })
          .eq('id', contact.id);

        // Update UI status
        setCurrentCallStatuses(prev => 
          prev.map(status => 
            status.contactId === contact.id 
              ? { 
                  ...status, 
                  status: callResult,
                  duration: Math.round((new Date().getTime() - (status.startTime?.getTime() || 0)) / 1000)
                }
              : status
          )
        );

        // Wait between calls
        if (i < pendingContacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error('Error making call:', error);
        
        // Update status to failed
        setCurrentCallStatuses(prev => 
          prev.map(status => 
            status.contactId === contact.id 
              ? { ...status, status: 'failed' }
              : status
          )
        );

        // Update contact in database
        await supabase
          .from('campaign_contacts')
          .update({
            call_status: 'failed',
            call_attempts: (contact.call_attempts || 0) + 1,
            last_call_attempt: new Date().toISOString()
          })
          .eq('id', contact.id);
      }
    }

    setIsProcessing(false);
    loadCampaignContacts(); // Refresh data
    toast({
      title: "Campanie Finalizată",
      description: `S-au procesat ${pendingContacts.length} contacte`
    });
  };

  const pauseCampaignCalls = () => {
    setIsProcessing(false);
    toast({
      title: "Campanie Pauzată",
      description: "Procesarea apelurilor a fost oprită"
    });
  };

  const getTotalProgress = () => {
    const total = campaign.total_contacts || 0;
    const called = campaign.called_contacts || 0;
    return total > 0 ? (called / total) * 100 : 0;
  };

  const getSuccessRate = () => {
    const successful = campaign.successful_calls || 0;
    const called = campaign.called_contacts || 0;
    return called > 0 ? (successful / called) * 100 : 0;
  };

  const pendingContacts = contacts.filter(c => c.call_status === 'pending');
  const completedContacts = contacts.filter(c => c.call_status === 'completed');
  const failedContacts = contacts.filter(c => c.call_status === 'failed');

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-primary" />
              {campaign.name}
              {isProcessing && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  În desfășurare
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          </div>
          <div className="flex gap-2">
            {!isProcessing ? (
              <Button
                onClick={startCampaignCalls}
                disabled={pendingContacts.length === 0}
                className="gap-2"
                size="sm"
              >
                <Play className="h-4 w-4" />
                Pornește Apelurile
              </Button>
            ) : (
              <Button
                onClick={pauseCampaignCalls}
                variant="destructive"
                className="gap-2"
                size="sm"
              >
                <Pause className="h-4 w-4" />
                Pauzează
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{campaign.total_contacts || 0}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingContacts.length}</div>
            <div className="text-sm text-muted-foreground">În așteptare</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedContacts.length}</div>
            <div className="text-sm text-muted-foreground">Reușite</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedContacts.length}</div>
            <div className="text-sm text-muted-foreground">Eșuate</div>
          </div>
        </div>

        <Separator />

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progres general</span>
            <span>{getTotalProgress().toFixed(1)}%</span>
          </div>
          <Progress value={getTotalProgress()} className="h-2" />
        </div>

        {/* Live Call Status */}
        {isProcessing && currentCallStatuses.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status Apeluri Live
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {currentCallStatuses.slice(0, 5).map((callStatus) => (
                <motion.div
                  key={callStatus.contactId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {callStatus.status === 'waiting' && (
                      <Clock className="h-4 w-4 text-gray-500" />
                    )}
                    {callStatus.status === 'calling' && (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                    {callStatus.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {callStatus.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{callStatus.contactName}</div>
                      <div className="text-xs text-muted-foreground">{callStatus.phoneNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${callStatus.status === 'waiting' ? 'text-gray-600 border-gray-200' : ''}
                        ${callStatus.status === 'calling' ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}
                        ${callStatus.status === 'completed' ? 'text-green-600 border-green-200 bg-green-50' : ''}
                        ${callStatus.status === 'failed' ? 'text-red-600 border-red-200 bg-red-50' : ''}
                      `}
                    >
                      {callStatus.status === 'waiting' && 'În așteptare'}
                      {callStatus.status === 'calling' && 'Apelează...'}
                      {callStatus.status === 'completed' && 'Reușit'}
                      {callStatus.status === 'failed' && 'Eșuat'}
                    </Badge>
                    {callStatus.duration && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {callStatus.duration}s
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {currentCallStatuses.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  ...și încă {currentCallStatuses.length - 5} contacte
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campaign Settings */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Agent:</span>
            <Badge variant="outline">{campaign.agent_id || 'Neasignat'}</Badge>
          </div>
          {campaign.sms_enabled && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600">SMS Activat</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
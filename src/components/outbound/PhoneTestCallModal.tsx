import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Loader2 } from 'lucide-react';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface PhoneTestCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  phoneLabel: string;
}

export const PhoneTestCallModal: React.FC<PhoneTestCallModalProps> = ({ 
  isOpen, 
  onClose, 
  phoneNumber,
  phoneLabel 
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [targetPhoneNumber, setTargetPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');

  const { data: agents = [] } = useUserAgents();
  const { user } = useAuth();
  const { initiateCall, isInitiating } = useCallInitiation({
    agentId: selectedAgentId,
    phoneNumber: targetPhoneNumber
  });

  const handleTestCall = async () => {
    if (!selectedAgentId || !targetPhoneNumber.trim()) {
      toast({
        title: "Eroare",
        description: "Trebuie să selectezi un agent și să introduci un număr de telefon",
        variant: "destructive"
      });
      return;
    }

    // Use direct call with caller_number for test calls
    try {
      const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
        body: {
          agent_id: selectedAgentId,
          phone_number: `+373${targetPhoneNumber}`,
          contact_name: contactName || 'Test Call',
          user_id: user?.id,
          batch_processing: false,
          is_test_call: true,
          caller_number: 'phnum_9501k2y60kzjfr98sybbze66vy2x' // Always use moldcel number
        }
      });

      if (error) {
        toast({
          title: "Eroare",
          description: error.message || "Nu s-a putut iniția apelul",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "✅ Apel inițiat cu succes!",
          description: `Apelul către +373${targetPhoneNumber} a fost pornit de pe +37379325040`,
          duration: 5000
        });
        onClose();
        // Reset form
        setContactName('');
        setTargetPhoneNumber('');
        setSelectedAgentId('');
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut iniția apelul de test",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test Call din {phoneLabel}
          </DialogTitle>
          <DialogDescription>
            Face un apel de test de pe numărul {phoneNumber}
            <br />
            <span className="text-green-700 text-xs">📞 Apelul va fi făcut automat de pe: +37379325040 (moldcel)</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent-select">Selectează Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Alege un agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.elevenlabs_agent_id || agent.agent_id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nume Contact (opțional)</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ex: Test Call"
            />
          </div>

          {/* Target Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="target-phone">Numărul de apelat</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                <span className="text-sm">🇲🇩 +373</span>
              </div>
              <Input
                id="target-phone"
                value={targetPhoneNumber}
                onChange={(e) => setTargetPhoneNumber(e.target.value)}
                placeholder="794 16 481"
                className="rounded-l-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Anulează
          </Button>
          <Button 
            onClick={handleTestCall}
            disabled={!selectedAgentId || !targetPhoneNumber.trim() || isInitiating}
            className="flex-1"
          >
            {isInitiating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Se sună...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Apelează
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
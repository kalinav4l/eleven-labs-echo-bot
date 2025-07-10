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
import { Phone, Loader2, X } from 'lucide-react';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import { toast } from '@/components/ui/use-toast';

interface SingleCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleCallModal: React.FC<SingleCallModalProps> = ({ isOpen, onClose }) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { data: agents = [] } = useUserAgents();
  const { data: phoneNumbers = [] } = useUserPhoneNumbers();
  
  const { initiateCall, isInitiating } = useCallInitiation({
    agentId: selectedAgentId,
    phoneNumber: phoneNumber
  });

  const handleSingleCall = async () => {
    if (!selectedAgentId || !phoneNumber.trim()) {
      toast({
        title: "Eroare",
        description: "Trebuie să selectezi un agent și să introduci un număr de telefon",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPhoneId) {
      toast({
        title: "Eroare",
        description: "Trebuie să selectezi numărul de telefon de pe care să suni",
        variant: "destructive"
      });
      return;
    }

    const result = await initiateCall(selectedAgentId, phoneNumber, contactName || 'Contact necunoscut');
    if (result) {
      onClose();
      // Reset form
      setContactName('');
      setPhoneNumber('');
      setSelectedAgentId('');
      setSelectedPhoneId('');
    }
  };

  const getPhoneNumberDisplay = (phoneId: string) => {
    const phone = phoneNumbers.find(p => p.id === phoneId);
    return phone ? `${phone.phone_number} (${phone.label})` : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Outbound Call
          </DialogTitle>
          <DialogDescription>
            Enter a phone number to receive a call from one of your agents.
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

          {/* Phone Number to Call */}
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nume Contact (opțional)</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ex: John Doe"
            />
          </div>

          {/* From Phone Number Selection */}
          <div className="space-y-2">
            <Label htmlFor="phone-select">Sună de pe numărul</Label>
            <Select value={selectedPhoneId} onValueChange={setSelectedPhoneId}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează numărul de telefon..." />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((phone) => (
                  <SelectItem key={phone.id} value={phone.id}>
                    {phone.phone_number} ({phone.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone number</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                <span className="text-sm">🇷🇴 +373</span>
              </div>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="794 16 481"
                className="rounded-l-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            onClick={handleSingleCall}
            disabled={!selectedAgentId || !phoneNumber.trim() || !selectedPhoneId || isInitiating}
            className="flex-1"
          >
            {isInitiating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calling...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Send Test Call
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
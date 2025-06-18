
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Loader2 } from 'lucide-react';
import { useCallInitiation } from '@/hooks/useCallInitiation';

interface AgentTestCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string;
    agent_id: string;
    name: string;
  };
}

export const AgentTestCallModal: React.FC<AgentTestCallModalProps> = ({
  isOpen,
  onClose,
  agent
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const { handleInitiateCall, isInitiating } = useCallInitiation({
    customAgentId: agent.agent_id,
    createdAgentId: agent.agent_id,
    phoneNumber: phoneNumber
  });

  const handleTestCall = async () => {
    if (!phoneNumber.trim()) return;
    
    await handleInitiateCall();
    // Close modal after successful call initiation
    if (!isInitiating) {
      setPhoneNumber('');
      onClose();
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-accent" />
            Test Apel - {agent.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone">
              Numărul tău de telefon
            </Label>
            <Input
              id="test-phone"
              type="tel"
              placeholder="+40712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="glass-input"
            />
            <p className="text-sm text-muted-foreground">
              Agentul te va suna pe acest număr pentru a testa conversația
            </p>
          </div>

          <div className="p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-foreground font-medium">Agent ID:</p>
            <p className="text-xs text-muted-foreground font-mono">{agent.agent_id}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isInitiating}
            >
              Anulează
            </Button>
            <Button
              onClick={handleTestCall}
              disabled={!phoneNumber.trim() || isInitiating}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se Inițiază...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Inițiază Test
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Phone, Mic, Users, Play, Clock } from 'lucide-react';
import { useCallInitiation } from '@/hooks/useCallInitiation';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

interface Step4Props {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  finalAgentId: string;
  setFinalAgentId: (id: string) => void;
  onInitiateCall: () => void;
  onInitiateOnlineCall: () => void;
  isInitiatingCall: boolean;
  isOnlineCallActive: boolean;
  contacts?: Contact[];
}

export const Step4CallInitiation: React.FC<Step4Props> = ({
  phoneNumber,
  setPhoneNumber,
  finalAgentId,
  setFinalAgentId,
  onInitiateCall,
  onInitiateOnlineCall,
  isInitiatingCall,
  isOnlineCallActive,
  contacts = []
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const { 
    processBatchCalls, 
    isProcessingBatch, 
    currentProgress, 
    totalCalls,
    currentContact
  } = useCallInitiation({
    agentId: finalAgentId,
    phoneNumber
  });

  const canInitiateCall = finalAgentId.trim() !== '' && phoneNumber.trim() !== '';
  const canInitiateOnlineCall = finalAgentId.trim() !== '';
  const canProcessBatch = finalAgentId.trim() !== '' && selectedContacts.size > 0;

  const handleContactSelect = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  const handleBatchProcess = async () => {
    if (!canProcessBatch) return;
    
    const contactsToProcess = contacts.filter(c => selectedContacts.has(c.id));
    await processBatchCalls(contactsToProcess, finalAgentId);
  };

  const progressPercentage = totalCalls > 0 ? (currentProgress / totalCalls) * 100 : 0;

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Phone className="w-5 h-5 text-accent" />
          Pas 4: Inițiere Apeluri ElevenLabs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="final-agent-id" className="text-foreground">
            ID Agent ElevenLabs
          </Label>
          <Input 
            id="final-agent-id" 
            value={finalAgentId} 
            onChange={e => setFinalAgentId(e.target.value)} 
            placeholder="agent_xxxxxxxxx" 
            className="glass-input font-mono" 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Agent-ul tău dedicat din ElevenLabs
          </p>
        </div>

        {/* Batch Processing Section */}
        {contacts.length > 0 && (
          <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Procesare Batch ({contacts.length} contacte)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-sm"
              >
                {selectedContacts.size === contacts.length ? 'Deselectează Tot' : 'Selectează Tot'}
              </Button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {contacts.map(contact => (
                <div key={contact.id} className="flex items-center space-x-3 p-2 bg-white/50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={(e) => handleContactSelect(contact.id, e.target.checked)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{contact.phone}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {contact.country}
                  </span>
                </div>
              ))}
            </div>

            {isProcessingBatch && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Progres: {currentProgress} / {totalCalls}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                {currentContact && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Se procesează: {currentContact}</span>
                  </div>
                )}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📞 Apelurile se procesează secvențial. După finalizarea fiecărui apel, 
                    informațiile complete vor fi recuperate automat din ElevenLabs și salvate în istoric.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleBatchProcess}
              disabled={!canProcessBatch || isProcessingBatch}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isProcessingBatch ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesează... ({currentProgress}/{totalCalls})
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Procesează Batch ({selectedContacts.size} contacte)
                </>
              )}
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Apel Telefonic Individual */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Apel Individual
            </h3>
            
            <div>
              <Label htmlFor="phone-number" className="text-foreground">
                Numărul de Telefon
              </Label>
              <Input 
                id="phone-number" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                placeholder="+40712345678" 
                className="glass-input font-mono" 
              />
            </div>

            <Button 
              onClick={onInitiateCall} 
              disabled={!canInitiateCall || isInitiatingCall || isProcessingBatch} 
              className="bg-foreground text-background hover:bg-foreground/90 w-full"
            >
              {isInitiatingCall ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se Inițiază Apel
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Inițiază Apel Telefonic
                </>
              )}
            </Button>
          </div>

          {/* Apel Online */}
          <div className="space-y-4 py-[29px]">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 px-0 py-0 mx-0 my-[3px]">
              <Mic className="w-5 h-5" />
              Test Vocal Online
            </h3>
            
            <p className="text-sm text-muted-foreground">
              Testează agentul direct în browser folosind microfonul.
            </p>

            <Button 
              onClick={onInitiateOnlineCall} 
              disabled={!canInitiateOnlineCall || isProcessingBatch} 
              className={`w-full ${
                isOnlineCallActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-accent hover:bg-accent/90 text-white'
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isOnlineCallActive ? 'Oprește Testul Vocal' : 'Inițiază Test Vocal'}
            </Button>

            {isOnlineCallActive && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 text-accent">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="font-medium">Test vocal activ</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Vorbește acum cu agentul...
                </p>
              </div>
            )}
          </div>
        </div>

        {finalAgentId && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Agent ElevenLabs: <span className="font-mono text-foreground">{finalAgentId}</span>
            </p>
          </div>
        )}

        {/* Status Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Apelurile batch se procesează secvențial (unul după altul)</p>
          <p>• După finalizarea fiecărui apel, informațiile complete sunt recuperate automat</p>
          <p>• Toate rezultatele sunt salvate în Analytics Hub cu transcript complet</p>
          <p>• Fiecare utilizator primește doar informațiile de la propriul agent</p>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, Mic } from 'lucide-react';

interface Step4Props {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  finalAgentId: string;
  setFinalAgentId: (id: string) => void;
  onInitiateCall: () => void;
  onInitiateOnlineCall: () => void;
  isInitiatingCall: boolean;
  isOnlineCallActive: boolean;
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
}) => {
  const canInitiateCall = finalAgentId.trim() !== '' && phoneNumber.trim() !== '';
  const canInitiateOnlineCall = finalAgentId.trim() !== '';

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Phone className="w-5 h-5 text-accent" />
          Pas 4: Inițiere Apeluri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="final-agent-id" className="text-foreground">
            ID Agent
          </Label>
          <Input
            id="final-agent-id"
            value={finalAgentId}
            onChange={(e) => setFinalAgentId(e.target.value)}
            placeholder="Introdu ID-ul agentului"
            className="glass-input"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Apel Telefonic */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Apel Telefonic
            </h3>
            
            <div>
              <Label htmlFor="phone-number" className="text-foreground">
                Numărul de Telefon
              </Label>
              <Input
                id="phone-number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+40712345678"
                className="glass-input"
              />
            </div>

            <Button
              onClick={onInitiateCall}
              disabled={!canInitiateCall || isInitiatingCall}
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Apel Online
            </h3>
            
            <p className="text-sm text-muted-foreground">
              Vorbește direct cu agentul în browser folosind microfonul.
            </p>

            <Button
              onClick={onInitiateOnlineCall}
              disabled={!canInitiateOnlineCall}
              className={`w-full ${
                isOnlineCallActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-accent hover:bg-accent/90 text-white'
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isOnlineCallActive ? 'Oprește Apelul Online' : 'Inițiază Apel Online'}
            </Button>

            {isOnlineCallActive && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 text-accent">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="font-medium">Apel online activ</span>
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
              Agent folosit: <span className="font-mono text-foreground">{finalAgentId}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

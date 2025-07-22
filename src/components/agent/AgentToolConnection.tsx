import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Link, Copy, CheckCircle, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AgentToolConnectionProps {
  agentData: any;
  setAgentData: React.Dispatch<React.SetStateAction<any>>;
}

const AgentToolConnection: React.FC<AgentToolConnectionProps> = ({ agentData, setAgentData }) => {
  const toolId = 'tool_01k04eezd2ee2s07f6z6zs84y5'; // Fixed tool ID
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const examplePrompt = `OBLIGATORIU: Daca omul nu are timp, poti oferi sa trimiti o oferta prin SMS.
Poti intreba: 'Doriți să vă trimit oferta prin SMS la acest număr ({{system__called_number}}), sau la un alt număr de contact?'
Daca clientul cere pe alt numar, cere numarul explicit si foloseste tool-ul de SMS pentru numarul specificat de el.
Daca confirma la numarul curent, trimite sms prin smsto care ai in webhook cu tool.
In oferta trimite si linkul la site https://kalinaai.md/.`;

  const connectSMSTool = async () => {
    setIsLoading(true);
    try {
      // Fetch and connect tool in one step
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${toolId}`, {
        method: "GET",
        headers: {
          "xi-api-key": "sk_2bb078bf754417218ead92d389932a47d387f40be2cd3e50"
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add tool to agent's tools array
      const currentTools = agentData.conversation_config?.tools || [];
      const updatedTools = [...currentTools, data];

      setAgentData({
        ...agentData,
        conversation_config: {
          ...agentData.conversation_config,
          tools: updatedTools
        }
      });

      setIsConnected(true);
      
      toast({
        title: "Succes!",
        description: "Tool-ul SMS a fost conectat la agent"
      });
    } catch (error) {
      console.error('Error connecting SMS tool:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut conecta tool-ul SMS",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(examplePrompt);
    toast({
      title: "Copiat!",
      description: "Prompt-ul a fost copiat în clipboard"
    });
  };

  const addPromptToAgent = () => {
    const currentPrompt = agentData.conversation_config?.agent?.prompt?.prompt || '';
    const newPrompt = currentPrompt + '\n\n' + examplePrompt;

    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        agent: {
          ...agentData.conversation_config?.agent,
          prompt: {
            ...agentData.conversation_config?.agent?.prompt,
            prompt: newPrompt
          }
        }
      }
    });

    toast({
      title: "Succes!",
      description: "Prompt-ul a fost adăugat la agentul tău"
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Tool SMS pentru Oferte
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Conectează tool-ul SMS pentru a permite agentului să trimită oferte prin mesaje text.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connect SMS Tool Button */}
        <div className="flex justify-center">
          <Button
            onClick={connectSMSTool}
            disabled={isLoading || isConnected}
            className="bg-accent text-white hover:bg-accent/90 px-8 py-3 text-lg"
          >
            {isLoading ? (
              'Se conectează...'
            ) : isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Tool SMS Conectat
              </>
            ) : (
              <>
                <Link className="w-5 h-5 mr-2" />
                Conectează Tool SMS
              </>
            )}
          </Button>
        </div>

        {/* Obligatory Prompt Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium text-red-600">
              ⚠️ Prompt OBLIGATORIU
            </Label>
            <div className="flex gap-2">
              <Button
                onClick={copyPrompt}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiază
              </Button>
              <Button
                onClick={addPromptToAgent}
                variant="outline"
                size="sm"
                className="glass-button"
              >
                Adaugă la Prompt
              </Button>
            </div>
          </div>
          <Textarea
            value={examplePrompt}
            readOnly
            className="glass-input min-h-[120px] resize-none bg-red-50/50 border-red-200"
          />
          <div className="bg-red-50/50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ IMPORTANT: Acest prompt este OBLIGATORIU pentru funcționarea corectă a tool-ului SMS. 
              Agentul nu va putea trimite oferte prin SMS fără aceste instrucțiuni.
            </p>
          </div>
        </div>

        {/* Connected Tools Display */}
        {agentData.conversation_config?.tools && agentData.conversation_config.tools.length > 0 && (
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Tool-uri Conectate</Label>
            <div className="space-y-2">
              {agentData.conversation_config.tools.map((tool: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/30">
                  <div>
                    <p className="font-medium text-foreground">{tool.name || `Tool ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{tool.type || 'Unknown type'}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    Conectat
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentToolConnection;
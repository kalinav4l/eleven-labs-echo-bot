import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Link, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AgentToolConnectionProps {
  agentData: any;
  setAgentData: React.Dispatch<React.SetStateAction<any>>;
}

const AgentToolConnection: React.FC<AgentToolConnectionProps> = ({ agentData, setAgentData }) => {
  const [toolId, setToolId] = useState('tool_01k04eezd2ee2s07f6z6zs84y5');
  const [toolData, setToolData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const examplePrompt = `Daca omul nu are timp, poti oferi sa trimiti o oferta prin SMS.
Poti intreba: 'Doriți să vă trimit oferta prin SMS la acest număr ({{system__called_number}}), sau la un alt număr de contact?'
Daca clientul cere pe alt numar, cere numarul explicit si foloseste tool-ul de SMS pentru numarul specificat de el.
Daca confirma la numarul curent, trimite sms prin smsto care ai in webhook cu tool.
In oferta trimite si linkul la site https://kalinaai.md/.`;

  const fetchTool = async () => {
    if (!toolId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un Tool ID valid",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
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
      setToolData(data);
      
      toast({
        title: "Succes!",
        description: "Tool-ul a fost încărcat cu succes"
      });
    } catch (error) {
      console.error('Error fetching tool:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut încărca tool-ul",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectTool = () => {
    if (!toolData) {
      toast({
        title: "Eroare",
        description: "Te rog încarcă mai întâi tool-ul",
        variant: "destructive"
      });
      return;
    }

    // Add tool to agent's tools array
    const currentTools = agentData.conversation_config?.tools || [];
    const updatedTools = [...currentTools, toolData];

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
      description: "Tool-ul a fost conectat la agent"
    });
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
          <Link className="w-5 h-5" />
          Conectare Tool SMS
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Conectează tool-ul SMS pentru a permite agentului să trimită oferte prin mesaje text.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tool ID Input */}
        <div className="space-y-2">
          <Label htmlFor="tool-id" className="text-foreground">Tool ID</Label>
          <div className="flex gap-2">
            <Input
              id="tool-id"
              value={toolId}
              onChange={(e) => setToolId(e.target.value)}
              placeholder="tool_01k04eezd2ee2s07f6z6zs84y5"
              className="glass-input flex-1"
            />
            <Button
              onClick={fetchTool}
              disabled={isLoading}
              variant="outline"
              className="glass-button"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Încarcă Tool'
              )}
            </Button>
          </div>
        </div>

        {/* Tool Information */}
        {toolData && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Informații Tool</h3>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                Încărcat
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nume:</span>
                <p className="font-medium text-foreground">{toolData.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tip:</span>
                <p className="font-medium text-foreground">{toolData.type || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Descriere:</span>
                <p className="font-medium text-foreground">{toolData.description || 'N/A'}</p>
              </div>
            </div>
            
            <Button
              onClick={connectTool}
              disabled={isConnected}
              className="w-full bg-accent text-white hover:bg-accent/90"
            >
              {isConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tool Conectat
                </>
              ) : (
                'Conectează Tool la Agent'
              )}
            </Button>
          </div>
        )}

        {/* Example Prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">Prompt Recomandat</Label>
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
            className="glass-input min-h-[120px] resize-none bg-muted/30"
          />
          <p className="text-xs text-muted-foreground">
            Acest prompt va instrui agentul să ofere trimiterea de oferte prin SMS atunci când clientul nu are timp pentru o conversație completă.
          </p>
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
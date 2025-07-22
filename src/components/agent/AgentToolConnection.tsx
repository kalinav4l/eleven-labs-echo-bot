import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Link, CheckCircle, MessageSquare, X, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useClipboard } from '@/hooks/useClipboard';

interface AgentToolConnectionProps {
  agentData: any;
  setAgentData: React.Dispatch<React.SetStateAction<any>>;
}

const AgentToolConnection: React.FC<AgentToolConnectionProps> = ({
  agentData,
  setAgentData
}) => {
  const toolId = 'tool_01k04eezd2ee2s07f6z6zs84y5';
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(() => {
    const tools = agentData.conversation_config?.tools || [];
    return tools.some((tool: any) => tool.id === toolId);
  });
  const { copyToClipboard } = useClipboard();

  const examplePrompt = `Daca omul nu are timp, poti oferi sa trimiti o oferta prin SMS.
Poti intreba: 'Doriți să vă trimit oferta prin SMS la acest număr ({{system__called_number}}), sau la un alt număr de contact?'
Daca clientul cere pe alt numar, cere numarul explicit si foloseste tool-ul de SMS pentru numarul specificat de el.
Daca confirma la numarul curent, trimite sms prin smsto care ai in webhook cu tool.
In oferta trimite si linkul la site https://kalinaai.md/.`;

  const connectSMSTool = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/tools/${toolId}`, {
        method: "GET",
        headers: {
          "xi-api-key": "sk_2bb078bf754417218ead92d389932a47d387f40be2cd3e50"
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
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
        title: "Conectat!",
        description: "Tool-ul SMS a fost conectat"
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

  const disconnectSMSTool = () => {
    const currentTools = agentData.conversation_config?.tools || [];
    const updatedTools = currentTools.filter((tool: any) => tool.id !== toolId);

    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        tools: updatedTools
      }
    });

    setIsConnected(false);
    toast({
      title: "Deconectat!",
      description: "Tool-ul SMS a fost deconectat"
    });
  };

  return (
    <Card className="border border-border/50 bg-card/95 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4 border-b border-border/30">
        <CardTitle className="text-foreground flex items-center gap-3 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          Tool SMS pentru Oferte
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Connection Status & Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/30">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-foreground">
                {isConnected ? 'Tool conectat' : 'Tool neconectat'}
              </span>
            </div>
            
            {!isConnected ? (
              <Button 
                onClick={connectSMSTool} 
                disabled={isLoading} 
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? 'Se conectează...' : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Conectează
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={disconnectSMSTool} 
                variant="outline" 
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Important Warning */}
        <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-50/50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">⚠️</span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                IMPORTANT
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                Acest prompt este OBLIGATORIU pentru funcționarea corectă a tool-ului SMS. 
                Agentul nu va putea trimite oferte prin SMS fără aceste instrucțiuni. 
                Poți schimba site-ul cu al tău.
              </p>
            </div>
          </div>
        </div>

        {/* Prompt Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Prompt pentru Agent</h4>
            <Button 
              onClick={() => copyToClipboard(examplePrompt)} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Textarea 
              value={examplePrompt} 
              readOnly 
              className="min-h-[120px] resize-none text-sm bg-muted/30 border-border/50 focus:border-primary/50 font-mono leading-relaxed" 
            />
          </div>
        </div>

        {/* Connected Tools Status */}
        {isConnected && (
          <div className="border-t border-border/30 pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Tool-uri Active</h4>
            <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">SMS Tool</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Webhook activ</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs border-green-200 dark:border-green-800"
                >
                  Conectat
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentToolConnection;
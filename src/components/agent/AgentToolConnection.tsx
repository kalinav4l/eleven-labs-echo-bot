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
  return <Card className="liquid-glass">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Tool SMS pentru Oferte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connect/Disconnect Buttons */}
        <div className="flex gap-3">
          {!isConnected ? <Button onClick={connectSMSTool} disabled={isLoading} className="bg-accent text-white hover:bg-accent/90 flex-1">
              {isLoading ? 'Se conectează...' : <>
                  <Link className="w-4 h-4 mr-2" />
                  Conectează Tool SMS
                </>}
            </Button> : <div className="flex gap-2 w-full">
              <Button disabled className="flex-1 cursor-default text-slate-50 bg-gray-950 hover:bg-gray-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Tool SMS Conectat
              </Button>
              <Button onClick={disconnectSMSTool} variant="outline" className="bg-black text-white hover:bg-black/80 border-black">
                <X className="w-4 h-4" />
              </Button>
            </div>}
        </div>

        {/* Important Note */}
        <div className="border border-amber-500/20 rounded-lg p-3 mb-3 bg-red-50">
          <p className="text-sm text-amber-600 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span className="text-base text-red-600"><strong>IMPORTANT:</strong> Acest prompt este OBLIGATORIU pentru funcționarea corectă a tool-ului SMS. Agentul nu va putea trimite oferte prin SMS fără aceste instrucțiuni. Poți schimba site-ul cu al tău.</span>
          </p>
        </div>

        {/* Simple Prompt Display */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea value={examplePrompt} readOnly className="glass-input min-h-[100px] resize-none text-sm flex-1" />
            <Button 
              onClick={() => copyToClipboard(examplePrompt)} 
              variant="outline" 
              size="sm"
              className="self-start"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Connected Tools */}
        {isConnected && <div className="pt-2">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/30">
              <div>
                <p className="font-medium text-foreground text-sm">SMS Tool</p>
                <p className="text-xs text-muted-foreground">Webhook</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                Conectat
              </Badge>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default AgentToolConnection;
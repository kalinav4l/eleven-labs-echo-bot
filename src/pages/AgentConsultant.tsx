
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Globe, Bot, Phone, Copy } from 'lucide-react';

const AgentConsultant = () => {
  const defaultModelId = "eleven_flash_v2_5";
  const { user } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  
  // Agent creation form
  const [agentName, setAgentName] = useState('');
  const [agentLanguage, setAgentLanguage] = useState('ro');
  const [selectedVoice, setSelectedVoice] = useState('cjVigY5qzO86Huf0OWal');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState('');
  
  // Phone call section
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customAgentId, setCustomAgentId] = useState('');
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const voices = [
    { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' }
  ];

  const generatePrompt = async (): Promise<string | null> => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un URL valid",
        variant: "destructive"
      });
      return null;
    }

    setIsGeneratingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: {
          message:
              `You are an expert AI Prompt Engineer. Your task is to analyze the content of the website at the URL provided below and generate a comprehensive system prompt for a new conversational AI agent.

              **Website to Analyze:**
              ${websiteUrl}
              
              **System Prompt Structure:**
              Based on your analysis, create the agent's system prompt using the following Markdown structure.
              
              ## Persona & Goal
              - **Role:** Define the agent's persona (e.g., "a friendly and professional customer support consultant").
              - **Primary Goal:** State the main objective (e.g., "to assist users by answering questions about the company's services, providing contact information, and capturing leads").
              
              ## Core Knowledge Base
              - **Company/Service Introduction:** A brief summary of what the company does.
              - **Main Products/Services:** A list or detailed description of the offerings.
              - **Competitive Advantages:** What makes the company unique or better than competitors.
              - **Contact Information & Procedures:** How users can contact the company (email, phone, form) and what the procedure is.
              
              ## Priority Directives
              Incorporate the following user-provided directive. This is the most important instruction and must be followed. If the text for the directive is empty or just whitespace, you can omit this entire "Priority Directives" section.
              - **User Directive:** ${additionalPrompt}
              
              ## Conversational Style
              - **Tone:** Describe the tone (e.g., "Friendly, professional, helpful, and slightly informal").
              - **Answering FAQs:** Instruct the agent on how to handle frequently asked questions based on the knowledge base.
              
              **Final Instruction:**
              Your output must be ONLY the generated system prompt in Markdown format, ready to be used. Do not include any of your own commentary, introductions, or explanations.`,
          agentName: 'GPT-4 Consultant Generator'
        }
      });

      if (error) throw error;

      const newPrompt = data.response;
      toast({
        title: "Succes!",
        description: "Promptul a fost generat cu succes"
      });

      return newPrompt;

    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut genera promptul",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const copyAgentIdToClipboard = async() => {
    await copyAgentId(true, createdAgentId)
  }

  const copyAgentId = async (showCopiedMessage: boolean, agentId: string) => {
    if (!agentId) return;

    try {
      await navigator.clipboard.writeText(agentId);
      if (showCopiedMessage) {
        toast({
          title: "Copiat!",
          description: "ID-ul agentului a fost copiat în clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut copia ID-ul agentului",
        variant: "destructive"
      });
    }
  };

  interface BaseTTSConfig {
    voice_id: string;
  }

  interface TTSConfigWithModel extends BaseTTSConfig {
    model_id: string;
  }

  type TTSConfig = BaseTTSConfig | TTSConfigWithModel;

  interface AgentConfig {
    language: string;
    prompt: {
      prompt: string;
    };
  }

  interface ConversationConfig {
    agent: AgentConfig;
    tts: TTSConfig;
  }

  interface CreateAgentRequest {
    conversation_config: ConversationConfig;
    name: string;
  }

  const createAgent = async () => {
    if (!agentName.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele agentului.",
        variant: "destructive"
      });
      return;
    }

    setCreatedAgentId('');

    const newlyGeneratedPrompt = await generatePrompt();

    // If it returned null, stop the process. The toast is already shown inside generatePrompt.
    if (!newlyGeneratedPrompt) {
      console.log("Prompt generation failed, stopping agent creation.");
      return;
    }

    // 3. Now you have both pieces of data, guaranteed to be up-to-date.
    console.log("Creating agent with Name:", agentName); // From state
    console.log("Creating agent with Prompt:", newlyGeneratedPrompt); // From function return

    setIsCreatingAgent(true);
    try {
      const ttsConfig: TTSConfig = agentLanguage !== "en"
          ? {
            voice_id: selectedVoice,
            model_id: defaultModelId
          } as TTSConfigWithModel
          : {
            voice_id: selectedVoice
          } as BaseTTSConfig;

      const requestBody: CreateAgentRequest = {
        conversation_config: {
          agent: {
            language: agentLanguage,
            prompt: {
              prompt: newlyGeneratedPrompt
            }
          },
          tts: ttsConfig
        },
        name: agentName
      };

      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating agent:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const agentData = await response.json();
      console.log('Agent created:', agentData);

      // Save to Supabase
      const { error: supabaseError } = await supabase
          .from('kalina_agents')
          .insert({
            agent_id: `agent_${Date.now()}`,
            elevenlabs_agent_id: agentData.agent_id,
            name: agentName,
            description: `Agent consultant generat automat pentru ${websiteUrl}`,
            system_prompt: newlyGeneratedPrompt,
            voice_id: selectedVoice,
            user_id: user.id
          });

      if (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
      }

      setCreatedAgentId(agentData.agent_id);
      toast({
        title: "Succes!",
        description: `Agentul "${agentName}" a fost creat cu succes și a fost copiat în clipboard`
      });
      await copyAgentId(false, agentData.agent_id);

    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea agentul",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const initiateCall = async () => {
    const agentIdToUse = customAgentId.trim() || createdAgentId;
    
    if (!agentIdToUse || !phoneNumber.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu ID-ul agentului și numărul de telefon",
        variant: "destructive"
      });
      return;
    }

    setIsInitiatingCall(true);
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          agent_id: agentIdToUse,
          agent_phone_number_id: "phnum_01jxaeyg3feh3tmx39d4ky63rd",
          to_number: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Succes!",
        description: "Apelul a fost inițiat cu succes"
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut iniția apelul",
        variant: "destructive"
      });
    } finally {
      setIsInitiatingCall(false);
    }
  };

  const renderButtonContent = (): React.ReactNode => {
    if (isCreatingAgent) {
      return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se Generează Agent
          </>
      );
    }

    if (isGeneratingPrompt) {
      return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se Generează Prompt
          </>
      );
    }

    return 'Generează Agent';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Agent Consultant AI</h1>
            <p className="text-muted-foreground">Creează automat un agent consultant pentru orice site web</p>
          </div>

          {/* Section 1: Generate Prompt */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5 text-accent" />
                Pas 1: Generează Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website-url" className="text-foreground">URL Site Web</Label>
                <Input
                  id="website-url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="prompt-aditional" className="text-foreground">Prompt Aditional</Label>
                <Input
                    id="prompt-aditional"
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="De exemplu: Atrage atentia ca in urmatoarele 3 luni avem reducere 30%"
                    className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="agent-name" className="text-foreground">Numele Agentului</Label>
                <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent Consultant Site"
                    className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="agent-language" className="text-foreground">Limba</Label>
                <Select value={agentLanguage} onValueChange={setAgentLanguage}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="voice-select" className="text-foreground">Vocea Agentului</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                  onClick={createAgent}
                  disabled={isCreatingAgent || isGeneratingPrompt || !websiteUrl || !agentName}
                  className="bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center"
              >
                {renderButtonContent()}
              </Button>
              {createdAgentId && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-accent font-medium">
                          ✅ Agent creat cu succes!
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ID Agent: {createdAgentId}
                        </p>
                      </div>
                      <Button
                          onClick={copyAgentIdToClipboard}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 border-accent/30 text-accent hover:bg-accent/10"
                      >
                        <Copy className="w-4 h-4" />
                        Copiază ID
                      </Button>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>
          {/* Section 3: Phone Call */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Phone className="w-5 h-5 text-accent" />
                Pas 2: Inițiază Apel Telefonic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-agent-id" className="text-foreground">ID Agent (opțional)</Label>
                <Input
                  id="custom-agent-id"
                  value={customAgentId}
                  onChange={(e) => setCustomAgentId(e.target.value)}
                  placeholder="agent_01xxx... (sau folosește agentul creat mai sus)"
                  className="glass-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Dacă nu completezi, se va folosi agentul creat în secțiunea de mai sus
                </p>
              </div>
              <div>
                <Label htmlFor="phone-number" className="text-foreground">Numărul de Telefon</Label>
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+40712345678"
                  className="glass-input"
                />
              </div>
              <Button 
                onClick={initiateCall}
                disabled={isInitiatingCall || (!createdAgentId && !customAgentId)}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isInitiatingCall && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Inițiază Apel
              </Button>
              <p className="text-sm text-muted-foreground">
                Agentul te va suna la numărul specificat și va funcționa ca un consultant pentru site-ul analizat.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentConsultant;

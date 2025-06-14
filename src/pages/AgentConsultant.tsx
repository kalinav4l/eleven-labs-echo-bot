
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
  const { user } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  // Agent creation form
  const [agentName, setAgentName] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');
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
    { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric (Romanian)' },
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (English)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (English)' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (English)' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (English)' }
  ];

  const generatePrompt = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un URL valid",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: {
          message: `Analizează următorul site web: ${websiteUrl}

Te rog să extragi informațiile principale despre compania/serviciile oferite și să creezi un prompt detaliat pentru un agent AI conversațional care va funcționa ca un consultant pentru această companie.

Promptul trebuie să includă:
1. Prezentarea companiei/serviciului
2. Principalele produse/servicii oferite
3. Avantajele competitive
4. Informații de contact și proceduri
5. Tonul de conversație (prietenos, profesional, etc.)
6. Instrucțiuni pentru răspunsurile la întrebări frecvente

Răspunde doar cu promptul final, fără explicații suplimentare.`,
          agentName: 'GPT-4 Consultant Generator'
        }
      });

      if (error) throw error;

      setGeneratedPrompt(data.response);
      setAgentPrompt(data.response); // Auto-populate agent prompt field
      toast({
        title: "Succes!",
        description: "Promptul a fost generat cu succes"
      });
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut genera promptul",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "Copiat!",
        description: "Promptul a fost copiat în clipboard"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut copia promptul",
        variant: "destructive"
      });
    }
  };

  const copyAgentId = async () => {
    if (!createdAgentId) return;
    
    try {
      await navigator.clipboard.writeText(createdAgentId);
      toast({
        title: "Copiat!",
        description: "ID-ul agentului a fost copiat în clipboard"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut copia ID-ul agentului",
        variant: "destructive"
      });
    }
  };

  const createAgent = async () => {
    if (!agentName.trim() || !agentPrompt.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele agentului și promptul",
        variant: "destructive"
      });
      return;
    }

setIsCreatingAgent(true);
try {
  const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
    method: "POST",
    headers: {
      "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "conversation_config": {
        "asr": {
          "language": "ro" // Aici adaugi limba. Poți folosi coduri ISO 639-1, de exemplu "en" pentru engleză, "ro" pentru română.
        },
        "turn": {},
        "tts": {},
        "conversation": {},
        "agent": {
          "prompt": {
            "prompt": agentPrompt
          }
        }
      },
      "name": agentName
    })
  });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating agent:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const agentData = await response.json();
      console.log('Agent created:', agentData);
      setCreatedAgentId(agentData.agent_id);

      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from('kalina_agents')
        .insert({
          agent_id: `agent_${Date.now()}`,
          elevenlabs_agent_id: agentData.agent_id,
          name: agentName,
          description: `Agent consultant generat automat pentru ${websiteUrl}`,
          system_prompt: agentPrompt,
          voice_id: selectedVoice,
          user_id: user.id
        });

      if (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
      }

      toast({
        title: "Succes!",
        description: `Agentul "${agentName}" a fost creat cu succes`
      });
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
                Pas 1: Generează Prompt din Site Web
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
              <Button 
                onClick={generatePrompt}
                disabled={isGeneratingPrompt}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isGeneratingPrompt && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generează Prompt
              </Button>
              {generatedPrompt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="generated-prompt" className="text-foreground">Prompt Generat</Label>
                    <Button
                      onClick={copyPrompt}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 glass-button"
                    >
                      <Copy className="w-4 h-4" />
                      Copiază
                    </Button>
                  </div>
                  <Textarea
                    id="generated-prompt"
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    rows={8}
                    className="glass-input"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Create Agent */}
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bot className="w-5 h-5 text-accent" />
                Pas 2: Creează Agentul AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="agent-prompt" className="text-foreground">Promptul Agentului</Label>
                <Textarea
                  id="agent-prompt"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="Introdu promptul pentru agent sau generează unul din secțiunea de mai sus..."
                  rows={6}
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
                disabled={isCreatingAgent || !agentPrompt}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {isCreatingAgent && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Creează Agent
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
                      onClick={copyAgentId}
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
                Pas 3: Inițiază Apel Telefonic
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

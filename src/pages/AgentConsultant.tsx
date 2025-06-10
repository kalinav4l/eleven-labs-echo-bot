
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
import { Loader2, Globe, Bot, Phone } from 'lucide-react';

const AgentConsultant = () => {
  const { user } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  // Agent creation form
  const [agentName, setAgentName] = useState('');
  const [agentLanguage, setAgentLanguage] = useState('ro');
  const [selectedVoice, setSelectedVoice] = useState('cjVigY5qzO86Huf0OWal');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState('');
  
  // Phone call section
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const createAgent = async () => {
    if (!agentName.trim() || !generatedPrompt.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele agentului și generează un prompt",
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
          conversation_config: {
            asr: {
              quality: "high",
              provider: "elevenlabs",
              user_input_audio_format: "",
              keywords: []
            },
            language_presets: {
              [agentLanguage]: true
            },
            turn: {
              turn_timeout: 7,
              silence_end_call_timeout: -1,
              mode: ""
            },
            tts: {
              model_id: "",
              voice_id: selectedVoice
            },
            conversation: {
              text_only: false,
              max_duration_seconds: 600,
              client_events: []
            },
            agent: {
              prompt: {
                prompt: generatedPrompt
              }
            }
          },
          name: agentName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const agentData = await response.json();
      setCreatedAgentId(agentData.agent_id);

      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from('kalina_agents')
        .insert({
          agent_id: `agent_${Date.now()}`,
          elevenlabs_agent_id: agentData.agent_id,
          name: agentName,
          description: `Agent consultant generat automat pentru ${websiteUrl}`,
          system_prompt: generatedPrompt,
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
    if (!createdAgentId || !phoneNumber.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog creează mai întâi un agent și introdu numărul de telefon",
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
          agent_id: createdAgentId,
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
      <div className="p-6 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Agent Consultant AI</h1>
            <p className="text-gray-600">Creează automat un agent consultant pentru orice site web</p>
          </div>

          {/* Section 1: Generate Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Pas 1: Generează Prompt din Site Web
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website-url">URL Site Web</Label>
                <Input
                  id="website-url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="border-gray-300"
                />
              </div>
              <Button 
                onClick={generatePrompt}
                disabled={isGeneratingPrompt}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isGeneratingPrompt && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generează Prompt
              </Button>
              {generatedPrompt && (
                <div>
                  <Label htmlFor="generated-prompt">Prompt Generat</Label>
                  <Textarea
                    id="generated-prompt"
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    rows={8}
                    className="border-gray-300"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Create Agent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Pas 2: Creează Agentul AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Numele Agentului</Label>
                <Input
                  id="agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Agent Consultant Site"
                  className="border-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="agent-language">Limba</Label>
                <Select value={agentLanguage} onValueChange={setAgentLanguage}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ro">Română</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="voice-select">Vocea Agentului</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                disabled={isCreatingAgent || !generatedPrompt}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isCreatingAgent && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Creează Agent
              </Button>
              {createdAgentId && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800">
                    ✅ Agent creat cu succes! ID: {createdAgentId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Phone Call */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Pas 3: Inițiază Apel Telefonic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone-number">Numărul de Telefon</Label>
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+40712345678"
                  className="border-gray-300"
                />
              </div>
              <Button 
                onClick={initiateCall}
                disabled={isInitiatingCall || !createdAgentId}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isInitiatingCall && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Inițiază Apel
              </Button>
              <p className="text-sm text-gray-600">
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

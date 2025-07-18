import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { DEFAULT_VALUES, VOICES, LANGUAGES } from '../constants/constants';
import { usePromptGeneration } from '../hooks/usePromptGeneration';
import { useAgentCreation } from '../hooks/useAgentCreation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Globe, Bot, Copy, Wand2 } from 'lucide-react';

const AgentConsultant: React.FC = () => {
  const { user } = useAuth();

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentLanguage, setAgentLanguage] = useState<string>(DEFAULT_VALUES.LANGUAGE);
  const [selectedVoice, setSelectedVoice] = useState<string>(DEFAULT_VALUES.VOICE_ID);

  // Custom hooks
  const {
    generatePrompt,
    isGenerating: isGeneratingPrompt
  } = usePromptGeneration();
  
  const {
    isCreating: isCreatingAgent,
    createdAgentId,
    handleCreateAgent,
    handleCopyAgentId
  } = useAgentCreation({
    websiteUrl,
    additionalPrompt: '', // Nu mai folosim prompt adiţional
    agentName,
    agentLanguage,
    selectedVoice,
    generatePrompt: () => Promise.resolve(generatedPrompt)
  });

  // Authentication guard
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Handlers
  const handleGeneratePrompt = async () => {
    const prompt = await generatePrompt({
      websiteUrl,
      agentRole: '',
      additionalPrompt: ''
    });
    if (prompt) {
      setGeneratedPrompt(prompt);
    }
  };

  const handleCreateAgentWithPrompt = async () => {
    await handleCreateAgent();
  };

  const canGeneratePrompt = websiteUrl.trim() !== '';
  const canCreateAgent = websiteUrl.trim() !== '' && generatedPrompt.trim() !== '' && agentName.trim() !== '';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 my-[60px]">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Agent Consultant AI
            </h1>
            <p className="text-muted-foreground">
              Creează automat un agent consultant pentru orice site web
            </p>
          </div>

          {/* Combined Form */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pas 1: Configurare Website & Prompt */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="w-5 h-5 text-primary" />
                  Configurare Website & Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website-url" className="text-foreground font-medium">
                    URL Site Web *
                  </Label>
                  <Input
                    id="website-url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="generated-prompt" className="text-foreground font-medium">
                    Prompt Agent
                  </Label>
                  <Textarea
                    id="generated-prompt"
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    placeholder="Prompt-ul generat va apărea aici sau poți scrie unul manual..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleGeneratePrompt}
                  disabled={!canGeneratePrompt || isGeneratingPrompt}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isGeneratingPrompt ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Se Generează...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generează Prompt Automat
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Pas 2: Creare Agent */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bot className="w-5 h-5 text-primary" />
                  Configurare Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agent-name" className="text-foreground font-medium">
                    Numele Agentului *
                  </Label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent Consultant Site"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="agent-language" className="text-foreground font-medium">
                    Limba
                  </Label>
                  <Select value={agentLanguage} onValueChange={(value) => setAgentLanguage(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="voice-select" className="text-foreground font-medium">
                    Vocea Agentului
                  </Label>
                  <Select value={selectedVoice} onValueChange={(value) => setSelectedVoice(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICES.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateAgentWithPrompt}
                  disabled={!canCreateAgent || isCreatingAgent}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  size="lg"
                >
                  {isCreatingAgent ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Se Creează Agent...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Creează Agent
                    </>
                  )}
                </Button>

                {createdAgentId && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">
                          ✅ Agent creat cu succes!
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          ID Agent: {createdAgentId}
                        </p>
                      </div>
                      <Button
                        onClick={handleCopyAgentId}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiază
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>* Câmpurile marcate sunt obligatorii</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentConsultant;
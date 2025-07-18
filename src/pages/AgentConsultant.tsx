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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Globe, Bot, Copy, Wand2, Edit3 } from 'lucide-react';

const AgentConsultant: React.FC = () => {
  const { user } = useAuth();

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [promptMode, setPromptMode] = useState<'generate' | 'manual'>('generate');
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
  const shouldShowPromptField = promptMode === 'manual' || generatedPrompt;

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 md:p-6" style={{
        background: '#ffffff',
        minHeight: '100vh'
      }}>
        <div className="max-w-2xl mx-auto pt-16">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
              Agent Consultant AI
            </h1>
            <p className="text-gray-600 text-lg">
              Creează automat un agent consultant pentru orice site web
            </p>
          </div>

          {/* Main Form */}
          <div className="space-y-6">
            {/* Prompt Configuration Section */}
            <Card className="liquid-glass animate-slide-in-up">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                  Configurare Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black mb-3 block">Cum vrei să configurezi prompt-ul?</Label>
                  <RadioGroup 
                    value={promptMode} 
                    onValueChange={(value: 'generate' | 'manual') => setPromptMode(value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="generate" id="generate" className="border-gray-400 text-black" />
                      <Label htmlFor="generate" className="text-black cursor-pointer">
                        Generează automat din site
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" className="border-gray-400 text-black" />
                      <Label htmlFor="manual" className="text-black cursor-pointer">
                        Scriu eu prompt-ul
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {promptMode === 'generate' && (
                  <div className="space-y-4 animate-slide-in-up">
                    <div>
                      <Label className="text-black block mb-2">URL Site Web</Label>
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="glass-input text-black placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      onClick={handleGeneratePrompt}
                      disabled={!canGeneratePrompt || isGeneratingPrompt}
                      className="w-full glass-button text-black hover:text-black"
                      size="lg"
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Se generează...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generează Prompt Automat
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {shouldShowPromptField && (
                  <div className="animate-slide-in-up">
                    <Label className="text-black block mb-2">
                      {promptMode === 'generate' ? 'Prompt Generat' : 'Prompt Personalizat'}
                    </Label>
                    <Textarea
                      value={generatedPrompt}
                      onChange={(e) => setGeneratedPrompt(e.target.value)}
                      placeholder={
                        promptMode === 'generate' 
                          ? "Prompt-ul generat va apărea aici..." 
                          : "Scrie prompt-ul pentru agent aici..."
                      }
                      className="glass-input text-black placeholder:text-gray-400"
                      rows={5}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Configuration Section */}
            <Card className="liquid-glass animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-black">
                  <Bot className="w-5 h-5 text-gray-600" />
                  Configurare Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black block mb-2">Numele Agentului</Label>
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent Consultant Site"
                    className="glass-input text-black placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-black block mb-2">Limba</Label>
                  <Select value={agentLanguage} onValueChange={(value) => setAgentLanguage(value)}>
                    <SelectTrigger className="glass-input text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language.value} value={language.value} className="text-black">
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-black block mb-2">Vocea Agentului</Label>
                  <Select value={selectedVoice} onValueChange={(value) => setSelectedVoice(value)}>
                    <SelectTrigger className="glass-input text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {VOICES.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id} className="text-black">
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Create Agent Button */}
            <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <Button
                onClick={handleCreateAgentWithPrompt}
                disabled={!canCreateAgent || isCreatingAgent}
                className="w-full glass-button text-black hover:text-black text-lg h-14"
                size="lg"
              >
                {isCreatingAgent ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Se creează agentul...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    Creează Agent
                  </>
                )}
              </Button>
            </div>

            {/* Success Message */}
            {createdAgentId && (
              <Card className="liquid-glass border-gray-300 animate-slide-in-up">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black font-medium text-lg">
                        ✅ Agent creat cu succes!
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        ID Agent: {createdAgentId}
                      </p>
                    </div>
                    <Button
                      onClick={handleCopyAgentId}
                      variant="outline"
                      size="sm"
                      className="glass-button border-gray-300 text-black hover:text-black"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiază
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentConsultant;
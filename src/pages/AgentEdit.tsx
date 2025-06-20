import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, Save, Copy, Upload, FileText, Trash2, TestTube, Languages, Database, Plus } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG, VOICES, LANGUAGES, LANGUAGE_MAP } from '@/constants/constants';
import { agentService } from '@/services/AgentService';
import { AgentResponse } from '@/components/AgentResponse';
import AgentTestModal from '@/components/AgentTestModal';
import AdditionalLanguagesSection from '@/components/AdditionalLanguagesSection';
import MultilingualFirstMessageModal from '@/components/MultilingualFirstMessageModal';
import CreativitySelector from '@/components/CreativitySelector';
import { useEnhancedKnowledgeBase } from '@/hooks/useEnhancedKnowledgeBase';

interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

const AgentEdit = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<AgentResponse | null>(null);
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);
  const [isMultilingualModalOpen, setIsMultilingualModalOpen] = useState(false);
  const [multilingualMessages, setMultilingualMessages] = useState<Record<string, string>>({});
  const [selectedExistingDocId, setSelectedExistingDocId] = useState<string>('');

  // Enhanced Knowledge Base Hook
  const {
    documents,
    existingDocuments,
    selectedExistingDocuments,
    isUpdating: isUpdatingKnowledge,
    isLoadingExisting,
    loadExistingDocuments,
    addExistingDocument,
    addTextDocument,
    addFileDocument,
    removeDocument,
    updateAgentKnowledgeBase
  } = useEnhancedKnowledgeBase({ 
    agentId: agentId || '',
    onAgentRefresh: (refreshedAgentData) => {
      setAgentData(refreshedAgentData);
      // Update additional languages based on refreshed data
      const parsedAdditionalLanguages = parseAdditionalLanguagesFromResponse(refreshedAgentData);
      setAdditionalLanguages(parsedAdditionalLanguages);
    }
  });

  // Helper function to parse additional languages from AgentResponse
  const parseAdditionalLanguagesFromResponse = (agentResponse: AgentResponse): string[] => {
    const currentLanguage = agentResponse.conversation_config?.agent?.language;
    const languagePresets = agentResponse.conversation_config?.language_presets;
    if (!languagePresets) return [];

    // Extract language keys from language_presets, excluding the current language
    return Object.keys(languagePresets).filter(lang => lang !== currentLanguage);
  };

  // Remove current language from additional languages when it changes
  useEffect(() => {
    const currentLanguage = agentData?.conversation_config?.agent?.language;
    if (currentLanguage && additionalLanguages.includes(currentLanguage)) {
      setAdditionalLanguages(prev => prev.filter(lang => lang !== currentLanguage));
    }
  }, [agentData?.conversation_config?.agent?.language]);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!agentId) return;
      try {
        const data = await agentService.getAgent(agentId);
        setAgentData(data);

        // Parse additional languages from the AgentResponse
        const parsedAdditionalLanguages = parseAdditionalLanguagesFromResponse(data);
        setAdditionalLanguages(parsedAdditionalLanguages);
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast({
          title: "Eroare",
          description: "Nu s-a putut încărca informațiile agentului",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgentData();
  }, [agentId]);

  // Initialize multilingual messages when agent data loads
  useEffect(() => {
    if (agentData?.conversation_config?.agent?.multilingual_first_messages) {
      setMultilingualMessages(agentData.conversation_config.agent.multilingual_first_messages);
    } else if (agentData?.conversation_config?.agent?.first_message) {
      // Initialize with the current first message for the default language
      const defaultLanguage = agentData.conversation_config?.agent?.language || 'en';
      const currentMessages: Record<string, string> = {
        [defaultLanguage]: agentData.conversation_config.agent.first_message
      };

      // Add messages from language presets if they exist
      if (agentData.conversation_config?.language_presets) {
        Object.entries(agentData.conversation_config.language_presets).forEach(([languageId, preset]) => {
          if (preset.overrides?.agent?.first_message) {
            currentMessages[languageId] = preset.overrides.agent.first_message;
          } else if (preset.first_message_translation?.text) {
            currentMessages[languageId] = preset.first_message_translation.text;
          }
        });
      }
      setMultilingualMessages(currentMessages);
    }
  }, [agentData]);

  // Handle additional languages change - add empty messages for new languages
  const handleAdditionalLanguagesChange = (newLanguages: string[]) => {
    setAdditionalLanguages(newLanguages);
    
    // Add empty messages for new languages that don't exist in multilingualMessages
    const defaultLanguage = agentData?.conversation_config?.agent?.language || 'en';
    const updatedMessages = { ...multilingualMessages };
    
    // Add empty string for new languages
    newLanguages.forEach(language => {
      if (!updatedMessages[language]) {
        updatedMessages[language] = '';
      }
    });
    
    // Remove messages for languages that are no longer selected
    Object.keys(updatedMessages).forEach(language => {
      if (language !== defaultLanguage && !newLanguages.includes(language)) {
        delete updatedMessages[language];
      }
    });
    
    setMultilingualMessages(updatedMessages);
  };

  // Handle agent data refresh after multilingual modal saves
  const handleAgentDataRefresh = (refreshedAgentData: AgentResponse) => {
    setAgentData(refreshedAgentData);
    
    // Update additional languages based on refreshed data
    const parsedAdditionalLanguages = parseAdditionalLanguagesFromResponse(refreshedAgentData);
    setAdditionalLanguages(parsedAdditionalLanguages);
  };

  const getLanguageLabel = (languageId: string) => {
    return LANGUAGE_MAP[languageId as keyof typeof LANGUAGE_MAP] || languageId;
  };

  const handleSave = async () => {
    if (!agentId || !agentData) return;
    setIsSaving(true);
    try {
      const updatePayload = agentService.prepareUpdatePayload(agentData, multilingualMessages);
      await agentService.updateAgent(agentId, updatePayload);
      
      // Also update knowledge base if there are documents
      if (documents.length > 0) {
        await updateAgentKnowledgeBase(true); // true = should reload after save
      }
      
      toast({
        title: "Succes!",
        description: "Agentul a fost salvat cu succes. Pagina se va reîncărca."
      });
      
      // Reload the page after successful save
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva agentul",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await addFileDocument(file);
    if (success) {
      // Clear the input
      event.target.value = '';
    }
  };

  const addManualDocument = async () => {
    if (!newDocName.trim() || !newDocContent.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele și conținutul documentului.",
        variant: "destructive",
      });
      return;
    }

    const success = await addTextDocument(newDocName, newDocContent);
    if (success) {
      setNewDocName('');
      setNewDocContent('');
      setIsAddingDoc(false);
    }
  };

  const handleRemoveDocument = (id: string) => {
    removeDocument(id);
  };

  const handleUpdateKnowledgeBase = async () => {
    await updateAgentKnowledgeBase(false);
  };

  const handleAddExistingDocument = () => {
    if (!selectedExistingDocId) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un document.",
        variant: "destructive",
      });
      return;
    }

    addExistingDocument(selectedExistingDocId);
    setSelectedExistingDocId('');
  };

  const getAvailableExistingDocuments = () => {
    return existingDocuments.filter(doc => !selectedExistingDocuments.has(doc.id));
  };

  const handleMultilingualMessagesUpdate = (messages: Record<string, string>) => {
    setMultilingualMessages(messages);

    // Update the main first_message with the default language message
    const defaultLanguage = agentData?.conversation_config?.agent?.language || 'en';
    if (messages[defaultLanguage]) {
      setAgentData({
        ...agentData!,
        conversation_config: {
          ...agentData!.conversation_config,
          agent: {
            ...agentData!.conversation_config?.agent!,
            first_message: messages[defaultLanguage]
          }
        }
      });
    }
  };

  const openMultilingualModal = () => {
    const defaultLanguage = agentData?.conversation_config?.agent?.language || 'en';
    const currentMessage = agentData?.conversation_config?.agent?.first_message || '';

    // Initialize messages with current first message for default language
    const initialMessages = {
      ...multilingualMessages,
      [defaultLanguage]: currentMessage
    };
    setMultilingualMessages(initialMessages);
    setIsMultilingualModalOpen(true);
  };

  const handleCreativityChange = (temperature: number) => {
    setAgentData({
      ...agentData!,
      conversation_config: {
        ...agentData!.conversation_config,
        agent: {
          ...agentData!.conversation_config?.agent!,
          prompt: {
            ...agentData!.conversation_config?.agent?.prompt!,
            temperature: temperature
          }
        }
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Se încarcă agentul...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agentData) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Agentul nu a fost găsit</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 px-[240px] my-[60px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/account/kalina-agents')} className="glass-button border-border">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Editare Agent</h1>
                <p className="text-muted-foreground">Modifică setările agentului tău AI</p>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setIsTestModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testează Agent
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Informații Generale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="text-foreground">Numele Agentului</Label>
                <Input id="agent-name" value={agentData.name || ''} onChange={e => setAgentData({
                ...agentData,
                name: e.target.value
              })} className="glass-input" />
              </div>

              <div>
                <Label className="text-foreground">Agent ID</Label>
                <div className="flex items-center gap-2">
                  <Input value={agentData.agent_id || ''} readOnly className="glass-input bg-muted/50" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(agentData.agent_id)} className="glass-button border-border">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="voice-select" className="text-foreground">Voce</Label>
                <Select value={agentData.conversation_config?.tts?.voice_id || ''} onValueChange={value => setAgentData({
                ...agentData,
                conversation_config: {
                  ...agentData.conversation_config,
                  tts: {
                    ...agentData.conversation_config?.tts!,
                    voice_id: value
                  }
                }
              })}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Selectează vocea" />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map(voice => <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language-select" className="text-foreground">Limba</Label>
                <Select value={agentData.conversation_config?.agent?.language || ''} onValueChange={value => setAgentData({
                ...agentData,
                conversation_config: {
                  ...agentData.conversation_config,
                  agent: {
                    ...agentData.conversation_config?.agent!,
                    language: value
                  }
                }
              })}>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Selectează limba" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(language => <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <CreativitySelector value={agentData.conversation_config?.agent?.prompt?.temperature ?? 0.5} onChange={handleCreativityChange} />
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Prompt Sistem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Label htmlFor="system-prompt" className="text-foreground">Prompt</Label>
                <Textarea id="system-prompt" value={agentData.conversation_config?.agent?.prompt?.prompt || ''} onChange={e => setAgentData({
                ...agentData,
                conversation_config: {
                  ...agentData.conversation_config,
                  agent: {
                    ...agentData.conversation_config?.agent!,
                    prompt: {
                      ...agentData.conversation_config?.agent?.prompt!,
                      prompt: e.target.value
                    }
                  }
                }
              })} className="glass-input min-h-[300px] w-full" placeholder="Introdu prompt-ul pentru agent..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* First Message Section */}
        <Card className="liquid-glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Primul mesaj</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Primul mesaj pe care îl va spune agentul. Dacă este gol, agentul va aștepta ca utilizatorul să înceapă conversația.
                </p>
              </div>
              {additionalLanguages.length > 0 && (
                <Button 
                  onClick={openMultilingualModal} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <Languages className="w-4 h-4" />
                  Configurare multilingual
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="first-message" className="text-foreground">
                Mesaj
                {additionalLanguages.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (limba principală: {getLanguageLabel(agentData?.conversation_config?.agent?.language || 'en')})
                  </span>
                )}
              </Label>
              <Textarea 
                id="first-message" 
                value={agentData.conversation_config?.agent?.first_message || ''} 
                onChange={(e) => setAgentData({
                  ...agentData,
                  conversation_config: {
                    ...agentData.conversation_config,
                    agent: {
                      ...agentData.conversation_config?.agent!,
                      first_message: e.target.value
                    }
                  }
                })} 
                className="glass-input" 
                placeholder="e.g. Hello, how can I help you today?" 
              />
              {additionalLanguages.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Pentru configurarea mesajelor în limbile adiționale, folosește butonul "Configurare multilingual".
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Languages Section */}
        <AdditionalLanguagesSection 
          selectedLanguages={additionalLanguages} 
          onLanguagesChange={handleAdditionalLanguagesChange}
          currentLanguage={agentData.conversation_config?.agent?.language} 
        />

        {/* Enhanced Knowledge Base Section */}
        <Card className="liquid-glass">
          <CardHeader>
            <CardTitle className="text-foreground">Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">
              Oferă LLM-ului informații specifice domeniului pentru a-l ajuta să răspundă mai precis la întrebări.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Retrieval-Augmented Generation (RAG)</Label>
                <p className="text-xs text-muted-foreground">
                  RAG mărește dimensiunea maximă a Knowledge Base-ului agentului. Agentul va avea acces la informații relevante din Knowledge Base în timpul generării răspunsului.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExistingDocuments}
                  disabled={isLoadingExisting}
                  className="flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  {isLoadingExisting ? 'Se încarcă...' : 'Selectează documente existente'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAddingDoc(true)} className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Adaugă Manual
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Încarcă Document
                    </span>
                  </Button>
                  <input type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* Existing Documents Selection */}
            {existingDocuments.length > 0 && (
              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <Label className="text-foreground font-medium">Documente Existente în ElevenLabs</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedExistingDocId} 
                    onValueChange={setSelectedExistingDocId}
                  >
                    <SelectTrigger className="glass-input flex-1">
                      <SelectValue placeholder="Selectează un document existent" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {getAvailableExistingDocuments().map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} ({doc.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddExistingDocument}
                    disabled={!selectedExistingDocId}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă
                  </Button>
                </div>
              </div>
            )}

            {isAddingDoc && <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <Input value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Numele documentului" className="glass-input" />
                <Textarea value={newDocContent} onChange={e => setNewDocContent(e.target.value)} placeholder="Conținutul documentului..." className="glass-input min-h-[100px]" />
                <div className="flex gap-2">
                  <Button onClick={addManualDocument} size="sm">
                    Adaugă
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingDoc(false)}>
                    Anulează
                  </Button>
                </div>
              </div>}

            <div className="space-y-2">
              {documents.length === 0 ? <p className="text-muted-foreground text-sm text-center py-8">
                  Nu ai adăugat încă documente în Knowledge Base.
                  <br />
                  Adaugă documente pentru a îmbunătăți răspunsurile agentului.
                </p> : documents.map(doc => <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {doc.name} 
                        <span className="text-xs text-muted-foreground ml-2">
                          ({doc.type === 'existing' ? 'existent' : doc.type})
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Adăugat: {doc.uploadedAt.toLocaleDateString()}
                      </p>
                      {doc.content && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.content.length > 100 ? `${doc.content.substring(0, 100)}...` : doc.content}
                        </p>
                      )}
                      {doc.elevenLabsId && (
                        <p className="text-xs text-blue-600 mt-1">
                          ElevenLabs ID: {doc.elevenLabsId}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveDocument(doc.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>)}
            </div>

            {documents.length > 0 && <Button onClick={handleUpdateKnowledgeBase} disabled={isUpdatingKnowledge || !agentId} className="bg-accent text-white hover:bg-accent/90 w-full">
                {isUpdatingKnowledge ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Se Actualizează Knowledge Base pentru {agentId}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Actualizează Knowledge Base în ElevenLabs
                  </>
                )}
              </Button>}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/account/kalina-agents')} className="glass-button border-border">
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-white hover:bg-accent/90">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Se salvează și se reîncarcă...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvează
              </>
            )}
          </Button>
        </div>

        {/* Test Modal */}
        <AgentTestModal 
          agent={agentData} 
          isOpen={isTestModalOpen} 
          onClose={() => setIsTestModalOpen(false)} 
        />

        {/* Multilingual First Message Modal */}
        <MultilingualFirstMessageModal 
          isOpen={isMultilingualModalOpen} 
          onClose={() => setIsMultilingualModalOpen(false)} 
          defaultLanguage={agentData?.conversation_config?.agent?.language || 'en'} 
          additionalLanguages={additionalLanguages} 
          messages={multilingualMessages} 
          onMessagesUpdate={handleMultilingualMessagesUpdate}
          agentId={agentId}
          agentData={agentData}
          onAgentDataRefresh={handleAgentDataRefresh}
        />
      </div>
    </DashboardLayout>
  );
};

export default AgentEdit;

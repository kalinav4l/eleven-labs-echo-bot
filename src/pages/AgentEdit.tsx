import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, Save, Upload, FileText, Trash2, TestTube, Database, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AgentTestModal from '@/components/AgentTestModal';
import AdditionalLanguagesSection from '@/components/AdditionalLanguagesSection';
import MultilingualFirstMessageModal from '@/components/MultilingualFirstMessageModal';
import { useEnhancedKnowledgeBase } from '@/hooks/useEnhancedKnowledgeBase';
import AgentGeneralInfo from '@/components/agent/AgentGeneralInfo';
import AgentSystemPrompt from '@/components/agent/AgentSystemPrompt';
import AgentFirstMessage from '@/components/agent/AgentFirstMessage';
import {AgentResponse, LanguagePreset} from "@/types/dtos.ts";
import {ElevenLabsController} from "@/controllers/ElevenLabsController.ts";
import { supabase } from '@/integrations/supabase/client';

const AgentEdit = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  
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
    updateAgentKnowledgeBase,
    processAgentKnowledgeBase
  } = useEnhancedKnowledgeBase({ 
    agentId: agentId || '',
    onAgentRefresh: (refreshedAgentData) => {
      setAgentData(refreshedAgentData);
      const parsedAdditionalLanguages = parseAdditionalLanguagesFromResponse(refreshedAgentData);
      setAdditionalLanguages(parsedAdditionalLanguages);
    }
  });

  // Helper function to parse additional languages from AgentResponse
  const parseAdditionalLanguagesFromResponse = (agentResponse: AgentResponse): string[] => {
    const currentLanguage = agentResponse.conversation_config?.agent?.language;
    const languagePresets = agentResponse.conversation_config?.language_presets;
    if (!languagePresets) return [];

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
        const data = await ElevenLabsController.getAgent(agentId);
        setAgentData(data);

        const parsedAdditionalLanguages = parseAdditionalLanguagesFromResponse(data);
        setAdditionalLanguages(parsedAdditionalLanguages);

        processAgentKnowledgeBase(data);
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
  }, [agentId, processAgentKnowledgeBase]);

  // Initialize multilingual messages when agent data loads
    useEffect(() => {
        if (agentData?.conversation_config) {
            const defaultLanguage = agentData.conversation_config.agent?.language || 'en';
            const defaultFirstMessage = agentData.conversation_config.agent?.first_message || '';
            // Start with the default language and its first message
            const currentMessages: Record<string, string> = {
                [defaultLanguage]: defaultFirstMessage
            };

            // Add/override with language presets
            if (agentData.conversation_config.language_presets) {
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
    
    const defaultLanguage = agentData?.conversation_config?.agent?.language || 'en';
    const updatedMessages = { ...multilingualMessages };
    
    newLanguages.forEach(language => {
      if (!updatedMessages[language]) {
        updatedMessages[language] = '';
      }
    });
    
    Object.keys(updatedMessages).forEach(language => {
      if (language !== defaultLanguage && !newLanguages.includes(language)) {
        delete updatedMessages[language];
      }
    });
    
    setMultilingualMessages(updatedMessages);
  };

  const handleAgentDataRefresh = (refreshedAgentData: AgentResponse) => {
    setAgentData(refreshedAgentData);
    
    const parsedAdditionalLanguages = parseAdditionalLanguagesFromResponse(refreshedAgentData);
    setAdditionalLanguages(parsedAdditionalLanguages);
  };

  const handleSave = async () => {
    if (!agentId || !agentData) return;
    setIsSaving(true);
    try {
      const updatePayload = ElevenLabsController.prepareUpdatePayload(agentData, multilingualMessages);
      const data = await ElevenLabsController.updateAgent(agentId, updatePayload);
      handleAgentDataRefresh(data)
      
      // Update agent name in database if it was changed
      if (agentData.name) {
        const { error: updateError } = await supabase
          .from('kalina_agents')
          .update({ name: agentData.name })
          .eq('elevenlabs_agent_id', agentId);
        
        if (updateError) {
          console.error('Error updating agent name in database:', updateError);
        }
      }
      
      if (documents.length > 0) {
        await updateAgentKnowledgeBase(true);
      }
      
      toast({
        title: "Succes!",
        description: "Agentul a fost salvat cu succes. Pagina se va reîncărca."
      });
      
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
      const defaultLanguage = agentData?.conversation_config?.agent?.language || 'en';
      const defaultLanguageFirstMessage = messages[defaultLanguage];

      const sourceHash = JSON.stringify({
          firstMessage: defaultLanguageFirstMessage,
          language: defaultLanguage
      });

      const language_presets: { [key: string]: LanguagePreset } = Object.entries(messages)
          .filter(([lang]) => lang !== defaultLanguage)
          .reduce((acc, [lang, firstMessageText]) => {
              acc[lang] = {
                  overrides: {
                      agent: {
                          first_message: firstMessageText
                      }
                  },
                  first_message_translation: {
                      source_hash: sourceHash,
                      text: firstMessageText
                  }
              };
              return acc;
          }, {} as { [key: string]: LanguagePreset });

    if (messages[defaultLanguage]) {
      setAgentData({
        ...agentData!,
        conversation_config: {
          ...agentData!.conversation_config,
          agent: {
            ...agentData!.conversation_config?.agent,
            first_message: messages[defaultLanguage]
          },
          language_presets: language_presets
        }
      });
    }
  };

  const openMultilingualModal = () => {
    const defaultLanguage = agentData?.conversation_config?.agent?.language || 'en';
    const currentMessage = agentData?.conversation_config?.agent?.first_message || '';

    const initialMessages = {
      ...multilingualMessages,
      [defaultLanguage]: currentMessage
    };
    setMultilingualMessages(initialMessages);
    setIsMultilingualModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6 space-y-6">
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
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-muted-foreground">Agentul nu a fost găsit</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 lg:px-[240px] lg:my-[60px]">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
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
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Editare Agent</h1>
                <p className="text-sm text-muted-foreground">Modifică setările agentului tău AI</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsTestModalOpen(true)} 
            className="bg-accent text-white hover:bg-accent/90 border border-accent/20 shadow-md flex items-center gap-2 w-full lg:w-auto transition-all duration-200"
          >
            <TestTube className="w-4 h-4" />
            Testează Agent
          </Button>
        </div>

        {/* Main Content - Mobile optimized grid */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {/* General Information */}
          <AgentGeneralInfo agentData={agentData} setAgentData={setAgentData} />

          {/* System Prompt */}
          <AgentSystemPrompt agentData={agentData} setAgentData={setAgentData} />
        </div>

        {/* First Message Section - Mobile optimized */}
        <AgentFirstMessage 
          agentData={agentData} 
          setAgentData={setAgentData} 
          additionalLanguages={additionalLanguages}
          onOpenMultilingualModal={openMultilingualModal}
        />

        {/* Additional Languages Section */}
        <AdditionalLanguagesSection 
          selectedLanguages={additionalLanguages} 
          onLanguagesChange={handleAdditionalLanguagesChange}
          currentLanguage={agentData.conversation_config?.agent?.language} 
        />

        {/* Enhanced Knowledge Base Section - Mobile optimized */}
        <Card className="liquid-glass">
          <CardHeader>
            <CardTitle className="text-foreground">Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">
              Oferă LLM-ului informații specifice domeniului pentru a-l ajuta să răspundă mai precis la întrebări.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-foreground font-medium">Retrieval-Augmented Generation (RAG)</Label>
                <p className="text-xs text-muted-foreground">
                  RAG mărește dimensiunea maximă a Knowledge Base-ului agentului. Agentul va avea acces la informații relevante din Knowledge Base în timpul generării răspunsului.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExistingDocuments}
                  disabled={isLoadingExisting}
                  className="flex items-center justify-center gap-2 h-12 hover:bg-accent/5 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isLoadingExisting ? 'Se încarcă...' : 'Selectează existente'}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingDoc(true)} 
                  className="flex items-center justify-center gap-2 h-12 hover:bg-accent/5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Adaugă Manual</span>
                </Button>
                
                <label className="cursor-pointer">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-2 w-full h-12 hover:bg-accent/5 transition-colors" 
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Încarcă Document</span>
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
                <div className="flex flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0">
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
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Document Addition - Mobile optimized */}
            {isAddingDoc && (
              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <Input value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Numele documentului" className="glass-input" />
                <Textarea value={newDocContent} onChange={e => setNewDocContent(e.target.value)} placeholder="Conținutul documentului..." className="glass-input min-h-[100px]" />
                <div className="flex flex-col space-y-2 sm:flex-row sm:gap-2 sm:space-y-0">
                  <Button onClick={addManualDocument} size="sm" className="w-full sm:w-auto">
                    Adaugă
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingDoc(false)} className="w-full sm:w-auto">
                    Anulează
                  </Button>
                </div>
              </div>
            )}

            {/* Documents List - Mobile optimized */}
            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nu ai adăugat încă documente în Knowledge Base.
                  <br />
                  Adaugă documente pentru a îmbunătăți răspunsurile agentului.
                </p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {doc.name} 
                        <span className="text-xs text-muted-foreground ml-2">
                          ({doc.type === 'existing' ? 'existent' : doc.type})
                        </span>
                      </h4>
                        <p className="text-xs text-blue-600 mt-1">
                          ElevenLabs ID: {doc.elevenLabsId}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveDocument(doc.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {documents.length > 0 && (
              <Button onClick={handleUpdateKnowledgeBase} disabled={isUpdatingKnowledge || !agentId} className="bg-accent text-white hover:bg-accent/90 w-full">
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
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Bottom Action Buttons - Mobile optimized */}
        <div className="flex flex-col space-y-2 lg:flex-row lg:justify-end lg:gap-4 lg:space-y-0 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => navigate('/account/kalina-agents')} 
            className="glass-button border-border w-full lg:w-auto hover:bg-muted/50 transition-colors"
            disabled={isSaving}
          >
            Anulează
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-accent text-white hover:bg-accent/90 w-full lg:w-auto transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Se salvează...
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

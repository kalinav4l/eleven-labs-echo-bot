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
import AgentToolConnection from '@/components/agent/AgentToolConnection';
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
  }, [agentId]);

  // Initialize multilingual messages when agentData changes
  useEffect(() => {
    if (agentData) {
      const languagePresets = agentData.conversation_config?.language_presets;
      if (languagePresets) {
        const messages: Record<string, string> = {};
        Object.entries(languagePresets).forEach(([lang, preset]) => {
          if (typeof preset === 'object' && preset !== null && 'first_message' in preset) {
            messages[lang] = (preset as LanguagePreset).first_message || '';
          }
        });
        setMultilingualMessages(messages);
      }
    }
  }, [agentData]);

  const handleAdditionalLanguagesChange = (newLanguages: string[]) => {
    setAdditionalLanguages(newLanguages);
    
    // Initialize multilingual messages for new languages
    const updatedMessages = { ...multilingualMessages };
    newLanguages.forEach(lang => {
      if (!updatedMessages[lang]) {
        updatedMessages[lang] = '';
      }
    });
    
    // Remove messages for languages that are no longer selected
    Object.keys(updatedMessages).forEach(lang => {
      if (!newLanguages.includes(lang) && lang !== agentData?.conversation_config?.agent?.language) {
        delete updatedMessages[lang];
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
    if (!agentData || !agentId) return;

    setIsSaving(true);
    try {
      await ElevenLabsController.updateAgent(agentId, agentData);

      // Update agent name in database if it has changed
      if (agentData.conversation_config?.agent?.name) {
        const { error } = await supabase
          .from('user_agents')
          .update({ 
            agent_name: agentData.conversation_config.agent.name 
          })
          .eq('agent_id', agentId);

        if (error) {
          console.error('Error updating agent name in database:', error);
        }
      }

      toast({
        title: "Succes",
        description: "Agentul a fost salvat cu succes!"
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

  const handleMultilingualMessagesUpdate = (messages: Record<string, string>) => {
    setMultilingualMessages(messages);
    if (agentData) {
      const updatedAgentData = { ...agentData };
      const languagePresets = updatedAgentData.conversation_config?.language_presets || {};
      
      Object.entries(messages).forEach(([lang, message]) => {
        if (languagePresets[lang]) {
          languagePresets[lang].first_message = message;
        }
      });
      
      if (updatedAgentData.conversation_config) {
        updatedAgentData.conversation_config.language_presets = languagePresets;
      }
      
      setAgentData(updatedAgentData);
    }
  };

  const openMultilingualModal = () => {
    setIsMultilingualModalOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await addFileDocument(file);
      event.target.value = '';
      toast({
        title: "Succes",
        description: "Documentul a fost încărcat cu succes!"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut încărca documentul",
        variant: "destructive"
      });
    }
  };

  const addManualDocument = async () => {
    if (!newDocName.trim() || !newDocContent.trim()) {
      toast({
        title: "Eroare",
        description: "Numele și conținutul documentului sunt obligatorii",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingDoc(true);
      await addTextDocument(newDocName, newDocContent);
      setNewDocName('');
      setNewDocContent('');
      toast({
        title: "Succes", 
        description: "Documentul a fost adăugat cu succes!"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga documentul",
        variant: "destructive"
      });
    } finally {
      setIsAddingDoc(false);
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    try {
      await removeDocument(docId);
      toast({
        title: "Succes",
        description: "Documentul a fost eliminat cu succes!"
      });
    } catch (error) {
      toast({
        title: "Eroare", 
        description: "Nu s-a putut elimina documentul",
        variant: "destructive"
      });
    }
  };

  const handleAddExistingDocument = async () => {
    if (!selectedExistingDocId) {
      toast({
        title: "Eroare",
        description: "Selectează un document din listă",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addExistingDocument(selectedExistingDocId);
      setSelectedExistingDocId('');
      toast({
        title: "Succes",
        description: "Documentul a fost adăugat cu succes!"
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga documentul",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Se încarcă agentul...</h2>
              <p className="text-muted-foreground">Vă rugăm să așteptați</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agentData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Agent negăsit</h2>
              <p className="text-muted-foreground">Agentul specificat nu a putut fi găsit</p>
              <Button 
                onClick={() => navigate('/account/agents')} 
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Agenți
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/account/agents')}
                className="shrink-0 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  Editare Agent
                </h1>
                <p className="text-muted-foreground text-sm">
                  Personalizează comportamentul și configurația agentului tău AI
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsTestModalOpen(true)}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Testează Agent
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Se salvează...' : 'Salvează'}
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Information */}
              <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    Informații Generale
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AgentGeneralInfo agentData={agentData} setAgentData={setAgentData} />
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-5 h-5 bg-secondary/20 rounded flex items-center justify-center">
                      <FileText className="w-3 h-3 text-secondary-foreground" />
                    </div>
                    Prompt Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AgentSystemPrompt agentData={agentData} setAgentData={setAgentData} />
                </CardContent>
              </Card>

              {/* First Message */}
              <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-5 h-5 bg-accent/20 rounded flex items-center justify-center">
                      <Bot className="w-3 h-3 text-accent-foreground" />
                    </div>
                    Primul Mesaj
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AgentFirstMessage 
                    agentData={agentData} 
                    setAgentData={setAgentData}
                    onOpenMultilingualModal={openMultilingualModal}
                    hasAdditionalLanguages={additionalLanguages.length > 0}
                  />
                </CardContent>
              </Card>

              {/* Additional Languages */}
              <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
                      <Bot className="w-3 h-3 text-blue-600" />
                    </div>
                    Limbi Adiționale
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <AdditionalLanguagesSection
                    agentData={agentData}
                    setAgentData={setAgentData}
                    additionalLanguages={additionalLanguages}
                    onAdditionalLanguagesChange={handleAdditionalLanguagesChange}
                    onAgentDataRefresh={handleAgentDataRefresh}
                  />
                </CardContent>
              </Card>

              {/* Tool Connection */}
              <div className="space-y-6">
                <AgentToolConnection 
                  agentData={agentData} 
                  setAgentData={setAgentData} 
                />
              </div>
            </div>

            {/* Knowledge Base Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center">
                      <Database className="w-3 h-3 text-green-600" />
                    </div>
                    Baza de Cunoștințe
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Upload Document */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Încarcă Document
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Selectează un fișier pentru a-l adăuga la baza de cunoștințe
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Selectează Fișier
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {/* Add Manual Document */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Adaugă Document Manual
                    </Label>
                    <div className="space-y-3">
                      <Input
                        placeholder="Numele documentului"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="bg-muted/30"
                      />
                      <Textarea
                        placeholder="Conținutul documentului..."
                        value={newDocContent}
                        onChange={(e) => setNewDocContent(e.target.value)}
                        className="min-h-[100px] bg-muted/30"
                      />
                      <Button 
                        onClick={addManualDocument}
                        disabled={isAddingDoc || !newDocName.trim() || !newDocContent.trim()}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {isAddingDoc ? 'Se adaugă...' : 'Adaugă Document'}
                      </Button>
                    </div>
                  </div>

                  {/* Add Existing Document */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Folosește Document Existent
                    </Label>
                    <div className="space-y-3">
                      <Select
                        value={selectedExistingDocId}
                        onValueChange={setSelectedExistingDocId}
                      >
                        <SelectTrigger className="bg-muted/30">
                          <SelectValue placeholder="Selectează document existent" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingDocuments.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddExistingDocument}
                        disabled={!selectedExistingDocId}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adaugă Document
                      </Button>
                    </div>
                  </div>

                  {/* Current Documents */}
                  {documents.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">
                        Documente Curente ({documents.length})
                      </Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {documents.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground truncate">
                                {doc.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive/20 shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Update Knowledge Base */}
                  <Button
                    onClick={() => updateAgentKnowledgeBase(agentData)}
                    disabled={isUpdatingKnowledge || documents.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {isUpdatingKnowledge ? 'Se actualizează...' : 'Actualizează Baza de Cunoștințe'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AgentTestModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          agentId={agentId || ''}
        />

        <MultilingualFirstMessageModal
          isOpen={isMultilingualModalOpen}
          onClose={() => setIsMultilingualModalOpen(false)}
          languages={additionalLanguages}
          messages={multilingualMessages}
          onMessagesUpdate={handleMultilingualMessagesUpdate}
        />
      </div>
    </DashboardLayout>
  );
};

export default AgentEdit;
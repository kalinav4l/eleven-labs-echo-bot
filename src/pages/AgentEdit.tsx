import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, Save, Copy, Upload, FileText, Trash2, TestTube } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG, VOICES, LANGUAGES } from '@/constants/constants';
import AgentTestModal from '@/components/AgentTestModal';
import AdditionalLanguagesSection from '@/components/AdditionalLanguagesSection';

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
  const [agentData, setAgentData] = useState<any>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [isUpdatingKnowledge, setIsUpdatingKnowledge] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);

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
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
          method: 'GET',
          headers: {
            'Xi-Api-Key': API_CONFIG.ELEVENLABS_API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAgentData(data);
        } else {
          toast({
            title: "Eroare",
            description: "Nu s-a putut încărca informațiile agentului",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast({
          title: "Eroare",
          description: "A apărut o eroare la încărcarea agentului",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [agentId]);

  const handleSave = async () => {
    if (!agentId || !agentData) return;

    setIsSaving(true);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Xi-Api-Key': API_CONFIG.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agentData.name,
          conversation_config: agentData.conversation_config,
        }),
      });

      if (response.ok) {
        toast({
          title: "Succes!",
          description: "Agentul a fost salvat cu succes",
        });
      } else {
        throw new Error('Failed to save agent');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva agentul",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newDoc: KnowledgeDocument = {
        id: Date.now().toString(),
        name: file.name,
        content,
        uploadedAt: new Date(),
      };
      setDocuments(prev => [...prev, newDoc]);
      toast({
        title: "Succes!",
        description: `Documentul "${file.name}" a fost încărcat cu succes.`,
      });
    };
    reader.readAsText(file);
  };

  const addManualDocument = () => {
    if (!newDocName.trim() || !newDocContent.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele și conținutul documentului.",
        variant: "destructive",
      });
      return;
    }

    const newDoc: KnowledgeDocument = {
      id: Date.now().toString(),
      name: newDocName,
      content: newDocContent,
      uploadedAt: new Date(),
    };
    setDocuments(prev => [...prev, newDoc]);
    setNewDocName('');
    setNewDocContent('');
    setIsAddingDoc(false);
    
    toast({
      title: "Succes!",
      description: `Documentul "${newDocName}" a fost adăugat cu succes.`,
    });
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Succes!",
      description: "Documentul a fost șters.",
    });
  };

  const updateKnowledgeBase = async () => {
    if (!agentId || documents.length === 0) {
      toast({
        title: "Eroare",
        description: "Nu ai adăugat documente pentru actualizarea Knowledge Base.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingKnowledge(true);

    try {
      const knowledgeBase = documents.map(doc => ({
        name: doc.name,
        content: doc.content
      }));

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Xi-Api-Key": API_CONFIG.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "conversation_config": {
            "agent": {
              "prompt": {
                "knowledge_base": knowledgeBase
              }
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();
      console.log('Agent updated:', body);

      toast({
        title: "Succes!",
        description: "Knowledge Base-ul a fost actualizat cu succes în ElevenLabs.",
      });

    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Eroare",
        description: `A apărut o eroare la actualizarea agentului ${agentId}. Te rog verifică ID-ul agentului.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingKnowledge(false);
    }
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/account/kalina-agents')}
              className="glass-button border-border"
            >
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
          
          {/* Test Agent Button */}
          <Button
            onClick={() => setIsTestModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Testează Agent
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Informații Generale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="text-foreground">Numele Agentului</Label>
                <Input
                  id="agent-name"
                  value={agentData.name || ''}
                  onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <Label className="text-foreground">Agent ID</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={agentData.agent_id || ''}
                    readOnly
                    className="glass-input bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(agentData.agent_id)}
                    className="glass-button border-border"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="voice-select" className="text-foreground">Voce</Label>
                <Select
                  value={agentData.conversation_config?.tts?.voice_id || ''}
                  onValueChange={(value) => setAgentData({
                    ...agentData,
                    conversation_config: {
                      ...agentData.conversation_config,
                      tts: {
                        ...agentData.conversation_config?.tts,
                        voice_id: value
                      }
                    }
                  })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Selectează vocea" />
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

              <div>
                <Label htmlFor="language-select" className="text-foreground">Limba</Label>
                <Select
                  value={agentData.conversation_config?.agent?.language || ''}
                  onValueChange={(value) => setAgentData({
                    ...agentData,
                    conversation_config: {
                      ...agentData.conversation_config,
                      agent: {
                        ...agentData.conversation_config?.agent,
                        language: value
                      }
                    }
                  })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Selectează limba" />
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
            </CardContent>
          </Card>

          <Card className="liquid-glass">
            <CardHeader>
              <CardTitle className="text-foreground">Prompt Sistem</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="system-prompt" className="text-foreground">Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={agentData.conversation_config?.agent?.prompt?.prompt || ''}
                  onChange={(e) => setAgentData({
                    ...agentData,
                    conversation_config: {
                      ...agentData.conversation_config,
                      agent: {
                        ...agentData.conversation_config?.agent,
                        prompt: {
                          ...agentData.conversation_config?.agent?.prompt,
                          prompt: e.target.value
                        }
                      }
                    }
                  })}
                  className="glass-input min-h-[300px]"
                  placeholder="Introdu prompt-ul pentru agent..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Languages Section */}
        <AdditionalLanguagesSection
          selectedLanguages={additionalLanguages}
          onLanguagesChange={setAdditionalLanguages}
          currentLanguage={agentData.conversation_config?.agent?.language}
        />

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
                  onClick={() => setIsAddingDoc(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Adaugă Manual
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4" />
                      Încarcă Document
                    </span>
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            {isAddingDoc && (
              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <Input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Numele documentului"
                  className="glass-input"
                />
                <Textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Conținutul documentului..."
                  className="glass-input min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button onClick={addManualDocument} size="sm">
                    Adaugă
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddingDoc(false)}
                  >
                    Anulează
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Nu ai adăugat încă documente în Knowledge Base.
                  <br />
                  Adaugă documente pentru a îmbunătăți răspunsurile agentului.
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Adăugat: {doc.uploadedAt.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.content.length > 100 
                          ? `${doc.content.substring(0, 100)}...` 
                          : doc.content}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {documents.length > 0 && (
              <Button
                onClick={updateKnowledgeBase}
                disabled={isUpdatingKnowledge}
                className="bg-accent text-white hover:bg-accent/90 w-full"
              >
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

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/account/kalina-agents')}
            className="glass-button border-border"
          >
            Anulează
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-accent text-white hover:bg-accent/90"
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
      </div>
    </DashboardLayout>
  );
};

export default AgentEdit;

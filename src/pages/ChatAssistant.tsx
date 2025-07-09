import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Settings, 
  Upload, 
  FileText, 
  Trash2, 
  Plus, 
  Save,
  ChevronDown,
  Brain
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLocalKnowledgeBase, LocalAgent, LocalDocument } from '@/hooks/useLocalKnowledgeBase';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

// Modelele GPT disponibile
const GPT_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recomandată)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rapidă)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const ChatAssistant = () => {
  const { user } = useAuth();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Bună! Sunt asistentul tău AI. Pot răspunde la întrebări bazându-mă pe documentația și informațiile din baza ta de cunoștințe. Cu ce te pot ajuta?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  
  // Agent creation/editing state
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentSystemPrompt, setAgentSystemPrompt] = useState('');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  
  // Knowledge base state
  const [textDocumentName, setTextDocumentName] = useState('');
  const [textDocumentContent, setTextDocumentContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Local knowledge base hook
  const {
    documents,
    agents: localAgents,
    isLoading: isKnowledgeLoading,
    addTextDocument,
    addFileDocument,
    removeDocument,
    loadUserDocuments,
    createAgent,
    updateAgent,
    deleteAgent,
    loadUserAgents,
    linkDocumentToAgent,
    unlinkDocumentFromAgent,
    getAgentDocuments
  } = useLocalKnowledgeBase();

  // Convert LocalAgent to Agent for compatibility
  const agents = localAgents.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || '',
    systemPrompt: agent.system_prompt || ''
  }));
  
  // Convert selectedAgent to LocalAgent when needed
  const selectedLocalAgent = selectedAgent ? localAgents.find(a => a.id === selectedAgent.id) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadUserDocuments();
    loadUserAgents();
  }, [loadUserDocuments, loadUserAgents]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-agent', {
        body: {
          message: userMessage.content,
          userId: user?.id,
          model: selectedModel,
          agentId: selectedAgent?.id,
          systemPrompt: selectedAgent?.systemPrompt
        }
      });

      if (error) {
        throw error;
      }

      let responseContent = data.response || 'Îmi pare rău, nu am putut procesa cererea ta.';
      
      // Adaugă informații despre sursa răspunsului pentru transparență
      if (data.contextFound && data.chunksUsed > 0) {
        responseContent += `\n\n_Răspuns bazat pe ${data.chunksUsed} fragmente din documentele tale încărcate._`;
      } else if (selectedAgent && !data.contextFound) {
        responseContent += `\n\n_Nu am găsit informații relevante în documentele încărcate pentru această întrebare._`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite mesajul. Te rog încearcă din nou.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Îmi pare rău, a apărut o eroare. Te rog încearcă din nou.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Agent management functions
  const handleCreateAgent = async () => {
    if (!agentName.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un nume pentru agent.",
        variant: "destructive",
      });
      return;
    }

    const newAgent = await createAgent(agentName, agentDescription, agentSystemPrompt || 'Ești un asistent AI util și prietenos.');
    if (newAgent) {
      setSelectedAgent({
        id: newAgent.id,
        name: newAgent.name,
        description: newAgent.description || '',
        systemPrompt: newAgent.system_prompt || ''
      });
      
      // Reset form
      setAgentName('');
      setAgentDescription('');
      setAgentSystemPrompt('');
      setShowAgentConfig(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setAgentName(agent.name);
    setAgentDescription(agent.description);
    setAgentSystemPrompt(agent.systemPrompt);
    setShowAgentConfig(true);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !agentName.trim()) return;

    const success = await updateAgent(editingAgent.id, agentName, agentDescription, agentSystemPrompt);
    if (success) {
      const updatedAgent: Agent = {
        ...editingAgent,
        name: agentName,
        description: agentDescription,
        systemPrompt: agentSystemPrompt
      };
      
      if (selectedAgent?.id === editingAgent.id) {
        setSelectedAgent(updatedAgent);
      }

      // Reset form
      setEditingAgent(null);
      setAgentName('');
      setAgentDescription('');
      setAgentSystemPrompt('');
      setShowAgentConfig(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    const success = await deleteAgent(agentId);
    if (success && selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
  };

  // Knowledge base functions
  const handleAddTextDocument = async () => {
    if (!textDocumentName.trim() || !textDocumentContent.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele și conținutul documentului.",
        variant: "destructive",
      });
      return;
    }

    const success = await addTextDocument(textDocumentName, textDocumentContent);
    if (success) {
      setTextDocumentName('');
      setTextDocumentContent('');
      
      // Link document to selected agent if available
      if (selectedAgent && documents.length > 0) {
        const newDocument = documents[documents.length - 1];
        await linkDocumentToAgent(selectedAgent.id, newDocument.id);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un fișier.",
        variant: "destructive",
      });
      return;
    }

    const success = await addFileDocument(uploadFile);
    if (success) {
      setUploadFile(null);
      
      // Link document to selected agent if available
      if (selectedAgent && documents.length > 0) {
        const newDocument = documents[documents.length - 1];
        await linkDocumentToAgent(selectedAgent.id, newDocument.id);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Configuration Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Model Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Model GPT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează modelul" />
                  </SelectTrigger>
                  <SelectContent>
                    {GPT_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Agent Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select 
                  value={selectedAgent?.id || ''} 
                  onValueChange={(value) => {
                    const agent = agents.find(a => a.id === value);
                    setSelectedAgent(agent || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedAgent && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Agent selectat:</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditAgent(selectedAgent)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAgent(selectedAgent.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
                  </div>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAgentConfig(true)}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {editingAgent ? 'Editează Agent' : 'Creează Agent'}
                </Button>
              </CardContent>
            </Card>

            {/* Agent Configuration */}
            {showAgentConfig && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {editingAgent ? 'Editează Agent' : 'Creează Agent Nou'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="agentName">Nume Agent</Label>
                    <Input
                      id="agentName"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="Numele agentului"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="agentDescription">Descriere</Label>
                    <Input
                      id="agentDescription"
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Descrierea agentului"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="agentPrompt">System Prompt</Label>
                    <Textarea
                      id="agentPrompt"
                      value={agentSystemPrompt}
                      onChange={(e) => setAgentSystemPrompt(e.target.value)}
                      placeholder="Instrucțiuni pentru agent..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                      className="flex-1"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {editingAgent ? 'Actualizează' : 'Creează'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAgentConfig(false);
                        setEditingAgent(null);
                        setAgentName('');
                        setAgentDescription('');
                        setAgentSystemPrompt('');
                      }}
                    >
                      Anulează
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Knowledge Base Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Add Text Document */}
                <div className="space-y-2">
                  <Label className="text-xs">Adaugă Document Text</Label>
                  <Input
                    value={textDocumentName}
                    onChange={(e) => setTextDocumentName(e.target.value)}
                    placeholder="Numele documentului"
                  />
                  <Textarea
                    value={textDocumentContent}
                    onChange={(e) => setTextDocumentContent(e.target.value)}
                    placeholder="Conținutul documentului..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTextDocument}
                    disabled={!textDocumentName.trim() || !textDocumentContent.trim()}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adaugă Text
                  </Button>
                </div>

                <Separator />

                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-xs">Upload Fișier</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.docx"
                  />
                  {uploadFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground truncate">
                        {uploadFile.name}
                      </span>
                      <Button
                        size="sm"
                        onClick={handleFileUpload}
                        disabled={isKnowledgeLoading}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Documents List */}
                <div className="space-y-2">
                  <Label className="text-xs">Documente Curente</Label>
                  <ScrollArea className="max-h-40">
                    <div className="space-y-1">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                          <span className="truncate">{doc.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {documents.length === 0 && (
                        <p className="text-xs text-muted-foreground">Nu sunt documente încărcate</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>Asistent AI - Chat cu RAG</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedAgent 
                          ? `Conversație RAG cu ${selectedAgent.name} - răspunsuri bazate pe documentele încărcate` 
                          : 'Creează un agent și încarcă documente pentru răspunsuri specifice bazate pe conținutul tău'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedModel}</Badge>
                    {selectedAgent && (
                      <Badge variant="outline">{selectedAgent.name}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-120px)]">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.type === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className={`flex flex-col max-w-[70%] ${
                          message.type === 'user' ? 'items-end' : 'items-start'
                        }`}>
                          <div className={`p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Gândesc...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="flex gap-2 mt-4">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedAgent ? `Scrie un mesaj pentru ${selectedAgent.name}...` : "Scrie mesajul tău aici..."}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatAssistant;
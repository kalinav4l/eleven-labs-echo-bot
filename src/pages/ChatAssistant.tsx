import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLocalKnowledgeBase } from '@/hooks/useLocalKnowledgeBase';
import { AgentConfiguration } from '@/components/chat/AgentConfiguration';
import { KnowledgeBaseManagement } from '@/components/chat/KnowledgeBaseManagement';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ModelSelection } from '@/components/chat/ModelSelection';

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

  // Configuration state
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  
  // Local knowledge base hook
  const {
    documents,
    agents: localAgents,
    addTextDocument,
    removeDocument,
    loadUserDocuments,
    createAgent,
    updateAgent,
    deleteAgent,
    loadUserAgents,
    linkDocumentToAgent,
  } = useLocalKnowledgeBase();

  // Convert LocalAgent to Agent for compatibility
  const agents = localAgents.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || '',
    systemPrompt: agent.system_prompt || ''
  }));

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

  // Agent management functions
  const handleAgentCreate = async (name: string, description: string, systemPrompt: string) => {
    const newAgent = await createAgent(name, description, systemPrompt || 'Ești un asistent AI util și prietenos.');
    if (newAgent) {
      const agentData = {
        id: newAgent.id,
        name: newAgent.name,
        description: newAgent.description || '',
        systemPrompt: newAgent.system_prompt || ''
      };
      setSelectedAgent(agentData);
    }
  };

  const handleAgentUpdate = async (id: string, name: string, description: string, systemPrompt: string) => {
    const success = await updateAgent(id, name, description, systemPrompt);
    if (success) {
      const updatedAgent: Agent = {
        id,
        name,
        description,
        systemPrompt
      };
      
      if (selectedAgent?.id === id) {
        setSelectedAgent(updatedAgent);
      }
    }
  };

  const handleAgentDelete = async (agentId: string) => {
    const success = await deleteAgent(agentId);
    if (success && selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
  };

  // Knowledge base functions
  const handleTextDocumentAdd = async (name: string, content: string) => {
    const success = await addTextDocument(name, content);
    if (success && selectedAgent) {
      // Link document to selected agent if available
      setTimeout(async () => {
        await loadUserDocuments();
        const latestDoc = documents[0]; // Cel mai recent document
        if (latestDoc) {
          await linkDocumentToAgent(selectedAgent.id, latestDoc.id);
          toast({
            title: "Document legat",
            description: `Documentul a fost legat la agentul ${selectedAgent.name}`,
          });
        }
      }, 1000);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedAgent) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un agent înainte de a încărca un document.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsProcessingDocument(true);
    toast({
      title: "Procesare în curs...",
      description: "Fișierul tău este procesat cu AI. Acest proces poate dura câteva minute.",
    });

    try {
      // 1. Încarcă fișierul în Supabase Storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('document-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Apelează funcția de backend pentru procesare (chunking, embedding, salvare)
      const { data, error: invokeError } = await supabase.functions.invoke('process-document', {
        body: {
          fileUrl: filePath,
          fileName: file.name,
          userId: user.id,
          agentId: selectedAgent.id,
        }
      });

      if (invokeError) throw invokeError;

      toast({
        title: "Succes!",
        description: `Fișierul "${file.name}" a fost procesat și legat de agentul ${selectedAgent.name}. Au fost create ${data.chunksCreated} fragmente de informație.`,
      });
      
      // Reîncarcă lista de documente pentru a afișa noul fișier
      await loadUserDocuments();

    } catch (error) {
      console.error("Eroare la procesarea fișierului:", error);
      toast({
        title: "Eroare la procesare",
        description: error.message || "A apărut o eroare în timpul procesării.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDocument(false);
    }
  };

  // Wrapper functions to handle boolean returns
  const handleDocumentRemove = async (id: string) => {
    await removeDocument(id);
  };

  const handleDocumentLinkToAgent = async (agentId: string, documentId: string) => {
    await linkDocumentToAgent(agentId, documentId);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Configuration Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            
            <ModelSelection
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            <AgentConfiguration
              agents={agents}
              selectedAgent={selectedAgent}
              onAgentSelect={setSelectedAgent}
              onAgentCreate={handleAgentCreate}
              onAgentUpdate={handleAgentUpdate}
              onAgentDelete={handleAgentDelete}
            />

            <KnowledgeBaseManagement
              documents={documents}
              selectedAgent={selectedAgent}
              onTextDocumentAdd={handleTextDocumentAdd}
              onFileUpload={handleFileUpload}
              onDocumentRemove={handleDocumentRemove}
              onDocumentLinkToAgent={handleDocumentLinkToAgent}
              isProcessingDocument={isProcessingDocument}
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <ChatInterface
              messages={messages}
              inputMessage={inputMessage}
              isLoading={isLoading}
              selectedModel={selectedModel}
              selectedAgent={selectedAgent}
              onInputChange={setInputMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatAssistant;
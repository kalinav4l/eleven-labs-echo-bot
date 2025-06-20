
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { knowledgeBaseService, ExistingDocument, KnowledgeBaseDocument } from '../services/KnowledgeBaseService';
import { agentService } from '../services/AgentService';
import { AgentResponse } from '../components/AgentResponse';

interface KnowledgeDocumentLocal {
  id: string;
  name: string;
  content?: string;
  uploadedAt: Date;
  type: 'text' | 'file' | 'existing';
  elevenLabsId?: string;
}

interface UseEnhancedKnowledgeBaseProps {
  agentId: string;
  onAgentRefresh?: (agentData: AgentResponse) => void;
}

export const useEnhancedKnowledgeBase = ({ agentId, onAgentRefresh }: UseEnhancedKnowledgeBaseProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [documents, setDocuments] = useState<KnowledgeDocumentLocal[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([]);
  const [selectedExistingDocuments, setSelectedExistingDocuments] = useState<Set<string>>(new Set());

  const loadExistingDocuments = useCallback(async () => {
    setIsLoadingExisting(true);
    try {
      const response = await knowledgeBaseService.getExistingDocuments();
      setExistingDocuments(response.documents);
      console.log('Loaded existing documents:', response.documents);
    } catch (error) {
      console.error('Error loading existing documents:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca documentele existente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExisting(false);
    }
  }, []);

  const addExistingDocument = useCallback((documentId: string) => {
    const existingDoc = existingDocuments.find(doc => doc.id === documentId);
    if (!existingDoc) return;

    const newDoc: KnowledgeDocumentLocal = {
      id: `existing-${documentId}`,
      name: existingDoc.name,
      uploadedAt: new Date(existingDoc.metadata.created_at_unix_secs * 1000),
      type: 'existing',
      elevenLabsId: existingDoc.id
    };

    setDocuments(prev => [...prev, newDoc]);
    setSelectedExistingDocuments(prev => new Set([...prev, documentId]));
    
    toast({
      title: "Succes!",
      description: `Documentul "${existingDoc.name}" a fost adăugat.`,
    });
  }, [existingDocuments]);

  const addTextDocument = useCallback(async (name: string, content: string): Promise<boolean> => {
    try {
      const response = await knowledgeBaseService.createTextDocument({ name, text: content });
      
      const newDoc: KnowledgeDocumentLocal = {
        id: Date.now().toString(),
        name,
        content,
        uploadedAt: new Date(),
        type: 'text',
        elevenLabsId: response.id
      };
      
      setDocuments(prev => [...prev, newDoc]);
      
      toast({
        title: "Succes!",
        description: `Documentul text "${name}" a fost creat în ElevenLabs.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating text document:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea documentul text în ElevenLabs.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const addFileDocument = useCallback(async (file: File): Promise<boolean> => {
    try {
      const fileName = file.name.split('.')[0]; // Extract name without extension
      const response = await knowledgeBaseService.uploadFileDocument(file, fileName);
      
      const newDoc: KnowledgeDocumentLocal = {
        id: Date.now().toString(),
        name: file.name,
        uploadedAt: new Date(),
        type: 'file',
        elevenLabsId: response.id
      };
      
      setDocuments(prev => [...prev, newDoc]);
      
      toast({
        title: "Succes!",
        description: `Fișierul "${file.name}" a fost încărcat în ElevenLabs.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut încărca fișierul în ElevenLabs.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const removeDocument = useCallback((id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc && doc.elevenLabsId) {
      setSelectedExistingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(doc.elevenLabsId!);
        return newSet;
      });
    }
    
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    toast({
      title: "Succes!",
      description: "Documentul a fost șters din listă.",
    });
  }, [documents]);

  const updateAgentKnowledgeBase = useCallback(async (shouldReload = false): Promise<boolean> => {
    if (!agentId.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu ID-ul agentului pentru editare.",
        variant: "destructive",
      });
      return false;
    }

    setIsUpdating(true);

    try {
      // Prepare knowledge base from documents
      const knowledgeBase: KnowledgeBaseDocument[] = documents
        .filter(doc => doc.elevenLabsId)
        .map(doc => ({
          type: doc.type === 'existing' ? 'file' : doc.type as 'text' | 'file',
          name: doc.name,
          id: doc.elevenLabsId!,
          usage_mode: 'auto' as const
        }));

      console.log('Updating agent knowledge base with:', knowledgeBase);

      // Update agent via ElevenLabs API
      await knowledgeBaseService.updateAgentKnowledgeBase(agentId, knowledgeBase);

      toast({
        title: "Succes!",
        description: "Knowledge Base-ul agentului a fost actualizat cu succes în ElevenLabs.",
      });

      // If shouldReload is true, refresh the agent data
      if (shouldReload && onAgentRefresh) {
        try {
          const refreshedAgent = await agentService.getAgent(agentId);
          onAgentRefresh(refreshedAgent);
        } catch (error) {
          console.error('Error refreshing agent data:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating agent knowledge base:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la actualizarea Knowledge Base-ului agentului.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [agentId, documents, onAgentRefresh]);

  return {
    documents,
    existingDocuments,
    selectedExistingDocuments,
    isUpdating,
    isLoadingExisting,
    loadExistingDocuments,
    addExistingDocument,
    addTextDocument,
    addFileDocument,
    removeDocument,
    updateAgentKnowledgeBase
  };
};


import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { knowledgeBaseService, ExistingDocument } from '../services/KnowledgeBaseService';
import { AgentResponse } from '../components/AgentResponse';

interface KnowledgeDocumentLocal {
  id: string;
  name: string;
  content?: string;
  uploadedAt: Date;
  type: 'text' | 'file' | 'existing';
  elevenLabsId?: string;
}

export const useKnowledgeDocuments = () => {
  const [documents, setDocuments] = useState<KnowledgeDocumentLocal[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([]);
  const [selectedExistingDocuments, setSelectedExistingDocuments] = useState<Set<string>>(new Set());
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const processAgentKnowledgeBase = useCallback((agentData: AgentResponse) => {
    const knowledgeBase = agentData.conversation_config?.agent?.prompt?.knowledge_base || [];
    
    if (knowledgeBase.length > 0) {
      console.log('Processing existing knowledge base documents:', knowledgeBase);
      
      const processedDocs: KnowledgeDocumentLocal[] = knowledgeBase.map((doc) => ({
        id: `existing-${doc.id}`,
        name: doc.name,
        uploadedAt: new Date(),
        type: 'existing',
        elevenLabsId: doc.id
      }));
      
      setDocuments(processedDocs);
      
      const selectedIds = new Set(knowledgeBase.map(doc => doc.id));
      setSelectedExistingDocuments(selectedIds);
      
      console.log('Processed knowledge base documents:', processedDocs);
    } else {
      setDocuments([]);
      setSelectedExistingDocuments(new Set());
    }
  }, []);

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

  return {
    documents,
    setDocuments,
    existingDocuments,
    selectedExistingDocuments,
    isLoadingExisting,
    processAgentKnowledgeBase,
    loadExistingDocuments,
    addExistingDocument,
    removeDocument
  };
};

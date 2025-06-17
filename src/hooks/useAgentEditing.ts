
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { elevenLabsApi } from '../utils/apiService';

interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

interface UseAgentEditingProps {
  agentIdForEdit: string;
}

export const useAgentEditing = ({ agentIdForEdit }: UseAgentEditingProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);

  const updateAgentKnowledgeBase = useCallback(async (documents: KnowledgeDocument[]): Promise<boolean> => {
    if (!agentIdForEdit.trim()) {
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
      const knowledgeBase = documents.map(doc => ({
        name: doc.name,
        content: doc.content
      }));

      // Update agent via Eleven Labs API
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentIdForEdit}`, {
        method: "PATCH",
        headers: {
          "Xi-Api-Key": "sk_2685ed11d030a3f3befffd09cb2602ac8a19a26458df4873",
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
        description: "Agentul a fost actualizat cu success cu noile documente din Knowledge Base.",
      });

      return true;
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la actualizarea agentului. Te rog verifică ID-ul agentului.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [agentIdForEdit]);

  const addDocument = useCallback((document: KnowledgeDocument) => {
    setDocuments(prev => [...prev, document]);
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const saveKnowledgeBase = useCallback(async () => {
    return await updateAgentKnowledgeBase(documents);
  }, [updateAgentKnowledgeBase, documents]);

  return {
    documents,
    setDocuments,
    addDocument,
    removeDocument,
    saveKnowledgeBase,
    isUpdating,
  };
};

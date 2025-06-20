
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { knowledgeBaseService } from '../services/KnowledgeBaseService';

interface KnowledgeDocumentLocal {
  id: string;
  name: string;
  content?: string;
  uploadedAt: Date;
  type: 'text' | 'file' | 'existing';
  elevenLabsId?: string;
}

interface UseDocumentCreationProps {
  setDocuments: React.Dispatch<React.SetStateAction<KnowledgeDocumentLocal[]>>;
}

export const useDocumentCreation = ({ setDocuments }: UseDocumentCreationProps) => {
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
  }, [setDocuments]);

  const addFileDocument = useCallback(async (file: File): Promise<boolean> => {
    try {
      const fileName = file.name.split('.')[0];
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
  }, [setDocuments]);

  return {
    addTextDocument,
    addFileDocument
  };
};


import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { backendApiService, PromptGenerationRequest } from '../services/BackendApiService';

export const usePromptGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const generatePrompt = useCallback(async (
    websiteUrl: string, 
    agentRole: string, 
    additionalPrompt: string
  ): Promise<string> => {
    if (!websiteUrl.trim() || !agentRole.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează URL-ul site-ului și rolul agentului.",
        variant: "destructive",
      });
      return '';
    }

    setIsGenerating(true);
    
    try {
      const request: PromptGenerationRequest = {
        websiteUrl: websiteUrl.trim(),
        agentRole: agentRole.trim(),
        additionalPrompt: additionalPrompt.trim()
      };

      const response = await backendApiService.generatePrompt(request);
      
      setGeneratedPrompt(response.response);
      
      toast({
        title: "Succes!",
        description: "Prompt-ul a fost generat cu succes!",
      });

      return response.response;
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut genera prompt-ul. Te rog încearcă din nou.",
        variant: "destructive",
      });
      return '';
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePrompt,
    isGenerating,
    generatedPrompt,
    setGeneratedPrompt
  };
};

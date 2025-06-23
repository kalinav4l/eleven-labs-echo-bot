import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MESSAGES } from '../constants/constants';

interface UsePromptGenerationProps {
  websiteUrl: string;
  additionalPrompt: string;
}

export const usePromptGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrompt = useCallback(async ({ websiteUrl, additionalPrompt }: UsePromptGenerationProps): Promise<string | null> => {
    if (!websiteUrl.trim()) {
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.INVALID_URL,
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: {
          message: `You are an expert AI Prompt Engineer. Your task is to analyze the content of the website at the URL provided below and generate a comprehensive system prompt for a new conversational AI agent.

**Website to Analyze:**
${websiteUrl}

**System Prompt Structure:**
Based on your analysis, create the agent's system prompt using the following Markdown structure.

## Persona & Goal
- **Role:** Define the agent's persona based on the role specified: ${additionalPrompt.includes('Rolul agentului:') ? additionalPrompt.split('Rolul agentului:')[1].trim() : 'consultant'} (e.g., "a friendly and professional sales consultant" or "a knowledgeable customer support consultant").
- **Primary Goal:** State the main objective based on the role (e.g., "to assist users by answering questions about the company's services, generating leads, and guiding them towards making a purchase" for sales, or "to provide excellent customer support and answer questions about services" for consultant).

## Core Knowledge Base
- **Company/Service Introduction:** A brief summary of what the company does.
- **Main Products/Services:** A list or detailed description of the offerings.
- **Competitive Advantages:** What makes the company unique or better than competitors.
- **Contact Information & Procedures:** How users can contact the company (email, phone, form) and what the procedure is.

## Priority Directives
Incorporate the following user-provided directive. This is the most important instruction and must be followed. If the text for the directive is empty or just whitespace, you can omit this entire "Priority Directives" section.
- **User Directive:** ${additionalPrompt.replace(/Rolul agentului:.*?($|\s)/i, '').trim()}

## Conversational Style
- **Tone:** Describe the tone based on the role (e.g., "Friendly, professional, persuasive, and sales-oriented" for sales role, or "Friendly, professional, helpful, and informative" for consultant role).
- **Answering FAQs:** Instruct the agent on how to handle frequently asked questions based on the knowledge base.
- **Lead Generation:** ${additionalPrompt.includes('vinzator') || additionalPrompt.includes('vânzător') ? 'Always try to qualify leads and guide conversations towards sales opportunities. Ask for contact information when appropriate.' : 'Focus on providing helpful information and building trust with potential customers.'}

**Final Instruction:**
Your output must be ONLY the generated system prompt in Markdown format, ready to be used. Do not include any of your own commentary, introductions, or explanations.`,
          agentName: 'GPT-4 Consultant Generator',
        },
      });

      if (error) throw error;

      toast({
        title: "Succes!",
        description: MESSAGES.SUCCESS.PROMPT_GENERATED,
      });

      return data.response;
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Eroare",
        description: MESSAGES.ERRORS.PROMPT_GENERATION_FAILED,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generatePrompt,
    isGenerating,
  };
};

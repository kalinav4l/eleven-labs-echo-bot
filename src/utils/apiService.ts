
// IMPORTANT: This file now uses Supabase Edge Functions for secure API calls
// All ElevenLabs API interactions should go through Supabase Edge Functions
// where the API key is securely stored in Supabase Secrets

import { supabase } from '@/integrations/supabase/client';

// Types for API requests and responses
export interface TTSConfig {
  voice_id: string;
  model_id?: string;
}

export interface AgentConfig {
  language: string;
  prompt: {
    prompt: string;
  };
}

export interface ConversationConfig {
  agent: AgentConfig;
  tts: TTSConfig;
}

export interface CreateAgentRequest {
  conversation_config: ConversationConfig;
  name: string;
}

export interface CreateAgentResponse {
  agent_id: string;
  [key: string]: unknown;
}

export interface InitiateCallRequest {
  agent_id: string;
  phone_number: string;
}

class ElevenLabsApiService {
  // All API calls now go through Supabase Edge Functions for security
  async createAgent(request: CreateAgentRequest): Promise<CreateAgentResponse> {
    console.log('Creating agent via Supabase Edge Function:', request);
    
    const { data, error } = await supabase.functions.invoke('create-elevenlabs-agent', {
      body: request
    });

    if (error) {
      console.error('Create agent error:', error);
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    console.log('Agent created successfully:', data);
    return data;
  }

  async initiateCall(request: InitiateCallRequest): Promise<{ success: boolean; conversationId?: string }> {
    console.log('Initiating call via Supabase Edge Function:', request);
    
    const { data, error } = await supabase.functions.invoke('initiate-scheduled-call', {
      body: request
    });

    if (error) {
      console.error('Initiate call error:', error);
      throw new Error(`Failed to initiate call: ${error.message}`);
    }

    console.log('Call initiated successfully:', data);
    return data;
  }

  async textToSpeech(text: string, voiceId?: string): Promise<{ audioContent: string }> {
    console.log('Converting text to speech via Supabase Edge Function');
    
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { 
        text, 
        voice: voiceId || '21m00Tcm4TlvDq8ikWAM' 
      }
    });

    if (error) {
      console.error('Text to speech error:', error);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }

    return data;
  }
}

export const elevenLabsApi = new ElevenLabsApiService();

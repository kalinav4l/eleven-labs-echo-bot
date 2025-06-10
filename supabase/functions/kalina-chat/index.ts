
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { agent_id, message, user_message } = await req.json();

    if (!agent_id || !message) {
      throw new Error('Agent ID and message are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get agent configuration from our database
    const { data: agent, error: agentError } = await supabase
      .from('kalina_agents')
      .select('*')
      .eq('agent_id', agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // If it's an ElevenLabs agent, use their API directly
    if (agent.provider === 'elevenlabs' && agent.elevenlabs_agent_id) {
      // Use ElevenLabs Conversational AI API
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.elevenlabs_agent_id,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    // If it's a custom agent, use OpenAI + ElevenLabs TTS
    else {
      // Step 1: Get response from OpenAI
      const systemPrompt = agent.system_prompt || `You are ${agent.name}, a helpful AI assistant. Respond in Romanian in a friendly manner.`;

      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 150,
        }),
      });

      const gptData = await gptResponse.json();
      if (!gptResponse.ok) {
        throw new Error(gptData.error?.message || 'OpenAI API error');
      }
      const textResponse = gptData.choices[0].message.content;

      // Step 2: Convert to speech with ElevenLabs TTS
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${agent.voice_id || '21m00Tcm4TlvDq8ikWAM'}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: textResponse,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`ElevenLabs TTS API error: ${await ttsResponse.text()}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return new Response(JSON.stringify({
        text: textResponse,
        audio: audioDataUrl,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in kalina-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

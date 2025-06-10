
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, agentName, voiceId } = await req.json();

    if (!openAIApiKey || !elevenLabsApiKey) {
      throw new Error('API keys for OpenAI or ElevenLabs are not configured in Supabase Vault.');
    }

    // Step 1: Get text response from OpenAI
    const systemPrompt = `You are ${agentName || 'a virtual assistant'}, a conversational AI agent. Respond in Romanian in a friendly and helpful manner. Keep your answers short and clear.`;

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

    // Step 2: Convert text to speech with ElevenLabs
    const elevenLabsVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default voice if not specified

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
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
      throw new Error(`ElevenLabs API error: ${await ttsResponse.text()}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Step 3: Return both text and audio
    return new Response(JSON.stringify({
      text: textResponse,
      audio: audioDataUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-ai-voice-response function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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
    const { agent_id, message, conversation_history = [] } = await req.json();

    if (!agent_id || !message) {
      throw new Error('Agent ID and message are required');
    }

    console.log(`Processing chat request for agent: ${agent_id}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get agent configuration from our database
    const { data: agent, error: agentError } = await supabase
      .from('kalina_agents')
      .select('*')
      .eq('agent_id', agent_id)
      .single();

    if (agentError || !agent) {
      console.error('Agent not found:', agentError);
      throw new Error('Agent not found');
    }

    console.log(`Agent found: ${agent.name}`);

    // If it's an ElevenLabs agent, use their API directly
    if (agent.provider === 'elevenlabs' && agent.elevenlabs_agent_id) {
      console.log('Using ElevenLabs Conversational AI');
      
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
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    // If it's a custom agent, use OpenAI + ElevenLabs TTS
    else {
      console.log('Using custom agent with OpenAI + TTS');
      
      // Build conversation context
      const systemPrompt = agent.system_prompt || `You are ${agent.name}, a conversational AI agent. Respond in a friendly and helpful way. Keep your responses short and clear.`;
      // Build messages array with conversation history
      const messages = [
        { role: 'system', content: systemPrompt }
      ];
      
      // Add conversation history (limit to last 10 messages to avoid token limits)
      const recentHistory = conversation_history.slice(-10);
      messages.push(...recentHistory);
      
      // Add current user message
      messages.push({ role: 'user', content: message });

      console.log('Calling OpenAI with messages:', messages.length);

      // Step 1: Get response from OpenAI
      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const gptData = await gptResponse.json();
      if (!gptResponse.ok) {
        console.error('OpenAI API error:', gptData);
        throw new Error(gptData.error?.message || 'OpenAI API error');
      }
      
      const textResponse = gptData.choices[0].message.content;
      console.log('Generated text response:', textResponse.substring(0, 100) + '...');

      // Step 2: Convert to speech with ElevenLabs TTS (if API key is available)
      let audioDataUrl = null;
      
      if (elevenLabsApiKey) {
        try {
          console.log('Generating audio with ElevenLabs TTS');
          
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
                style: 0.0,
                use_speaker_boost: true
              },
            }),
          });

          if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            console.warn('ElevenLabs TTS API error:', errorText);
          } else {
            const audioBuffer = await ttsResponse.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
            audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;
            console.log('Audio generated successfully');
          }
        } catch (ttsError) {
          console.warn('TTS generation failed:', ttsError);
          // Continue without audio
        }
      }

      const response = {
        text: textResponse,
        audio: audioDataUrl,
        agent_name: agent.name
      };

      console.log('Sending response back to widget');

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in kalina-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      text: 'Ne pare rău, a apărut o eroare tehnică. Te rog să încerci din nou.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, audioData, isVoiceCall } = await req.json();

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    // Pentru apeluri vocale, folosește ElevenLabs Conversational AI
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (elevenLabsApiKey && isVoiceCall) {
      try {
        // Folosește API-ul ElevenLabs pentru conversații vocale
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/agents/${agentId}/conversation`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'Salut! Sunt Borea AI. Cu ce te pot ajuta?',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            }
          }),
        });

        if (elevenLabsResponse.ok) {
          const elevenLabsData = await elevenLabsResponse.json();
          return new Response(JSON.stringify({ 
            response: elevenLabsData.response,
            audioContent: elevenLabsData.audio_content,
            isVoiceResponse: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (elevenLabsError) {
        console.log('ElevenLabs failed, falling back to text response:', elevenLabsError);
      }
    }

    // Fallback pentru răspuns text
    const responses = [
      "Salut! Sunt Borea AI. Cu ce te pot ajuta astăzi?",
      "Bună ziua! Sunt aici să te ajut cu orice întrebări ai.",
      "Salut! Sunt asistentul tău virtual Borea. În ce te pot sprijini?",
      "Bună! Sunt Borea AI, gata să îți ofer informațiile de care ai nevoie.",
      "Salut! Mă bucur să vorbesc cu tine. Cu ce te pot ajuta?"
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return new Response(JSON.stringify({ 
      response: response,
      isVoiceResponse: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in widget-voice-call function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Îmi pare rău, nu pot răspunde momentan. Te rog încearcă din nou mai târziu.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

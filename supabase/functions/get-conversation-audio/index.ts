import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId } = await req.json();
    
    if (!conversationId) {
      console.error('No conversation ID provided');
      return new Response(JSON.stringify({ error: 'Conversation ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Getting audio for conversation:', conversationId);

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key not found');
      return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get audio from ElevenLabs
    const audioUrl = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`;
    console.log('Fetching audio from:', audioUrl);
    
    const response = await fetch(audioUrl, {
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
    });

    console.log('ElevenLabs response status:', response.status);
    console.log('ElevenLabs response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, response.statusText, errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch audio from ElevenLabs', 
        details: `Status: ${response.status}, Message: ${errorText}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the audio blob from ElevenLabs
    const audioBlob = await response.blob();
    
    // Convert blob to base64 for JSON response
    const audioBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Successfully fetched audio for conversation:', conversationId);
    
    return new Response(JSON.stringify({ 
      audioData: base64Audio,
      contentType: 'audio/mpeg'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-conversation-audio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
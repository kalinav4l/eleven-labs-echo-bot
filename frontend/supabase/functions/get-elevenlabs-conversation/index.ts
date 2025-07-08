
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { conversationId } = await req.json();
    console.log('Getting conversation details for:', conversationId);
    
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY not found in environment variables");
      throw new Error("ElevenLabs API key not configured");
    }
    
    if (!conversationId) {
      console.error("conversationId is required");
      throw new Error("conversationId is required");
    }

    // Call ElevenLabs API to get specific conversation
    const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
    console.log('Calling ElevenLabs API:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Return a structured error response instead of throwing
      return new Response(
        JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorText,
          conversationId: conversationId,
          status: response.status >= 404 ? 'not_found' : 'api_error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 so client can handle the error gracefully
        }
      );
    }

    const data = await response.json();
    console.log('Successfully retrieved conversation:', data);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-elevenlabs-conversation function:', error);
    
    // Return structured error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        status: 'function_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 so client can handle gracefully
      }
    );
  }
});

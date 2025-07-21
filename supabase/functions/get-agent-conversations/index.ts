
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { agentId } = await req.json();
    console.log('Getting all conversations for agent:', agentId);
    
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY not found in environment variables");
      throw new Error("ElevenLabs API key not configured");
    }
    
    if (!agentId) {
      console.error("agentId is required");
      throw new Error("agentId is required");
    }

    // Get all conversations for this agent
    const url = `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${agentId}`;
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
      
      return new Response(
        JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorText,
          agentId: agentId,
          status: response.status >= 404 ? 'not_found' : 'api_error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const data = await response.json();
    console.log('Successfully retrieved conversations for agent:', agentId, 'Count:', data?.conversations?.length || 0);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-agent-conversations function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        status: 'function_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

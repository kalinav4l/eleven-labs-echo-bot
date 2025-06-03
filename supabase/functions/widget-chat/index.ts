
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
    const { message, agentId } = await req.json();

    if (!message || !agentId) {
      throw new Error('Message and agentId are required');
    }

    // Încearcă mai întâi ElevenLabs
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (elevenLabsApiKey) {
      try {
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/agents/${agentId}/chat`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message
          }),
        });

        if (elevenLabsResponse.ok) {
          const elevenLabsData = await elevenLabsResponse.json();
          return new Response(JSON.stringify({ response: elevenLabsData.response }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (elevenLabsError) {
        console.log('ElevenLabs failed, falling back to OpenAI:', elevenLabsError);
      }
    }

    // Fallback la OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('No API keys configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Ești Borea AI, un asistent virtual prietenos și util. Răspunde în română într-un mod concis și profesional.' 
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in widget-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Îmi pare rău, nu pot răspunde momentan. Te rog încearcă din nou mai târziu.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

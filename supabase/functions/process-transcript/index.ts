
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { transcriptText } = await req.json();

    if (!transcriptText) {
      throw new Error('Transcript text is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Ești un expert în procesarea transcripturilor. Analizează textul primit și transformă-l într-un dialog structurat între "Agent AI" și "User". 

Instrucțiuni:
1. Identifică cine vorbește în fiecare segment
2. Separă dialogul în replici clare
3. Atribuie fiecare replică fie la "Agent AI" fie la "User"
4. Returnează rezultatul în format JSON cu următoarea structură:
{
  "dialogue": [
    {
      "speaker": "User" sau "Agent AI",
      "text": "textul replicii",
      "timestamp": "00:00"
    }
  ]
}

Important: Menține sensul original și nu adăuga informații care nu există în transcript.`
          },
          {
            role: 'user',
            content: `Te rog să procesezi următorul transcript și să îl transformi într-un dialog structurat: ${transcriptText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const processedText = data.choices[0].message.content;

    // Try to parse the JSON response from GPT-4o
    let structuredDialogue;
    try {
      structuredDialogue = JSON.parse(processedText);
    } catch (parseError) {
      console.error('Failed to parse GPT-4o JSON response:', parseError);
      // Fallback: create a simple structure
      structuredDialogue = {
        dialogue: [
          {
            speaker: "Agent AI",
            text: processedText,
            timestamp: "00:00"
          }
        ]
      };
    }

    return new Response(JSON.stringify(structuredDialogue), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-transcript function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      dialogue: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

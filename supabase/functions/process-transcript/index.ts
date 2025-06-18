
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
            content: `Ești un expert în procesarea transcripturilor. Analizează textul primit și transformă-l într-un dialog clar și structurat.

Instrucțiuni IMPORTANTE:
1. Identifică cu atenție momentele când se schimbă vorbitorul
2. Recunoaște indicii ca: pauze, schimbări de ton, întrebări și răspunsuri
3. Separă dialogul în replici clare, fiecare pe o linie nouă
4. Primul vorbitor este "User", al doilea este "Agent AI"
5. Alternează corect între "User" și "Agent AI" în funcție de context
6. Fiecare replică să înceapă de pe un rând nou
7. Returnează DOAR JSON-ul, fără text suplimentar sau markdown

Format JSON obligatoriu:
{
  "dialogue": [
    {
      "speaker": "User",
      "text": "textul exact al replicii",
      "timestamp": "00:00"
    },
    {
      "speaker": "Agent AI", 
      "text": "textul exact al replicii",
      "timestamp": "00:02"
    }
  ]
}

FOARTE IMPORTANT: Nu adăuga ``` sau alte marcaje markdown. Returnează doar JSON-ul curat.`
          },
          {
            role: 'user',
            content: `Procesează următorul transcript și creează un dialog structurat cu replici clare pentru fiecare vorbitor:

${transcriptText}`
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let processedText = data.choices[0].message.content;

    // Clean up the response - remove markdown formatting if present
    processedText = processedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try to parse the JSON response from GPT-4o
    let structuredDialogue;
    try {
      structuredDialogue = JSON.parse(processedText);
    } catch (parseError) {
      console.error('Failed to parse GPT-4o JSON response:', parseError);
      console.error('Raw response:', processedText);
      
      // Enhanced fallback: try to extract meaningful dialogue
      const lines = processedText.split('\n').filter(line => line.trim());
      const dialogueEntries = [];
      
      lines.forEach((line, index) => {
        if (line.trim()) {
          const speaker = index % 2 === 0 ? "User" : "Agent AI";
          dialogueEntries.push({
            speaker: speaker,
            text: line.trim(),
            timestamp: `00:${Math.floor(index * 3 / 60).toString().padStart(2, '0')}:${(index * 3 % 60).toString().padStart(2, '0')}`
          });
        }
      });
      
      structuredDialogue = {
        dialogue: dialogueEntries.length > 0 ? dialogueEntries : [
          {
            speaker: "Agent AI",
            text: "Nu s-a putut procesa transcriptul. Vă rugăm să încercați din nou.",
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

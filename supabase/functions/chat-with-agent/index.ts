import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurații
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, model = 'gpt-4o-mini', agentId, systemPrompt } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chat message:', { message, userId, model, agentId });

    let contextText = '';
    
    // Dacă avem un agent ID, căutăm în documentele sale
    if (agentId) {
      try {
        // Folosim funcția de căutare din PostgreSQL pentru a găsi fragmentele relevante
        const { data: relevantChunks, error: searchError } = await supabase
          .rpc('search_relevant_chunks', {
            query_text: message,
            agent_id_param: agentId,
            match_count: 5
          });

        if (searchError) {
          console.error('Search error:', searchError);
        } else if (relevantChunks && relevantChunks.length > 0) {
          contextText = relevantChunks
            .map((chunk: any) => `[${chunk.document_name}]: ${chunk.chunk_text}`)
            .join('\n\n');
          console.log('Found relevant chunks:', relevantChunks.length);
        } else {
          console.log('No relevant chunks found for query');
        }
      } catch (error) {
        console.error('Error searching for relevant chunks:', error);
      }
    }

    // Pas 3: Creează prompt-ul pentru OpenAI cu context și restricții RAG
    const finalSystemPrompt = systemPrompt || `Ești un asistent AI care răspunde DOAR pe baza informațiilor din baza de cunoștințe furnizată.

REGULI IMPORTANTE:
1. Folosește DOAR informațiile din contextul furnizat pentru a răspunde
2. Dacă informația nu se află în context, răspunde: "Îmi pare rău, nu am găsit informații specifice despre acest subiect în baza mea de cunoștințe."
3. Nu inventa răspunsuri sau nu folosi cunoștințe generale
4. Fii prietenos și util, dar respectă strict limitările contextului
5. Răspunde în română

CONTEXT DIN BAZA DE CUNOȘTINȚE:
${contextText}

Dacă contextul este limitat, explică că ai nevoie de mai multe informații în baza de cunoștințe pentru a răspunde complet.`;

    const messages = [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: message }
    ];

    // Pas 4: Trimite request la OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.3, // Temperatură mai mică pentru răspunsuri mai consistente
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate response');
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response generated');
    }

    console.log('Generated response:', aiResponse);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        contextFound: contextText.length > 0,
        chunksUsed: contextText ? contextText.split('\n\n').length : 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-agent function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'Îmi pare rău, a apărut o eroare în procesarea cererii tale. Te rog încearcă din nou.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
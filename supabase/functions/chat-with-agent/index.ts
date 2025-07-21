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

// Input validation helpers
const validateInput = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }
  
  const { message, userId, model = 'gpt-4o-mini', agentId, systemPrompt } = data;
  
  // Validate message
  if (!message || typeof message !== 'string' || message.length === 0 || message.length > 5000) {
    throw new Error('Invalid message: must be 1-5000 characters');
  }
  
  // Validate model
  const allowedModels = ['gpt-4o-mini', 'gpt-4o'];
  if (model && !allowedModels.includes(model)) {
    throw new Error('Invalid model specified');
  }
  
  // Validate agentId if provided
  if (agentId && (typeof agentId !== 'string' || agentId.length > 100)) {
    throw new Error('Invalid agentId');
  }
  
  // Validate systemPrompt if provided
  if (systemPrompt && (typeof systemPrompt !== 'string' || systemPrompt.length > 10000)) {
    throw new Error('System prompt too long');
  }
  
  return { message, userId, model, agentId, systemPrompt };
};

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { message, userId, model, agentId, systemPrompt } = validateInput(requestData);

    console.log('Processing chat message:', { message, userId, model, agentId });

    let contextText = '';
    
    // Dacă avem un agent ID, căutăm în documentele sale folosind embedding-uri
    if (agentId) {
      try {
        // Creăm embedding pentru întrebarea utilizatorului
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: message,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error('Failed to create embedding for query');
        }

        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        // Căutăm documentele similare folosind funcția de căutare vectorială
        const { data: relevantChunks, error: searchError } = await supabase
          .rpc('match_document_embeddings', {
            query_embedding: JSON.stringify(queryEmbedding),
            agent_id_param: agentId,
            match_threshold: 0.7,
            match_count: 5
          });

        if (searchError) {
          console.error('Vector search error:', searchError);
        } else if (relevantChunks && relevantChunks.length > 0) {
          contextText = relevantChunks
            .map((chunk: any) => `[Document: ${chunk.document_name}] (Similitudine: ${(chunk.similarity * 100).toFixed(1)}%)\n${chunk.chunk_text}`)
            .join('\n\n---\n\n');
          console.log(`Found ${relevantChunks.length} relevant chunks using vector search`);
        } else {
          console.log('No relevant chunks found using vector search');
        }
      } catch (error) {
        console.error('Error in vector search:', error);
        // Fallback la căutarea text simplă dacă embedding-urile nu funcționează
        try {
          const { data: textChunks, error: textError } = await supabase
            .rpc('search_relevant_chunks', {
              query_text: message,
              agent_id_param: agentId,
              match_count: 5
            });

          if (!textError && textChunks && textChunks.length > 0) {
            const filteredChunks = textChunks.filter((chunk: any) => chunk.rank > 0.1);
            if (filteredChunks.length > 0) {
              contextText = filteredChunks
                .map((chunk: any) => `[Document: ${chunk.document_name}]\n${chunk.chunk_text}`)
                .join('\n\n---\n\n');
              console.log(`Fallback to text search: Found ${filteredChunks.length} chunks`);
            }
          }
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
        }
      }
    }

    // Pas 3: Creează prompt-ul pentru OpenAI cu context și restricții RAG
    const finalSystemPrompt = systemPrompt || `Ești un asistent AI specializat care răspunde EXCLUSIV pe baza informațiilor din baza de cunoștințe furnizată.

REGULI CRITICE:
1. Folosește DOAR informațiile din contextul furnizat pentru a răspunde
2. Dacă informația nu se află în context, răspunde explicit: "Nu am găsit informații specifice despre acest subiect în documentele încărcate."
3. NU improviza, NU inventa răspunsuri și NU folosi cunoștințe generale
4. Când ai informații relevante, citează sursa documentului în răspuns
5. Fii precis și specific - referă-te direct la informațiile din context
6. Răspunde în română într-un mod profesional și util
7. Dacă întrebarea este parțial acoperită de context, specifică ce informații ai și ce lipsește

${contextText ? `INFORMAȚII DISPONIBILE DIN DOCUMENTE:
${contextText}

Bazează-ți răspunsul EXCLUSIV pe informațiile de mai sus.` : 'Nu există informații relevante în baza de cunoștințe pentru această întrebare.'}`;

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
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurații
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
}

interface KnowledgeBaseResponse {
  documents: KnowledgeDocument[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chat message:', { message, userId });

    // Pas 1: Obține lista documentelor din knowledge base
    const documentsResponse = await fetch('https://api.elevenlabs.io/v1/knowledge-base', {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
    });

    if (!documentsResponse.ok) {
      console.error('Failed to fetch knowledge base documents');
      throw new Error('Failed to access knowledge base');
    }

    const documentsData: KnowledgeBaseResponse = await documentsResponse.json();
    console.log('Available documents:', documentsData.documents);

    // Pas 2: Căutare prin documentele disponibile folosind OpenAI pentru relevanta
    // Pentru început, vom folosi toate documentele disponibile ca context
    let contextText = '';
    
    // Selectează primele 3 documente pentru context (într-o implementare reală, 
    // ai face o căutare vectorială aici)
    const relevantDocs = documentsData.documents.slice(0, 3);
    
    if (relevantDocs.length > 0) {
      contextText = `Documentele disponibile în baza de cunoștințe: ${relevantDocs.map(doc => doc.name).join(', ')}`;
    }

    // Pas 3: Creează prompt-ul pentru OpenAI cu context și restricții RAG
    const systemPrompt = `Ești un asistent AI care răspunde DOAR pe baza informațiilor din baza de cunoștințe furnizată.

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
      { role: 'system', content: systemPrompt },
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
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
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
        documentsUsed: relevantDocs.length,
        availableDocuments: documentsData.documents.length
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
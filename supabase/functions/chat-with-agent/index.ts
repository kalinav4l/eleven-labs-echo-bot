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

// Helper functions pentru extragerea datelor utilizatorului
const getUserStatistics = async (userId: string) => {
  try {
    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    const { data: balance } = await supabase
      .from('user_balance')
      .select('balance_usd')
      .eq('user_id', userId)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, account_type')
      .eq('id', userId)
      .single();

    return { stats, balance, profile };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { stats: null, balance: null, profile: null };
  }
};

const getTodaysCallHistory = async (userId: string) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: calls } = await supabase
      .from('call_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false });

    return calls || [];
  } catch (error) {
    console.error('Error fetching today calls:', error);
    return [];
  }
};

const getRecentCallHistory = async (userId: string, limit = 10) => {
  try {
    const { data: calls } = await supabase
      .from('call_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return calls || [];
  } catch (error) {
    console.error('Error fetching recent calls:', error);
    return [];
  }
};

const getUserAgents = async (userId: string) => {
  try {
    const { data: agents } = await supabase
      .from('kalina_agents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    return agents || [];
  } catch (error) {
    console.error('Error fetching user agents:', error);
    return [];
  }
};

const generateUserContext = (userData: any) => {
  const { stats, balance, profile, todaysCalls, recentCalls, agents } = userData;
  
  let context = `INFORMAȚII DESPRE UTILIZATOR:\n`;
  
  if (profile) {
    context += `Nume: ${profile.first_name || ''} ${profile.last_name || ''}\n`;
    context += `Email: ${profile.email || 'Nu este disponibil'}\n`;
    context += `Tip cont: ${profile.account_type || 'regular'}\n\n`;
  }

  if (balance) {
    context += `BALANȚĂ CONT:\n`;
    context += `Balanța curentă: $${balance.balance_usd || 0}\n\n`;
  }

  if (stats) {
    context += `STATISTICI GENERALE:\n`;
    context += `Total apeluri efectuate: ${stats.total_voice_calls || 0}\n`;
    context += `Total minute vorbite: ${stats.total_minutes_talked || 0}\n`;
    context += `Total cheltuit: $${stats.total_spent_usd || 0}\n\n`;
  }

  if (todaysCalls && todaysCalls.length > 0) {
    context += `APELURI DE ASTĂZI (${todaysCalls.length} total):\n`;
    todaysCalls.slice(0, 5).forEach((call: any, index: number) => {
      const duration = call.duration_seconds ? Math.round(call.duration_seconds / 60) : 0;
      const cost = call.cost_usd || 0;
      const time = new Date(call.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      context += `${index + 1}. ${call.contact_name || call.phone_number} - ${duration} min - $${cost} (${time})\n`;
    });
    context += `\n`;
  } else {
    context += `APELURI DE ASTĂZI: Nu au fost efectuate apeluri astăzi.\n\n`;
  }

  if (agents && agents.length > 0) {
    context += `AGENȚII ACTIVI (${agents.length} total):\n`;
    agents.forEach((agent: any, index: number) => {
      context += `${index + 1}. ${agent.name} (ID: ${agent.agent_id})\n`;
    });
    context += `\n`;
  }

  if (recentCalls && recentCalls.length > 0) {
    const successfulCalls = recentCalls.filter((call: any) => call.call_status === 'completed');
    const failedCalls = recentCalls.filter((call: any) => call.call_status === 'failed');
    
    context += `STATISTICI RECENTE:\n`;
    context += `Apeluri reușite recent: ${successfulCalls.length}\n`;
    context += `Apeluri eșuate recent: ${failedCalls.length}\n`;
    context += `Ultimul apel: ${recentCalls[0] ? new Date(recentCalls[0].created_at).toLocaleDateString('ro-RO') : 'Nu există'}\n\n`;
  }

  return context;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { message, userId, model, agentId, systemPrompt } = validateInput(requestData);

    console.log('Processing chat message:', { message, userId, model, agentId });

    // Extrage datele utilizatorului pentru context
    const [userStats, todaysCalls, recentCalls, userAgents] = await Promise.all([
      getUserStatistics(userId),
      getTodaysCallHistory(userId),
      getRecentCallHistory(userId),
      getUserAgents(userId)
    ]);

    // Generează contextul cu datele utilizatorului
    const userContext = generateUserContext({
      ...userStats,
      todaysCalls,
      recentCalls,
      agents: userAgents
    });

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

    // Pas 3: Creează prompt-ul pentru OpenAI cu context complet
    const finalSystemPrompt = systemPrompt || `Ești Kalina AI, un asistent inteligent și prietenos care cunoaște toate informațiile despre utilizator și poate răspunde la întrebări despre contul și activitatea lor.

${userContext}

${contextText ? `INFORMAȚII SPECIFICE DIN BAZA DE CUNOȘTINȚE:
${contextText}

` : ''}INSTRUCȚIUNI:
1. Ai acces complet la toate datele utilizatorului de mai sus - statistici, apeluri, balanță, agenți
2. Când utilizatorul întreabă despre apeluri, statistici, costuri, balanță - folosește informațiile exacte de mai sus
3. Pentru întrebări despre "câte apeluri am avut azi", "cât am cheltuit", "care e balanța mea" - răspunde cu datele concrete
4. Dacă sunt informații din baza de cunoștințe relevante, folosește-le și citează sursa
5. Pentru conversații generale, răspunde natural și util
6. Fii prietenos, profesional și răspunde în română
7. Poți combina informațiile despre cont cu cunoștințele generale când este relevant
8. Dacă utilizatorul vrea detalii specifice despre un apel sau agent, folosește informațiile disponibile`;

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
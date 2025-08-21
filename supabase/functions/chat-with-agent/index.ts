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

// Helper functions pentru extragerea completă a datelor utilizatorului
const getUserStatistics = async (userId: string) => {
  try {
    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    const { data: balance } = await supabase
      .from('user_balance')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { stats, balance, profile };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { stats: null, balance: null, profile: null };
  }
};

const getAllCallHistory = async (userId: string) => {
  try {
    const { data: calls } = await supabase
      .from('call_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return calls || [];
  } catch (error) {
    console.error('Error fetching call history:', error);
    return [];
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

const getUserAgents = async (userId: string) => {
  try {
    const { data: agents } = await supabase
      .from('kalina_agents')
      .select('*')
      .eq('user_id', userId);

    return agents || [];
  } catch (error) {
    console.error('Error fetching user agents:', error);
    return [];
  }
};

const getUserConversations = async (userId: string) => {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return conversations || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

const getUserContacts = async (userId: string) => {
  try {
    const { data: contacts } = await supabase
      .from('contacts_database')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return contacts || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

const getUserCampaigns = async (userId: string) => {
  try {
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return campaigns || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};

const getUserPhoneNumbers = async (userId: string) => {
  try {
    const { data: phones } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId);

    return phones || [];
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return [];
  }
};

const getUserActiveAgents = async (userId: string) => {
  try {
    const { data: activeAgents } = await supabase
      .from('active_agents')
      .select('*')
      .eq('user_id', userId);

    return activeAgents || [];
  } catch (error) {
    console.error('Error fetching active agents:', error);
    return [];
  }
};

const getUserKnowledgeDocuments = async (userId: string) => {
  try {
    const { data: documents } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return documents || [];
  } catch (error) {
    console.error('Error fetching knowledge documents:', error);
    return [];
  }
};

const getCallbackRequests = async (userId: string) => {
  try {
    const { data: callbacks } = await supabase
      .from('callback_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return callbacks || [];
  } catch (error) {
    console.error('Error fetching callback requests:', error);
    return [];
  }
};

const getBalanceTransactions = async (userId: string) => {
  try {
    const { data: transactions } = await supabase
      .from('balance_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return transactions || [];
  } catch (error) {
    console.error('Error fetching balance transactions:', error);
    return [];
  }
};

const getConversationAnalytics = async (userId: string) => {
  try {
    const { data: analytics } = await supabase
      .from('conversation_analytics_cache')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return analytics || [];
  } catch (error) {
    console.error('Error fetching conversation analytics:', error);
    return [];
  }
};

const generateUserContext = (userData: any) => {
  const { 
    stats, balance, profile, todaysCalls, allCalls, agents, conversations, 
    contacts, campaigns, phoneNumbers, activeAgents, documents, callbacks, 
    transactions, analytics 
  } = userData;
  
  let context = `=== INFORMAȚII COMPLETE DESPRE UTILIZATOR ===\n\n`;
  
  // PROFIL UTILIZATOR
  if (profile) {
    context += `👤 PROFIL UTILIZATOR:\n`;
    context += `Nume: ${profile.first_name || ''} ${profile.last_name || ''}\n`;
    context += `Email: ${profile.email || 'Nu este disponibil'}\n`;
    context += `Tip cont: ${profile.account_type || 'regular'}\n`;
    context += `Planul: ${profile.plan || 'starter'}\n`;
    if (profile.telegram_chat_id) context += `Telegram conectat: Da\n`;
    context += `Creat la: ${new Date(profile.created_at).toLocaleDateString('ro-RO')}\n\n`;
  }

  // BALANȚĂ CONT ȘI TRANZACȚII
  if (balance) {
    context += `💰 BALANȚĂ CONT:\n`;
    context += `Balanța curentă: $${balance.balance_usd || 0}\n`;
    if (transactions && transactions.length > 0) {
      context += `Ultima tranzacție: ${transactions[0].description} - $${transactions[0].amount} (${new Date(transactions[0].created_at).toLocaleDateString('ro-RO')})\n`;
      const totalCredits = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + Number(t.amount), 0);
      const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      context += `Total încărcat: $${totalCredits}\n`;
      context += `Total cheltuit în tranzacții: $${totalSpent}\n`;
    }
    context += `\n`;
  }

  // STATISTICI GENERALE
  if (stats) {
    context += `📊 STATISTICI GENERALE:\n`;
    context += `Total apeluri efectuate: ${stats.total_voice_calls || 0}\n`;
    context += `Total minute vorbite: ${stats.total_minutes_talked || 0}\n`;
    context += `Total conversații: ${stats.total_conversations || 0}\n`;
    context += `Total mesaje: ${stats.total_messages || 0}\n`;
    context += `Total cheltuit: $${stats.total_spent_usd || 0}\n`;
    context += `Agenți folosiți: ${stats.agents_used || 0}\n\n`;
  }

  // APELURI DE ASTĂZI
  if (todaysCalls && todaysCalls.length > 0) {
    context += `📞 APELURI DE ASTĂZI (${todaysCalls.length} total):\n`;
    const successfulToday = todaysCalls.filter(call => call.call_status === 'completed').length;
    const failedToday = todaysCalls.filter(call => call.call_status === 'failed').length;
    context += `Reușite: ${successfulToday}, Eșuate: ${failedToday}\n`;
    
    todaysCalls.slice(0, 8).forEach((call: any, index: number) => {
      const duration = call.duration_seconds ? Math.round(call.duration_seconds / 60) : 0;
      const cost = call.cost_usd || 0;
      const time = new Date(call.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      const status = call.call_status === 'completed' ? '✅' : call.call_status === 'failed' ? '❌' : '⏳';
      context += `${index + 1}. ${status} ${call.contact_name || call.phone_number} - ${duration}min - $${cost} (${time})\n`;
    });
    context += `\n`;
  } else {
    context += `📞 APELURI DE ASTĂZI: Nu au fost efectuate apeluri astăzi.\n\n`;
  }

  // ISTORICUL COMPLET AL APELURILOR
  if (allCalls && allCalls.length > 0) {
    const completedCalls = allCalls.filter(call => call.call_status === 'completed');
    const failedCalls = allCalls.filter(call => call.call_status === 'failed');
    const busyCalls = allCalls.filter(call => call.call_status === 'busy');
    const totalCost = allCalls.reduce((sum, call) => sum + (Number(call.cost_usd) || 0), 0);
    const totalDuration = allCalls.reduce((sum, call) => sum + (Number(call.duration_seconds) || 0), 0);
    
    context += `📈 ISTORIC COMPLET APELURI (ultimele ${allCalls.length}):\n`;
    context += `Reușite: ${completedCalls.length}, Eșuate: ${failedCalls.length}, Ocupate: ${busyCalls.length}\n`;
    context += `Cost total: $${totalCost.toFixed(4)}, Durată totală: ${Math.round(totalDuration / 60)} minute\n`;
    context += `Ultimul apel: ${new Date(allCalls[0].created_at).toLocaleDateString('ro-RO')} - ${allCalls[0].contact_name || allCalls[0].phone_number}\n\n`;
  }

  // AGENȚI AI
  if (agents && agents.length > 0) {
    context += `🤖 AGENȚI AI (${agents.length} total):\n`;
    agents.forEach((agent: any, index: number) => {
      const status = agent.is_active ? '🟢 Activ' : '🔴 Inactiv';
      context += `${index + 1}. ${agent.name} ${status} (ID: ${agent.agent_id})\n`;
      if (agent.description) context += `   Descriere: ${agent.description.substring(0, 80)}...\n`;
    });
    context += `\n`;
  }

  // AGENȚI ACTIVI ACUM
  if (activeAgents && activeAgents.length > 0) {
    context += `🔄 AGENȚI ACTIVI ACUM (${activeAgents.length}):\n`;
    activeAgents.forEach((agent: any, index: number) => {
      context += `${index + 1}. ${agent.agent_name} - ${agent.status}\n`;
      if (agent.current_contact_name) context += `   În apel cu: ${agent.current_contact_name} (${agent.current_phone_number})\n`;
    });
    context += `\n`;
  }

  // CONTACTE
  if (contacts && contacts.length > 0) {
    context += `👥 CONTACTE (${contacts.length} din baza de date):\n`;
    contacts.slice(0, 10).forEach((contact: any, index: number) => {
      context += `${index + 1}. ${contact.nume} - ${contact.telefon}`;
      if (contact.company) context += ` (${contact.company})`;
      if (contact.status) context += ` [${contact.status}]`;
      context += `\n`;
    });
    if (contacts.length > 10) context += `... și încă ${contacts.length - 10} contacte\n`;
    context += `\n`;
  }

  // CAMPANII
  if (campaigns && campaigns.length > 0) {
    context += `📢 CAMPANII (${campaigns.length} total):\n`;
    campaigns.forEach((campaign: any, index: number) => {
      const successRate = campaign.total_contacts > 0 ? 
        Math.round((campaign.successful_calls / campaign.total_contacts) * 100) : 0;
      context += `${index + 1}. ${campaign.name} - ${campaign.status}\n`;
      context += `   Total contacte: ${campaign.total_contacts}, Reușite: ${campaign.successful_calls}/${campaign.called_contacts} (${successRate}%)\n`;
    });
    context += `\n`;
  }

  // NUMERE DE TELEFON
  if (phoneNumbers && phoneNumbers.length > 0) {
    context += `☎️ NUMERE DE TELEFON (${phoneNumbers.length}):\n`;
    phoneNumbers.forEach((phone: any, index: number) => {
      const status = phone.is_primary ? '⭐ Principal' : 'Secundar';
      context += `${index + 1}. ${phone.phone_number} (${phone.label}) - ${status}\n`;
      if (phone.connected_agent_id) context += `   Conectat la agentul: ${phone.connected_agent_id}\n`;
    });
    context += `\n`;
  }

  // CONVERSAȚII AI
  if (conversations && conversations.length > 0) {
    context += `💬 CONVERSAȚII AI RECENTE (${conversations.length}):\n`;
    conversations.slice(0, 5).forEach((conv: any, index: number) => {
      context += `${index + 1}. ${conv.agent_name} - ${conv.message_count} mesaje, ${conv.credits_used} credite\n`;
      context += `   Durată: ${conv.duration_minutes || 0} min, Cost: $${conv.cost_usd || 0}\n`;
    });
    context += `\n`;
  }

  // DOCUMENTE CUNOȘTINȚE
  if (documents && documents.length > 0) {
    context += `📄 DOCUMENTE CUNOȘTINȚE (${documents.length}):\n`;
    documents.slice(0, 5).forEach((doc: any, index: number) => {
      context += `${index + 1}. ${doc.name} (${doc.file_type || 'text'})\n`;
      context += `   Creat: ${new Date(doc.created_at).toLocaleDateString('ro-RO')}\n`;
    });
    if (documents.length > 5) context += `... și încă ${documents.length - 5} documente\n`;
    context += `\n`;
  }

  // CERERI DE CALLBACK
  if (callbacks && callbacks.length > 0) {
    context += `📋 CERERI CALLBACK (${callbacks.length}):\n`;
    callbacks.slice(0, 3).forEach((cb: any, index: number) => {
      const status = cb.status === 'scheduled' ? '⏰ Programat' : 
                    cb.status === 'completed' ? '✅ Completat' : '❌ Anulat';
      context += `${index + 1}. ${cb.client_name} (${cb.phone_number}) - ${status}\n`;
      context += `   Programat pentru: ${new Date(cb.scheduled_time).toLocaleString('ro-RO')}\n`;
    });
    context += `\n`;
  }

  // ANALIZĂ CONVERSAȚII
  if (analytics && analytics.length > 0) {
    context += `📈 ANALITICE CONVERSAȚII (ultimele ${analytics.length}):\n`;
    const avgDuration = analytics.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / analytics.length;
    const totalCost = analytics.reduce((sum, a) => sum + (a.cost_credits || 0), 0);
    context += `Durată medie: ${Math.round(avgDuration / 60)} min, Total credite: ${totalCost}\n`;
    const statusCounts = analytics.reduce((acc, a) => {
      acc[a.call_status] = (acc[a.call_status] || 0) + 1;
      return acc;
    }, {});
    context += `Statusuri: ${Object.entries(statusCounts).map(([status, count]) => `${status}: ${count}`).join(', ')}\n\n`;
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

    // Extrage TOATE datele utilizatorului pentru context complet
    const [
      userStats, todaysCalls, allCalls, userAgents, conversations,
      contacts, campaigns, phoneNumbers, activeAgents, documents,
      callbacks, transactions, analytics
    ] = await Promise.all([
      getUserStatistics(userId),
      getTodaysCallHistory(userId),
      getAllCallHistory(userId),
      getUserAgents(userId),
      getUserConversations(userId),
      getUserContacts(userId),
      getUserCampaigns(userId),
      getUserPhoneNumbers(userId),
      getUserActiveAgents(userId),
      getUserKnowledgeDocuments(userId),
      getCallbackRequests(userId),
      getBalanceTransactions(userId),
      getConversationAnalytics(userId)
    ]);

    // Generează contextul complet cu TOATE datele utilizatorului
    const userContext = generateUserContext({
      ...userStats,
      todaysCalls,
      allCalls,
      agents: userAgents,
      conversations,
      contacts,
      campaigns,
      phoneNumbers,
      activeAgents,
      documents,
      callbacks,
      transactions,
      analytics
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
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
    context += `📢 CAMPANII (${campaigns.length} active):\n`;
    campaigns.slice(0, 5).forEach((campanie: any, index: number) => {
      context += `${index + 1}. ${campanie.name} - Status: ${campanie.status || 'necunoscut'}\n`;
    });
    if (campaigns.length > 5) context += `... și încă ${campaigns.length - 5} campanii\n`;
    context += `\n`;
  }

  // NUMERE DE TELEFON
  if (phoneNumbers && phoneNumbers.length > 0) {
    context += `📞 NUMERE DE TELEFON (${phoneNumbers.length} disponibile):\n`;
    phoneNumbers.forEach((phone: any, index: number) => {
      context += `${index + 1}. ${phone.phone_number} - ${phone.description || 'fără descriere'}\n`;
    });
    context += `\n`;
  }

  // AGENȚI ACTIVI
  if (activeAgents && activeAgents.length > 0) {
    context += `🟢 AGENȚI ACTIVI (${activeAgents.length}):\n`;
    activeAgents.forEach((agent: any, index: number) => {
      context += `${index + 1}. ${agent.name} - Status: ${agent.status || 'necunoscut'}\n`;
    });
    context += `\n`;
  }

  // DOCUMENTE DE CUNOȘTINȚE
  if (documents && documents.length > 0) {
    context += `📚 DOCUMENTE DE CUNOȘTINȚE (${documents.length}):\n`;
    documents.slice(0, 5).forEach((doc: any, index: number) => {
      context += `${index + 1}. ${doc.title} - ${doc.description?.substring(0, 80) || 'fără descriere'}\n`;
    });
    if (documents.length > 5) context += `... și încă ${documents.length - 5} documente\n`;
    context += `\n`;
  }

  // CALLBACK-URI PROGRAMATE
  if (callbacks && callbacks.length > 0) {
    context += `📅 CALLBACK-URI PROGRAMATE (${callbacks.length}):\n`;
    callbacks.slice(0, 5).forEach((cb: any, index: number) => {
      context += `${index + 1}. ${cb.client_name} - ${new Date(cb.scheduled_time).toLocaleString('ro-RO')} - Status: ${cb.status}\n`;
    });
    if (callbacks.length > 5) context += `... și încă ${callbacks.length - 5} callback-uri\n`;
    context += `\n`;
  }

  // ANALITICE CONVERSAȚII
  if (analytics && analytics.length > 0) {
    context += `📈 ANALITICE CONVERSAȚII (${analytics.length} recente):\n`;
    analytics.forEach((an: any, index: number) => {
      context += `${index + 1}. Conversație ID: ${an.conversation_id} - Scor satisfacție: ${an.satisfaction_score || 'N/A'}\n`;
    });
    context += `\n`;
  }

  return context;
};

// Tool execution functions pentru MCP/JARVIS functionality
const executeInitiateCall = async (userId: string, contactName: string, phoneNumber: string, agentType?: string) => {
  try {
    console.log('🚀 Initiating call:', { userId, contactName, phoneNumber, agentType });
    
    // Find suitable agent
    const agents = await getUserAgents(userId);
    let selectedAgent = null;
    
    if (agentType) {
      // Search for agent by type/description
      selectedAgent = agents.find(agent => 
        agent.description?.toLowerCase().includes(agentType.toLowerCase()) ||
        agent.name.toLowerCase().includes(agentType.toLowerCase())
      );
    }
    
    // Fallback to first active agent
    if (!selectedAgent) {
      selectedAgent = agents.find(agent => agent.is_active) || agents[0];
    }
    
    if (!selectedAgent) {
      return {
        success: false,
        message: 'Nu am găsit niciun agent disponibil în contul tău. Te rog să creezi mai întâi un agent.',
        data: null
      };
    }
    
    // Call the initiate-scheduled-call function
    const { data: callResult, error } = await supabase.functions.invoke('initiate-scheduled-call', {
      body: {
        agent_id: selectedAgent.agent_id,
        phone_number: phoneNumber,
        contact_name: contactName,
        user_id: userId,
        is_test_call: false
      }
    });
    
    if (error) {
      console.error('Error initiating call:', error);
      return {
        success: false,
        message: `Eroare la inițierea apelului: ${error.message}`,
        data: null
      };
    }
    
    console.log('✅ Call initiated successfully:', callResult);
    
    return {
      success: true,
      message: `Apelul către ${contactName} (${phoneNumber}) a fost inițiat cu succes folosind agentul "${selectedAgent.name}". ID conversație: ${callResult?.conversation_id || 'N/A'}`,
      data: {
        agent: selectedAgent.name,
        contact: contactName,
        phone: phoneNumber,
        conversationId: callResult?.conversation_id,
        callResult
      }
    };
    
  } catch (error) {
    console.error('Error in executeInitiateCall:', error);
    return {
      success: false,
      message: `Eroare la inițierea apelului: ${error.message}`,
      data: null
    };
  }
};

const executeFindAgent = async (userId: string, agentType: string) => {
  try {
    const agents = await getUserAgents(userId);
    
    const matchingAgents = agents.filter(agent => 
      agent.description?.toLowerCase().includes(agentType.toLowerCase()) ||
      agent.name.toLowerCase().includes(agentType.toLowerCase()) ||
      agent.system_prompt?.toLowerCase().includes(agentType.toLowerCase())
    );
    
    return {
      success: true,
      message: `Am găsit ${matchingAgents.length} agent(i) pentru "${agentType}"`,
      data: matchingAgents
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la căutarea agentului: ${error.message}`,
      data: null
    };
  }
};

const executeSearchContact = async (userId: string, query: string) => {
  try {
    const contacts = await getUserContacts(userId);
    
    const matchingContacts = contacts.filter(contact => 
      contact.nume?.toLowerCase().includes(query.toLowerCase()) ||
      contact.telefon?.includes(query) ||
      contact.company?.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      message: `Am găsit ${matchingContacts.length} contact(e) pentru "${query}"`,
      data: matchingContacts
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la căutarea contactului: ${error.message}`,
      data: null
    };
  }
};

const executeScheduleCallback = async (userId: string, clientName: string, phoneNumber: string, scheduledTime: string, reason?: string) => {
  try {
    const { data, error } = await supabase
      .from('callback_requests')
      .insert({
        user_id: userId,
        client_name: clientName,
        phone_number: phoneNumber,
        scheduled_time: new Date(scheduledTime).toISOString(),
        reason: reason || 'Programat din chat AI',
        status: 'scheduled',
        priority: 'medium'
      })
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        message: `Eroare la programarea callback-ului: ${error.message}`,
        data: null
      };
    }
    
    return {
      success: true,
      message: `Callback-ul pentru ${clientName} (${phoneNumber}) a fost programat cu succes pentru ${new Date(scheduledTime).toLocaleString('ro-RO')}`,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: `Eroare la programarea callback-ului: ${error.message}`,
      data: null
    };
  }
};

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: "function",
    function: {
      name: "initiate_call",
      description: "Inițiază un apel telefonic către un contact folosind un agent AI. FOLOSEȘTE ACEASTĂ FUNCȚIE când utilizatorul cere să sune pe cineva.",
      parameters: {
        type: "object",
        properties: {
          contact_name: {
            type: "string",
            description: "Numele persoanei care va fi sunată"
          },
          phone_number: {
            type: "string",
            description: "Numărul de telefon (format internațional cu +)"
          },
          agent_type: {
            type: "string",
            description: "Tipul de agent dorit (ex: vânzări, suport, consultanță)"
          }
        },
        required: ["contact_name", "phone_number"]
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "find_agent",
      description: "Găsește agenți AI potriviți pe baza unei descrieri sau tipului dorit",
      parameters: {
        type: "object",
        properties: {
          agent_type: {
            type: "string",
            description: "Tipul sau descrierea agentului căutat"
          }
        },
        required: ["agent_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_contact",
      description: "Caută contacte în baza de date pe baza numelui, telefonului sau companiei",
      parameters: {
        type: "object", 
        properties: {
          query: {
            type: "string",
            description: "Termenul de căutare (nume, telefon sau companie)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "schedule_callback",
      description: "Programează un callback pentru o dată și oră viitoare",
      parameters: {
        type: "object",
        properties: {
          client_name: {
            type: "string",
            description: "Numele clientului"
          },
          phone_number: {
            type: "string", 
            description: "Numărul de telefon"
          },
          scheduled_time: {
            type: "string",
            description: "Data și ora programată (format ISO)"
          },
          reason: {
            type: "string",
            description: "Motivul callback-ului"
          }
        },
        required: ["client_name", "phone_number", "scheduled_time"]
      }
    }
  }
];

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
        // Vector search implementation
        // Fetch agent's knowledge documents embeddings and perform similarity search
        const { data: agentDocs } = await supabase
          .from('knowledge_documents')
          .select('id, content, embedding')
          .eq('agent_id', agentId);

        if (agentDocs && agentDocs.length > 0) {
          // For simplicity, concatenate top 3 documents content as context
          contextText = agentDocs.slice(0, 3).map((doc: any) => doc.content).join('\n\n');
        }
      } catch (error) {
        console.error('Error in vector search:', error);
      }
    }

    // Pas 3: Creează prompt-ul pentru OpenAI cu context complet
    const finalSystemPrompt = systemPrompt || `TU EȘTI KALINA AI - UN ASISTENT OPERAȚIONAL CARE EXECUTĂ ACȚIUNI AUTOMAT!

🚨 IMPORTANT: TU POȚI ȘI TREBUIE SĂ FACI ACȚIUNI CONCRETE!

CONTEXT COMPLET UTILIZATOR:
${userContext}

${contextText ? `INFORMAȚII SPECIFICE DIN BAZA DE CUNOȘTINȚE:
${contextText}

` : ''}INSTRUCȚIUNI CRITICE - EXECUTĂ AUTOMAT FĂRĂ SĂ CERI PERMISIUNI:

📞 APELURI TELEFONICE:
- Când utilizatorul zice "Sună-l pe [nume] cu [numărul]" → EXECUȚI initiate_call() DIRECT
- Când zice "Sună ultimii clienți" → Te uiți în call_history și îi suni pe toți AUTOMAT  
- NU întrebi "Vrei să...?" - TU FACI DIRECT!

🤖 GĂSIRE AGENȚI:
- Pentru "agent de vânzări", "agent tehnic" etc. → GĂSEȘTI cel mai potrivit din lista utilizatorului
- Folosești find_agent() sau găsești direct din datele disponibile

👥 CĂUTARE CONTACTE:
- Pentru orice nume menționat → CAUȚI în contacts_database automat
- Folosești search_contact() pentru a găsi informații

📅 PROGRAMĂRI:
- Pentru "programează un apel" → CREEZI callback automat cu schedule_callback()

🎯 COMPORTAMENT OBLIGATORIU:
❌ NICIODATĂ: "Nu pot", "Trebuie să", "Poți să", "Te rog să"
✅ ÎNTOTDEAUNA: "Fac acum", "Inițiez apelul", "Am găsit și sun", "Programez"

❌ NU ceri confirmări sau permisiuni
✅ EXECUȚI și anunți ce faci: "Inițiez apelul către Ion cu agentul de vânzări..."

❌ NU explici proceduri  
✅ LE FACI și raportezi rezultatul

TU EȘTI UN JARVIS ADEVĂRAT - OPERAȚIONAL, NU DOAR INFORMATIV!

TOOLS DISPONIBILE OBLIGATORIU DE FOLOSIT:
- initiate_call(contact_name, phone_number, agent_type)
- find_agent(agent_type)  
- search_contact(query)
- schedule_callback(client_name, phone_number, scheduled_time, reason)

EXECUTĂ IMEDIAT CÂND ESTE CERUT - FĂRĂ EZITĂRI!`;

    const messages = [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: message }
    ];

    // Pas 4: Trimite request la OpenAI cu tool calling
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
        temperature: 0.1, // Very low temperature for consistent tool usage
        tools: tools,
        tool_choice: "auto"
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate response');
    }

    const openaiData = await openaiResponse.json();
    const aiMessage = openaiData.choices[0]?.message;

    if (!aiMessage) {
      throw new Error('No response generated');
    }

    let finalResponse = aiMessage.content || '';
    let toolResults = [];

    // Handle tool calls if present
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      console.log('🛠️ Tool calls detected:', aiMessage.tool_calls.length);
      
      for (const toolCall of aiMessage.tool_calls) {
        console.log('Executing tool:', toolCall.function.name, toolCall.function.arguments);
        
        try {
          const args = JSON.parse(toolCall.function.arguments);
          let toolResult;
          
          switch (toolCall.function.name) {
            case 'initiate_call':
              toolResult = await executeInitiateCall(
                userId, 
                args.contact_name, 
                args.phone_number, 
                args.agent_type
              );
              break;
              
            case 'find_agent':
              toolResult = await executeFindAgent(userId, args.agent_type);
              break;
              
            case 'search_contact':
              toolResult = await executeSearchContact(userId, args.query);
              break;
              
            case 'schedule_callback':
              toolResult = await executeScheduleCallback(
                userId,
                args.client_name,
                args.phone_number,
                args.scheduled_time,
                args.reason
              );
              break;
              
            default:
              toolResult = {
                success: false,
                message: `Tool necunoscut: ${toolCall.function.name}`,
                data: null
              };
          }
          
          toolResults.push({
            tool: toolCall.function.name,
            ...toolResult
          });
          
          console.log(`✅ Tool ${toolCall.function.name} executed:`, toolResult);
          
        } catch (error) {
          console.error(`❌ Error executing tool ${toolCall.function.name}:`, error);
          toolResults.push({
            tool: toolCall.function.name,
            success: false,
            message: `Eroare la executarea acțiunii: ${error.message}`,
            data: null
          });
        }
      }
      
      // If tools were executed, create a follow-up response
      if (toolResults.length > 0) {
        const toolSummary = toolResults.map(result => 
          `${result.success ? '✅' : '❌'} ${result.message}`
        ).join('\n');
        
        // Generate a follow-up response that includes tool results
        const followUpMessages = [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: message },
          { role: 'assistant', content: aiMessage.content || '', tool_calls: aiMessage.tool_calls },
          { role: 'user', content: `Rezultatele acțiunilor executate:\n${toolSummary}\n\nTe rog să confirmi utilizatorului ce s-a întâmplat și să oferi un răspuns relevant.` }
        ];
        
        const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: followUpMessages,
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });
        
        if (followUpResponse.ok) {
          const followUpData = await followUpResponse.json();
          finalResponse = followUpData.choices[0]?.message?.content || finalResponse;
        }
      }
    }

    console.log('Generated response:', finalResponse);

    return new Response(
      JSON.stringify({ 
        response: finalResponse,
        contextFound: contextText.length > 0,
        chunksUsed: contextText ? contextText.split('\n\n').length : 0,
        toolsExecuted: toolResults.length,
        toolResults: toolResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-agent function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

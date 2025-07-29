import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    console.log('Processing message:', message, 'for user:', userId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // System tools for OpenAI
    const tools = [
      {
        type: "function",
        function: {
          name: "query_conversation_analytics",
          description: "Search and analyze conversation data from analytics cache",
          parameters: {
            type: "object",
            properties: {
              search_query: { type: "string", description: "What to search for in conversations" },
              date_range: { type: "string", description: "Date range filter (e.g., 'last_week', 'last_month')" },
              agent_filter: { type: "string", description: "Filter by specific agent" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_phone_numbers_by_criteria",
          description: "Extract phone numbers of callers based on specific criteria",
          parameters: {
            type: "object",
            properties: {
              criteria: { type: "string", description: "Criteria for filtering (e.g., 'asked about price', 'unhappy customers')" },
              limit: { type: "number", description: "Maximum number of results" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_agent_performance",
          description: "Analyze performance metrics for agents",
          parameters: {
            type: "object",
            properties: {
              agent_id: { type: "string", description: "Specific agent ID or 'all' for comparison" },
              metric: { type: "string", description: "Performance metric (e.g., 'success_rate', 'duration', 'satisfaction')" }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_conversation_trends",
          description: "Get trends and statistics from conversations",
          parameters: {
            type: "object",
            properties: {
              period: { type: "string", description: "Time period (e.g., 'last_30_days', 'this_month')" },
              metric: { type: "string", description: "What to analyze (e.g., 'common_questions', 'response_patterns')" }
            }
          }
        }
      }
    ];

    // Function implementations
    async function queryConversationAnalytics(params: any) {
      console.log('Querying conversation analytics:', params);
      
      let query = supabase
        .from('conversation_analytics_cache')
        .select('*')
        .eq('user_id', userId);

      // Add date filtering
      if (params.date_range) {
        const now = new Date();
        let startDate = new Date();
        
        switch (params.date_range) {
          case 'last_week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'last_month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'last_30_days':
            startDate.setDate(now.getDate() - 30);
            break;
        }
        
        query = query.gte('call_date', startDate.toISOString());
      }

      // Add agent filtering
      if (params.agent_filter) {
        query = query.eq('agent_id', params.agent_filter);
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;

      // Search in transcript data
      if (params.search_query && data) {
        const filtered = data.filter(conversation => {
          const transcript = conversation.transcript;
          if (transcript && Array.isArray(transcript)) {
            const fullText = transcript.map(t => t.text || '').join(' ').toLowerCase();
            return fullText.includes(params.search_query.toLowerCase());
          }
          return false;
        });
        return filtered;
      }

      return data || [];
    }

    async function getPhoneNumbersByCriteria(params: any) {
      console.log('Getting phone numbers by criteria:', params);
      
      const { data, error } = await supabase
        .from('conversation_analytics_cache')
        .select('phone_number, contact_name, transcript, call_date')
        .eq('user_id', userId)
        .limit(params.limit || 50);

      if (error) throw error;

      if (!data) return [];

      // Filter based on criteria
      const filtered = data.filter(conversation => {
        const transcript = conversation.transcript;
        if (transcript && Array.isArray(transcript)) {
          const fullText = transcript.map(t => t.text || '').join(' ').toLowerCase();
          const criteria = params.criteria.toLowerCase();
          
          // Common patterns
          if (criteria.includes('preț') || criteria.includes('price')) {
            return fullText.includes('preț') || fullText.includes('cost') || fullText.includes('price');
          }
          if (criteria.includes('nemulțumit') || criteria.includes('unhappy')) {
            return fullText.includes('nemulțumit') || fullText.includes('probleme') || fullText.includes('angry');
          }
          if (criteria.includes('ora') || criteria.includes('time')) {
            return fullText.includes('ora') || fullText.includes('timp') || fullText.includes('când');
          }
          
          return fullText.includes(criteria);
        }
        return false;
      });

      return filtered.map(conv => ({
        phone_number: conv.phone_number,
        contact_name: conv.contact_name,
        call_date: conv.call_date
      }));
    }

    async function analyzeAgentPerformance(params: any) {
      console.log('Analyzing agent performance:', params);
      
      let query = supabase
        .from('conversation_analytics_cache')
        .select('agent_id, agent_name, call_status, duration_seconds, cost_credits, call_date')
        .eq('user_id', userId);

      if (params.agent_id && params.agent_id !== 'all') {
        query = query.eq('agent_id', params.agent_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      if (!data) return [];

      // Group by agent and calculate metrics
      const agentStats: any = {};
      
      data.forEach(conv => {
        const agentId = conv.agent_id || 'unknown';
        if (!agentStats[agentId]) {
          agentStats[agentId] = {
            agent_name: conv.agent_name,
            total_calls: 0,
            successful_calls: 0,
            total_duration: 0,
            total_cost: 0,
            avg_duration: 0,
            success_rate: 0
          };
        }
        
        agentStats[agentId].total_calls++;
        agentStats[agentId].total_duration += conv.duration_seconds || 0;
        agentStats[agentId].total_cost += conv.cost_credits || 0;
        
        if (conv.call_status === 'success') {
          agentStats[agentId].successful_calls++;
        }
      });

      // Calculate averages and rates
      Object.keys(agentStats).forEach(agentId => {
        const stats = agentStats[agentId];
        stats.avg_duration = stats.total_duration / stats.total_calls;
        stats.success_rate = (stats.successful_calls / stats.total_calls) * 100;
      });

      return Object.values(agentStats);
    }

    async function getConversationTrends(params: any) {
      console.log('Getting conversation trends:', params);
      
      const now = new Date();
      let startDate = new Date();
      
      switch (params.period) {
        case 'last_30_days':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'this_month':
          startDate.setDate(1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      const { data, error } = await supabase
        .from('conversation_analytics_cache')
        .select('*')
        .eq('user_id', userId)
        .gte('call_date', startDate.toISOString());

      if (error) throw error;

      if (!data) return [];

      // Analyze trends based on metric
      const trends: any = {
        total_conversations: data.length,
        success_rate: data.length > 0 ? (data.filter(c => c.call_status === 'success').length / data.length) * 100 : 0,
        avg_duration: data.length > 0 ? data.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / data.length : 0,
        common_questions: []
      };

      // Extract common questions/keywords
      const keywords: any = {};
      data.forEach(conv => {
        const transcript = conv.transcript;
        if (transcript && Array.isArray(transcript)) {
          const text = transcript.map(t => t.text || '').join(' ').toLowerCase();
          
          // Common question patterns
          const patterns = ['preț', 'cost', 'ora', 'timp', 'când', 'cum', 'unde', 'ce'];
          patterns.forEach(pattern => {
            if (text.includes(pattern)) {
              keywords[pattern] = (keywords[pattern] || 0) + 1;
            }
          });
        }
      });

      trends.common_questions = Object.entries(keywords)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

      return trends;
    }

    // Call GPT with tools
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `Ești un asistent AI specialist în analiza datelor de conversații. Poți să:
            1. Analizezi conversațiile din cache-ul de analiză
            2. Extragi numere de telefon bazate pe criterii specifice
            3. Analizezi performanța agenților
            4. Identifici tendințe în conversații
            
            Răspunde în română și fii concis dar informativ. Când folosești funcțiile, explică ce ai găsit.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.3
      }),
    });

    const gptData = await gptResponse.json();
    console.log('GPT Response:', JSON.stringify(gptData, null, 2));
    
    if (gptData.error) {
      throw new Error(gptData.error.message);
    }

    let result = gptData.choices[0].message;

    // Handle tool calls (new format)
    if (result.tool_calls && result.tool_calls.length > 0) {
      const toolCall = result.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      console.log('Calling function:', functionName, 'with args:', functionArgs);
      
      let functionResult;
      
      switch (functionName) {
        case 'query_conversation_analytics':
          functionResult = await queryConversationAnalytics(functionArgs);
          break;
        case 'get_phone_numbers_by_criteria':
          functionResult = await getPhoneNumbersByCriteria(functionArgs);
          break;
        case 'analyze_agent_performance':
          functionResult = await analyzeAgentPerformance(functionArgs);
          break;
        case 'get_conversation_trends':
          functionResult = await getConversationTrends(functionArgs);
          break;
        default:
          functionResult = { error: 'Unknown function' };
      }

      console.log('Function result:', functionResult);

      // Send function result back to GPT
      const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'Analizează rezultatele și oferă un răspuns clar și util în română.'
            },
            {
              role: 'user',
              content: message
            },
            {
              role: 'assistant',
              content: null,
              tool_calls: result.tool_calls
            },
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(functionResult)
            }
          ],
          temperature: 0.3
        }),
      });

      const followUpData = await followUpResponse.json();
      console.log('Follow-up response:', followUpData);
      result = followUpData.choices[0].message;
    }

    return new Response(
      JSON.stringify({ 
        response: result.content || 'Am analizat datele tale.',
        functionCalled: result.tool_calls?.[0]?.function?.name || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in agent-ai-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        response: 'Scuze, am întâmpinat o problemă tehnică. Te rog să încerci din nou.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
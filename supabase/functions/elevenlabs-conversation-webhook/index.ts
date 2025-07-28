import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ElevenLabsWebhookPayload {
  conversation_id: string;
  agent_id: string;
  status: 'started' | 'completed' | 'failed';
  phone_number?: string;
  duration_seconds?: number;
  cost_usd?: number;
  transcript?: any[];
  metadata?: any;
}

serve(async (req) => {
  console.log('ElevenLabs conversation webhook called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: ElevenLabsWebhookPayload = await req.json();
    console.log('🎯 WEBHOOK PAYLOAD - Agent în conversația activă:', payload.agent_id);
    console.log('📞 WEBHOOK PAYLOAD - Conversation ID:', payload.conversation_id);
    console.log('🔍 WEBHOOK PAYLOAD - Complet:', payload);

    if (!payload.conversation_id || !payload.agent_id) {
      throw new Error('Missing required fields: conversation_id, agent_id');
    }

    // Find the agent owner based on agent_id
    const { data: agentData, error: agentError } = await supabase
      .from('kalina_agents')
      .select('user_id, name')
      .eq('elevenlabs_agent_id', payload.agent_id)
      .single();

    if (agentError || !agentData) {
      console.error('Could not find agent owner for agent:', payload.agent_id, agentError);
      // Don't throw error, just log and continue - this might be an agent from another system
      console.warn('Agent not found in kalina_agents table, skipping conversation tracking');
      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook received but agent not found in system'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = agentData.user_id;
    const agentName = agentData.name;
    console.log(`✅ AGENT GĂSIT - Proprietar: ${userId}`);
    console.log(`🎯 AGENT ACTIV - ID: ${payload.agent_id}`);
    console.log(`📝 AGENT ACTIV - Nume: ${agentName}`);
    console.log(`🔄 Procesez conversația pentru proprietarul corect al agentului...`);

    // Only process completed conversations
    if (payload.status === 'completed') {
      // Get conversation details from ElevenLabs API
      let conversationDetails = null;
      try {
        const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
        if (apiKey) {
          const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${payload.conversation_id}`, {
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            conversationDetails = await response.json();
            console.log('Retrieved conversation details from ElevenLabs:', conversationDetails);
          }
        }
      } catch (error) {
        console.warn('Could not retrieve conversation details from ElevenLabs:', error);
      }

      // Create call history record
      const callRecord = {
        user_id: userId,
        phone_number: payload.phone_number || conversationDetails?.phone_number || 'Unknown',
        contact_name: conversationDetails?.contact_name || 'Apel ElevenLabs',
        call_status: payload.status === 'completed' ? 'success' : 'failed',
        summary: `Conversație cu ${agentName} - ${payload.duration_seconds || 0}s`,
        dialog_json: JSON.stringify({
          agent_id: payload.agent_id,
          agent_name: agentName,
          transcript: payload.transcript || conversationDetails?.transcript || [],
          conversation_id: payload.conversation_id,
          elevenlabs_history_id: payload.conversation_id,
          webhook_payload: payload,
          conversation_details: conversationDetails
        }),
        call_date: new Date().toISOString(),
        cost_usd: payload.cost_usd || 0,
        agent_id: payload.agent_id, // This is the real ElevenLabs agent_id
        language: 'ro',
        conversation_id: payload.conversation_id,
        elevenlabs_history_id: payload.conversation_id,
        duration_seconds: payload.duration_seconds || 0
      };

      const { data: callData, error: callError } = await supabase
        .from('call_history')
        .insert([callRecord])
        .select()
        .single();

      if (callError) {
        console.error('Error saving call history:', callError);
        throw callError;
      }

      console.log('Call history saved successfully:', callData);

      // Check for callback intent in the conversation
      const transcriptText = payload.transcript?.map((entry: any) => 
        entry.message || entry.text || ''
      ).join(' ') || conversationDetails?.transcript?.map((entry: any) => 
        entry.message || entry.text || ''
      ).join(' ') || '';

      if (transcriptText) {
        try {
          console.log('Checking for callback intent in ElevenLabs conversation...');
          
          const { data: callbackData, error: callbackError } = await supabase.functions.invoke('detect-callback-intent', {
            body: {
              text: transcriptText,
              conversationId: payload.conversation_id,
              phoneNumber: payload.phone_number || conversationDetails?.phone_number,
              contactName: conversationDetails?.contact_name || 'Apelant necunoscut',
              agentId: payload.agent_id // Use the real ElevenLabs agent_id
            }
          });

          if (callbackError) {
            console.warn('Callback detection failed:', callbackError);
          } else if (callbackData?.callbackDetected) {
            console.log('Callback detected and scheduled from webhook:', callbackData);
          }
        } catch (callbackError) {
          console.warn('Error during callback detection from webhook:', callbackError);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Conversation processed successfully',
        call_id: callData.id,
        user_id: userId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For non-completed conversations, just acknowledge
    return new Response(JSON.stringify({
      success: true,
      message: `Conversation ${payload.status} acknowledged`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ElevenLabs conversation webhook:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
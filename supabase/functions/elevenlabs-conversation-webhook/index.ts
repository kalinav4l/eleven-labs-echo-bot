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

// Global debounce map to prevent duplicate processing
const processingMap = new Map<string, Promise<any>>();

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

    // DEBOUNCING: Prevent duplicate processing of the same conversation
    const conversationKey = `${payload.conversation_id}-${payload.status}`;
    
    if (processingMap.has(conversationKey)) {
      console.log('⏳ DEBOUNCING: Conversation already being processed, waiting for completion...');
      try {
        const existingResult = await processingMap.get(conversationKey);
        return new Response(JSON.stringify({
          success: true,
          message: 'Conversation already processed (debounced)',
          result: existingResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.warn('⚠️ Error in debounced processing, continuing with new attempt');
        processingMap.delete(conversationKey);
      }
    }

    // Create processing promise
    const processingPromise = processConversation(supabase, payload);
    processingMap.set(conversationKey, processingPromise);
    
    try {
      const result = await processingPromise;
      return result;
    } finally {
      // Clean up after processing
      processingMap.delete(conversationKey);
    }

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

async function processConversation(supabase: any, payload: ElevenLabsWebhookPayload) {
  // Find the agent owner based on elevenlabs_agent_id
  console.log('🔍 Caut agentul în baza de date cu elevenlabs_agent_id:', payload.agent_id);
    
    const { data: agentData, error: agentError } = await supabase
      .from('kalina_agents')
      .select('user_id, name, agent_id')
      .eq('elevenlabs_agent_id', payload.agent_id)
      .single();

    if (agentError || !agentData) {
      console.error('❌ AGENT NU GĂSIT - Nu pot găsi proprietarul pentru agent:', payload.agent_id);
      console.error('❌ EROARE CĂUTARE AGENT:', agentError);
      console.error('❌ ACEST AGENT NU EXISTĂ ÎN SISTEMUL NOSTRU');
      
      // Return error instead of fallback - no hardcoded agent
      return new Response(JSON.stringify({
        success: false,
        error: `Agent ${payload.agent_id} not found in system. Cannot process callback.`,
        message: 'Agent not registered in our system'
      }), {
        status: 404,
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

      // Calculate cost based on duration (0.15 per minute)
      const COST_PER_MINUTE = 0.15;
      const durationSeconds = payload.duration_seconds || 0;
      const durationMinutes = durationSeconds / 60;
      const calculatedCost = Math.round(durationMinutes * COST_PER_MINUTE * 100) / 100; // Round to 2 decimals
      const finalCost = payload.cost_usd || calculatedCost; // Use payload cost if available, otherwise calculated cost
      
      console.log(`💰 Cost calculation: ${durationSeconds}s = ${durationMinutes.toFixed(2)}min = $${calculatedCost}`);
      console.log(`💳 Final cost to deduct: $${finalCost}`);

      // ATOMIC TRANSACTION: Process balance deduction, statistics, and call history together
      if (finalCost > 0) {
        console.log(`💳 Starting atomic transaction: Deducting $${finalCost} from user ${userId}...`);
        
        try {
          // Use the new atomic transaction function
          const { data: transactionResult, error: transactionError } = await supabase.rpc('execute_atomic_call_transaction', {
            p_user_id: userId,
            p_amount: finalCost,
            p_duration_seconds: durationSeconds,
            p_description: `Apel vocal cu ${agentName} - ${durationSeconds}s`,
            p_conversation_id: payload.conversation_id
          });

          if (transactionError) {
            console.error('❌ ATOMIC TRANSACTION FAILED:', transactionError);
            throw new Error(`Transaction failed: ${transactionError.message}`);
          }
          
          if (!transactionResult) {
            console.warn('⚠️ Transaction returned false - insufficient funds');
            throw new Error('Insufficient funds for call');
          }
          
          console.log('✅ ATOMIC TRANSACTION COMPLETED - Balance and statistics updated');
          
        } catch (atomicError) {
          console.error('❌ CRITICAL ERROR in atomic transaction:', atomicError);
          
          // RETRY LOGIC: Try individual operations as fallback
          console.log('🔄 Attempting fallback: individual operations...');
          
          try {
            const { data: deductResult, error: deductError } = await supabase
              .rpc('deduct_balance', {
                p_user_id: userId,
                p_amount: finalCost,
                p_description: `Apel vocal cu ${agentName} - ${durationSeconds}s`,
                p_conversation_id: payload.conversation_id
              });

            if (deductError || !deductResult) {
              throw new Error('Balance deduction failed in fallback');
            }
            
            console.log('✅ Fallback: Balance deducted successfully');
            
            // Update statistics separately
            await supabase.rpc('update_user_statistics_with_spending', {
              p_user_id: userId,
              p_duration_seconds: durationSeconds,
              p_cost_usd: finalCost
            });
            
            console.log('✅ Fallback: Statistics updated successfully');
            
          } catch (fallbackError) {
            console.error('❌ FALLBACK FAILED:', fallbackError);
            // Continue with call recording but mark as failed transaction
            finalCost = 0; // Don't charge if we can't process payment
          }
        }
      }

      // Extract phone numbers correctly from conversation details
      let callerNumber = null;
      let phoneNumber = payload.phone_number || 'Unknown';
      
      if (conversationDetails?.metadata?.phone_call) {
        const phoneCall = conversationDetails.metadata.phone_call;
        callerNumber = phoneCall.agent_number || null; // Number we call FROM
        phoneNumber = phoneCall.external_number || payload.phone_number || 'Unknown'; // Number we call TO
        console.log('Phone numbers extracted from conversation:', {
          callerNumber,
          phoneNumber,
          originalPayloadPhone: payload.phone_number
        });
      }

      // Create call history record
      const callRecord = {
        user_id: userId,
        phone_number: phoneNumber,
        caller_number: callerNumber,
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
        cost_usd: finalCost, // Use the calculated/final cost
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
              agentId: payload.agent_id, // Use the real ElevenLabs agent_id
              userId: userId // Transmit explicit user_id-ul proprietarului agentului
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
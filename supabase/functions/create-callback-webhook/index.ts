import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallbackWebhookRequest {
  client_name?: string;
  phone_number: string;
  callback_time: string; // "30 minutes", "2 hours", or ISO timestamp  
  reason?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  agent_id?: string;
  agent_name?: string; // Alternative to agent_id
  conversation_id?: string;
  user_id?: string;
  user_email?: string;
  send_sms?: boolean;
  sms_message?: string;
}

serve(async (req) => {
  console.log('Callback webhook called:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Only process POST requests with JSON data
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Only POST requests are supported'
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let payload: CallbackWebhookRequest;
    try {
      payload = await req.json();
    } catch (e) {
      console.error('Invalid JSON in request body:', e);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('Received callback request:', payload);

    // Validate required fields
    if (!payload.phone_number || !payload.callback_time) {
      throw new Error('Missing required fields: phone_number, callback_time');
    }

    // Process callback time to scheduled datetime
    let scheduledDatetime;
    const now = new Date();
    
    // Parse callback_time and create scheduled datetime
    const callbackTime = payload.callback_time.toLowerCase();
    if (callbackTime.includes('minute')) {
      const minutes = parseInt(callbackTime.match(/\d+/)?.[0] || '5');
      scheduledDatetime = new Date(now.getTime() + minutes * 60 * 1000);
    } else if (callbackTime.includes('hour')) {
      const hours = parseInt(callbackTime.match(/\d+/)?.[0] || '1');
      scheduledDatetime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    } else if (callbackTime.includes('tomorrow')) {
      scheduledDatetime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else {
      // Default to 10 minutes
      scheduledDatetime = new Date(now.getTime() + 10 * 60 * 1000);
    }

    // Normalize phone number
    let normalizedPhone = payload.phone_number;
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+373' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+373' + normalizedPhone;
    }

    const processedData = {
      normalized_phone: normalizedPhone,
      scheduled_datetime: scheduledDatetime.toISOString(),
      priority: payload.priority || 'medium',
      description: `Callback requested because: ${payload.reason || 'client requested callback'}.`,
      client_name: payload.client_name || 'Client'
    };
    
    console.log('Processed callback data:', processedData);

    // Determine user_id through multiple fallback methods for security
    let userId = payload.user_id;
    
    // Method 1: Direct user_id provided
    if (!userId && payload.user_email) {
      // Method 2: Look up by email
      const { data: userData } = await supabase.auth.admin.listUsers();
      const foundUser = userData.users.find(u => u.email === payload.user_email);
      userId = foundUser?.id;
      console.log('Found user by email:', payload.user_email, '-> userId:', userId);
    }
    
    if (!userId && payload.agent_name) {
      // Method 3: Look up by agent name
      const { data: agentData } = await supabase
        .from('kalina_agents')
        .select('user_id, agent_id')
        .eq('name', payload.agent_name)
        .eq('is_active', true)
        .maybeSingle();
      
      userId = agentData?.user_id;
      console.log('Found user by agent_name:', payload.agent_name, '-> userId:', userId);
      
      // Also set agent_id if found
      if (agentData?.agent_id) {
        payload.agent_id = agentData.agent_id;
      }
    }
    
    if (!userId && payload.agent_id) {
      // Method 3.5: Try agent_id as agent name first
      const { data: agentByName } = await supabase
        .from('kalina_agents')
        .select('user_id, agent_id')
        .eq('name', payload.agent_id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (agentByName?.user_id) {
        userId = agentByName.user_id;
        payload.agent_id = agentByName.agent_id; // Update with real agent_id
        console.log('Found user by agent_id as name:', payload.agent_id, '-> userId:', userId);
      }
    }
    
    if (!userId && payload.agent_id) {
      // Method 4: Look up by agent_id (ElevenLabs agent_id)
      const { data: agentData } = await supabase
        .from('kalina_agents')
        .select('user_id')
        .eq('elevenlabs_agent_id', payload.agent_id)
        .maybeSingle();
      
      userId = agentData?.user_id;
      console.log('Found user by elevenlabs_agent_id:', payload.agent_id, '-> userId:', userId);
    }
    
    if (!userId && payload.agent_id) {
      // Method 5: Look up by internal agent_id
      const { data: agentData2 } = await supabase
        .from('kalina_agents')
        .select('user_id')
        .eq('agent_id', payload.agent_id)
        .maybeSingle();
      
      userId = agentData2?.user_id;
      console.log('Found user by internal agent_id:', payload.agent_id, '-> userId:', userId);
    }

    // CRITICAL: No hardcoded fallback - require agent owner identification
    if (!userId) {
      console.error('❌ CALLBACK CREATION FAILED - Nu pot determina proprietarul agentului');
      console.error('❌ AGENT_ID PRIMIT:', payload.agent_id);
      console.error('❌ AGENT_NAME PRIMIT:', payload.agent_name);
      console.error('❌ USER_EMAIL PRIMIT:', payload.user_email);
      console.error('❌ USER_ID PRIMIT:', payload.user_id);
      console.error('❌ ACEST CALLBACK NU VA FI CREAT deoarece nu știu cui să-l asociez');
      
      throw new Error(`Cannot determine agent owner for callback. Agent ${payload.agent_id || payload.agent_name} not found in system. Please ensure the agent is properly registered.`);
    }

    console.log('Final userId determined:', userId);

    // Create the callback in scheduled_calls table
    const { data: callbackData, error: callbackError } = await supabase
      .from('scheduled_calls')
      .insert({
        user_id: userId,
        client_name: processedData.client_name || payload.client_name,
        phone_number: processedData.normalized_phone || payload.phone_number,
        scheduled_datetime: processedData.scheduled_datetime,
        priority: processedData.priority || payload.priority || 'medium',
        description: processedData.description || payload.reason,
        task_type: 'callback',
        agent_id: payload.agent_id,
        created_via_webhook: true,
        original_conversation_id: payload.conversation_id,
        webhook_payload: payload,
        status: 'scheduled'
      })
      .select()
      .single();

    if (callbackError) {
      console.error('Error creating callback:', callbackError);
      throw new Error(`Failed to create callback: ${callbackError.message}`);
    }

    console.log('Callback created successfully:', callbackData);

    // Send SMS if requested and SMS.to API key is available
    let smsResult = null;
    if (payload.send_sms && payload.sms_message) {
      const smsApiKey = Deno.env.get('SMS_TO_API_KEY');
      if (smsApiKey) {
        try {
          console.log('Sending SMS confirmation...');
          
          // Personalize SMS message
          const personalizedMessage = payload.sms_message
            .replace(/\{client_name\}/g, processedData.client_name || payload.client_name)
            .replace(/\{callback_time\}/g, payload.callback_time)
            .replace(/\{reason\}/g, payload.reason || 'discuția noastră');

          const smsResponse = await fetch('https://api.sms.to/sms/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${smsApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{
                message: personalizedMessage,
                to: processedData.normalized_phone || payload.phone_number
              }],
              sender_id: 'aichat'
            }),
          });

          smsResult = await smsResponse.json();
          console.log('SMS sent:', smsResult);

          // Update callback with SMS status
          await supabase
            .from('scheduled_calls')
            .update({
              sms_sent: true,
              sms_response: smsResult
            })
            .eq('id', callbackData.id);

        } catch (smsError) {
          console.error('Error sending SMS:', smsError);
          smsResult = { error: smsError.message };
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      callback_id: callbackData.id,
      scheduled_datetime: processedData.scheduled_datetime,
      processed_data: processedData,
      sms_sent: !!smsResult,
      sms_result: smsResult,
      message: `Callback programat cu succes pentru ${processedData.client_name || payload.client_name} la ${processedData.scheduled_datetime}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in callback webhook:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
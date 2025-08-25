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
      // Extract specific time if provided (e.g., "tomorrow 10:00", "tomorrow at 10:00")
      const timeMatch = callbackTime.match(/(?:tomorrow|mâine).*?(\d{1,2}):?(\d{2})?/i);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        scheduledDatetime = new Date(now);
        scheduledDatetime.setDate(scheduledDatetime.getDate() + 1);
        scheduledDatetime.setHours(hour, minute, 0, 0);
      } else {
        // Default to 10:00 AM tomorrow if no specific time mentioned
        scheduledDatetime = new Date(now);
        scheduledDatetime.setDate(scheduledDatetime.getDate() + 1);
        scheduledDatetime.setHours(10, 0, 0, 0);
      }
    } else if (callbackTime.includes('today') || callbackTime.includes('azi')) {
      // Extract specific time for today
      const timeMatch = callbackTime.match(/(?:today|azi).*?(\d{1,2}):?(\d{2})?/i);
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        scheduledDatetime = new Date(now);
        scheduledDatetime.setHours(hour, minute, 0, 0);
      } else {
        // Default to 2 hours from now if no specific time
        scheduledDatetime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      }
    } else {
      // Try to parse specific time patterns including Romanian format "15 și 30"
      let timeMatch = callbackTime.match(/(\d{1,2}):(\d{2})/); // Standard format "15:30"
      if (!timeMatch) {
        timeMatch = callbackTime.match(/(\d{1,2})\s*(?:și|si|şi)\s*(\d{2})/i); // Romanian format "15 și 30"
      }
      if (!timeMatch) {
        timeMatch = callbackTime.match(/la\s*(\d{1,2}):?(\d{2})?/i); // "la 15:30" or "la 15"
      }
      if (!timeMatch) {
        timeMatch = callbackTime.match(/(\d{1,2})\s*(?:h|ore|ora)/i); // "15h" or "15 ora"
      }
      
      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        scheduledDatetime = new Date(now);
        
        // If time is in the past today, schedule for tomorrow
        const testTime = new Date(now);
        testTime.setHours(hour, minute, 0, 0);
        if (testTime <= now) {
          scheduledDatetime.setDate(scheduledDatetime.getDate() + 1);
        }
        scheduledDatetime.setHours(hour, minute, 0, 0);
      } else {
        // Try to parse as ISO timestamp or relative time
        try {
          scheduledDatetime = new Date(payload.callback_time);
          if (isNaN(scheduledDatetime.getTime())) {
            throw new Error('Invalid date');
          }
        } catch {
          // Default to 10 minutes if parsing fails
          scheduledDatetime = new Date(now.getTime() + 10 * 60 * 1000);
        }
      }
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

    // IMPROVED: Determine user_id through comprehensive agent owner identification
    let userId: string | null = null;
    
    console.log('🔍 Începerea identificării proprietarului agentului...');
    console.log('📥 Date primite:', {
      user_id: payload.user_id,
      user_email: payload.user_email,
      agent_name: payload.agent_name,
      agent_id: payload.agent_id
    });
    
    // Method 1: Direct user_id validation (verify it exists and owns the agent)
    if (payload.user_id) {
      console.log('🔍 Method 1: Verificare user_id direct...');
      
      // Validate that this user_id actually owns the specified agent
      if (payload.agent_id || payload.agent_name) {
        const { data: ownershipCheck } = await supabase
          .from('kalina_agents')
          .select('user_id, name, agent_id, elevenlabs_agent_id')
          .eq('user_id', payload.user_id)
          .eq('is_active', true)
          .or(`agent_id.eq.${payload.agent_id || 'null'},elevenlabs_agent_id.eq.${payload.agent_id || 'null'},name.eq.${payload.agent_name || 'null'}`)
          .maybeSingle();
        
        if (ownershipCheck) {
          userId = payload.user_id;
          console.log('✅ Method 1 SUCCESS: User verificat ca proprietar al agentului');
        } else {
          console.log('❌ Method 1 FAILED: User_id nu deține agentul specificat');
        }
      } else {
        // If no agent specified, just validate the user exists
        const { data: userCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', payload.user_id)
          .maybeSingle();
        
        if (userCheck) {
          userId = payload.user_id;
          console.log('✅ Method 1 SUCCESS: User_id valid');
        }
      }
    }
    
    // Method 2: Look up by agent information (most reliable method)
    if (!userId && (payload.agent_id || payload.agent_name)) {
      console.log('🔍 Method 2: Căutare prin informațiile agentului...');
      
      // Try multiple agent identifier patterns
      const agentQueries = [];
      
      if (payload.agent_id) {
        agentQueries.push(
          // Internal agent_id
          supabase.from('kalina_agents').select('user_id, name, agent_id').eq('agent_id', payload.agent_id).eq('is_active', true).maybeSingle(),
          // ElevenLabs agent_id
          supabase.from('kalina_agents').select('user_id, name, agent_id').eq('elevenlabs_agent_id', payload.agent_id).eq('is_active', true).maybeSingle(),
          // Agent name (in case agent_id is actually a name)
          supabase.from('kalina_agents').select('user_id, name, agent_id').eq('name', payload.agent_id).eq('is_active', true).maybeSingle()
        );
      }
      
      if (payload.agent_name) {
        agentQueries.push(
          supabase.from('kalina_agents').select('user_id, name, agent_id').eq('name', payload.agent_name).eq('is_active', true).maybeSingle()
        );
      }
      
      // Execute all queries and find the first match
      for (let i = 0; i < agentQueries.length; i++) {
        const { data: agentData, error } = await agentQueries[i];
        if (agentData && !error) {
          userId = agentData.user_id;
          payload.agent_id = agentData.agent_id; // Standardize to internal agent_id
          console.log(`✅ Method 2 SUCCESS (query ${i+1}): Agent găsit - User: ${userId}, Agent: ${agentData.name}`);
          break;
        }
      }
      
      if (!userId) {
        console.log('❌ Method 2 FAILED: Agentul nu a fost găsit în baza de date');
      }
    }
    
    // Method 3: Look up by user email (only if previous methods failed)
    if (!userId && payload.user_email) {
      console.log('🔍 Method 3: Căutare prin email...');
      const { data: userData } = await supabase.auth.admin.listUsers();
      const foundUser = userData.users.find(u => u.email === payload.user_email);
      
      if (foundUser) {
        // Double-check that this user actually has agents
        const { data: userAgents } = await supabase
          .from('kalina_agents')
          .select('id')
          .eq('user_id', foundUser.id)
          .eq('is_active', true);
        
        if (userAgents && userAgents.length > 0) {
          userId = foundUser.id;
          console.log('✅ Method 3 SUCCESS: User găsit prin email și confirmat că are agenți');
        } else {
          console.log('❌ Method 3 FAILED: User găsit prin email dar nu are agenți activi');
        }
      } else {
        console.log('❌ Method 3 FAILED: Nu s-a găsit user cu acest email');
      }
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
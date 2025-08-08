import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateScheduledCallbackPayload {
  client_name: string;
  phone_number: string;
  scheduled_datetime: string; // ISO string
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  notes?: string;
  agent_id?: string; // internal agent_id or elevenlabs_agent_id
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: CreateScheduledCallbackPayload = await req.json();

    // Basic validation
    if (!body.client_name || !body.phone_number || !body.scheduled_datetime) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse/validate datetime
    const sched = new Date(body.scheduled_datetime);
    if (isNaN(sched.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid scheduled_datetime' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine target user by agent ownership first
    let targetUserId: string | null = null;

    if (body.agent_id) {
      // Try by elevenlabs_agent_id first, then agent_id
      const { data: byEleven, error: err1 } = await supabase
        .from('kalina_agents')
        .select('user_id, agent_id')
        .eq('elevenlabs_agent_id', body.agent_id)
        .maybeSingle();

      if (byEleven?.user_id) {
        targetUserId = byEleven.user_id as string;
      } else {
        const { data: byInternal } = await supabase
          .from('kalina_agents')
          .select('user_id, agent_id')
          .eq('agent_id', body.agent_id)
          .maybeSingle();
        if (byInternal?.user_id) targetUserId = byInternal.user_id as string;
      }
    }

    // Fallback: try phone_number mapping
    if (!targetUserId) {
      const { data: mapping } = await supabase
        .from('phone_number_mappings')
        .select('user_id')
        .eq('phone_number', body.phone_number)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mapping?.user_id) targetUserId = mapping.user_id as string;
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'Cannot determine target user for this agent/phone' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert into scheduled_calls with service role (bypasses RLS)
    const insertPayload = {
      user_id: targetUserId,
      client_name: body.client_name,
      phone_number: body.phone_number,
      scheduled_datetime: sched.toISOString(),
      priority: body.priority || 'medium',
      description: body.description,
      notes: body.notes,
      status: 'scheduled',
      task_type: 'callback',
      agent_id: body.agent_id || null,
    } as const;

    const { data, error } = await supabase
      .from('scheduled_calls')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, callback: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Function error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const BASE_URL = "https://api.elevenlabs.io/v1/convai/batch-calling";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY nu este configurat în Supabase Secrets');
    }

    const { action, ...params } = await req.json();
    console.log(`🔄 Acțiune batch calling: ${action}`, params);

    const headers = {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json"
    };

    let response: Response;

    switch (action) {
      case 'submit_batch_call':
        response = await submitBatchCall(headers, params);
        break;
      case 'list_workspace_calls':
        response = await listWorkspaceCalls(headers);
        break;
      case 'get_batch_call_details':
        response = await getBatchCallDetails(headers, params.batch_id);
        break;
      case 'cancel_batch_call':
        response = await cancelBatchCall(headers, params.batch_id);
        break;
      case 'retry_batch_call':
        response = await retryBatchCall(headers, params.batch_id);
        break;
      default:
        throw new Error(`Acțiune necunoscută: ${action}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Eroare ElevenLabs ${action}:`, data);
      throw new Error(data.detail || `Eroare ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Succes ${action}:`, data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Eroare în batch calling function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function submitBatchCall(headers: Record<string, string>, params: any) {
  console.log('🚀 Se inițiază lotul de apeluri:', params.call_name);
  
  const payload = {
    call_name: params.call_name || "Lot de apeluri",
    agent_id: params.agent_id,
    agent_phone_number_id: params.agent_phone_id,
    recipients: params.recipients
  };

  console.log('📤 Payload batch call:', JSON.stringify(payload, null, 2));

  return await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
}

async function listWorkspaceCalls(headers: Record<string, string>) {
  console.log('📋 Se listează toate loturile de apeluri...');
  
  return await fetch(`${BASE_URL}/workspace`, {
    method: 'GET',
    headers
  });
}

async function getBatchCallDetails(headers: Record<string, string>, batch_id: string) {
  console.log(`ℹ️ Se obțin detalii pentru lotul: ${batch_id}`);
  
  return await fetch(`${BASE_URL}/${batch_id}`, {
    method: 'GET',
    headers
  });
}

async function cancelBatchCall(headers: Record<string, string>, batch_id: string) {
  console.log(`🛑 Se anulează lotul: ${batch_id}`);
  
  return await fetch(`${BASE_URL}/${batch_id}/cancel`, {
    method: 'POST',
    headers
  });
}

async function retryBatchCall(headers: Record<string, string>, batch_id: string) {
  console.log(`🔄 Se reîncearcă lotul: ${batch_id}`);
  
  return await fetch(`${BASE_URL}/${batch_id}/retry`, {
    method: 'POST',
    headers
  });
}
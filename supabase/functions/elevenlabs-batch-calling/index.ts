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
    console.log('🔑 ELEVENLABS_API_KEY set:', !!ELEVENLABS_API_KEY);
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ELEVENLABS_API_KEY nu este configurat');
      throw new Error('ELEVENLABS_API_KEY nu este configurat în Supabase Secrets');
    }

    const body = await req.json();
    console.log('📥 Request body received:', JSON.stringify(body, null, 2));
    
    const { action, ...params } = body;
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

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Eroare la parsarea JSON:', jsonError);
      const text = await response.text();
      console.error('❌ Response text:', text);
      throw new Error(`Răspuns invalid de la ElevenLabs: ${text}`);
    }
    
    if (!response.ok) {
      console.error(`❌ Eroare ElevenLabs ${action}:`, data);
      throw new Error(data.detail || data.message || `Eroare ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Succes ${action}:`, data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Eroare în batch calling function:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Eroare necunoscută',
      details: error.stack,
      type: error.constructor.name
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function submitBatchCall(headers: Record<string, string>, params: any) {
  console.log('🚀 Se inițiază lotul de apeluri:', params.call_name);
  
  // Validare parametri
  if (!params.agent_id) {
    throw new Error('agent_id este obligatoriu');
  }
  if (!params.agent_phone_id) {
    throw new Error('agent_phone_id este obligatoriu');
  }
  if (!params.recipients || !Array.isArray(params.recipients) || params.recipients.length === 0) {
    throw new Error('recipients trebuie să fie un array cu cel puțin un element');
  }
  
  const payload = {
    call_name: params.call_name || "Lot de apeluri",
    agent_id: params.agent_id,
    agent_phone_number_id: params.agent_phone_id,
    recipients: params.recipients
  };

  console.log('📤 Payload batch call:', JSON.stringify(payload, null, 2));
  console.log('📤 Headers:', JSON.stringify(headers, null, 2));

  const response = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  console.log('📥 Response status:', response.status);
  console.log('📥 Response headers:', JSON.stringify([...response.headers.entries()], null, 2));
  
  // Citește răspunsul o singură dată
  const responseText = await response.text();
  console.log('📥 Response body:', responseText);
  
  // Creează un nou response object pentru a fi returnat
  return new Response(responseText, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
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
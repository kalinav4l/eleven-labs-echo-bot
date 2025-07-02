
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agent_id, phone_number, contact_name, user_id, batch_processing } = await req.json()

    if (!agent_id || !phone_number || !user_id) {
      throw new Error('Agent ID, numărul de telefon și user ID sunt obligatorii')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get ElevenLabs API credentials
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    const agentPhoneId = Deno.env.get('PHONE_NUMBER_ID') || 'phnum_01jz06e77dfce9034d7jnpj5v7'
    
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key nu este configurat în Supabase Secrets')
    }

    console.log(`Inițiere apel pentru ${phone_number} cu agentul ${agent_id} pentru utilizatorul ${user_id}`)

    const requestBody = {
      agent_id: agent_id,
      agent_phone_number_id: agentPhoneId,
      to_number: phone_number
    }

    console.log('Request body pentru ElevenLabs:', JSON.stringify(requestBody, null, 2))

    // Make the call to ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('ElevenLabs response status:', response.status)
    console.log('ElevenLabs response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Eroare ElevenLabs response:', errorData)
      throw new Error(`Eroare ElevenLabs: ${response.status} - ${errorData}`)
    }

    const elevenLabsData = await response.json()
    console.log('Apel inițiat cu succes:', elevenLabsData)

    // Store call initiation in database
    const callHistoryData = {
      user_id: user_id,
      phone_number: phone_number,
      contact_name: contact_name || phone_number,
      call_status: 'initiated',
      summary: `Apel inițiat către ${contact_name || phone_number}`,
      agent_id: agent_id,
      conversation_id: elevenLabsData.conversation_id,
      elevenlabs_history_id: elevenLabsData.conversation_id,
      dialog_json: JSON.stringify({
        request: requestBody,
        response: elevenLabsData,
        initiated_at: new Date().toISOString(),
        batch_processing: batch_processing || false
      }),
      call_date: new Date().toISOString(),
      cost_usd: 0, // Will be updated when call completes
      duration_seconds: 0, // Will be updated when call completes
      language: 'ro'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('call_history')
      .insert(callHistoryData)
      .select()

    if (insertError) {
      console.error('Error inserting call history:', insertError)
      // Continue even if database insert fails
    } else {
      console.log('Call history inserted:', insertData)
    }

    // Set up webhook to listen for call completion (if not batch processing)
    if (!batch_processing) {
      // You can add webhook logic here if needed
      console.log('Single call - webhook setup can be added here')
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: elevenLabsData.conversation_id,
        callHistoryId: insertData?.[0]?.id,
        agent_id: agent_id,
        user_id: user_id,
        phone_number: phone_number,
        elevenlabs_data: elevenLabsData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Eroare în inițierea apelului:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

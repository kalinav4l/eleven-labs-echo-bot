
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

    console.log('Received request:', { agent_id, phone_number, contact_name, user_id, batch_processing })

    if (!agent_id || !phone_number || !user_id) {
      console.error('Missing required fields:', { agent_id: !!agent_id, phone_number: !!phone_number, user_id: !!user_id })
      return new Response(
        JSON.stringify({ 
          error: 'Agent ID, numărul de telefon și user ID sunt obligatorii',
          success: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get ElevenLabs API credentials
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    const agentPhoneId = 'phnum_01jzwnpa8cfnhbxh0367z4jtqs'
    
    console.log('API Key exists:', !!elevenLabsApiKey)
    console.log('Phone ID:', agentPhoneId)
    
    if (!elevenLabsApiKey) {
      console.error('❌ ElevenLabs API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key nu este configurat în Supabase Secrets. Configurați ELEVENLABS_API_KEY în Edge Functions Secrets.',
          success: false,
          details: 'Mergeți la Project Settings > Edge Functions > Manage secrets și adăugați ELEVENLABS_API_KEY'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`🚀 Inițiere apel pentru ${phone_number} cu agentul ${agent_id} pentru utilizatorul ${user_id}`)

    const requestBody = {
      agent_id: agent_id,
      agent_phone_number_id: agentPhoneId,
      to_number: phone_number
    }

    console.log('📤 Request body pentru ElevenLabs:', JSON.stringify(requestBody, null, 2))

    // Make the call to ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📡 ElevenLabs response status:', response.status)
    console.log('📡 ElevenLabs response headers:', Object.fromEntries(response.headers.entries()))

    let elevenLabsData
    let responseText = ''
    
    try {
      responseText = await response.text()
      console.log('📝 ElevenLabs raw response:', responseText)
      
      if (responseText) {
        elevenLabsData = JSON.parse(responseText)
        console.log('✅ Parsed ElevenLabs data:', JSON.stringify(elevenLabsData, null, 2))
      }
    } catch (parseError) {
      console.error('❌ Error parsing ElevenLabs response:', parseError)
      console.error('📄 Raw response was:', responseText)
    }

    if (!response.ok) {
      console.error('❌ ElevenLabs API error:', response.status, responseText)
      
      // Enhanced error message based on status code
      let errorMessage = `Eroare ElevenLabs: ${response.status}`
      
      if (response.status === 401) {
        errorMessage += ' - API Key invalid sau lipsă'
      } else if (response.status === 400) {
        errorMessage += ' - Date de intrare invalide (verificați Agent ID și numărul de telefon)'
      } else if (response.status === 404) {
        errorMessage += ' - Agent sau numărul de telefon nu a fost găsit'
      } else if (response.status === 429) {
        errorMessage += ' - Prea multe cereri (rate limit)'
      } else if (response.status >= 500) {
        errorMessage += ' - Eroare server ElevenLabs'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: responseText,
          success: false,
          status_code: response.status
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Apel inițiat cu succes:', elevenLabsData)

    // Determine call status based on ElevenLabs response
    let callStatus = 'initiated'
    let callSummary = `Apel inițiat către ${contact_name || phone_number}`
    
    if (elevenLabsData) {
      const message = elevenLabsData.message || ''
      const success = elevenLabsData.success
      
      if (success === false) {
        callStatus = 'failed'
        callSummary = `Apel eșuat către ${contact_name || phone_number}: ${message}`
      } else if (success === true) {
        if (message.includes('initiated')) {
          callStatus = 'initiated'
          callSummary = `Apel inițiat către ${contact_name || phone_number}`
        } else {
          callStatus = 'success'
          callSummary = `Apel reușit către ${contact_name || phone_number}`
        }
      }
      
      // Check for specific SIP error patterns
      if (message.includes('TEMPORARILY_UNAVAILABLE') || message.includes('480')) {
        callStatus = 'busy'
        callSummary = `Apel ocupat către ${contact_name || phone_number}: temporar indisponibil`
      } else if (message.includes('FORBIDDEN') || message.includes('403')) {
        callStatus = 'failed'
        callSummary = `Apel interzis către ${contact_name || phone_number}: acces refuzat`
      } else if (message.includes('NOT_FOUND') || message.includes('404')) {
        callStatus = 'failed'
        callSummary = `Apel eșuat către ${contact_name || phone_number}: număr negăsit`
      }
    }

    // Store call initiation in database
    const callHistoryData = {
      user_id: user_id,
      phone_number: phone_number,
      contact_name: contact_name || phone_number,
      call_status: callStatus,
      summary: callSummary,
      agent_id: agent_id,
      conversation_id: elevenLabsData?.conversation_id || null,
      elevenlabs_history_id: elevenLabsData?.conversation_id || null,
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

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: elevenLabsData?.conversation_id,
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
    console.error('💥 Eroare critică în inițierea apelului:', error)
    console.error('🔍 Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Eroare necunoscută în inițierea apelului',
        details: error.stack || 'Nu sunt disponibile detalii suplimentare',
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

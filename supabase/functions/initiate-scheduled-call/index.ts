
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agent_id, phone_number } = await req.json()

    if (!agent_id || !phone_number) {
      throw new Error('Agent ID și numărul de telefon sunt obligatorii')
    }

    // Obține toate secretele din Supabase Secrets
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    const defaultAgentPhoneId = Deno.env.get('DEFAULT_AGENT_PHONE_ID')
    
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key nu este configurat în Supabase Secrets')
    }

    if (!defaultAgentPhoneId) {
      console.warn('Default Agent Phone ID nu este configurat - se va încerca fără el')
    }

    console.log(`Inițiere apel pentru ${phone_number} cu agentul ${agent_id}`)

    const requestBody = {
      agent_id: agent_id,
      to_number: phone_number,
    }

    // Adaugă agent_phone_number_id doar dacă este disponibil
    if (defaultAgentPhoneId) {
      requestBody.agent_phone_number_id = defaultAgentPhoneId
    }

    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Eroare ElevenLabs:', errorData)
      throw new Error(`Eroare ElevenLabs: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('Apel inițiat cu succes:', data)

    return new Response(
      JSON.stringify({ success: true, conversationId: data.conversation_id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Eroare în inițierea apelului:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

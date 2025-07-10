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
    const { conversation_id } = await req.json()

    console.log('Checking call status for conversation:', conversation_id)

    if (!conversation_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Conversation ID este obligatoriu',
          success: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get ElevenLabs API credentials
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key nu este configurat în Supabase Secrets',
          success: false
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check call status from ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}`, {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
    })

    console.log('ElevenLabs response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: `Eroare ElevenLabs: ${response.status} - ${errorText}`,
          success: false
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const conversationData = await response.json()
    console.log('Conversation status data:', conversationData)

    // Determine call status based on ElevenLabs response
    let callStatus = 'unknown'
    let isCompleted = false
    
    if (conversationData) {
      const status = conversationData.status?.toLowerCase()
      const end_time = conversationData.end_time
      
      if (status === 'ended' || status === 'completed' || end_time) {
        callStatus = 'completed'
        isCompleted = true
      } else if (status === 'failed' || status === 'error') {
        callStatus = 'failed'
        isCompleted = true
      } else if (status === 'in_progress' || status === 'ongoing' || status === 'active') {
        callStatus = 'in_progress'
        isCompleted = false
      } else if (status === 'initiated' || status === 'starting') {
        callStatus = 'initiated'
        isCompleted = false
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversation_id,
        status: callStatus,
        is_completed: isCompleted,
        full_data: conversationData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Eroare în verificarea statusului apelului:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Eroare necunoscută',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
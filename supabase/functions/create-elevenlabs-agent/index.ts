
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
    const body = await req.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))
    
    // Get ElevenLabs API key from Supabase Secrets
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!elevenLabsApiKey) {
      console.error('Missing ElevenLabs API key in Supabase Secrets')
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('Creating ElevenLabs agent with request:', JSON.stringify(body, null, 2))

    // Handle both old and new request formats
    let elevenLabsRequest;
    
    if (body.conversation_config) {
      // New format - use directly
      elevenLabsRequest = {
        name: body.name,
        conversation_config: body.conversation_config
      }
    } else {
      // Old format - transform to new format
      elevenLabsRequest = {
        name: body.name,
        conversation_config: {
          agent: {
            prompt: {
              prompt: body.system_prompt
            },
            first_message: body.first_message || `Bună ziua! Sunt ${body.name}. Cum vă pot ajuta astăzi?`,
            language: body.language || "ro"
          },
          tts: {
            voice_id: body.voice_id || '9BWtsMINqrJLrRacOk9x',
            model_id: "eleven_multilingual_v2"
          },
          asr: {
            quality: "high"
          }
        }
      }
    }

    console.log('Transformed request for ElevenLabs:', JSON.stringify(elevenLabsRequest, null, 2))

    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Xi-Api-Key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elevenLabsRequest),
    })

    console.log('ElevenLabs response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API error:', response.status, errorData)
      return new Response(
        JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const data = await response.json()
    console.log('Agent created successfully:', data)

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in create-elevenlabs-agent function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})


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
    const { agentId, ...updateData } = await req.json()
    
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    // Get ElevenLabs API key from Supabase Secrets
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured in Supabase Secrets')
    }

    console.log('Updating ElevenLabs agent:', agentId, 'with data:', JSON.stringify(updateData, null, 2))

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`, {
      method: 'PATCH',
      headers: {
        'Xi-Api-Key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API error:', response.status, errorData)
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('Agent updated successfully')

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in update-elevenlabs-agent function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

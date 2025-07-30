import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const sipData = await req.json()
    console.log('Creating phone number with data:', sipData)

    // Get ElevenLabs API key from environment
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key is not configured')
    }

    // Call ElevenLabs API to create phone number
    const response = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify(sipData)
    })

    const result = await response.json()
    console.log('ElevenLabs response:', { status: response.status, result })

    if (!response.ok) {
      console.error('ElevenLabs API error:', result)
      throw new Error(result.detail?.message || result.message || 'Failed to create phone number in ElevenLabs')
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating phone number:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while creating the phone number',
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
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

    // Validate SIP data before sending to ElevenLabs
    if (!sipData.phone_number || !sipData.label) {
      throw new Error('Phone number and label are required')
    }

    // Ensure outbound configuration is complete for SIP trunks
    if (!sipData.outbound_trunk_config?.address || !sipData.outbound_trunk_config?.credentials?.username) {
      throw new Error('Outbound SIP configuration (address and username) is required')
    }

    // Simplify inbound trunk config - ElevenLabs API is strict about this
    if (sipData.inbound_trunk_config) {
      // Try removing inbound config entirely if it's causing issues
      // Some providers don't need or support complex inbound configurations
      delete sipData.inbound_trunk_config;
      console.log('Removed inbound_trunk_config to avoid ElevenLabs API issues');
    }

    console.log('Processed SIP data:', JSON.stringify(sipData, null, 2))

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
      const errorMessage = result.detail?.message || result.message || 'Failed to create phone number in ElevenLabs'
      
      // Provide more specific error messages for common issues
      if (errorMessage.includes('inbound trunk')) {
        throw new Error('Configurația SIP inbound nu este validă. Verifică adresele permise și credențialele.')
      } else if (errorMessage.includes('outbound trunk')) {
        throw new Error('Configurația SIP outbound nu este validă. Verifică adresa serverului și credențialele.')
      } else if (errorMessage.includes('phone_number')) {
        throw new Error('Numărul de telefon nu este valid sau este deja în folosință.')
      }
      
      throw new Error(errorMessage)
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
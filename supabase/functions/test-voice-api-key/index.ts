import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Nu sunteți autentificat')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Nu sunteți autentificat')
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user', {
      _user_id: user.id
    })

    if (adminError || !isAdmin) {
      throw new Error('Nu aveți permisiuni de administrator')
    }

    // Get API key from environment
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Cheia API nu este configurată' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Test the API key by making a simple request
    const testResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'Xi-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const valid = testResponse.ok

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_admin_user_id: user.id,
      p_action: 'TEST_VOICE_API_KEY',
      p_details: { 
        action: 'voice_api_key_tested',
        result: valid ? 'success' : 'failed',
        status_code: testResponse.status
      }
    })

    return new Response(
      JSON.stringify({ 
        valid,
        message: valid ? 'Cheia API funcționează corect' : 'Cheia API nu este validă'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in test-voice-api-key function:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
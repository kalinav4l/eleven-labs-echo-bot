import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { callHistoryId, conversationId } = await req.json()

    console.log('Updating call history data for:', { callHistoryId, conversationId })

    if (!callHistoryId || !conversationId) {
      throw new Error('Missing required parameters')
    }

    // Get conversation data from ElevenLabs
    const elevenLabsResponse = await supabase.functions.invoke('get-elevenlabs-conversation', {
      body: { conversationId }
    })

    if (elevenLabsResponse.error) {
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.error.message}`)
    }

    const conversationData = elevenLabsResponse.data
    
    if (!conversationData?.metadata) {
      console.log('No metadata found for conversation:', conversationId)
      return new Response(JSON.stringify({ success: false, message: 'No metadata found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const duration = Math.round(conversationData.metadata.call_duration_secs || 0)
    const cost = conversationData.metadata.cost || 0

    console.log('Updating with data:', { duration, cost })

    // Update call history in database
    const { error: updateError } = await supabase
      .from('call_history')
      .update({
        duration_seconds: duration,
        cost_usd: cost,
        updated_at: new Date().toISOString()
      })
      .eq('id', callHistoryId)

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    console.log('Successfully updated call history:', callHistoryId)

    return new Response(JSON.stringify({ 
      success: true, 
      duration, 
      cost,
      callHistoryId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error updating call history data:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
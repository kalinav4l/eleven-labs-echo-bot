import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ElevenLabsConversationResponse {
  metadata?: any
  transcript?: any
  sentiment_data?: number[]
  emotions?: Record<string, number>
  keywords?: string[]
  topics?: Array<{ name: string; start_time: number; end_time: number; confidence: number }>
  metrics?: { talk_time: number; interruptions: number; silence_percent: number; speech_speed: number }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured')
    }

    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    // Fetch up to 50 conversations that are older than 10 minutes, have a conversation_id, and no cached analytics yet
    const { data: candidates, error: candidatesError } = await supabase
      .from('call_history')
      .select(
        'id, user_id, conversation_id, agent_id, phone_number, contact_name, call_status, call_date, duration_seconds'
      )
      .in('call_status', ['success', 'done', 'completed'])
      .not('conversation_id', 'is', null)
      .lte('call_date', tenMinutesAgo.toISOString())
      .order('call_date', { ascending: false })
      .limit(100)

    if (candidatesError) {
      throw candidatesError
    }

    // Filter out those already cached
    const conversationIds = (candidates || [])
      .map((c) => c.conversation_id)
      .filter((id): id is string => !!id)

    const { data: cachedRows, error: cacheError } = await supabase
      .from('conversation_analytics_cache')
      .select('conversation_id, user_id')
      .in('conversation_id', conversationIds)

    if (cacheError) {
      throw cacheError
    }

    const cachedSet = new Set((cachedRows || []).map((r) => `${r.user_id}:${r.conversation_id}`))
    const toProcess = (candidates || []).filter(
      (c) => c.conversation_id && !cachedSet.has(`${c.user_id}:${c.conversation_id}`)
    )

    const results: Array<{ conversation_id: string; success: boolean; error?: string }> = []

    for (const record of toProcess) {
      try {
        const convoId = record.conversation_id as string

        // Retrieve details from ElevenLabs
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convoId}`, {
          method: 'GET',
          headers: {
            'xi-api-key': elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`ElevenLabs error ${response.status}: ${text}`)
        }

        const data = (await response.json()) as ElevenLabsConversationResponse
        const metadata = data.metadata || {}
        const duration = Math.round(metadata.call_duration_secs || record.duration_seconds || 0)
        const cost = metadata.cost || 0

        // Optional: resolve agent name for user-friendly display
        let agentName: string | undefined = undefined
        if (record.agent_id) {
          const { data: agentData } = await supabase
            .from('kalina_agents')
            .select('name')
            .eq('agent_id', record.agent_id)
            .eq('user_id', record.user_id)
            .maybeSingle()
          agentName = agentData?.name || undefined
        }

        // Upsert into cache
        const { error: upsertError } = await supabase
          .from('conversation_analytics_cache')
          .upsert(
            {
              conversation_id: convoId,
              user_id: record.user_id,
              agent_id: record.agent_id,
              agent_name: agentName,
              phone_number: record.phone_number,
              contact_name: record.contact_name,
              call_status: record.call_status,
              call_date: record.call_date,
              duration_seconds: duration,
              cost_credits: cost,
              transcript: data.transcript || [],
              analysis: {
                sentiment_data: data.sentiment_data || [],
                emotions: data.emotions || {},
                keywords: data.keywords || [],
                topics: data.topics || [],
                metrics: data.metrics || { talk_time: 0, interruptions: 0, silence_percent: 0, speech_speed: 0 },
              },
              metadata,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'conversation_id,user_id' }
          )

        if (upsertError) {
          throw upsertError
        }

        results.push({ conversation_id: convoId, success: true })
      } catch (err: any) {
        results.push({ conversation_id: record.conversation_id as string, success: false, error: err?.message || String(err) })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        ok: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Verificare taskuri programate...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Găsește toate taskurile care trebuie executate acum
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000) // 5 minute toleranță

    console.log(`⏰ Căutare taskuri între ${fiveMinutesAgo.toISOString()} și ${now.toISOString()}`)

    const { data: scheduledTasks, error } = await supabase
      .from('scheduled_calls')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_datetime', fiveMinutesAgo.toISOString())
      .lte('scheduled_datetime', now.toISOString())

    if (error) {
      console.error('❌ Eroare la căutarea taskurilor:', error)
      throw error
    }

    console.log(`📋 Găsite ${scheduledTasks?.length || 0} taskuri de executat`)

    if (!scheduledTasks || scheduledTasks.length === 0) {
      // Even dacă nu sunt taskuri, rulează procesarea de analytics pentru conversațiile mai vechi de 10 minute
      await supabase.functions.invoke('process-conversation-analytics', { body: {} })
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nu sunt taskuri de executat. Analytics backfill declanșat.',
          executedTasks: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const executedTasks = []
    const failedTasks = []

    // Execută fiecare task
    for (const task of scheduledTasks) {
      try {
        console.log(`🚀 Executare task ${task.id} pentru ${task.client_name}`)

        // Marchează taskul ca în execuție
        await supabase
          .from('scheduled_calls')
          .update({ status: 'executing' })
          .eq('id', task.id)

        // Găsește agentul asociat din kalina_agents
        const { data: agentData } = await supabase
          .from('kalina_agents')
          .select('elevenlabs_agent_id')
          .eq('agent_id', task.agent_id)
          .eq('user_id', task.user_id)
          .single()

        const elevenLabsAgentId = agentData?.elevenlabs_agent_id

        if (!elevenLabsAgentId) {
          console.error(`❌ Nu s-a găsit ElevenLabs agent ID pentru ${task.agent_id}`)
          throw new Error('Agent ElevenLabs nu a fost găsit')
        }

        // Apelează funcția de inițiere apel
        const callResponse = await supabase.functions.invoke('initiate-scheduled-call', {
          body: {
            agent_id: elevenLabsAgentId,
            phone_number: task.phone_number,
            contact_name: task.client_name,
            user_id: task.user_id,
            caller_number: task.caller_number || null,
            batch_processing: false
          }
        })

        if (callResponse.error) {
          console.error(`❌ Eroare la apelarea funcției pentru task ${task.id}:`, callResponse.error)
          throw callResponse.error
        }

        const callData = callResponse.data

        if (callData.success) {
          // Marchează taskul ca executat cu succes
          await supabase
            .from('scheduled_calls')
            .update({ 
              status: 'completed',
              notes: `${task.notes || ''}\nExecutat automat la ${now.toISOString()}`
            })
            .eq('id', task.id)

          executedTasks.push({
            taskId: task.id,
            clientName: task.client_name,
            phoneNumber: task.phone_number,
            conversationId: callData.conversationId,
            success: true
          })

          console.log(`✅ Task ${task.id} executat cu succes`)
        } else {
          throw new Error(callData.error || 'Apel eșuat')
        }

      } catch (taskError: any) {
        console.error(`❌ Eroare la executarea task ${task.id}:`, taskError)
        
        // Marchează taskul ca eșuat
        await supabase
          .from('scheduled_calls')
          .update({ 
            status: 'failed',
            notes: `${task.notes || ''}\nEșuat la ${now.toISOString()}: ${taskError.message}`
          })
          .eq('id', task.id)

        failedTasks.push({
          taskId: task.id,
          clientName: task.client_name,
          phoneNumber: task.phone_number,
          error: taskError.message,
          success: false
        })
      }
    }

    // După execuția taskurilor, rulează backfill de analytics
    await supabase.functions.invoke('process-conversation-analytics', { body: {} })

    console.log(`🎯 Rezultat: ${executedTasks.length} succese, ${failedTasks.length} eșecuri`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Executate ${executedTasks.length} taskuri cu succes, ${failedTasks.length} eșecuri` ,
        executedTasks: executedTasks.length,
        failedTasks: failedTasks.length,
        details: {
          successful: executedTasks,
          failed: failedTasks
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('💥 Eroare critică în verificarea taskurilor:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
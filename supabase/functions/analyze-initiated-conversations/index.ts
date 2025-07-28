import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting analysis of initiated conversations...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all initiated conversations that haven't been analyzed
    // Only check conversations older than 2 minutes to give them time to complete
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data: initiatedConversations, error: fetchError } = await supabase
      .from('call_history')
      .select('*')
      .eq('call_status', 'initiated')
      .eq('callback_analyzed', false)
      .lt('created_at', twoMinutesAgo)
      .limit(10); // Process max 10 conversations per run

    if (fetchError) {
      console.error('Error fetching initiated conversations:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${initiatedConversations?.length || 0} initiated conversations to analyze`);

    let processedCount = 0;
    let callbacksDetected = 0;

    for (const conversation of initiatedConversations || []) {
      try {
        console.log(`Processing conversation ${conversation.id} with ElevenLabs ID: ${conversation.conversation_id}`);

        // Update last_status_check timestamp
        await supabase
          .from('call_history')
          .update({ last_status_check: new Date().toISOString() })
          .eq('id', conversation.id);

        // Get current conversation details from ElevenLabs
        const { data: elevenLabsData, error: elevenLabsError } = await supabase.functions.invoke(
          'get-elevenlabs-conversation',
          {
            body: { conversationId: conversation.conversation_id }
          }
        );

        if (elevenLabsError) {
          console.error(`Error getting ElevenLabs conversation ${conversation.conversation_id}:`, elevenLabsError);
          continue;
        }

        console.log(`ElevenLabs conversation status: ${elevenLabsData?.status}`);

        // Check if status has changed from 'initiated'
        if (elevenLabsData?.status && elevenLabsData.status !== 'initiated') {
          // Update the conversation status in our database
          await supabase
            .from('call_history')
            .update({ 
              call_status: elevenLabsData.status,
              duration_seconds: elevenLabsData.metadata?.call_duration_secs || conversation.duration_seconds,
              cost_usd: (elevenLabsData.metadata?.cost || 0) / 100 // Convert from cents to dollars
            })
            .eq('id', conversation.id);

          console.log(`Updated conversation ${conversation.id} status to: ${elevenLabsData.status}`);

          // If conversation is done and has a transcript, analyze for callback intent
          if (elevenLabsData.status === 'done' && elevenLabsData.transcript && elevenLabsData.transcript.length > 0) {
            console.log(`Analyzing transcript for callback intent...`);
            
            // Construct transcript text from the conversation
            const transcriptText = elevenLabsData.transcript
              .map((entry: any) => `${entry.role}: ${entry.message}`)
              .join('\n');

            console.log(`Transcript text length: ${transcriptText.length} characters`);

            // Call detect-callback-intent function
            const { data: callbackData, error: callbackError } = await supabase.functions.invoke(
              'detect-callback-intent',
              {
                body: {
                  text: transcriptText,
                  conversationId: conversation.conversation_id,
                  phoneNumber: conversation.phone_number,
                  contactName: conversation.contact_name || 'Client necunoscut',
                  agentId: conversation.agent_id,
                  userId: conversation.user_id
                }
              }
            );

            if (callbackError) {
              console.error(`Error detecting callback intent for conversation ${conversation.id}:`, callbackError);
            } else if (callbackData?.callbackDetected) {
              console.log(`✅ Callback detected for conversation ${conversation.id}!`);
              callbacksDetected++;
            } else {
              console.log(`No callback detected for conversation ${conversation.id}`);
            }
          }
        }

        // Mark conversation as analyzed regardless of outcome
        await supabase
          .from('call_history')
          .update({ callback_analyzed: true })
          .eq('id', conversation.id);

        processedCount++;

      } catch (error) {
        console.error(`Error processing conversation ${conversation.id}:`, error);
        
        // Mark as analyzed even if there was an error to avoid reprocessing
        await supabase
          .from('call_history')
          .update({ 
            callback_analyzed: true,
            last_status_check: new Date().toISOString() 
          })
          .eq('id', conversation.id);
      }
    }

    const result = {
      success: true,
      processedConversations: processedCount,
      callbacksDetected: callbacksDetected,
      timestamp: new Date().toISOString()
    };

    console.log('Analysis complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-initiated-conversations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
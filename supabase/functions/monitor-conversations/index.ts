import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Monitorizare conversații pentru oferte SMS...');

    // Găsește conversații recent finalizate care nu au fost încă procesate pentru oferte
    const { data: conversations, error } = await supabase
      .from('call_history')
      .select('*')
      .eq('call_status', 'completed')
      .gte('call_date', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Ultimele 10 minute
      .is('conversation_id', null);

    if (error) {
      console.error('❌ Eroare la căutarea conversațiilor:', error);
      throw error;
    }

    console.log(`📊 Găsite ${conversations?.length || 0} conversații de procesat`);

    for (const conversation of conversations || []) {
      console.log(`🔄 Procesez conversația ${conversation.id}...`);

      try {
        // Încearcă să obții detaliile conversației de la ElevenLabs
        if (conversation.elevenlabs_history_id) {
          const { data: conversationDetails } = await supabase.functions.invoke('get-elevenlabs-conversation', {
            body: { conversationId: conversation.elevenlabs_history_id }
          });

          if (conversationDetails && conversationDetails.transcript) {
            console.log(`✅ Detalii conversație obținute pentru ${conversation.elevenlabs_history_id}`);
            
            // Generează oferta personalizată
            const { data: offerResult } = await supabase.functions.invoke('generate-personalized-offer', {
              body: {
                conversationId: conversation.elevenlabs_history_id,
                phoneNumber: conversation.phone_number,
                contactName: conversation.contact_name,
                transcript: conversationDetails.transcript,
                userId: conversation.user_id
              }
            });

            if (offerResult?.success) {
              console.log(`📧 Ofertă SMS trimisă cu succes pentru ${conversation.contact_name}`);
            } else {
              console.log(`ℹ️ Nu s-a trimis ofertă pentru ${conversation.contact_name}: ${offerResult?.reason || 'Clientul nu pare interesat'}`);
            }

            // Actualizează conversația să marcheze că a fost procesată
            await supabase
              .from('call_history')
              .update({ conversation_id: conversation.elevenlabs_history_id })
              .eq('id', conversation.id);
          }
        }
      } catch (error) {
        console.error(`❌ Eroare la procesarea conversației ${conversation.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: conversations?.length || 0,
        message: `Procesate ${conversations?.length || 0} conversații`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Eroare în monitor-conversations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
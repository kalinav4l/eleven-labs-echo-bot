import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { conversationId, phoneNumber, contactName, transcript, userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key nu este configurată');
    }

    console.log(`🤖 Analizez conversația pentru ${contactName} (${phoneNumber})`);

    // Extrage textul din transcript
    let conversationText = '';
    if (Array.isArray(transcript)) {
      conversationText = transcript
        .map(entry => `${entry.role}: ${entry.message}`)
        .join('\n');
    } else {
      conversationText = JSON.stringify(transcript);
    }

    console.log(`📝 Text conversație extras: ${conversationText.substring(0, 200)}...`);

    // Prompt îmbunătățit pentru GPT să detecteze interesul clientului
    const analysisPrompt = `
Analizează această conversație telefonică și determină dacă clientul este interesat să primească o ofertă sau informații suplimentare:

CONVERSAȚIA:
${conversationText}

INSTRUCȚIUNI:
1. Analizează tonul și răspunsurile clientului
2. Caută semne de interes (întrebări, cereri de prețuri, programări, etc.)
3. Detectează semnele de neinteres (răspunsuri scurte, refuzuri, graba de a încheia)
4. Determină dacă clientul ar putea fi interesat de o ofertă prin SMS

Răspunde cu JSON în acest format exact:
{
  "shouldSendOffer": true/false,
  "interestLevel": "high"/"medium"/"low"/"none",
  "reasoning": "explicația în română",
  "offerType": "programare"/"informații"/"promoție"/"consultație",
  "personalizedMessage": "mesajul personalizat pentru SMS (maxim 160 caractere)"
}

IMPORTANTE:
- shouldSendOffer = true DOAR dacă clientul a arătat interes clar
- personalizedMessage trebuie să fie în română și să includă numele ${contactName}
- Nu trimite oferte dacă clientul a refuzat explicit sau pare supărat
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Ești un expert în analizarea conversațiilor telefonice pentru a detecta interesul clienților. Răspunde întotdeauna cu JSON valid.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    console.log(`🎯 Analiza GPT:`, analysis);

    // Salvează analiza în baza de date
    const { error: insertError } = await supabase
      .from('sms_offers')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        phone_number: phoneNumber,
        contact_name: contactName,
        offer_content: analysis.personalizedMessage,
        transcript_summary: analysis.reasoning,
        status: analysis.shouldSendOffer ? 'pending' : 'skipped',
        gpt_analysis: analysis
      });

    if (insertError) {
      console.error('❌ Eroare la salvarea analizei:', insertError);
    }

    // Trimite SMS doar dacă GPT recomandă
    if (analysis.shouldSendOffer && analysis.personalizedMessage) {
      console.log(`📧 Trimit SMS pentru ${contactName}...`);
      
      const { data: smsResult } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber: phoneNumber,
          message: analysis.personalizedMessage,
          smsConfig: {
            enabled: true,
            apiToken: Deno.env.get('SMS_TO_API_KEY'),
            senderId: 'MEDPARK',
            message: analysis.personalizedMessage,
            delay: 0
          }
        }
      });

      if (smsResult?.success) {
        // Actualizează status-ul
        await supabase
          .from('sms_offers')
          .update({ status: 'sent' })
          .eq('conversation_id', conversationId);

        console.log(`✅ SMS trimis cu succes către ${contactName}`);
        
        return new Response(JSON.stringify({
          success: true,
          smsSent: true,
          analysis: analysis,
          message: `SMS trimis către ${contactName}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.error('❌ Eroare la trimiterea SMS:', smsResult);
        return new Response(JSON.stringify({
          success: false,
          error: 'Eroare la trimiterea SMS',
          analysis: analysis
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      console.log(`ℹ️ Nu trimit SMS pentru ${contactName}: ${analysis.reasoning}`);
      
      return new Response(JSON.stringify({
        success: true,
        smsSent: false,
        reason: analysis.reasoning,
        analysis: analysis,
        message: `Clientul ${contactName} nu pare interesat de ofertă`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Eroare în generate-personalized-offer:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
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
    const { 
      agentName, 
      agentType, 
      websiteUrl, 
      companyName, 
      contactNumber, 
      domain, 
      additionalInfo,
      userId 
    } = await req.json();
    
    if (!agentName || !agentType || !userId) {
      throw new Error('Agent name, type, and user ID are required');
    }

    console.log('Generating prompt for agent:', agentName);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch website content if URL provided
    let websiteContent = '';
    if (websiteUrl) {
      try {
        const websiteResponse = await fetch(websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (websiteResponse.ok) {
          const html = await websiteResponse.text();
          // Extract text content from HTML
          websiteContent = html
            .replace(/<script[^>]*>.*?<\/script>/gsi, '')
            .replace(/<style[^>]*>.*?<\/style>/gsi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000);
        }
      } catch (error) {
        console.log('Could not fetch website content:', error.message);
      }
    }

    // Generate prompt using OpenAI
    const systemPrompt = `Ești un expert în crearea de prompt-uri pentru agenți conversaționali AI pentru vânzări și customer service. 
Generezi prompt-uri detaliate și eficiente care urmează exact structura specificată de utilizator.
Răspunde DOAR cu prompt-ul generat, fără explicații suplimentare.`;

    const userPrompt = `
Generează un prompt detaliat pentru un agent conversațional cu următoarele specificații:

**Informații despre agent:**
- Nume agent: ${agentName}
- Tip agent: ${agentType}
- Nume companie: ${companyName || 'Compania'}
- Domeniu: ${domain || 'general'}
- Număr de contact: ${contactNumber || 'vor fi furnizate separat'}

**Website și context:**
- URL website: ${websiteUrl || 'nu a fost furnizat'}
- Conținut website: ${websiteContent || 'nu a fost extras'}

**Informații suplimentare:**
${additionalInfo || 'Nu au fost furnizate informații suplimentare'}

**STRUCTURA EXACTĂ a prompt-ului (OBLIGATORIE):**

# CONSTITUȚIA AGENTULUI: ${agentName}

## 1. Persona și Rolul Principal
Tu ești ${agentName}, un asistent virtual profesionist și prietenos pentru compania ${companyName || '[Numele Companiei]'}. Scopul tău principal este să [defineștePe baza informațiilor furnizate]. Vorbești clar, calm și la obiect. Nu folosi un limbaj prea informal sau argou. Numele tău NU este ElevenLabs, ci ${agentName}.

## 2. Contextul Conversației
[Generează context specific bazat pe informațiile furnizate]

## 3. Obiectivul Final al Apelului
[Definește obiectivul specific bazat pe tipul de agent și domeniu]

## 4. Reguli de Bază și Limite (Ce să faci și ce SĂ NU faci)
[Generează reguli specifice și detaliate]

## 5. Flux Conversațional (Script Pas cu Pas)
[Creează un flux detaliat cu pași concreți]

## 6. Baza de Cunoștințe (Informații Specifice)
[Include informații specifice despre companie și servicii]

IMPORTANT: 
- Prompt-ul trebuie să fie în română
- Să fie specific pentru industria și serviciile companiei
- Să includă informații concrete despre companie
- Să fie profesional dar prietenos
- Să motiveze la acțiune/vânzare
- Să includă numărul de contact: ${contactNumber || '[Numărul va fi completat]'}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0].message.content;

    // Save to database
    console.log('Attempting to save prompt to database for user:', userId);
    const { data: savedPrompt, error: dbError } = await supabase
      .from('prompt_history')
      .insert({
        user_id: userId,
        agent_name: agentName,
        agent_type: agentType,
        website_url: websiteUrl || null,
        company_name: companyName || null,
        contact_number: contactNumber || null,
        domain: domain || null,
        additional_info: additionalInfo || null,
        generated_prompt: generatedPrompt
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save prompt to database: ${dbError.message}`);
    }

    console.log('Prompt saved successfully with ID:', savedPrompt?.id);

    console.log('Prompt generated and saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        prompt: generatedPrompt,
        promptId: savedPrompt.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-agent-prompt function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const gptApiKey = Deno.env.get('GPT_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { websiteUrl, agentRole, additionalPrompt } = await req.json();

    if (!websiteUrl) {
      throw new Error('Website URL is required');
    }

    console.log(`Generating prompt for website: ${websiteUrl}`);

    // Scrape website content first
    let websiteContent = '';
    try {
      const websiteResponse = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (websiteResponse.ok) {
        const html = await websiteResponse.text();
        // Extract text content from HTML (basic extraction)
        websiteContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 3000); // Limit content length
      }
    } catch (error) {
      console.warn('Could not scrape website:', error);
      websiteContent = 'Conținutul site-ului nu a putut fi accesat.';
    }

    // Generate prompt using OpenAI
    const systemMessage = `Ești un expert în crearea de prompt-uri pentru asistenți AI. Trebuie să creezi un prompt pentru un asistent conversațional bazat pe informațiile de pe un site web.

Trebuie să adaptezi următorul template la site-ul web dat, păstrând aceeași structură și stil:

INSTRUCȚIUNI DE SISTEM PENTRU ASISTENTUL [NUME_COMPANIE]
🎯 IDENTITATE ȘI MISIUNE

Nume: Asistent [Nume_companie]

Rol: [Descriere rol adaptat la companie]

Misiune: [Misiune adaptată la serviciile companiei]

👤 PERSONALITATEA AGENTULUI

Vocea companiei: [Adaptat la tonul și valorile companiei]

Empatic: [Adaptat la nevoile clienților companiei]

Răbdător: [Adaptat la complexitatea serviciilor]

Respectuos: Folosești mereu formule de politețe calde

Cunoscător: [Adaptat la domeniul de expertiză]

🗣️ STIL DE COMUNICARE

Salut standard: [Adaptat la companie]

Răspunsurile trebuie să fie [stil adaptat la industrie]

[Instrucțiuni specifice pentru comunicare]

📋 REGULI DE BAZĂ

Nu întrerupe clientul.
Toată informația trebuie să se refere exclusiv la [companie]
[Alte reguli adaptate]

🗺️ DOMENII DE ASISTENȚĂ

[Servicii și produse ale companiei]

💬 EXEMPLE DE RĂSPUNSURI

[3-4 exemple adaptate la serviciile companiei]

🛠️ GESTIONAREA TIPURILOR DE CLIENȚI

[Strategii adaptate la tipurile de clienți ai companiei]

Informații de contact: [Datele de contact găsite pe site]

🏁 ÎNCHIDERE

[Închidere adaptată la companie]

Importante:
1. Păstrează exact aceeași structură cu emoji-uri
2. Adaptează tot conținutul la industria și serviciile companiei
3. Folosește un ton profesional dar prietenos
4. Include informații specifice găsite pe site
5. Creează exemple realiste pentru domeniul companiei`;

    const userMessage = `Site web: ${websiteUrl}
Rol agent: ${agentRole || 'asistent general'}
Prompt aditional: ${additionalPrompt || 'Nimic specific'}

Conținut site web:
${websiteContent}

Te rog să creezi un prompt complet adaptat acestui site web, păstrând structura dată ca exemplu.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gptApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0].message.content;

    console.log('Prompt generated successfully');

    return new Response(JSON.stringify({ 
      response: generatedPrompt 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in prompt-generation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
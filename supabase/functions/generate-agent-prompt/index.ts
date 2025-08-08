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
    let websiteAnalysis = '';
    if (websiteUrl) {
      try {
        console.log('Fetching website content...');
        console.log('Analyzing website:', websiteUrl);
        
        const websiteResponse = await fetch(websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (websiteResponse.ok) {
          const html = await websiteResponse.text();
          console.log('Website content fetched, length:', html.length);
          
          // Extract comprehensive content from HTML
          const fullContent = html
            .replace(/<script[^>]*>.*?<\/script>/gsi, '')
            .replace(/<style[^>]*>.*?<\/style>/gsi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          // Extract specific sections
          const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : '';
          
          const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']*)["\'][^>]*>/i);
          const metaDescription = metaDescMatch ? metaDescMatch[1] : '';
          
          const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);
          const headings = h1Matches ? h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()) : [];
          
          // Extract product/service mentions
          const productKeywords = ['produs', 'produse', 'serviciu', 'servicii', 'solutii', 'oferta', 'catalog'];
          const contactKeywords = ['contact', 'telefon', 'email', 'adresa', 'locatie'];
          
          websiteContent = fullContent.substring(0, 4000);
          
          websiteAnalysis = `
ANALIZĂ WEBSITE:
- Titlu: ${title}
- Meta descriere: ${metaDescription}
- Titluri principale: ${headings.slice(0, 3).join(', ')}
- Conținut principal: ${fullContent.substring(0, 1500)}
- Cuvinte cheie identificate: ${productKeywords.filter(kw => fullContent.toLowerCase().includes(kw)).join(', ')}
- Informații contact: ${contactKeywords.filter(kw => fullContent.toLowerCase().includes(kw)).length > 0 ? 'Prezente' : 'Nu sunt evidente'}
          `;
        }
      } catch (error) {
        console.log('Could not fetch website content:', error.message);
      }
    }

    console.log('Generating prompt with OpenAI...');

    // Generate prompt using OpenAI with enhanced details
    const systemPrompt = `Ești un expert în crearea de prompt-uri ultra-detaliate pentru agenți conversaționali AI pentru vânzări și customer service. 
Creezi prompt-uri comprehensive, profesionale și extrem de specifice care acoperă toate aspectele conversației.
Folosești informațiile de pe website pentru a personaliza maximal prompt-ul.
Răspunde DOAR cu prompt-ul generat, fără explicații suplimentare.`;

    const userPrompt = `
Creează cel mai detaliat și profesional prompt pentru un agent conversațional cu următoarele specificații:

**INFORMAȚII AGENT:**
- Nume agent: ${agentName}
- Tip agent: ${agentType}
- Nume companie: ${companyName || 'Compania'}
- Domeniu activitate: ${domain || 'general'}
- Număr contact: ${contactNumber || 'va fi completat'}

**ANALIZĂ WEBSITE DETALIATĂ:**
${websiteAnalysis || 'Website nu a fost analizat'}

**CONȚINUT WEBSITE EXTRAS:**
${websiteContent || 'Nu s-a putut extrage conținut'}

**CONTEXT SUPLIMENTAR:**
${additionalInfo || 'Nu au fost furnizate informații suplimentare'}

**CERINȚE PENTRU PROMPT ULTRA-DETALIAT:**

Creează un prompt EXTREM DE COMPLET cu următoarea structură OBLIGATORIE:

# CONSTITUȚIA COMPLETĂ A AGENTULUI: ${agentName}

## 1. IDENTITATEA ȘI PERSONA DETALIATĂ
- Definește rolul exact al agentului
- Personalitatea și tonul de comunicare
- Experiența și expertiza în domeniu
- Metode de salutare și prezentare

## 2. CUNOAȘTEREA COMPLETĂ A COMPANIEI
- Istoric și misiunea companiei
- Produse/servicii specifice oferite
- Avantaje competitive și diferențiatori
- Prețuri și oferte speciale (dacă sunt disponibile)
- Politici și proceduri importante

## 3. OBIECTIVE DETALIATE ALE CONVERSAȚIEI
- Obiectivul principal (vânzare, informare, suport)
- Obiective secundare (colectare date, programare întâlniri)
- Indicatori de succes ai conversației
- Modalități de măsurare a eficienței

## 4. REGULILE ȘI LIMITELE COMPLETE
### CE TREBUIE SĂ FACI:
- [Lista detaliată de acțiuni obligatorii]
### CE NU AI VOIE SĂ FACI:
- [Lista detaliată de restricții și limite]
### SITUAȚII SPECIALE:
- [Cum să gestionezi obiecții, reclamații, situații dificile]

## 5. FLUXUL CONVERSAȚIONAL COMPLET
### FAZA 1: DESCHIDEREA (0-30 secunde)
- Salutul perfect
- Prezentarea agentului și companiei
- Confirmarea disponibilității interlocutorului

### FAZA 2: IDENTIFICAREA NEVOILOR (30-90 secunde)
- Întrebări pentru identificarea nevoilor
- Ascultare activă și empatie
- Calificarea lead-ului

### FAZA 3: PREZENTAREA SOLUȚIEI (90-180 secunde)
- Prezentarea produselor/serviciilor relevante
- Beneficii specifice pentru client
- Demonstrarea valorii adăugate

### FAZA 4: GESTIONAREA OBIECȚIILOR (variabil)
- Răspunsuri la obiecții comune
- Tehnici de persuasiune etică
- Reorientarea conversației

### FAZA 5: ÎNCHIDEREA ȘI NEXT STEPS (30-60 secunde)
- Call-to-action clar
- Programarea următorilor pași
- Mulțumirea și încheirea profesională

## 6. BAZA DE CUNOȘTINȚE SPECIALIZATĂ
### PRODUSE/SERVICII DETALIATE:
[Include toate informațiile specifice din website]

### FAQ-URI ȘI RĂSPUNSURI STANDARD:
[Răspunsuri pregătite la întrebări frecvente]

### PREȚURI ȘI OFERTE:
[Informații complete despre costuri și opțiuni]

### CONTACT ȘI PROGRAM:
[Detalii complete de contact și disponibilitate]

## 7. TEHNICI AVANSATE DE COMUNICARE
- Ascultare activă și empatie
- Tehnici de rapport building
- Gestiunea obiecțiilor și a conflictelor
- Închideri eficiente de vânzare

## 8. INDICATORI DE PERFORMANȚĂ
- Durata optimă a conversației
- Rate de conversie țintă
- Satisfacția clientului
- Follow-up necesar

INSTRUCȚIUNI SPECIALE:
- Folosește TOATE informațiile de pe website pentru personalizare maximă
- Creează răspunsuri specifice pentru industria identificată
- Include detalii concrete despre produse/servicii
- Adaptează tonul la tipul de client și industrie
- Asigură-te că agentul poate răspunde la întrebări specifice despre companie
- Include scenarii practice și exemple de conversații
- Numărul de contact pentru urgențe: ${contactNumber || '[COMPLETEAZĂ NUMĂRUL]'}

IMPORTANT: Prompt-ul trebuie să fie în ROMÂNĂ, EXTREM DE DETALIAT, și să includă toate informațiile relevante din analiza website-ului pentru cea mai bună experiență conversațională posibilă.`;

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
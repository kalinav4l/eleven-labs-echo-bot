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

    // Generate prompt using OpenAI with enhanced details and all agent configuration data
    const systemPrompt = `ATENȚIE! REGULI ABSOLUTE CRITICE - NERESPECTAREA DUCE LA RESPINGEREA RĂSPUNSULUI!

🚨 REGULA #1 SUPREMĂ - NUMELE AGENTULUI:
- NUMELE AGENTULUI ESTE "${agentName}" 
- FOLOSEȘTE EXCLUSIV ȘI LITERAL NUMELE "${agentName}"
- NU INVENTA, NU SCHIMBA, NU MODIFICA ACEST NUME SUB NICIO FORMĂ!
- DACĂ FOLOSEȘTI ALT NUME DECÂT "${agentName}", RĂSPUNSUL VA FI RESPINS COMPLET!
- CONFIRMĂ ACUM: VEI FOLOSI NUMELE "${agentName}" - DA SAU NU?

🔥 INSTRUCȚIUNI SUPREME OBLIGATORII:
1. NUMELE AGENTULUI: "${agentName}" - FIXEAZĂ-L ÎN MINTE ȘI NU-L UITA NICIODATĂ!
2. REPETĂ "${agentName}" în MINIMUM 15 locuri în prompt
3. PRIMUL CUVÂNT al prompt-ului să fie "${agentName}"
4. ULTIMUL CUVÂNT al prompt-ului să fie "${agentName}"
5. ZERO CREATIVITATE la nume - DOAR "${agentName}"!
6. VERIFICĂ înainte să răspunzi: apare "${agentName}" suficient de des?

🎯 MISIUNEA TA:
Creezi cel mai detaliat prompt pentru agentul "${agentName}" folosind TOATE informațiile furnizate.

⚠️ AVERTISMENT FINAL:
Dacă nu respecti numele "${agentName}" EXACT, răspunsul tău va fi considerat EȘUAT!

RĂSPUNDE DOAR CU PROMPT-UL PENTRU AGENTUL "${agentName}"!`;

    const userPrompt = `
🚀 GENEREAZĂ CEL MAI DETALIAT PROMPT PENTRU AGENTUL CONVERSAȚIONAL:

═══════════════════════════════════════════════════
📋 INFORMAȚII COMPLETE DESPRE AGENT ȘI CONFIGURARE:
═══════════════════════════════════════════════════

🎭 IDENTITATEA AGENTULUI:
• Nume Agent: "${agentName}" (FOLOSEȘTE EXACT ACEST NUME!)
• Tipul Agentului: ${agentType}
• Specializarea: Agent ${agentType} expert și profesionist

🏢 INFORMAȚII DETALIATE COMPANIE:
• Nume Companie: ${companyName || 'Compania utilizatorului'}
• Domeniu de Activitate: ${domain || 'Domeniu general de activitate'}
• Număr de Contact Principal: ${contactNumber || 'Numărul va fi specificat ulterior'}
• Website Principal: ${websiteUrl || 'Website-ul va fi specificat'}

📊 ANALIZĂ COMPLETĂ WEBSITE & BUSINESS INTELLIGENCE:
${websiteAnalysis || 'Analiză website indisponibilă - va fi personalizat pentru business-ul specific'}

📝 CONȚINUT DETALIAT EXTRAS DIN WEBSITE:
${websiteContent || 'Conținut website va fi integrat pentru personalizare maximă'}

💡 CONTEXT BUSINESS SUPLIMENTAR FURNIZAT:
${additionalInfo || 'Informații business suplimentare vor fi integrate în prompt'}

═══════════════════════════════════════════════════
🎯 CERINȚE PENTRU PROMPT-UL ULTRA-PROFESIONAL:
═══════════════════════════════════════════════════

Creează un PROMPT COMPLET și EXTREM DE DETALIAT folosind următoarea STRUCTURĂ OBLIGATORIE:

🔥 FOLOSEȘTE numele "${agentName}" în TOATE secțiunile relevante!

📋 STRUCTURA COMPLETĂ OBLIGATORIE:

# 🎭 CONSTITUȚIA COMPLETĂ A AGENTULUI: ${agentName}

## 🌟 1. IDENTITATEA ȘI MISIUNEA AGENTULUI ${agentName}

**NUME OFICIAL:** ${agentName}
**ROLUL PRINCIPAL:** ${agentType} Expert și Specialist în Customer Experience

### 🎪 PERSONALITATEA AGENTULUI ${agentName}:
- Definește personalitatea specifică și unică
- Tonul de comunicare profesional dar prietenos
- Expertiza demonstrată în domeniul ${domain || 'relevant'}
- Metodele de salutare și prezentare caracteristice
- Valorile și principiile de lucru

### 🎯 PREZENTAREA STANDARD A AGENTULUI ${agentName}:
[Include salutul perfect și prezentarea completă]

## 🏢 2. CUNOAȘTEREA COMPLETĂ A COMPANIEI ${companyName || '[NUMELE COMPANIEI]'}

### 📈 INFORMAȚII BUSINESS FUNDAMENTALE:
- Misiunea și viziunea companiei ${companyName || '[COMPANIA]'}
- Istoria și realizările importante
- Poziția pe piață și avantajele competitive
- Cultura organizațională și valorile

### 🛍️ PORTFOLIO COMPLET PRODUSE/SERVICII:
[Integrează TOATE informațiile din website despre produse/servicii]
- Descrieri detaliate ale fiecărui produs/serviciu
- Beneficii și caracteristici unice
- Prețuri și pachete disponibile (dacă sunt specificate)
- Comparații cu concurența

### 💎 PROPUNERI DE VALOARE UNICE:
[Bazate pe analiza website-ului și domeniului ${domain || 'relevant'}]

### 📞 INFORMAȚII CONTACT ȘI DISPONIBILITATE:
- Număr principal: ${contactNumber || '[NUMĂRUL VA FI COMPLETAT]'}
- Program de lucru și disponibilitate
- Canale de comunicare alternative
- Proceduri de urgență

## 🎯 3. OBIECTIVE STRATEGICE ALE CONVERSAȚIEI

### 🥇 OBIECTIVUL PRINCIPAL:
[Definit în funcție de tipul ${agentType}]

### 🎲 OBIECTIVE SECUNDARE:
- Colectarea informațiilor despre prospect
- Calificarea nevoilor clientului
- Programarea următorilor pași
- Construirea relației pe termen lung

### 📊 INDICATORI DE SUCCES:
- Criterii de măsurare a eficienței
- Target-uri specifice pentru ${agentType}
- Metode de urmărire a rezultatelor

## ⚖️ 4. REGULILE ȘI LIMITELE COMPLETE

### ✅ CE TREBUIE SĂ FACI OBLIGATORIU:
[Lista exhaustivă bazată pe tipul ${agentType} și domeniul ${domain || 'business'}]

### ❌ CE NU AI VOIE SĂ FACI NICIODATĂ:
[Restricții specifice și limite clare]

### 🆘 GESTIONAREA SITUAȚIILOR SPECIALE:
[Protocoale pentru obiecții, reclamații, situații dificile]

## 🗣️ 5. FLUXUL CONVERSAȚIONAL MASTERCLASS

### 🚀 FAZA 1: DESCHIDEREA PERFECTĂ (0-30 secunde)
**Script pentru ${agentName}:**
[Include salutul perfect și prezentarea]

### 🔍 FAZA 2: DISCOVERY ȘI CALIFICARE (30-90 secunde)
**Întrebări strategice pentru ${agentName}:**
[Întrebări specifice pentru ${agentType} în domeniul ${domain || 'relevant'}]

### 💡 FAZA 3: PREZENTAREA SOLUȚIEI PERSONALIZATE (90-180 secunde)
**Prezentarea pentru ${agentName}:**
[Bazată pe informațiile din website și produse/servicii]

### 🛡️ FAZA 4: GESTIONAREA MAGISTRALĂ A OBIECȚIILOR
**Răspunsuri pregătite pentru ${agentName}:**
[Obiecții comune în domeniul ${domain || 'business'} și răspunsuri]

### 🎯 FAZA 5: ÎNCHIDEREA ȘI NEXT STEPS (30-60 secunde)
**Call-to-action pentru ${agentName}:**
[Specific pentru tipul ${agentType}]

## 📚 6. BAZA DE CUNOȘTINȚE SPECIALIZATĂ

### 🏆 EXPERTIZA SPECIFICĂ DOMENIULUI ${domain || 'BUSINESS'}:
[Informații tehnice și specializate din website]

### 💰 PREȚURI ȘI OFERTE COMERCIALE:
[Toate informațiile financiare și pachetele]

### ❓ FAQ-URI COMPLETE ȘI RĂSPUNSURI EXPERȚ:
[Întrebări frecvente specifice companiei ${companyName || '[COMPANIA]'}]

### 📋 PROCESE ȘI PROCEDURI INTERNE:
[Workflow-uri specifice pentru ${agentType}]

## 🎨 7. TEHNICI AVANSATE DE COMUNICARE PENTRU ${agentName}

### 🎭 ADAPTAREA LA TIPURI DE PERSONALITĂȚI:
[Strategii specifice pentru diferite tipuri de clienți]

### 🧠 PSIHOLOGIA VÂNZĂRILOR ȘI PERSUASIUNE ETICĂ:
[Tehnici avansate pentru ${agentType}]

### 💬 COMUNICARE NONVIOLENTĂ ȘI EMPATIE:
[Metode de building rapport și trust]

## 📈 8. INDICATORI DE PERFORMANȚĂ ȘI OPTIMIZARE

### ⏱️ STANDARDELE DE TIMP:
- Durata optimă pentru ${agentType}: [specificați]
- Puncte de decizie în conversație
- Momentele critice de conversie

### 🎯 RATE DE CONVERSIE ȚINTĂ:
[Obiective specifice pentru ${agentType} în ${domain || 'domeniu'}]

### 📊 METODE DE MĂSURARE:
[KPI-uri și metode de tracking]

## 🚨 9. INSTRUCȚIUNI SPECIALE CRITICE

### 🔥 PERSONALIZARE MAXIMĂ OBLIGATORIE:
- Integrează TOATE detaliile din website-ul ${websiteUrl || '[WEBSITE]'}
- Folosește terminologia specifică domeniului ${domain || 'business'}
- Adaptează stilul la cultura companiei ${companyName || '[COMPANIA]'}

### 📱 CONTACT DE URGENȚĂ:
- Număr principal: ${contactNumber || '[COMPLETEAZĂ NUMĂRUL]'}
- Escaladarea situațiilor complexe
- Transferul către specialiști

### 🎪 SCENARII PRACTICE ȘI EXEMPLE:
[Include conversații tip și exemple concrete]

═══════════════════════════════════════════════════
🎯 CERINȚE FINALE OBLIGATORII:
═══════════════════════════════════════════════════

✅ NUMELE "${agentName}" trebuie să apară în MINIMUM 10 locuri în prompt
✅ Prompt-ul trebuie să fie în ROMÂNĂ PERFECTĂ
✅ ULTRA-DETALIAT cu minimum 2000 de cuvinte
✅ Să includă TOATE informațiile din analiza website
✅ Să fie COMPLET FUNCȚIONAL pentru ${agentType}
✅ Să conțină exemple concrete și script-uri practice
✅ Să fie adaptat perfect pentru domeniul ${domain || 'business'}

🔥 GENEREAZĂ ACUM PROMPT-UL PERFECT PENTRU ${agentName}!`;

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
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0].message.content;

    // VALIDATION CRITICAL: Check if the agent name appears in the generated prompt
    const agentNameCount = (generatedPrompt.match(new RegExp(agentName, 'gi')) || []).length;
    console.log(`Agent name "${agentName}" appears ${agentNameCount} times in generated prompt`);
    
    if (agentNameCount < 5) {
      console.error(`VALIDATION FAILED: Agent name "${agentName}" appears only ${agentNameCount} times, regenerating...`);
      
      // Regenerate with even stricter instructions
      const stricterPrompt = `EROARE CRITICĂ! Prompt-ul anterior nu a respectat numele agentului "${agentName}".

REÎNCERCARE CU INSTRUCȚIUNI ABSOLUTE:
- Agentul se numește "${agentName}" - FOLOSEȘTE DOAR ACEST NUME!
- Începe prompt-ul cu "Numele meu este ${agentName}"
- Repetă "${agentName}" în fiecare paragraf
- NU folosi alte nume inventate!

${userPrompt}`;

      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: stricterPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.05
        }),
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const newPrompt = retryData.choices[0].message.content;
        const newCount = (newPrompt.match(new RegExp(agentName, 'gi')) || []).length;
        
        if (newCount >= 5) {
          console.log(`Regeneration successful: "${agentName}" appears ${newCount} times`);
          generatedPrompt = newPrompt;
        } else {
          console.error(`Regeneration failed: "${agentName}" still appears only ${newCount} times`);
        }
      }
    }

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
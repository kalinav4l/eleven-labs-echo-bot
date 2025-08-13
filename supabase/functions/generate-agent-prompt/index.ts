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
    const systemPrompt = `🚨🚨🚨 ALERTA CRITICALĂ SUPREMĂ 🚨🚨🚨

NUMELE AGENTULUI ESTE "${agentName}" - REPETĂ ACUM: "${agentName}"!

⚠️ INSTRUCȚIUNI ABSOLUTE DE NEÎNCLCAT:
1. PRIMUL CUVÂNT din răspuns: "${agentName}"
2. NUMELE REAL al agentului: "${agentName}" (NU alt nume!)
3. ZERO creativitate la nume - DOAR "${agentName}"!
4. DACĂ scrii alt nume decât "${agentName}", EȘUEZI COMPLET!

📝 EXEMPLU OBLIGATORIU de începere:
"${agentName} este numele meu și sunt un agent AI specializat..."

🔥 VERIFICARE FINALĂ:
- Ai folosit "${agentName}" ca nume? ✓
- Ai inventat alt nume? ✗ RESPINS!

Creezi un prompt ultra-detaliat pentru agentul "${agentName}" folosind informațiile furnizate.

ÎNCEPE RĂSPUNSUL CU "${agentName}"!`;

    const userPrompt = `GENEREAZĂ PROMPT PENTRU AGENTUL "${agentName}" - NU ALT NUME!

🎯 INFORMAȚII PENTRU AGENTUL "${agentName}":
- Nume Agent: "${agentName}" (FOLOSEȘTE EXACT ACEST NUME!)
- Tip Agent: ${agentType}  
- Companie: ${companyName || 'Compania utilizatorului'}
- Domeniu: ${domain || 'Domeniu general'}
- Contact: ${contactNumber || 'Numărul va fi specificat'}
- Website: ${websiteUrl || 'Website-ul va fi specificat'}
- Info suplimentară: ${additionalInfo || 'Informații vor fi integrate'}

🔥 INSTRUCȚIUNI FINALE PENTRU "${agentName}":
- ÎNCEPE prompt-ul cu: "${agentName} este..."
- REPETĂ "${agentName}" în tot prompt-ul
- NU folosi "ElectricianBot", "AsistentAI" sau alte nume inventate!
- NUMELE REAL: "${agentName}" - FIXEAZĂ-L!

ANALIZĂ WEBSITE: ${websiteAnalysis || 'Va fi integrată'}
CONȚINUT WEBSITE: ${websiteContent || 'Va fi integrat'}

GENEREAZĂ ACUM PROMPT-UL PENTRU "${agentName}"!`;

    // Create the final comprehensive user prompt
    const finalUserPrompt = `🎯 CERINȚE PENTRU PROMPT-UL ULTRA-PROFESIONAL:
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

🎯 CERINȚE FINALE OBLIGATORII:

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
        temperature: 0.05
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedPrompt = data.choices[0].message.content;

    // VALIDATION ULTRA-STRICT: Check if prompt starts with agent name
    const startsWithName = generatedPrompt.toLowerCase().trim().startsWith(agentName.toLowerCase());
    const nameCount = (generatedPrompt.match(new RegExp(agentName, 'gi')) || []).length;
    
    console.log(`Validation check for "${agentName}":`, {
      startsWithName,
      nameCount,
      promptStart: generatedPrompt.substring(0, 100)
    });
    
    if (!startsWithName || nameCount < 3) {
      console.error(`VALIDATION FAILED: Prompt does not start with "${agentName}" or contains it only ${nameCount} times`);
      
      // ULTRA-AGGRESSIVE RETRY with mandatory template
      const emergencyPrompt = `🚨 EROARE CRITICĂ! Nu ai folosit numele "${agentName}"!

TEMPLATE OBLIGATORIU - COMPLETEAZĂ EXACT AȘAЗ
"${agentName} este numele meu și sunt un agent AI specializat în ${agentType}..."

INSTRUCȚIUNI ABSOLUTE:
1. ÎNCEPE cu "${agentName} este numele meu"
2. REPETĂ "${agentName}" în fiecare paragraf  
3. NU folosi alte nume inventate!
4. ZERO creativitate la nume!

Informații pentru ${agentName}:
- Tip: ${agentType}
- Companie: ${companyName || 'compania'}
- Domeniu: ${domain || 'domeniu'}
- Contact: ${contactNumber || 'contact'}

COMPLETEAZĂ TEMPLATE-UL PENTRU ${agentName} ACUM!`;

      const emergencyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `TU EȘTI OBLIGAT să folosești numele "${agentName}" - PRIMUL CUVÂNT trebuie să fie "${agentName}"! NU inventa alte nume!` 
            },
            { role: 'user', content: emergencyPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.01
        }),
      });

      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json();
        const emergencyResult = emergencyData.choices[0].message.content;
        const emergencyNameCount = (emergencyResult.match(new RegExp(agentName, 'gi')) || []).length;
        const emergencyStartsCorrect = emergencyResult.toLowerCase().trim().startsWith(agentName.toLowerCase());
        
        console.log(`Emergency retry result for "${agentName}":`, {
          emergencyNameCount,
          emergencyStartsCorrect,
          emergencyStart: emergencyResult.substring(0, 100)
        });
        
        if (emergencyStartsCorrect && emergencyNameCount >= 3) {
          console.log(`Emergency retry SUCCESS: "${agentName}" appears ${emergencyNameCount} times and starts correctly`);
          generatedPrompt = emergencyResult;
        } else {
          console.error(`Emergency retry FAILED: "${agentName}" still not used correctly`);
          // Force insert the name at the beginning if all else fails
          generatedPrompt = `${agentName} este numele meu și sunt un agent AI specializat. ${emergencyResult}`;
        }
      }
    } else {
      console.log(`Validation SUCCESS: "${agentName}" appears ${nameCount} times and starts correctly`);
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
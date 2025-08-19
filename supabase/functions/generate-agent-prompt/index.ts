import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { websiteUrl } = await req.json();
    
    if (!websiteUrl) {
      throw new Error('Website URL is required');
    }

    console.log('Analyzing website:', websiteUrl);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch website content
    console.log('Fetching website content...');
    const websiteResponse = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.status}`);
    }

    const websiteContent = await websiteResponse.text();
    console.log('Website content fetched, length:', websiteContent.length);

    // Extract key information from HTML
    const extractedInfo = extractWebsiteInfo(websiteContent);
    
    // Generate prompt using OpenAI
    console.log('Generating prompt with OpenAI...');
    const prompt = `
Analizează următorul site web și generează un prompt pentru un agent conversațional de vânzări/customer service pentru această companie.

INFORMAȚII DESPRE SITE:
- URL: ${websiteUrl}
- Titlu: ${extractedInfo.title}
- Descriere: ${extractedInfo.description}
- Servicii/Produse identificate: ${extractedInfo.services.join(', ')}
- Informații de contact: ${extractedInfo.contact}

CONȚINUT RELEVANT DIN SITE:
${extractedInfo.relevantText.substring(0, 3000)}

GENEREAZĂ UN PROMPT STRUCTURAT DUPĂ ACEST MODEL:

INSTRUCȚIUNI DE SISTEM PENTRU ASISTENTUL [NUME COMPANIE]
🎯 IDENTITATE ȘI MISIUNE

Nume: [Nume Agent]
Rol: [Rol specific pentru companie]
Misiune: [Misiunea agentului bazată pe serviciile companiei]

👤 PERSONALITATEA AGENTULUI
[Descrierea personalității potrivite pentru companie]

🗣️ STIL DE COMUNICARE
[Stilul de comunicare recomandat]

📋 REGULI DE BAZĂ
[Reguli specifice pentru acest agent]

🏢 DOMENII DE ASISTENȚĂ
[Domeniile în care poate ajuta agentul]

💬 EXEMPLE DE RĂSPUNSURI
[3-4 exemple concrete de răspunsuri]

🛠️ GESTIONAREA TIPURILOR DE CLIENȚI
[Cum să gestioneze diferite tipuri de clienți]

🏁 ÎNCHIDERE
[Cum să încheie conversațiile]

IMPORTANT: 
- Prompt-ul trebuie să fie în română
- Să fie specific pentru industria și serviciile companiei
- Să includă informații concrete despre companie
- Să fie profesional dar prietenos
- Să motiveze la cumpărare/acțiune
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
          { 
            role: 'system', 
            content: 'Ești un expert în marketing conversațional și crearea de agenți virtuali pentru business. Generezi prompt-uri detaliate și eficiente pentru agenți de vânzări.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
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

    console.log('Prompt generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        prompt: generatedPrompt,
        websiteInfo: extractedInfo
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

function extractWebsiteInfo(html: string) {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  const description = descMatch ? descMatch[1] : '';

  // Extract contact info
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  const phoneMatch = html.match(/(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g);
  
  let contact = '';
  if (emailMatch) contact += `Email: ${emailMatch[0]} `;
  if (phoneMatch) contact += `Telefon: ${phoneMatch[0]}`;

  // Remove HTML tags and extract text
  const textContent = html
    .replace(/<script[^>]*>.*?<\/script>/gsi, '')
    .replace(/<style[^>]*>.*?<\/style>/gsi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Identify services/products keywords
  const serviceKeywords = [
    'servicii', 'produse', 'soluții', 'echipamente', 'consultanță', 
    'vânzări', 'instalare', 'mentenanță', 'suport', 'transport',
    'fitness', 'sală', 'antrenament', 'spa', 'masaj', 'bazin',
    'restaurant', 'hotel', 'cazare', 'turism', 'excursii',
    'construcții', 'renovări', 'design', 'arhitectură',
    'software', 'web', 'aplicații', 'dezvoltare', 'IT',
    'medicina', 'stomatologie', 'analize', 'tratament',
    'educație', 'cursuri', 'training', 'școală', 'universitate'
  ];

  const services: string[] = [];
  const lowerText = textContent.toLowerCase();
  
  serviceKeywords.forEach(keyword => {
    if (lowerText.includes(keyword) && !services.includes(keyword)) {
      services.push(keyword);
    }
  });

  return {
    title,
    description,
    contact,
    services,
    relevantText: textContent.substring(0, 2000)
  };
}
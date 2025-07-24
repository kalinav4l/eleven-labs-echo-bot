import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CallbackIntent {
  hasCallbackRequest: boolean;
  timeframe?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  reason?: string;
  suggestedTime?: string;
  extractedPhones?: string[];
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Romanian callback patterns
const callbackPatterns = [
  /sună-?mă\s+(înapoi|mai târziu|peste|mâine|azi)/i,
  /telefon(eaz)?ă-?mă\s+(înapoi|mai târziu|peste|mâine|azi)/i,
  /apel(eaz)?ă-?mă\s+(înapoi|mai târziu|peste|mâine|azi)/i,
  /contacteaz[ăă]-?mă\s+(înapoi|mai târziu|peste|mâine|azi)/i,
  /îmi dai un telefon/i,
  /să vorbim mai târziu/i,
  /să ne vorbim/i,
  /să mă suni/i,
  /vreau să mă suni/i,
  /poți să mă suni/i,
  /call me back/i,
  /phone me/i
];

// Time extraction patterns
const timePatterns = [
  { pattern: /peste\s+(\d+)\s+minute?/i, unit: 'minutes' },
  { pattern: /în\s+(\d+)\s+minute?/i, unit: 'minutes' },
  { pattern: /peste\s+(\d+)\s+or[eă]/i, unit: 'hours' },
  { pattern: /în\s+(\d+)\s+or[eă]/i, unit: 'hours' },
  { pattern: /mâine\s+la\s+(\d{1,2}):?(\d{2})?/i, unit: 'tomorrow' },
  { pattern: /azi\s+la\s+(\d{1,2}):?(\d{2})?/i, unit: 'today' },
  { pattern: /diseară/i, unit: 'evening' },
  { pattern: /dimineață/i, unit: 'morning' },
  { pattern: /după-?amia?z[ăa]/i, unit: 'afternoon' }
];

// Urgency indicators
const urgencyIndicators = {
  urgent: ['urgent', 'imediat', 'acum', 'grabă', 'important foarte', 'critc'],
  high: ['important', 'cât mai repede', 'urgent', 'prioritate'],
  medium: ['când poți', 'când ai timp', 'normal'],
  low: ['când vrei', 'nu grăbește', 'când ți-e convenabil']
};

const detectCallbackIntent = async (text: string): Promise<CallbackIntent> => {
  console.log('Analyzing text for callback intent:', text);

  // Check for basic callback patterns first
  const hasBasicPattern = callbackPatterns.some(pattern => pattern.test(text));
  
  if (!hasBasicPattern) {
    // Use OpenAI for more sophisticated detection
    const openaiDetection = await detectWithOpenAI(text);
    if (!openaiDetection.hasCallbackRequest) {
      return { hasCallbackRequest: false, urgency: 'medium' };
    }
  }

  // Extract time information
  let timeframe = '';
  let suggestedTime = '';
  
  for (const timePattern of timePatterns) {
    const match = text.match(timePattern.pattern);
    if (match) {
      switch (timePattern.unit) {
        case 'minutes':
          const minutes = parseInt(match[1]);
          timeframe = `${minutes} minute`;
          suggestedTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
          break;
        case 'hours':
          const hours = parseInt(match[1]);
          timeframe = `${hours} ore`;
          suggestedTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
          break;
        case 'tomorrow':
          const hour = parseInt(match[1]);
          const minute = match[2] ? parseInt(match[2]) : 0;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(hour, minute, 0, 0);
          timeframe = `mâine la ${hour}:${minute.toString().padStart(2, '0')}`;
          suggestedTime = tomorrow.toISOString();
          break;
        case 'today':
          const todayHour = parseInt(match[1]);
          const todayMinute = match[2] ? parseInt(match[2]) : 0;
          const today = new Date();
          today.setHours(todayHour, todayMinute, 0, 0);
          timeframe = `azi la ${todayHour}:${todayMinute.toString().padStart(2, '0')}`;
          suggestedTime = today.toISOString();
          break;
        case 'evening':
          const evening = new Date();
          evening.setHours(18, 0, 0, 0);
          if (evening.getTime() < Date.now()) {
            evening.setDate(evening.getDate() + 1);
          }
          timeframe = 'diseară';
          suggestedTime = evening.toISOString();
          break;
        case 'morning':
          const morning = new Date();
          morning.setDate(morning.getDate() + 1);
          morning.setHours(9, 0, 0, 0);
          timeframe = 'mâine dimineață';
          suggestedTime = morning.toISOString();
          break;
        case 'afternoon':
          const afternoon = new Date();
          afternoon.setHours(14, 0, 0, 0);
          if (afternoon.getTime() < Date.now()) {
            afternoon.setDate(afternoon.getDate() + 1);
          }
          timeframe = 'după-amiază';
          suggestedTime = afternoon.toISOString();
          break;
      }
      break;
    }
  }

  // Determine urgency
  let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  const lowerText = text.toLowerCase();
  
  for (const [level, indicators] of Object.entries(urgencyIndicators)) {
    if (indicators.some(indicator => lowerText.includes(indicator))) {
      urgency = level as 'low' | 'medium' | 'high' | 'urgent';
      break;
    }
  }

  // Extract potential phone numbers
  const phoneRegex = /(\+?\d{8,15})/g;
  const extractedPhones = text.match(phoneRegex) || [];

  // Extract reason/context
  const reasonIndicators = [
    'pentru', 'despre', 'legat de', 'în privința', 'referitor la',
    'am o întrebare', 'vreau să întreb', 'să discutăm'
  ];
  
  let reason = '';
  for (const indicator of reasonIndicators) {
    const index = lowerText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = text.substring(index + indicator.length, index + indicator.length + 100);
      reason = afterIndicator.trim().split(/[.!?]/)[0];
      break;
    }
  }

  // Default timeframe if none detected
  if (!timeframe) {
    timeframe = 'mai târziu';
    suggestedTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
  }

  console.log('Callback intent detected:', {
    hasCallbackRequest: true,
    timeframe,
    urgency,
    reason,
    suggestedTime,
    extractedPhones
  });

  return {
    hasCallbackRequest: true,
    timeframe,
    urgency,
    reason: reason || undefined,
    suggestedTime,
    extractedPhones
  };
};

const detectWithOpenAI = async (text: string): Promise<CallbackIntent> => {
  if (!OPENAI_API_KEY) {
    return { hasCallbackRequest: false, urgency: 'medium' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Ești un sistem de analiză care detectează când cineva cere să fie sunat înapoi.

Analizează textul și determină:
1. Dacă persoana cere să fie sunată înapoi (true/false)
2. Când vrea să fie sunată (timeframe)
3. Urgența cererii (low/medium/high/urgent)
4. Motivul pentru care vrea să fie sunată (reason)

Răspunde doar cu JSON în formatul:
{
  "hasCallbackRequest": boolean,
  "timeframe": "string sau null",
  "urgency": "low|medium|high|urgent",
  "reason": "string sau null"
}`
          },
          { role: 'user', content: text }
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return { hasCallbackRequest: false, urgency: 'medium' };
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return { hasCallbackRequest: false, urgency: 'medium' };
    }

    try {
      const parsed = JSON.parse(aiResponse);
      return {
        hasCallbackRequest: parsed.hasCallbackRequest || false,
        timeframe: parsed.timeframe || undefined,
        urgency: parsed.urgency || 'medium',
        reason: parsed.reason || undefined
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return { hasCallbackRequest: false, urgency: 'medium' };
    }
  } catch (error) {
    console.error('OpenAI detection error:', error);
    return { hasCallbackRequest: false, urgency: 'medium' };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, conversationId, phoneNumber, contactName, agentId, userId } = await req.json();

    // Input validation
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }

    if (!conversationId || !phoneNumber || !userId) {
      throw new Error('Missing required conversation details');
    }

    console.log('Processing callback detection for:', { conversationId, phoneNumber, contactName });

    // Detect callback intent
    const intent = await detectCallbackIntent(text);

    if (!intent.hasCallbackRequest) {
      return new Response(
        JSON.stringify({ 
          callbackDetected: false,
          message: 'No callback request detected'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create callback entry in scheduled_calls
    const callbackData = {
      user_id: userId,
      client_name: contactName || 'Client necunoscut',
      phone_number: phoneNumber,
      scheduled_datetime: intent.suggestedTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      description: `Callback cerut în conversația ${conversationId}`,
      priority: intent.urgency,
      status: 'scheduled',
      notes: `Motiv: ${intent.reason || 'Nu specificat'}. Timeframe cerut: ${intent.timeframe || 'mai târziu'}`,
      task_type: 'callback',
      agent_id: agentId,
      callback_reason: intent.reason || 'Cerere callback din conversație',
      original_conversation_id: conversationId
    };

    const { data: callbackRecord, error: insertError } = await supabase
      .from('scheduled_calls')
      .insert(callbackData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating callback:', insertError);
      throw new Error('Failed to create callback record');
    }

    console.log('Callback created successfully:', callbackRecord);

    // Also update the original conversation with callback info
    try {
      const { error: updateError } = await supabase
        .from('call_history')
        .update({
          notes: `Callback programat pentru ${intent.timeframe || 'mai târziu'}. ID: ${callbackRecord.id}`
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (updateError) {
        console.warn('Failed to update conversation with callback info:', updateError);
      }
    } catch (updateError) {
      console.warn('Error updating conversation:', updateError);
    }

    return new Response(
      JSON.stringify({
        callbackDetected: true,
        callbackId: callbackRecord.id,
        intent: intent,
        scheduledTime: intent.suggestedTime,
        message: `Callback programat pentru ${intent.timeframe || 'mai târziu'}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-callback-intent function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        callbackDetected: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
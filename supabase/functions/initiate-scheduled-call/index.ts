
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation helpers
const validatePhoneNumber = (phone: string): boolean => {
  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validateInput = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }
  
  const { agent_id, phone_number, contact_name, user_id, batch_processing, caller_number, is_test_call } = data;
  
  // Validate required fields
  if (!agent_id || typeof agent_id !== 'string' || agent_id.length > 100) {
    throw new Error('Invalid agent ID');
  }
  
  if (!phone_number || typeof phone_number !== 'string') {
    throw new Error('Phone number is required');
  }
  
  if (!user_id || typeof user_id !== 'string') {
    throw new Error('User ID is required');
  }
  
  // Validate phone number format
  const cleanPhone = phone_number.replace(/[\s\-\(\)]/g, '');
  if (!validatePhoneNumber(cleanPhone)) {
    throw new Error('Invalid phone number format');
  }
  
  // Validate optional fields
  if (contact_name && (typeof contact_name !== 'string' || contact_name.length > 200)) {
    throw new Error('Contact name too long');
  }
  
  if (caller_number && typeof caller_number !== 'string') {
    throw new Error('Invalid caller number');
  }
  
  return { agent_id, phone_number: cleanPhone, contact_name, user_id, batch_processing, caller_number, is_test_call };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json();
    const { agent_id, phone_number, contact_name, user_id, batch_processing, caller_number, is_test_call } = validateInput(requestData);

    console.log('Received request:', { agent_id, phone_number, contact_name, user_id, batch_processing, caller_number, is_test_call })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get ElevenLabs API credentials
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    console.log('API Key exists:', !!elevenLabsApiKey)
    
    if (!elevenLabsApiKey) {
      console.error('❌ ElevenLabs API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key nu este configurat în Supabase Secrets. Configurați ELEVENLABS_API_KEY în Edge Functions Secrets.',
          success: false,
          details: 'Mergeți la Project Settings > Edge Functions > Manage secrets și adăugați ELEVENLABS_API_KEY'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Configure phone number for call - use test number for test calls
    let agentPhoneId, callerNumber;

    // Get user's phone number from database (for both test and regular calls)
    const { data: userPhoneNumbers, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('elevenlabs_phone_id, phone_number')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .order('is_primary', { ascending: false }) // Prefer primary phone numbers
      .order('created_at', { ascending: false })
      .limit(1);

    if (phoneError) {
      console.error('❌ Error fetching user phone numbers:', phoneError);
      return new Response(
        JSON.stringify({ 
          error: 'Nu s-au putut găsi numerele de telefon ale utilizatorului',
          success: false,
          details: phoneError.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!userPhoneNumbers || userPhoneNumbers.length === 0) {
      console.error('❌ No active phone numbers found for user:', user_id);
      return new Response(
        JSON.stringify({ 
          error: 'Nu aveți niciun număr de telefon activ înregistrat. Vă rugăm să adăugați un număr de telefon în secțiunea Phone Numbers.',
          success: false,
          details: 'Utilizatorul nu are numere de telefon active'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userPhone = userPhoneNumbers[0];
    agentPhoneId = userPhone.elevenlabs_phone_id;
    callerNumber = userPhone.phone_number;

    if (!agentPhoneId) {
      console.error('❌ Phone number missing ElevenLabs configuration');
      return new Response(
        JSON.stringify({ 
          error: 'Numărul de telefon nu este configurat corect cu ElevenLabs. Vă rugăm să reconfigurați numărul în secțiunea Phone Numbers.',
          success: false,
          details: 'Phone number missing elevenlabs_phone_id'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User phone details:', { agentPhoneId, callerNumber, user_id })

    // Fetch contact information from the contacts database
    let contactInfo = null
    const { data: contactData, error: contactError } = await supabase
      .from('contacts_database')
      .select('*')
      .eq('user_id', user_id)
      .eq('telefon', phone_number)
      .single()

    if (!contactError && contactData) {
      contactInfo = contactData
      console.log('📋 Contact info found:', contactInfo)
    } else {
      console.log('ℹ️ No contact info found for phone number:', phone_number)
    }

    // Fetch contact interaction history
    let interactionHistory = []
    if (contactInfo) {
      const { data: historyData, error: historyError } = await supabase
        .from('contact_interactions')
        .select('*')
        .eq('user_id', user_id)
        .eq('contact_id', contactInfo.id)
        .order('interaction_date', { ascending: false })
        .limit(5)

      if (!historyError && historyData) {
        interactionHistory = historyData
        console.log('📚 Interaction history found:', interactionHistory.length, 'interactions')
      }
    }

    // Build context for the agent with contact information
    let contextInstructions = ""
    if (contactInfo) {
      contextInstructions = `INFORMAȚII CONTACT:
- Nume: ${contactInfo.nume}
- Telefon: ${contactInfo.telefon}
- Email: ${contactInfo.email || 'N/A'}
- Companie: ${contactInfo.company || 'N/A'}
- Locație: ${contactInfo.locatie || 'N/A'}, ${contactInfo.tara || 'N/A'}
- Status: ${contactInfo.status}
- Note: ${contactInfo.notes || 'Nu există note'}
- Info suplimentare: ${contactInfo.info || 'Nu există informații suplimentare'}

ISTORIC INTERACȚIUNI ANTERIOARE:
${interactionHistory.length > 0 ? 
  interactionHistory.map(h => 
    `- ${h.interaction_date}: ${h.interaction_type} (${h.call_status || 'N/A'}) - ${h.summary || 'Fără sumar'}`
  ).join('\n')
  : 'Prima interacțiune cu acest contact'}

Folosește aceste informații pentru a personaliza conversația și a face referire la interacțiunile anterioare dacă este relevant.`
    } else {
      contextInstructions = `CONTACT NOU:
- Telefon: ${phone_number}
- Nume: ${contact_name || 'Necunoscut'}

Acest este un contact nou, fără istoric anterior de interacțiuni.`
    }

    console.log(`🚀 Inițiere apel pentru ${phone_number} cu agentul ${agent_id} pentru utilizatorul ${user_id} de pe ${callerNumber}`)

    const requestBody = {
      agent_id: agent_id,
      agent_phone_number_id: agentPhoneId,
      to_number: phone_number,
      conversation_config_override: {
        agent: {
          prompt: {
            prompt: contextInstructions
          }
        }
      }
    }

    console.log('📤 Request body pentru ElevenLabs:', JSON.stringify(requestBody, null, 2))

    // Make the call to ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📡 ElevenLabs response status:', response.status)
    console.log('📡 ElevenLabs response headers:', Object.fromEntries(response.headers.entries()))

    let elevenLabsData
    let responseText = ''
    
    try {
      responseText = await response.text()
      console.log('📝 ElevenLabs raw response:', responseText)
      
      if (responseText) {
        elevenLabsData = JSON.parse(responseText)
        console.log('✅ Parsed ElevenLabs data:', JSON.stringify(elevenLabsData, null, 2))
      }
    } catch (parseError) {
      console.error('❌ Error parsing ElevenLabs response:', parseError)
      console.error('📄 Raw response was:', responseText)
    }

    if (!response.ok) {
      console.error('❌ ElevenLabs API error:', response.status, responseText)
      
      // Enhanced error message based on status code
      let errorMessage = `Eroare ElevenLabs: ${response.status}`
      
      if (response.status === 401) {
        errorMessage += ' - API Key invalid sau lipsă'
      } else if (response.status === 400) {
        errorMessage += ' - Date de intrare invalide (verificați Agent ID și numărul de telefon)'
      } else if (response.status === 404) {
        errorMessage += ' - Agent sau numărul de telefon nu a fost găsit'
      } else if (response.status === 429) {
        errorMessage += ' - Prea multe cereri (rate limit)'
      } else if (response.status >= 500) {
        errorMessage += ' - Eroare server ElevenLabs'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: responseText,
          success: false,
          status_code: response.status
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Apel inițiat cu succes:', elevenLabsData)

    // Determine call status based on ElevenLabs response
    let callStatus = 'initiated'
    let callSummary = `Apel inițiat către ${contact_name || phone_number}`
    
    if (elevenLabsData) {
      const message = elevenLabsData.message || ''
      const success = elevenLabsData.success
      
      if (success === false) {
        callStatus = 'failed'
        callSummary = `Apel eșuat către ${contact_name || phone_number}: ${message}`
      } else if (success === true) {
        if (message.includes('initiated')) {
          callStatus = 'initiated'
          callSummary = `Apel inițiat către ${contact_name || phone_number}`
        } else {
          callStatus = 'success'
          callSummary = `Apel reușit către ${contact_name || phone_number}`
        }
      }
      
      // Check for specific SIP error patterns
      if (message.includes('TEMPORARILY_UNAVAILABLE') || message.includes('480')) {
        callStatus = 'busy'
        callSummary = `Apel ocupat către ${contact_name || phone_number}: temporar indisponibil`
      } else if (message.includes('FORBIDDEN') || message.includes('403')) {
        callStatus = 'failed'
        callSummary = `Apel interzis către ${contact_name || phone_number}: acces refuzat`
      } else if (message.includes('NOT_FOUND') || message.includes('404')) {
        callStatus = 'failed'
        callSummary = `Apel eșuat către ${contact_name || phone_number}: număr negăsit`
      }
    }

    // Store call initiation in database
    const callHistoryData = {
      user_id: user_id,
      phone_number: phone_number,
      caller_number: callerNumber, // Add the caller number
      contact_name: contact_name || phone_number,
      call_status: callStatus,
      summary: callSummary,
      agent_id: agent_id,
      conversation_id: elevenLabsData?.conversation_id || null,
      elevenlabs_history_id: elevenLabsData?.conversation_id || null,
      dialog_json: JSON.stringify({
        request: requestBody,
        response: elevenLabsData,
        initiated_at: new Date().toISOString(),
        batch_processing: batch_processing || false,
        is_test_call: is_test_call || false,
        caller_phone_details: { elevenlabs_phone_id: agentPhoneId, phone_number: callerNumber }
      }),
      call_date: new Date().toISOString(),
      cost_usd: 0, // Will be updated when call completes
      duration_seconds: 0, // Will be updated when call completes
      language: 'ro'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('call_history')
      .insert(callHistoryData)
      .select()

    if (insertError) {
      console.error('Error inserting call history:', insertError)
      // Continue even if database insert fails
    } else {
      console.log('Call history inserted:', insertData)
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: elevenLabsData?.conversation_id,
        callHistoryId: insertData?.[0]?.id,
        agent_id: agent_id,
        user_id: user_id,
        phone_number: phone_number,
        elevenlabs_data: elevenLabsData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('💥 Eroare critică în inițierea apelului:', error)
    console.error('🔍 Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Eroare necunoscută în inițierea apelului',
        details: error.stack || 'Nu sunt disponibile detalii suplimentare',
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

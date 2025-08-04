import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone_number, agent_id } = await req.json()
    
    console.log('📞 Contact context request for:', { phone_number, agent_id })

    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone_number.replace(/[\s\-\(\)]/g, '')
    
    // Search for contact in database by phone number
    const { data: contact, error } = await supabase
      .from('contacts_database')
      .select('nume, telefon, info, locatie, tara, user_id')
      .eq('telefon', normalizedPhone)
      .maybeSingle()

    if (error) {
      console.error('❌ Error fetching contact:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Database error',
          phone_number: normalizedPhone,
          context_found: false
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!contact) {
      // No contact found - return basic context
      console.log('📝 No contact found for:', normalizedPhone)
      return new Response(
        JSON.stringify({
          success: true,
          phone_number: normalizedPhone,
          context_found: false,
          contact_context: {
            nume: 'Contact necunoscut',
            telefon: normalizedPhone,
            info: 'Nu există informații suplimentare disponibile',
            locatie: 'Necunoscută',
            tara: 'Necunoscută'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Contact found - return full context
    console.log('✅ Contact found:', contact.nume)
    
    const contextData = {
      success: true,
      phone_number: normalizedPhone,
      context_found: true,
      contact_context: {
        nume: contact.nume || 'Nume necunoscut',
        telefon: contact.telefon || normalizedPhone,
        info: contact.info || 'Nu există informații suplimentare',
        locatie: contact.locatie || 'Necunoscută',
        tara: contact.tara || 'Necunoscută'
      },
      agent_instructions: `Salutare! Vorbești cu ${contact.nume || 'clientul'}${contact.locatie ? ` din ${contact.locatie}` : ''}${contact.tara ? `, ${contact.tara}` : ''}. ${contact.info ? `Informații suplimentare: ${contact.info}` : ''}`
    }

    return new Response(
      JSON.stringify(contextData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('💥 Error in contact-context-webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface ChatRequest {
  agentId: string
  message: string
  userId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agentId, message, userId }: ChatRequest = await req.json()

    if (!agentId || !message) {
      return new Response(
        JSON.stringify({ error: 'AgentId and message are required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ElevenLabs API key
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Start a conversation with the ElevenLabs agent
    const conversationResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations`, {
      method: 'POST',
      headers: {
        'Xi-Api-Key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    })

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text()
      console.error('ElevenLabs conversation start error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to start conversation with agent' }), 
        { 
          status: conversationResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation_id

    // Send message to the conversation
    const messageResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/message`, {
      method: 'POST',
      headers: {
        'Xi-Api-Key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    })

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text()
      console.error('ElevenLabs message error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send message to agent' }), 
        { 
          status: messageResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const messageData = await messageResponse.json()
    
    // Extract the response text
    let responseText = 'Nu am putut genera un răspuns.'
    if (messageData.text) {
      responseText = messageData.text
    } else if (messageData.message && messageData.message.text) {
      responseText = messageData.message.text
    }

    return new Response(
      JSON.stringify({ 
        response: responseText,
        conversationId: conversationId 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Chat with agent error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
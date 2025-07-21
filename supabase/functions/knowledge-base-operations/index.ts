import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface CreateTextDocumentRequest {
  name: string
  text: string
}

interface KnowledgeBaseDocument {
  id: string
  name: string
  type: string
  created_at?: string
}

interface CreateDocumentResponse {
  id: string
  name: string
}

interface KnowledgeBaseResponse {
  documents: KnowledgeBaseDocument[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Verify API key - using Supabase anon key as expected
    const apiKey = req.headers.get('X-API-KEY')
    const expectedApiKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('API key validation failed:', { provided: apiKey?.substring(0, 10), expected: expectedApiKey?.substring(0, 10) })
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
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

    // Handle text document creation (JSON request)
    if (method === 'POST') {
      const contentType = req.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
      const body: CreateTextDocumentRequest = await req.json()
      
      const response = await fetch('https://api.elevenlabs.io/v1/knowledge-base', {
        method: 'POST',
        headers: {
          'Xi-Api-Key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: body.name,
          description: `Text document: ${body.name}`,
          text: body.text,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs API error:', errorText)
        return new Response(
          JSON.stringify({ error: 'Failed to create text document in ElevenLabs' }), 
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = await response.json()
      const responseData: CreateDocumentResponse = {
        id: result.knowledge_base_id,
        name: body.name,
      }

        return new Response(
          JSON.stringify(responseData), 
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Handle file document upload (multipart/form-data request)
      if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File
      const name = url.searchParams.get('name') || file.name

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create form data for ElevenLabs
      const elevenLabsFormData = new FormData()
      elevenLabsFormData.append('file', file)
      elevenLabsFormData.append('name', name)
      elevenLabsFormData.append('description', `File document: ${name}`)

      const response = await fetch('https://api.elevenlabs.io/v1/knowledge-base', {
        method: 'POST',
        headers: {
          'Xi-Api-Key': elevenLabsApiKey,
        },
        body: elevenLabsFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs file upload error:', errorText)
        return new Response(
          JSON.stringify({ error: 'Failed to upload file to ElevenLabs' }), 
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = await response.json()
      const responseData: CreateDocumentResponse = {
        id: result.knowledge_base_id,
        name: name,
      }

        return new Response(
          JSON.stringify(responseData), 
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Handle getting existing documents
    if (method === 'GET') {
      const response = await fetch('https://api.elevenlabs.io/v1/knowledge-base', {
        method: 'GET',
        headers: {
          'Xi-Api-Key': elevenLabsApiKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ElevenLabs get documents error:', errorText)
        return new Response(
          JSON.stringify({ error: 'Failed to get documents from ElevenLabs' }), 
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const result = await response.json()
      const documents: KnowledgeBaseDocument[] = result.knowledge_bases?.map((kb: any) => ({
        id: kb.knowledge_base_id,
        name: kb.name,
        type: 'file', // ElevenLabs doesn't distinguish between text and file
        created_at: kb.created_at,
      })) || []

      const responseData: KnowledgeBaseResponse = {
        documents,
      }

      return new Response(
        JSON.stringify(responseData), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }), 
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Knowledge base operation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
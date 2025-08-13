import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user_id from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1]; // Get the last part of the path

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required in URL path' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📧 Webhook called for user: ${userId}, method: ${req.method}`);

    if (req.method === 'GET') {
      // Handle query requests from AI agent
      const queryParams = url.searchParams;
      const name = queryParams.get('name');
      const location = queryParams.get('location');
      const limit = parseInt(queryParams.get('limit') || '10');

      let query = supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters if provided
      if (name) {
        query = query.ilike('name', `%${name}%`);
      }
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching user data:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch data' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`✅ Returning ${data?.length || 0} records for user ${userId}`);
      
      return new Response(
        JSON.stringify({
          status: 'success',
          data: data || [],
          count: data?.length || 0,
          user_id: userId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (req.method === 'POST') {
      // Handle data modification requests from AI agent
      const body = await req.json();
      const { action, data: requestData } = body;

      console.log(`📝 Processing ${action} action for user ${userId}:`, requestData);

      if (action === 'add') {
        const { data, error } = await supabase
          .from('user_data')
          .insert([
            {
              user_id: userId,
              name: requestData.name,
              number: requestData.number,
              location: requestData.location,
              info: requestData.info,
              date_user: requestData.date_user || new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (error) {
          console.error('❌ Error adding data:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to add data' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({
            status: 'success',
            message: 'Data added successfully',
            data: data
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      } else if (action === 'update') {
        const { id, ...updateData } = requestData;
        
        const { data, error } = await supabase
          .from('user_data')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating data:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to update data' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({
            status: 'success',
            message: 'Data updated successfully',
            data: data
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      } else if (action === 'delete') {
        const { id } = requestData;
        
        const { error } = await supabase
          .from('user_data')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Error deleting data:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to delete data' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return new Response(
          JSON.stringify({
            status: 'success',
            message: 'Data deleted successfully'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: add, update, delete' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
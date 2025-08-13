export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      agent_documents: {
        Row: {
          agent_id: string
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          system_prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          system_prompt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          system_prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audio_generations: {
        Row: {
          audio_url: string | null
          character_count: number
          created_at: string
          credits_used: number
          id: string
          text: string
          user_id: string | null
          voice_id: string
          voice_name: string
        }
        Insert: {
          audio_url?: string | null
          character_count: number
          created_at?: string
          credits_used: number
          id?: string
          text: string
          user_id?: string | null
          voice_id: string
          voice_name: string
        }
        Update: {
          audio_url?: string | null
          character_count?: number
          created_at?: string
          credits_used?: number
          id?: string
          text?: string
          user_id?: string | null
          voice_id?: string
          voice_name?: string
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          amount: number
          conversation_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      call_history: {
        Row: {
          agent_id: string | null
          call_date: string
          call_status: string
          callback_analyzed: boolean | null
          caller_number: string | null
          contact_name: string | null
          conversation_id: string | null
          cost_processed: boolean | null
          cost_usd: number | null
          created_at: string
          dialog_json: string | null
          duration_seconds: number | null
          elevenlabs_history_id: string | null
          id: string
          language: string | null
          last_status_check: string | null
          phone_number: string
          summary: string | null
          timestamps: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          call_date?: string
          call_status?: string
          callback_analyzed?: boolean | null
          caller_number?: string | null
          contact_name?: string | null
          conversation_id?: string | null
          cost_processed?: boolean | null
          cost_usd?: number | null
          created_at?: string
          dialog_json?: string | null
          duration_seconds?: number | null
          elevenlabs_history_id?: string | null
          id?: string
          language?: string | null
          last_status_check?: string | null
          phone_number: string
          summary?: string | null
          timestamps?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          call_date?: string
          call_status?: string
          callback_analyzed?: boolean | null
          caller_number?: string | null
          contact_name?: string | null
          conversation_id?: string | null
          cost_processed?: boolean | null
          cost_usd?: number | null
          created_at?: string
          dialog_json?: string | null
          duration_seconds?: number | null
          elevenlabs_history_id?: string | null
          id?: string
          language?: string | null
          last_status_check?: string | null
          phone_number?: string
          summary?: string | null
          timestamps?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      call_sessions: {
        Row: {
          agent_id: string
          agent_owner_user_id: string
          contact_name: string | null
          created_at: string
          id: string
          phone_number: string | null
          session_id: string
          session_type: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          agent_owner_user_id: string
          contact_name?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          session_id: string
          session_type?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          agent_owner_user_id?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          session_id?: string
          session_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          agent_id: string | null
          client_name: string
          created_at: string
          description: string | null
          id: string
          notes: string | null
          phone_number: string
          priority: string
          reason: string | null
          scheduled_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          client_name: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          phone_number: string
          priority?: string
          reason?: string | null
          scheduled_time: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          client_name?: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          phone_number?: string
          priority?: string
          reason?: string | null
          scheduled_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_contacts: {
        Row: {
          call_attempts: number | null
          call_status: string | null
          campaign_id: string
          contact_name: string | null
          conversation_id: string | null
          created_at: string
          id: string
          last_call_attempt: string | null
          notes: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          call_attempts?: number | null
          call_status?: string | null
          campaign_id: string
          contact_name?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          last_call_attempt?: string | null
          notes?: string | null
          phone_number: string
          updated_at?: string
        }
        Update: {
          call_attempts?: number | null
          call_status?: string | null
          campaign_id?: string
          contact_name?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          last_call_attempt?: string | null
          notes?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agent_id: string | null
          called_contacts: number | null
          created_at: string
          description: string | null
          failed_calls: number | null
          id: string
          name: string
          sms_enabled: boolean | null
          sms_message: string | null
          status: string | null
          successful_calls: number | null
          total_contacts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          called_contacts?: number | null
          created_at?: string
          description?: string | null
          failed_calls?: number | null
          id?: string
          name: string
          sms_enabled?: boolean | null
          sms_message?: string | null
          status?: string | null
          successful_calls?: number | null
          total_contacts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          called_contacts?: number | null
          created_at?: string
          description?: string | null
          failed_calls?: number | null
          id?: string
          name?: string
          sms_enabled?: boolean | null
          sms_message?: string | null
          status?: string | null
          successful_calls?: number | null
          total_contacts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          agent_id: string | null
          call_status: string | null
          contact_id: string
          conversation_id: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          interaction_date: string
          interaction_type: string
          notes: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          call_status?: string | null
          contact_id: string
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          notes?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          call_status?: string | null
          contact_id?: string
          conversation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          notes?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_database"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_database: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          info: string | null
          last_contact_date: string | null
          locatie: string | null
          notes: string | null
          nume: string
          status: string | null
          tags: string[] | null
          tara: string | null
          telefon: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          info?: string | null
          last_contact_date?: string | null
          locatie?: string | null
          notes?: string | null
          nume: string
          status?: string | null
          tags?: string[] | null
          tara?: string | null
          telefon: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          info?: string | null
          last_contact_date?: string | null
          locatie?: string | null
          notes?: string | null
          nume?: string
          status?: string | null
          tags?: string[] | null
          tara?: string | null
          telefon?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_analytics_cache: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          analysis: Json | null
          call_date: string | null
          call_status: string | null
          contact_name: string | null
          conversation_id: string
          cost_credits: number | null
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          phone_number: string | null
          transcript: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          analysis?: Json | null
          call_date?: string | null
          call_status?: string | null
          contact_name?: string | null
          conversation_id: string
          cost_credits?: number | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          transcript?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          analysis?: Json | null
          call_date?: string | null
          call_status?: string | null
          contact_name?: string | null
          conversation_id?: string
          cost_credits?: number | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          transcript?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_logs: {
        Row: {
          agent_transcript: string | null
          conversation_id: string
          created_at: string
          generated_offer: string | null
          id: string
          phone_number: string | null
          sms_response: Json | null
          sms_status: string | null
          updated_at: string
          user_transcript: string | null
          webhook_config_id: string | null
        }
        Insert: {
          agent_transcript?: string | null
          conversation_id: string
          created_at?: string
          generated_offer?: string | null
          id?: string
          phone_number?: string | null
          sms_response?: Json | null
          sms_status?: string | null
          updated_at?: string
          user_transcript?: string | null
          webhook_config_id?: string | null
        }
        Update: {
          agent_transcript?: string | null
          conversation_id?: string
          created_at?: string
          generated_offer?: string | null
          id?: string
          phone_number?: string | null
          sms_response?: Json | null
          sms_status?: string | null
          updated_at?: string
          user_transcript?: string | null
          webhook_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_logs_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string
          agent_name: string
          conversation_id: string | null
          cost_usd: number | null
          created_at: string
          credits_used: number
          duration_minutes: number | null
          id: string
          ip_address: unknown | null
          message_count: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          credits_used?: number
          duration_minutes?: number | null
          id?: string
          ip_address?: unknown | null
          message_count?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          credits_used?: number
          duration_minutes?: number | null
          id?: string
          ip_address?: unknown | null
          message_count?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_monthly: number
          price_usd: number
          price_yearly: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits: number
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_monthly: number
          price_usd: number
          price_yearly: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_monthly?: number
          price_usd?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      custom_voices: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          user_id: string | null
          voice_id: string
          voice_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string | null
          voice_id: string
          voice_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string | null
          voice_id?: string
          voice_name?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_embeddings: {
        Row: {
          agent_id: string | null
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string
          document_name: string
          embedding: Json
          id: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id: string
          document_name: string
          embedding: Json
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string
          document_name?: string
          embedding?: Json
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      kalina_agents: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          elevenlabs_agent_id: string | null
          id: string
          is_active: boolean
          name: string
          provider: string | null
          system_prompt: string | null
          updated_at: string
          user_id: string
          voice_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          elevenlabs_agent_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          provider?: string | null
          system_prompt?: string | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          elevenlabs_agent_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          provider?: string | null
          system_prompt?: string | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      knowledge_documents: {
        Row: {
          content: string
          created_at: string
          file_type: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_type?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_type?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loading_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size_mb: number | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          video_path: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          video_path: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          video_path?: string
          video_url?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          total_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          total_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_price?: number
          quantity?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_city: string
          delivery_cost: number
          id: string
          notes: string | null
          order_number: string
          order_status: string
          payment_method: string
          payment_status: string
          stripe_session_id: string | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_city: string
          delivery_cost?: number
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: string
          payment_method: string
          payment_status?: string
          stripe_session_id?: string | null
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_city?: string
          delivery_cost?: number
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      phone_number_mappings: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          connected_agent_id: string | null
          created_at: string
          elevenlabs_phone_id: string | null
          id: string
          inbound_allowed_addresses: string[] | null
          inbound_allowed_numbers: string[] | null
          inbound_media_encryption: string | null
          inbound_password: string | null
          inbound_username: string | null
          is_primary: boolean | null
          label: string
          outbound_address: string | null
          outbound_headers: Json | null
          outbound_media_encryption: string | null
          outbound_password: string | null
          outbound_transport: string | null
          outbound_username: string | null
          phone_number: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_agent_id?: string | null
          created_at?: string
          elevenlabs_phone_id?: string | null
          id?: string
          inbound_allowed_addresses?: string[] | null
          inbound_allowed_numbers?: string[] | null
          inbound_media_encryption?: string | null
          inbound_password?: string | null
          inbound_username?: string | null
          is_primary?: boolean | null
          label: string
          outbound_address?: string | null
          outbound_headers?: Json | null
          outbound_media_encryption?: string | null
          outbound_password?: string | null
          outbound_transport?: string | null
          outbound_username?: string | null
          phone_number: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_agent_id?: string | null
          created_at?: string
          elevenlabs_phone_id?: string | null
          id?: string
          inbound_allowed_addresses?: string[] | null
          inbound_allowed_numbers?: string[] | null
          inbound_media_encryption?: string | null
          inbound_password?: string | null
          inbound_username?: string | null
          is_primary?: boolean | null
          label?: string
          outbound_address?: string | null
          outbound_headers?: Json | null
          outbound_media_encryption?: string | null
          outbound_password?: string | null
          outbound_transport?: string | null
          outbound_username?: string | null
          phone_number?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          image_url: string | null
          is_featured: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          created_at: string
          default_language: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          plan: string | null
          telegram_bot_token: string | null
          telegram_chat_id: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string
          default_language?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          plan?: string | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string
          default_language?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          plan?: string | null
          telegram_bot_token?: string | null
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_history: {
        Row: {
          additional_info: string | null
          agent_name: string
          agent_type: string
          company_name: string | null
          contact_number: string | null
          created_at: string
          domain: string | null
          generated_prompt: string
          id: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          additional_info?: string | null
          agent_name: string
          agent_type: string
          company_name?: string | null
          contact_number?: string | null
          created_at?: string
          domain?: string | null
          generated_prompt: string
          id?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          additional_info?: string | null
          agent_name?: string
          agent_type?: string
          company_name?: string | null
          contact_number?: string | null
          created_at?: string
          domain?: string | null
          generated_prompt?: string
          id?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      scheduled_calls: {
        Row: {
          agent_id: string | null
          call_duration_minutes: number | null
          caller_number: string | null
          client_name: string
          created_at: string
          created_via_webhook: boolean | null
          description: string | null
          id: string
          notes: string | null
          original_conversation_id: string | null
          phone_number: string
          priority: string | null
          scheduled_datetime: string
          sms_response: Json | null
          sms_sent: boolean | null
          status: string | null
          task_type: string | null
          updated_at: string
          user_id: string
          webhook_payload: Json | null
        }
        Insert: {
          agent_id?: string | null
          call_duration_minutes?: number | null
          caller_number?: string | null
          client_name: string
          created_at?: string
          created_via_webhook?: boolean | null
          description?: string | null
          id?: string
          notes?: string | null
          original_conversation_id?: string | null
          phone_number: string
          priority?: string | null
          scheduled_datetime: string
          sms_response?: Json | null
          sms_sent?: boolean | null
          status?: string | null
          task_type?: string | null
          updated_at?: string
          user_id: string
          webhook_payload?: Json | null
        }
        Update: {
          agent_id?: string | null
          call_duration_minutes?: number | null
          caller_number?: string | null
          client_name?: string
          created_at?: string
          created_via_webhook?: boolean | null
          description?: string | null
          id?: string
          notes?: string | null
          original_conversation_id?: string | null
          phone_number?: string
          priority?: string | null
          scheduled_datetime?: string
          sms_response?: Json | null
          sms_sent?: boolean | null
          status?: string | null
          task_type?: string | null
          updated_at?: string
          user_id?: string
          webhook_payload?: Json | null
        }
        Relationships: []
      }
      scraping_history: {
        Row: {
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          scraping_data: Json
          scraping_type: string | null
          status: string | null
          title: string
          total_images: number | null
          total_links: number | null
          total_products: number | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          scraping_data: Json
          scraping_type?: string | null
          status?: string | null
          title: string
          total_images?: number | null
          total_links?: number | null
          total_products?: number | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          scraping_data?: Json
          scraping_type?: string | null
          status?: string | null
          title?: string
          total_images?: number | null
          total_links?: number | null
          total_products?: number | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_offers: {
        Row: {
          contact_name: string | null
          conversation_id: string
          created_at: string
          gpt_analysis: Json | null
          id: string
          offer_content: string
          phone_number: string
          status: string
          transcript_summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_name?: string | null
          conversation_id: string
          created_at?: string
          gpt_analysis?: Json | null
          id?: string
          offer_content: string
          phone_number: string
          status?: string
          transcript_summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_name?: string | null
          conversation_id?: string
          created_at?: string
          gpt_analysis?: Json | null
          id?: string
          offer_content?: string
          phone_number?: string
          status?: string
          transcript_summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_events: {
        Row: {
          action: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_balance: {
        Row: {
          balance_usd: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_usd?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_usd?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          created_at: string
          custom_fields: Json | null
          database_id: string | null
          date_user: string
          id: string
          info: string | null
          location: string | null
          name: string
          number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          database_id?: string | null
          date_user?: string
          id?: string
          info?: string | null
          location?: string | null
          name: string
          number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          database_id?: string | null
          date_user?: string
          id?: string
          info?: string | null
          location?: string | null
          name?: string
          number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_data_columns: {
        Row: {
          column_name: string
          column_type: string
          created_at: string
          database_id: string
          display_order: number
          id: string
          is_required: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          column_name: string
          column_type?: string
          created_at?: string
          database_id: string
          display_order?: number
          id?: string
          is_required?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          column_name?: string
          column_type?: string
          created_at?: string
          database_id?: string
          display_order?: number
          id?: string
          is_required?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_data_columns_database"
            columns: ["database_id"]
            isOneToOne: false
            referencedRelation: "user_databases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_databases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
          webhook_token: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
          webhook_token?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          webhook_token?: string
        }
        Relationships: []
      }
      user_phone_mapping: {
        Row: {
          created_at: string
          id: string
          phone_number: string
          primary_number: boolean | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number: string
          primary_number?: boolean | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: string
          primary_number?: boolean | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          agents_used: number
          created_at: string
          current_spent_usd: number | null
          id: string
          max_spending_reached_at: string | null
          total_conversations: number
          total_messages: number
          total_minutes_talked: number
          total_spent_usd: number | null
          total_voice_calls: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agents_used?: number
          created_at?: string
          current_spent_usd?: number | null
          id?: string
          max_spending_reached_at?: string | null
          total_conversations?: number
          total_messages?: number
          total_minutes_talked?: number
          total_spent_usd?: number | null
          total_voice_calls?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agents_used?: number
          created_at?: string
          current_spent_usd?: number | null
          id?: string
          max_spending_reached_at?: string | null
          total_conversations?: number
          total_messages?: number
          total_minutes_talked?: number
          total_spent_usd?: number | null
          total_voice_calls?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_transcripts: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_size_mb: number | null
          id: string
          original_filename: string | null
          raw_text: string | null
          title: string
          transcript_entries: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_size_mb?: number | null
          id?: string
          original_filename?: string | null
          raw_text?: string | null
          title: string
          transcript_entries: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_size_mb?: number | null
          id?: string
          original_filename?: string | null
          raw_text?: string | null
          title?: string
          transcript_entries?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_generations: {
        Row: {
          created_at: string
          duration: number | null
          error_message: string | null
          estimated_completion: string | null
          id: string
          progress: number
          prompt: string
          resolution: string | null
          status: string
          style: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string | null
          video_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          error_message?: string | null
          estimated_completion?: string | null
          id?: string
          progress?: number
          prompt: string
          resolution?: string | null
          status?: string
          style: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
          video_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          error_message?: string | null
          estimated_completion?: string | null
          id?: string
          progress?: number
          prompt?: string
          resolution?: string | null
          status?: string
          style?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
          video_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          business_description: string | null
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          sender_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          business_description?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sender_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          business_description?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sender_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      workflow_columns: {
        Row: {
          created_at: string
          id: string
          prompt: string
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_ban_user: {
        Args: {
          p_target_user_id: string
          p_ban_status: boolean
          p_admin_user_id: string
        }
        Returns: boolean
      }
      admin_change_role: {
        Args: {
          p_target_user_id: string
          p_new_role: Database["public"]["Enums"]["app_role"]
          p_admin_user_id: string
        }
        Returns: boolean
      }
      admin_create_agent: {
        Args: {
          p_admin_user_id: string
          p_target_user_id: string
          p_name: string
          p_voice_id: string
          p_system_prompt?: string
          p_description?: string
          p_is_active?: boolean
          p_provider?: string
          p_elevenlabs_agent_id?: string
          p_agent_id?: string
        }
        Returns: {
          agent_id: string
          created_at: string
          description: string | null
          elevenlabs_agent_id: string | null
          id: string
          is_active: boolean
          name: string
          provider: string | null
          system_prompt: string | null
          updated_at: string
          user_id: string
          voice_id: string | null
        }
      }
      admin_delete_agent: {
        Args: { p_admin_user_id: string; p_agent_row_id: string }
        Returns: boolean
      }
      admin_get_all_users: {
        Args: { p_admin_user_id: string }
        Returns: {
          user_id: string
          email: string
          first_name: string
          last_name: string
          account_type: string
          user_role: Database["public"]["Enums"]["app_role"]
          balance_usd: number
          total_calls: number
          total_minutes: number
          total_spent_usd: number
          plan: string
          created_at: string
          last_sign_in: string
        }[]
      }
      admin_get_top_active_users: {
        Args: { period_hours?: number; limit_count?: number }
        Returns: {
          user_id: string
          event_count: number
          last_event_at: string
        }[]
      }
      admin_get_user_activity: {
        Args: { _user_id: string; since_hours?: number; limit_count?: number }
        Returns: {
          action: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }[]
      }
      admin_get_user_agents: {
        Args: { p_admin_user_id: string; p_target_user_id: string }
        Returns: {
          id: string
          user_id: string
          name: string
          description: string
          system_prompt: string
          voice_id: string
          is_active: boolean
          provider: string
          elevenlabs_agent_id: string
          created_at: string
          updated_at: string
          agent_id: string
        }[]
      }
      admin_get_user_by_id: {
        Args: { p_admin_user_id: string; p_target_user_id: string }
        Returns: {
          user_id: string
          email: string
          first_name: string
          last_name: string
          account_type: string
          user_role: Database["public"]["Enums"]["app_role"]
          balance_usd: number
          total_calls: number
          total_minutes: number
          total_spent_usd: number
          plan: string
          created_at: string
          last_sign_in: string
        }[]
      }
      admin_modify_balance: {
        Args: {
          p_target_user_id: string
          p_balance_amount: number
          p_operation: string
          p_admin_user_id: string
        }
        Returns: boolean
      }
      admin_update_agent: {
        Args: {
          p_admin_user_id: string
          p_agent_row_id: string
          p_name?: string
          p_voice_id?: string
          p_system_prompt?: string
          p_description?: string
          p_is_active?: boolean
          p_provider?: string
          p_elevenlabs_agent_id?: string
          p_agent_id?: string
        }
        Returns: boolean
      }
      cosine_similarity: {
        Args: { vec1: Json; vec2: Json }
        Returns: number
      }
      deduct_balance: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description?: string
          p_conversation_id?: string
        }
        Returns: boolean
      }
      execute_atomic_call_transaction: {
        Args: {
          p_user_id: string
          p_amount: number
          p_duration_seconds: number
          p_description: string
          p_conversation_id: string
        }
        Returns: boolean
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_user_id: string
          p_action: string
          p_target_user_id?: string
          p_details?: Json
          p_ip_address?: unknown
        }
        Returns: boolean
      }
      match_document_embeddings: {
        Args: {
          query_embedding: Json
          agent_id_param: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          chunk_text: string
          document_name: string
          similarity: number
        }[]
      }
      search_relevant_chunks: {
        Args: {
          query_text: string
          agent_id_param: string
          match_count?: number
        }
        Returns: {
          chunk_text: string
          document_name: string
          rank: number
        }[]
      }
      update_user_statistics_with_spending: {
        Args: {
          p_user_id: string
          p_duration_seconds: number
          p_cost_usd: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

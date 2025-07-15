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
      call_history: {
        Row: {
          agent_id: string | null
          call_date: string
          call_status: string
          contact_name: string | null
          conversation_id: string | null
          cost_usd: number | null
          created_at: string
          dialog_json: string | null
          duration_seconds: number | null
          elevenlabs_history_id: string | null
          id: string
          language: string | null
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
          contact_name?: string | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          dialog_json?: string | null
          duration_seconds?: number | null
          elevenlabs_history_id?: string | null
          id?: string
          language?: string | null
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
          contact_name?: string | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string
          dialog_json?: string | null
          duration_seconds?: number | null
          elevenlabs_history_id?: string | null
          id?: string
          language?: string | null
          phone_number?: string
          summary?: string | null
          timestamps?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
          id: string
          name: string
          price_usd: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          name: string
          price_usd: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          name?: string
          price_usd?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          conversation_id: string | null
          created_at: string
          description: string | null
          id: string
          stripe_session_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          stripe_session_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          stripe_session_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          plan: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          plan?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_calls: {
        Row: {
          agent_id: string | null
          call_duration_minutes: number | null
          client_name: string
          created_at: string
          description: string | null
          id: string
          notes: string | null
          phone_number: string
          priority: string | null
          scheduled_datetime: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          call_duration_minutes?: number | null
          client_name: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          phone_number: string
          priority?: string | null
          scheduled_datetime: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          call_duration_minutes?: number | null
          client_name?: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          phone_number?: string
          priority?: string | null
          scheduled_datetime?: string
          status?: string | null
          updated_at?: string
          user_id?: string
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
      user_credits: {
        Row: {
          created_at: string
          id: string
          remaining_credits: number | null
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          remaining_credits?: number | null
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          remaining_credits?: number | null
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          agents_used: number
          created_at: string
          id: string
          total_conversations: number
          total_messages: number
          total_minutes_talked: number
          total_voice_calls: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agents_used?: number
          created_at?: string
          id?: string
          total_conversations?: number
          total_messages?: number
          total_minutes_talked?: number
          total_voice_calls?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agents_used?: number
          created_at?: string
          id?: string
          total_conversations?: number
          total_messages?: number
          total_minutes_talked?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_stripe_session_id?: string
        }
        Returns: boolean
      }
      admin_add_credits: {
        Args: { p_user_email: string; p_amount: number; p_description?: string }
        Returns: boolean
      }
      admin_get_user_credits: {
        Args: { p_user_email: string }
        Returns: {
          user_id: string
          email: string
          total_credits: number
          used_credits: number
          remaining_credits: number
          created_at: string
        }[]
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
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description?: string
          p_conversation_id?: string
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

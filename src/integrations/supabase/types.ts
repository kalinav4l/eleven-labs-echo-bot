export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

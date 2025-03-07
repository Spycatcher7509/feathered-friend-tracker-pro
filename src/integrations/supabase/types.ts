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
      admin_group_members: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "admin_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          cost: number
          created_at: string
          endpoint: string
          id: string
          tokens_used: number
          updated_at: string
        }
        Insert: {
          cost: number
          created_at?: string
          endpoint: string
          id?: string
          tokens_used: number
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          endpoint?: string
          id?: string
          tokens_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      backup_disclaimers: {
        Row: {
          acknowledged_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backup_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          operation_type: string
          source_file_id: string | null
          time_of_day: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          operation_type?: string
          source_file_id?: string | null
          time_of_day: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          operation_type?: string
          source_file_id?: string | null
          time_of_day?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      backups: {
        Row: {
          created_at: string
          created_by: string | null
          drive_file_id: string | null
          filename: string
          id: string
          size_bytes: number | null
          total_cost: number | null
          total_tokens: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          drive_file_id?: string | null
          filename: string
          id?: string
          size_bytes?: number | null
          total_cost?: number | null
          total_tokens?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          drive_file_id?: string | null
          filename?: string
          id?: string
          size_bytes?: number | null
          total_cost?: number | null
          total_tokens?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bird_audio_recordings: {
        Row: {
          bird_sighting_id: string | null
          created_at: string
          duration: number | null
          id: string
          recording_url: string
          updated_at: string
        }
        Insert: {
          bird_sighting_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          recording_url: string
          updated_at?: string
        }
        Update: {
          bird_sighting_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          recording_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bird_audio_recordings_bird_sighting_id_fkey"
            columns: ["bird_sighting_id"]
            isOneToOne: false
            referencedRelation: "bird_sightings"
            referencedColumns: ["id"]
          },
        ]
      }
      bird_sightings: {
        Row: {
          bird_name: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          media_type: string | null
          media_url: string | null
          search_text: unknown | null
          sighting_date: string
          sound_url: string | null
          species_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bird_name: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          media_type?: string | null
          media_url?: string | null
          search_text?: unknown | null
          sighting_date?: string
          sound_url?: string | null
          species_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bird_name?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          media_type?: string | null
          media_url?: string | null
          search_text?: unknown | null
          sighting_date?: string
          sound_url?: string | null
          species_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bird_sightings_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "bird_species"
            referencedColumns: ["id"]
          },
        ]
      }
      bird_species: {
        Row: {
          conservation_status: string | null
          created_at: string
          description: string | null
          habitat: string | null
          id: string
          image_url: string | null
          name: string
          scientific_name: string | null
          seasonal_patterns: string | null
          size_range: string | null
          updated_at: string
        }
        Insert: {
          conservation_status?: string | null
          created_at?: string
          description?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          name: string
          scientific_name?: string | null
          seasonal_patterns?: string | null
          size_range?: string | null
          updated_at?: string
        }
        Update: {
          conservation_status?: string | null
          created_at?: string
          description?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          name?: string
          scientific_name?: string | null
          seasonal_patterns?: string | null
          size_range?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bird_trends: {
        Row: {
          bird_category: string | null
          created_at: string
          id: string
          long_term_annual_change: number | null
          long_term_percentage_change: number | null
          long_term_trend: Database["public"]["Enums"]["trend_category"] | null
          short_term_annual_change: number | null
          short_term_percentage_change: number | null
          short_term_trend: Database["public"]["Enums"]["trend_category"] | null
          species_name: string
          updated_at: string
        }
        Insert: {
          bird_category?: string | null
          created_at?: string
          id?: string
          long_term_annual_change?: number | null
          long_term_percentage_change?: number | null
          long_term_trend?: Database["public"]["Enums"]["trend_category"] | null
          short_term_annual_change?: number | null
          short_term_percentage_change?: number | null
          short_term_trend?:
            | Database["public"]["Enums"]["trend_category"]
            | null
          species_name: string
          updated_at?: string
        }
        Update: {
          bird_category?: string | null
          created_at?: string
          id?: string
          long_term_annual_change?: number | null
          long_term_percentage_change?: number | null
          long_term_trend?: Database["public"]["Enums"]["trend_category"] | null
          short_term_annual_change?: number | null
          short_term_percentage_change?: number | null
          short_term_trend?:
            | Database["public"]["Enums"]["trend_category"]
            | null
          species_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_metadata: {
        Row: {
          attachments: Json | null
          contact_time: string | null
          conversation_id: string
          created_at: string | null
          description: string
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          contact_time?: string | null
          conversation_id: string
          created_at?: string | null
          description: string
          email: string
          full_name: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          contact_time?: string | null
          conversation_id?: string
          created_at?: string | null
          description?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_metadata_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_backup_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: Database["public"]["Enums"]["backup_frequency"]
          id: string
          is_active: boolean | null
          operation_type: string
          source_file_id: string | null
          time_of_day: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: Database["public"]["Enums"]["backup_frequency"]
          id?: string
          is_active?: boolean | null
          operation_type?: string
          source_file_id?: string | null
          time_of_day: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: Database["public"]["Enums"]["backup_frequency"]
          id?: string
          is_active?: boolean | null
          operation_type?: string
          source_file_id?: string | null
          time_of_day?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      discord_webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempted_count: number | null
          attempts: number | null
          bounce_info: Json | null
          bounce_reason: string | null
          bounce_type: string | null
          created_at: string | null
          delivery_status: string | null
          error_message: string | null
          html_content: string | null
          id: string
          sent_at: string | null
          status: string
          subject: string
          text_content: string
          to_email: string
          updated_at: string | null
        }
        Insert: {
          attempted_count?: number | null
          attempts?: number | null
          bounce_info?: Json | null
          bounce_reason?: string | null
          bounce_type?: string | null
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          html_content?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject: string
          text_content: string
          to_email: string
          updated_at?: string | null
        }
        Update: {
          attempted_count?: number | null
          attempts?: number | null
          bounce_info?: Json | null
          bounce_reason?: string | null
          bounce_type?: string | null
          created_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          html_content?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          text_content?: string
          to_email?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      external_bird_sounds: {
        Row: {
          bird_name: string
          created_at: string
          id: string
          sound_url: string
          source: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bird_name: string
          created_at?: string
          id?: string
          sound_url: string
          source: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bird_name?: string
          created_at?: string
          id?: string
          sound_url?: string
          source?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gmail_service_account: {
        Row: {
          client_email: string
          created_at: string
          id: string
          private_key: string
          updated_at: string
        }
        Insert: {
          client_email: string
          created_at?: string
          id?: string
          private_key: string
          updated_at?: string
        }
        Update: {
          client_email?: string
          created_at?: string
          id?: string
          private_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_drive_config: {
        Row: {
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      google_drive_service_account: {
        Row: {
          client_email: string
          created_at: string
          id: string
          private_key: string
          updated_at: string
        }
        Insert: {
          client_email: string
          created_at?: string
          id?: string
          private_key: string
          updated_at?: string
        }
        Update: {
          client_email?: string
          created_at?: string
          id?: string
          private_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sort_order: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      issues: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_system_message: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          experience_level: string | null
          id: string
          is_admin: boolean | null
          location: string | null
          logged_on: string | null
          notification_preferences: Json | null
          preferred_birds: string[] | null
          privacy_settings: Json | null
          social_media: Json | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          id: string
          is_admin?: boolean | null
          location?: string | null
          logged_on?: string | null
          notification_preferences?: Json | null
          preferred_birds?: string[] | null
          privacy_settings?: Json | null
          social_media?: Json | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          id?: string
          is_admin?: boolean | null
          location?: string | null
          logged_on?: string | null
          notification_preferences?: Json | null
          preferred_birds?: string[] | null
          privacy_settings?: Json | null
          social_media?: Json | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      support_team_config: {
        Row: {
          created_at: string
          id: string
          support_email: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          support_email: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          support_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_disclaimers: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          user_id: string
        }
        Insert: {
          accepted: boolean
          accepted_at?: string | null
          user_id: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      format_pem_key: {
        Args: {
          raw_key: string
        }
        Returns: string
      }
      get_daily_email_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_user_in_admin_group: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      schedule_backup: {
        Args: {
          p_frequency: string
          p_time_of_day: string
          p_day_of_week?: number
          p_day_of_month?: number
        }
        Returns: undefined
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      trigger_backup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      backup_frequency: "daily" | "weekly" | "monthly"
      trend_category:
        | "strong decline"
        | "weak decline"
        | "no change"
        | "weak increase"
        | "strong increase"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

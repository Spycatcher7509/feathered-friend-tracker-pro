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
      backup_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          time_of_day: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          time_of_day: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          time_of_day?: string
          updated_at?: string
        }
        Relationships: []
      }
      backups: {
        Row: {
          created_at: string
          created_by: string | null
          drive_file_id: string
          filename: string
          id: string
          size_bytes: number | null
          total_cost: number | null
          total_tokens: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          drive_file_id: string
          filename: string
          id?: string
          size_bytes?: number | null
          total_cost?: number | null
          total_tokens?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          drive_file_id?: string
          filename?: string
          id?: string
          size_bytes?: number | null
          total_cost?: number | null
          total_tokens?: number | null
          updated_at?: string
        }
        Relationships: []
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
          sighting_date: string
          sound_url: string | null
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
          sighting_date?: string
          sound_url?: string | null
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
          sighting_date?: string
          sound_url?: string | null
          updated_at?: string
          user_id?: string
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
      custom_backup_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: Database["public"]["Enums"]["backup_frequency"]
          id: string
          is_active: boolean | null
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
      external_bird_sounds: {
        Row: {
          bird_name: string
          created_at: string
          id: string
          sound_url: string
          source: string
          updated_at: string
        }
        Insert: {
          bird_name: string
          created_at?: string
          id?: string
          sound_url: string
          source: string
          updated_at?: string
        }
        Update: {
          bird_name?: string
          created_at?: string
          id?: string
          sound_url?: string
          source?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          experience_level: string | null
          id: string
          is_admin: boolean | null
          location: string | null
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
          experience_level?: string | null
          id: string
          is_admin?: boolean | null
          location?: string | null
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
          experience_level?: string | null
          id?: string
          is_admin?: boolean | null
          location?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_user_in_admin_group: {
        Args: {
          user_id: string
        }
        Returns: boolean
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

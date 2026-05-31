export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          activities: string | null
          conflict_type: Database["public"]["Enums"]["conflict_type"]
          date: string
          id: string
          location: string | null
          notes: string | null
          phase: string | null
          plan_id: string
        }
        Insert: {
          activities?: string | null
          conflict_type?: Database["public"]["Enums"]["conflict_type"]
          date: string
          id?: string
          location?: string | null
          notes?: string | null
          phase?: string | null
          plan_id: string
        }
        Update: {
          activities?: string | null
          conflict_type?: Database["public"]["Enums"]["conflict_type"]
          date?: string
          id?: string
          location?: string | null
          notes?: string | null
          phase?: string | null
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "calendar_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_plans: {
        Row: {
          created_at: string
          id: string
          source_file_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_file_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_file_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_athlete_relationships: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["relationship_status"]
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["relationship_status"]
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["relationship_status"]
        }
        Relationships: [
          {
            foreignKeyName: "coach_athlete_relationships_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_athlete_relationships_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          workout_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          workout_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          relationship_id: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_id?: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          relationship_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "coach_athlete_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_cheers: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_cheers_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_cheers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_media: {
        Row: {
          created_at: string
          file_url: string
          id: string
          media_type: Database["public"]["Enums"]["feed_media_type"]
          post_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          media_type?: Database["public"]["Enums"]["feed_media_type"]
          post_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          media_type?: Database["public"]["Enums"]["feed_media_type"]
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          linked_workout_id: string | null
          post_type: Database["public"]["Enums"]["feed_post_type"]
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          linked_workout_id?: string | null
          post_type?: Database["public"]["Enums"]["feed_post_type"]
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          linked_workout_id?: string | null
          post_type?: Database["public"]["Enums"]["feed_post_type"]
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_linked_workout_id_fkey"
            columns: ["linked_workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      message_media: {
        Row: {
          created_at: string
          file_url: string
          id: string
          media_type: Database["public"]["Enums"]["message_media_type"]
          message_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          media_type?: Database["public"]["Enums"]["message_media_type"]
          message_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          media_type?: Database["public"]["Enums"]["message_media_type"]
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_media_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string | null
          sender_type: Database["public"]["Enums"]["message_sender_type"]
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          goal_date: string | null
          goal_race: string | null
          goal_time: string | null
          id: string
          source_file_url: string | null
          title: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          goal_date?: string | null
          goal_race?: string | null
          goal_time?: string | null
          id?: string
          source_file_url?: string | null
          title: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          goal_date?: string | null
          goal_race?: string | null
          goal_time?: string | null
          id?: string
          source_file_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_weeks: {
        Row: {
          date_end: string
          date_start: string
          focus: string | null
          id: string
          notes: string | null
          plan_id: string
          week_number: number
        }
        Insert: {
          date_end: string
          date_start: string
          focus?: string | null
          id?: string
          notes?: string | null
          plan_id: string
          week_number: number
        }
        Update: {
          date_end?: string
          date_start?: string
          focus?: string | null
          id?: string
          notes?: string | null
          plan_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_media: {
        Row: {
          ai_analysis: Json | null
          created_at: string
          file_url: string
          id: string
          media_type: Database["public"]["Enums"]["workout_media_type"]
          uploaded_by: string
          workout_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string
          file_url: string
          id?: string
          media_type?: Database["public"]["Enums"]["workout_media_type"]
          uploaded_by: string
          workout_id: string
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string
          file_url?: string
          id?: string
          media_type?: Database["public"]["Enums"]["workout_media_type"]
          uploaded_by?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_media_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          avg_hr: number | null
          created_at: string
          date: string
          day_of_week: string
          id: string
          log: string | null
          miles: number | null
          perceived_effort: number | null
          prescribed_workout: string
          status: Database["public"]["Enums"]["workout_status"]
          strava_activity_id: string | null
          strength_misc: string | null
          week_id: string
        }
        Insert: {
          avg_hr?: number | null
          created_at?: string
          date: string
          day_of_week: string
          id?: string
          log?: string | null
          miles?: number | null
          perceived_effort?: number | null
          prescribed_workout: string
          status?: Database["public"]["Enums"]["workout_status"]
          strava_activity_id?: string | null
          strength_misc?: string | null
          week_id: string
        }
        Update: {
          avg_hr?: number | null
          created_at?: string
          date?: string
          day_of_week?: string
          id?: string
          log?: string | null
          miles?: number | null
          perceived_effort?: number | null
          prescribed_workout?: string
          status?: Database["public"]["Enums"]["workout_status"]
          strava_activity_id?: string | null
          strength_misc?: string | null
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "training_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conflict_type: "travel" | "hiking" | "rest" | "none"
      conversation_type: "coach_athlete" | "ai_agent"
      feed_media_type: "image" | "video"
      feed_post_type: "achievement" | "milestone" | "general"
      message_media_type: "image" | "screenshot" | "file"
      message_sender_type: "user" | "ai"
      relationship_status: "pending" | "active" | "archived"
      user_role: "runner" | "coach"
      workout_media_type: "screenshot" | "photo" | "document"
      workout_status: "upcoming" | "completed" | "missed" | "modified"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      conflict_type: ["travel", "hiking", "rest", "none"],
      conversation_type: ["coach_athlete", "ai_agent"],
      feed_media_type: ["image", "video"],
      feed_post_type: ["achievement", "milestone", "general"],
      message_media_type: ["image", "screenshot", "file"],
      message_sender_type: ["user", "ai"],
      relationship_status: ["pending", "active", "archived"],
      user_role: ["runner", "coach"],
      workout_media_type: ["screenshot", "photo", "document"],
      workout_status: ["upcoming", "completed", "missed", "modified"],
    },
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academies: {
        Row: {
          address: Json | null
          created_at: string
          email: string | null
          geofence_radius_m: number | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string
          phone: string | null
          settings: Json
          slug: string
          status: string
          stripe_customer_id: string | null
          theme: Json | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          email?: string | null
          geofence_radius_m?: number | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          phone?: string | null
          settings?: Json
          slug: string
          status?: string
          stripe_customer_id?: string | null
          theme?: Json | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          email?: string | null
          geofence_radius_m?: number | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          phone?: string | null
          settings?: Json
          slug?: string
          status?: string
          stripe_customer_id?: string | null
          theme?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string | null
          id: string
          key: string
          name: string
          points: number
          threshold: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          key: string
          name: string
          points?: number
          threshold?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          key?: string
          name?: string
          points?: number
          threshold?: number
        }
        Relationships: []
      }
      ai_adaptive_tests: {
        Row: {
          academy_id: string
          completed_at: string | null
          config: Json
          created_at: string
          id: string
          membership_id: string
          status: string
          test_data: Json
        }
        Insert: {
          academy_id: string
          completed_at?: string | null
          config: Json
          created_at?: string
          id?: string
          membership_id: string
          status?: string
          test_data: Json
        }
        Update: {
          academy_id?: string
          completed_at?: string | null
          config?: Json
          created_at?: string
          id?: string
          membership_id?: string
          status?: string
          test_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_adaptive_tests_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_adaptive_tests_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_adaptive_tests_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_churn_labels: {
        Row: {
          academy_id: string
          churn_reason: string | null
          churned: boolean
          churned_at: string | null
          created_at: string
          feature_snapshot: Json | null
          id: string
          label_source: string
          membership_id: string
          predicted_score: number | null
          prediction_snapshot: Json | null
        }
        Insert: {
          academy_id: string
          churn_reason?: string | null
          churned?: boolean
          churned_at?: string | null
          created_at?: string
          feature_snapshot?: Json | null
          id?: string
          label_source?: string
          membership_id: string
          predicted_score?: number | null
          prediction_snapshot?: Json | null
        }
        Update: {
          academy_id?: string
          churn_reason?: string | null
          churned?: boolean
          churned_at?: string | null
          created_at?: string
          feature_snapshot?: Json | null
          id?: string
          label_source?: string
          membership_id?: string
          predicted_score?: number | null
          prediction_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_churn_labels_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_churn_labels_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_churn_labels_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_engagement_snapshots: {
        Row: {
          academy_id: string
          digital: number | null
          financial: number | null
          id: string
          membership_id: string
          overall_score: number
          pedagogical: number | null
          physical: number | null
          snapshot_date: string
          social_score: number | null
          tier: string
        }
        Insert: {
          academy_id: string
          digital?: number | null
          financial?: number | null
          id?: string
          membership_id: string
          overall_score: number
          pedagogical?: number | null
          physical?: number | null
          snapshot_date?: string
          social_score?: number | null
          tier: string
        }
        Update: {
          academy_id?: string
          digital?: number | null
          financial?: number | null
          id?: string
          membership_id?: string
          overall_score?: number
          pedagogical?: number | null
          physical?: number | null
          snapshot_date?: string
          social_score?: number | null
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_engagement_snapshots_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_engagement_snapshots_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_engagement_snapshots_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_instructor_briefings: {
        Row: {
          academy_id: string
          briefing: Json
          confidence: number
          created_at: string
          date: string
          id: string
          instructor_id: string
        }
        Insert: {
          academy_id: string
          briefing: Json
          confidence: number
          created_at?: string
          date?: string
          id?: string
          instructor_id: string
        }
        Update: {
          academy_id?: string
          briefing?: Json
          confidence?: number
          created_at?: string
          date?: string
          id?: string
          instructor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_instructor_briefings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_instructor_briefings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_instructor_briefings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_question_bank: {
        Row: {
          academy_id: string
          active: boolean
          belt_level: string
          competency: string
          created_at: string
          difficulty: number
          discrimination: number
          id: string
          question_data: Json
          segment: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          belt_level: string
          competency: string
          created_at?: string
          difficulty: number
          discrimination: number
          id?: string
          question_data: Json
          segment: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          belt_level?: string
          competency?: string
          created_at?: string
          difficulty?: number
          discrimination?: number
          id?: string
          question_data?: Json
          segment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_question_bank_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_social_connections: {
        Row: {
          academy_id: string
          id: string
          last_trained_together: string | null
          member_a: string
          member_b: string
          shared_classes: number
          shared_sessions: number
          strength: number
          updated_at: string | null
        }
        Insert: {
          academy_id: string
          id?: string
          last_trained_together?: string | null
          member_a: string
          member_b: string
          shared_classes?: number
          shared_sessions?: number
          strength?: number
          updated_at?: string | null
        }
        Update: {
          academy_id?: string
          id?: string
          last_trained_together?: string | null
          member_a?: string
          member_b?: string
          shared_classes?: number
          shared_sessions?: number
          strength?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_social_connections_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_social_connections_member_a_fkey"
            columns: ["member_a"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_social_connections_member_a_fkey"
            columns: ["member_a"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_social_connections_member_b_fkey"
            columns: ["member_b"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_social_connections_member_b_fkey"
            columns: ["member_b"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_student_dna_cache: {
        Row: {
          academy_id: string
          computed_at: string
          confidence: number
          data_points: number
          dna: Json
          expires_at: string
          id: string
          membership_id: string
        }
        Insert: {
          academy_id: string
          computed_at?: string
          confidence: number
          data_points: number
          dna: Json
          expires_at?: string
          id?: string
          membership_id: string
        }
        Update: {
          academy_id?: string
          computed_at?: string
          confidence?: number
          data_points?: number
          dna?: Json
          expires_at?: string
          id?: string
          membership_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_student_dna_cache_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_student_dna_cache_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_student_dna_cache_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_test_responses: {
        Row: {
          academy_id: string
          correct: boolean
          created_at: string
          id: string
          membership_id: string
          question_id: string
          response: Json
          response_time_ms: number | null
          test_id: string
        }
        Insert: {
          academy_id: string
          correct: boolean
          created_at?: string
          id?: string
          membership_id: string
          question_id: string
          response: Json
          response_time_ms?: number | null
          test_id: string
        }
        Update: {
          academy_id?: string
          correct?: boolean
          created_at?: string
          id?: string
          membership_id?: string
          question_id?: string
          response?: Json
          response_time_ms?: number | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_test_responses_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_test_responses_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "ai_test_responses_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_test_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "ai_question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_test_responses_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ai_adaptive_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      attendances: {
        Row: {
          academy_id: string
          checked_in_at: string
          checked_in_by: string | null
          checkin_method: Database["public"]["Enums"]["checkin_method"]
          id: string
          membership_id: string
          notes: string | null
          session_id: string
        }
        Insert: {
          academy_id: string
          checked_in_at?: string
          checked_in_by?: string | null
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          id?: string
          membership_id: string
          notes?: string | null
          session_id: string
        }
        Update: {
          academy_id?: string
          checked_in_at?: string
          checked_in_by?: string | null
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          id?: string
          membership_id?: string
          notes?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "attendances_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "attendances_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          academy_id: string | null
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      belt_systems: {
        Row: {
          created_at: string
          id: string
          martial_art: Database["public"]["Enums"]["martial_art"]
          name: string
          ranks: Json
        }
        Insert: {
          created_at?: string
          id?: string
          martial_art: Database["public"]["Enums"]["martial_art"]
          name: string
          ranks: Json
        }
        Update: {
          created_at?: string
          id?: string
          martial_art?: Database["public"]["Enums"]["martial_art"]
          name?: string
          ranks?: Json
        }
        Relationships: []
      }
      billing_usage: {
        Row: {
          academy_id: string
          id: string
          metric: string
          period_end: string
          period_start: string
          quantity: number
        }
        Insert: {
          academy_id: string
          id?: string
          metric: string
          period_end: string
          period_start: string
          quantity?: number
        }
        Update: {
          academy_id?: string
          id?: string
          metric?: string
          period_end?: string
          period_start?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_usage_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          academy_id: string
          body: string
          channel: string
          created_at: string
          id: string
          schedule_id: string | null
          sender_id: string
          sent_at: string | null
          target_audience: string
          target_filter: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          body: string
          channel?: string
          created_at?: string
          id?: string
          schedule_id?: string | null
          sender_id: string
          sent_at?: string | null
          target_audience?: string
          target_filter?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          body?: string
          channel?: string
          created_at?: string
          id?: string
          schedule_id?: string | null
          sender_id?: string
          sent_at?: string | null
          target_audience?: string
          target_filter?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          enrolled_at: string
          id: string
          membership_id: string
          schedule_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
        }
        Insert: {
          enrolled_at?: string
          id?: string
          membership_id: string
          schedule_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
        }
        Update: {
          enrolled_at?: string
          id?: string
          membership_id?: string
          schedule_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "class_enrollments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          academy_id: string
          active: boolean
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          instructor_id: string
          level: Database["public"]["Enums"]["class_level"]
          location: string | null
          martial_art: Database["public"]["Enums"]["martial_art"]
          max_capacity: number
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          instructor_id: string
          level?: Database["public"]["Enums"]["class_level"]
          location?: string | null
          martial_art: Database["public"]["Enums"]["martial_art"]
          max_capacity?: number
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          instructor_id?: string
          level?: Database["public"]["Enums"]["class_level"]
          location?: string | null
          martial_art?: Database["public"]["Enums"]["martial_art"]
          max_capacity?: number
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedules_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "class_schedules_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          academy_id: string
          created_at: string
          date: string
          id: string
          instructor_id: string
          notes: string | null
          schedule_id: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          date: string
          id?: string
          instructor_id: string
          notes?: string | null
          schedule_id: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          date?: string
          id?: string
          instructor_id?: string
          notes?: string | null
          schedule_id?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "class_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          academy_id: string
          belt_level: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_secs: number | null
          id: string
          martial_art: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
          visibility: string
        }
        Insert: {
          academy_id: string
          belt_level?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_secs?: number | null
          id?: string
          martial_art?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type?: string
          updated_at?: string
          url?: string | null
          visibility?: string
        }
        Update: {
          academy_id?: string
          belt_level?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_secs?: number | null
          id?: string
          martial_art?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          profile_id: string
          role: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          profile_id: string
          role?: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_feedback: {
        Row: {
          academy_id: string
          comment: string | null
          created_at: string
          difficulty: number | null
          energy: number | null
          id: string
          membership_id: string
          mood: number | null
          session_id: string | null
        }
        Insert: {
          academy_id: string
          comment?: string | null
          created_at?: string
          difficulty?: number | null
          energy?: number | null
          id?: string
          membership_id: string
          mood?: number | null
          session_id?: string | null
        }
        Update: {
          academy_id?: string
          comment?: string | null
          created_at?: string
          difficulty?: number | null
          energy?: number | null
          id?: string
          membership_id?: string
          mood?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_feedback_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_feedback_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "daily_feedback_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          id: string
          profile_id: string
          reason: string | null
          requested_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          profile_id: string
          reason?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          profile_id?: string
          reason?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          file_url: string | null
          id: string
          profile_id: string
          requested_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          file_url?: string | null
          id?: string
          profile_id: string
          requested_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          file_url?: string | null
          id?: string
          profile_id?: string
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          causation_id: string | null
          correlation_id: string | null
          event_type: string
          id: string
          idempotency_key: string | null
          metadata: Json | null
          occurred_at: string
          payload: Json
          version: number
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          causation_id?: string | null
          correlation_id?: string | null
          event_type: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          occurred_at?: string
          payload: Json
          version: number
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          causation_id?: string | null
          correlation_id?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          occurred_at?: string
          payload?: Json
          version?: number
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          academy_id: string
          created_at: string
          evaluated_at: string | null
          evaluator_id: string
          id: string
          notes: string | null
          score: Json | null
          status: string
          student_membership_id: string
          type: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          evaluated_at?: string | null
          evaluator_id: string
          id?: string
          notes?: string | null
          score?: Json | null
          status?: string
          student_membership_id: string
          type: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          evaluated_at?: string | null
          evaluator_id?: string
          id?: string
          notes?: string | null
          score?: Json | null
          status?: string
          student_membership_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_membership_id_fkey"
            columns: ["student_membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "evaluations_student_membership_id_fkey"
            columns: ["student_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      event_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          last_event_id: string | null
          last_processed: string | null
          subscriber_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          last_event_id?: string | null
          last_processed?: string | null
          subscriber_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          last_event_id?: string | null
          last_processed?: string | null
          subscriber_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_subscriptions_last_event_id_fkey"
            columns: ["last_event_id"]
            isOneToOne: false
            referencedRelation: "domain_events"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled_for_academies: string[] | null
          enabled_for_roles: string[] | null
          enabled_globally: boolean | null
          enabled_percentage: number | null
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled_for_academies?: string[] | null
          enabled_for_roles?: string[] | null
          enabled_globally?: boolean | null
          enabled_percentage?: number | null
          id: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled_for_academies?: string[] | null
          enabled_for_roles?: string[] | null
          enabled_globally?: boolean | null
          enabled_percentage?: number | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      federation_admins: {
        Row: {
          federation_id: string | null
          id: string
          profile_id: string | null
          role: string | null
        }
        Insert: {
          federation_id?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
        }
        Update: {
          federation_id?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "federation_admins_federation_id_fkey"
            columns: ["federation_id"]
            isOneToOne: false
            referencedRelation: "federations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "federation_admins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      federation_memberships: {
        Row: {
          academy_id: string | null
          federation_id: string | null
          id: string
          joined_at: string | null
          role: string | null
        }
        Insert: {
          academy_id?: string | null
          federation_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
        }
        Update: {
          academy_id?: string | null
          federation_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "federation_memberships_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "federation_memberships_federation_id_fkey"
            columns: ["federation_id"]
            isOneToOne: false
            referencedRelation: "federations"
            referencedColumns: ["id"]
          },
        ]
      }
      federations: {
        Row: {
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          academy_id: string
          amount_cents: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string
        }
        Insert: {
          academy_id: string
          amount_cents: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id: string
        }
        Update: {
          academy_id?: string
          amount_cents?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          academy_id: string
          assigned_to: string | null
          created_at: string
          email: string | null
          id: string
          interest: string | null
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          visitor_id: string | null
        }
        Insert: {
          academy_id: string
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Update: {
          academy_id?: string
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          academy_id: string
          cool_down: Json | null
          created_at: string
          description: string | null
          id: string
          main_content: Json | null
          notes: string | null
          objectives: string[] | null
          planned_date: string | null
          professor_id: string
          schedule_id: string | null
          title: string
          updated_at: string
          warm_up: Json | null
        }
        Insert: {
          academy_id: string
          cool_down?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          main_content?: Json | null
          notes?: string | null
          objectives?: string[] | null
          planned_date?: string | null
          professor_id: string
          schedule_id?: string | null
          title: string
          updated_at?: string
          warm_up?: Json | null
        }
        Update: {
          academy_id?: string
          cool_down?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          main_content?: Json | null
          notes?: string | null
          objectives?: string[] | null
          planned_date?: string | null
          professor_id?: string
          schedule_id?: string | null
          title?: string
          updated_at?: string
          warm_up?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "class_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_consent_log: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          ip_address: unknown
          profile_id: string
          user_agent: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          ip_address?: unknown
          profile_id: string
          user_agent?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_address?: unknown
          profile_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_consent_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_achievements: {
        Row: {
          achievement_id: string
          id: string
          membership_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          id?: string
          membership_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          id?: string
          membership_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_achievements_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "member_achievements_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          academy_id: string
          belt_rank: string | null
          created_at: string
          id: string
          joined_at: string
          profile_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          belt_rank?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          profile_id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          belt_rank?: string | null
          created_at?: string
          id?: string
          joined_at?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          media_url: string | null
          message_type: string
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          sender_id?: string
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
      milestones: {
        Row: {
          academy_id: string
          achieved_at: string
          description: string | null
          id: string
          membership_id: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["milestone_type"]
        }
        Insert: {
          academy_id: string
          achieved_at?: string
          description?: string | null
          id?: string
          membership_id: string
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["milestone_type"]
        }
        Update: {
          academy_id?: string
          achieved_at?: string
          description?: string | null
          id?: string
          membership_id?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["milestone_type"]
        }
        Relationships: [
          {
            foreignKeyName: "milestones_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "milestones_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          disabled_types: string[] | null
          email_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          disabled_types?: string[] | null
          email_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          disabled_types?: string[] | null
          email_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          academy_id: string | null
          body: string
          created_at: string
          data: Json | null
          id: string
          profile_id: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          academy_id?: string | null
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          profile_id: string
          read?: boolean
          title: string
          type?: string
        }
        Update: {
          academy_id?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          profile_id?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          academy_id: string
          completed_at: string | null
          created_at: string | null
          steps_completed: string[] | null
        }
        Insert: {
          academy_id: string
          completed_at?: string | null
          created_at?: string | null
          steps_completed?: string[] | null
        }
        Update: {
          academy_id?: string
          completed_at?: string | null
          created_at?: string | null
          steps_completed?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_links: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
          relationship: Database["public"]["Enums"]["relationship_type"]
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
          relationship?: Database["public"]["Enums"]["relationship_type"]
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          relationship?: Database["public"]["Enums"]["relationship_type"]
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_links_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          academy_id: string
          amount_cents: number
          created_at: string
          external_id: string | null
          id: string
          invoice_id: string
          method: string
          paid_at: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          academy_id: string
          amount_cents: number
          created_at?: string
          external_id?: string | null
          id?: string
          invoice_id: string
          method: string
          paid_at?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          academy_id?: string
          amount_cents?: number
          created_at?: string
          external_id?: string | null
          id?: string
          invoice_id?: string
          method?: string
          paid_at?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_products: {
        Row: {
          academy_id: string
          active: boolean
          category: string | null
          created_at: string
          id: string
          name: string
          price_cents: number
          sku: string | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          category?: string | null
          created_at?: string
          id?: string
          name: string
          price_cents: number
          sku?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          price_cents?: number
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_products_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_sales: {
        Row: {
          academy_id: string
          created_at: string
          customer_id: string | null
          id: string
          items: Json
          notes: string | null
          payment_method: string
          seller_id: string
          sold_at: string
          total_cents: number
        }
        Insert: {
          academy_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method: string
          seller_id: string
          sold_at?: string
          total_cents: number
        }
        Update: {
          academy_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string
          seller_id?: string
          sold_at?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdv_sales_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          academy_id: string
          active: boolean
          created_at: string
          description: string | null
          features: Json | null
          id: string
          interval_months: number
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_months?: number
          name: string
          price_cents: number
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_months?: number
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          added_at: string
          content_id: string
          id: string
          playlist_id: string
          sort_order: number
        }
        Insert: {
          added_at?: string
          content_id: string
          id?: string
          playlist_id: string
          sort_order?: number
        }
        Update: {
          added_at?: string
          content_id?: string
          id?: string
          playlist_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          academy_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          membership_id: string
          points: number
          reason: string
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          membership_id: string
          points: number
          reason: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          membership_id?: string
          points?: number
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "points_ledger_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          cpf_hash: string | null
          created_at: string
          display_name: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_locale: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf_hash?: string | null
          created_at?: string
          display_name?: string | null
          full_name: string
          id: string
          phone?: string | null
          preferred_locale?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf_hash?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_locale?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          academy_id: string
          belt_system_id: string
          created_at: string
          from_rank: string | null
          id: string
          membership_id: string
          notes: string | null
          promoted_at: string
          promoted_by: string
          to_rank: string
        }
        Insert: {
          academy_id: string
          belt_system_id: string
          created_at?: string
          from_rank?: string | null
          id?: string
          membership_id: string
          notes?: string | null
          promoted_at?: string
          promoted_by: string
          to_rank: string
        }
        Update: {
          academy_id?: string
          belt_system_id?: string
          created_at?: string
          from_rank?: string | null
          id?: string
          membership_id?: string
          notes?: string | null
          promoted_at?: string
          promoted_by?: string
          to_rank?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_belt_system_id_fkey"
            columns: ["belt_system_id"]
            isOneToOne: false
            referencedRelation: "belt_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "promotions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "promotions_promoted_by_fkey"
            columns: ["promoted_by"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          active: boolean | null
          created_at: string | null
          device_name: string | null
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          device_name?: string | null
          id?: string
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          device_name?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_log: {
        Row: {
          count: number
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          window_start: string
        }
        Update: {
          count?: number
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          window_start?: string
        }
        Relationships: []
      }
      request_logs: {
        Row: {
          academy_id: string | null
          created_at: string
          duration_ms: number | null
          id: string
          ip_hash: string | null
          method: string
          path: string
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_hash?: string | null
          method: string
          path: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_hash?: string | null
          method?: string
          path?: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      request_logs_2026_03: {
        Row: {
          academy_id: string | null
          created_at: string
          duration_ms: number | null
          id: string
          ip_hash: string | null
          method: string
          path: string
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_hash?: string | null
          method: string
          path: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_hash?: string | null
          method?: string
          path?: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      request_logs_2026_04: {
        Row: {
          academy_id: string | null
          created_at: string
          duration_ms: number | null
          id: string
          ip_hash: string | null
          method: string
          path: string
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_hash?: string | null
          method: string
          path: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          ip_hash?: string | null
          method?: string
          path?: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rm_academy_stats: {
        Row: {
          academy_id: string
          active_members: number | null
          avg_attendance_pct: number | null
          churn_risk_high_count: number | null
          last_computed_at: string | null
          revenue_30d_cents: number | null
          total_checkins_30d: number | null
          total_members: number | null
        }
        Insert: {
          academy_id: string
          active_members?: number | null
          avg_attendance_pct?: number | null
          churn_risk_high_count?: number | null
          last_computed_at?: string | null
          revenue_30d_cents?: number | null
          total_checkins_30d?: number | null
          total_members?: number | null
        }
        Update: {
          academy_id?: string
          active_members?: number | null
          avg_attendance_pct?: number | null
          churn_risk_high_count?: number | null
          last_computed_at?: string | null
          revenue_30d_cents?: number | null
          total_checkins_30d?: number | null
          total_members?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rm_academy_stats_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: true
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      rm_athlete_profile: {
        Row: {
          academy_id: string
          display_data: Json
          last_computed_at: string | null
          membership_id: string
          ml_scores: Json | null
          stats: Json
        }
        Insert: {
          academy_id: string
          display_data?: Json
          last_computed_at?: string | null
          membership_id: string
          ml_scores?: Json | null
          stats?: Json
        }
        Update: {
          academy_id?: string
          display_data?: Json
          last_computed_at?: string | null
          membership_id?: string
          ml_scores?: Json | null
          stats?: Json
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          items: Json
          notes: string | null
          profile_id: string
          status: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          items?: Json
          notes?: string | null
          profile_id: string
          status?: string
          total_cents: number
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          items?: Json
          notes?: string | null
          profile_id?: string
          status?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          academy_id: string
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          stock: number
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          stock?: number
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessments: {
        Row: {
          assessed_at: string
          assessed_by: string
          id: string
          membership_id: string
          notes: string | null
          score: number
          skill_key: string
          skill_track_id: string
        }
        Insert: {
          assessed_at?: string
          assessed_by: string
          id?: string
          membership_id: string
          notes?: string | null
          score: number
          skill_key: string
          skill_track_id: string
        }
        Update: {
          assessed_at?: string
          assessed_by?: string
          id?: string
          membership_id?: string
          notes?: string | null
          score?: number
          skill_key?: string
          skill_track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "skill_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_assessments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "skill_assessments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_assessments_skill_track_id_fkey"
            columns: ["skill_track_id"]
            isOneToOne: false
            referencedRelation: "skill_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_tracks: {
        Row: {
          academy_id: string
          created_at: string
          description: string | null
          id: string
          martial_art: Database["public"]["Enums"]["martial_art"]
          name: string
          skills: Json
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          description?: string | null
          id?: string
          martial_art: Database["public"]["Enums"]["martial_art"]
          name: string
          skills: Json
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          description?: string | null
          id?: string
          martial_art?: Database["public"]["Enums"]["martial_art"]
          name?: string
          skills?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_tracks_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      snapshots: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          created_at: string
          id: string
          state: Json
          version: number
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          created_at?: string
          id?: string
          state: Json
          version: number
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          created_at?: string
          id?: string
          state?: Json
          version?: number
        }
        Relationships: []
      }
      streaks: {
        Row: {
          academy_id: string
          current_streak: number
          id: string
          last_activity_date: string
          longest_streak: number
          membership_id: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          current_streak?: number
          id?: string
          last_activity_date: string
          longest_streak?: number
          membership_id: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          current_streak?: number
          id?: string
          last_activity_date?: string
          longest_streak?: number
          membership_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streaks_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "streaks_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          academy_id: string
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          membership_id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          membership_id: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          membership_id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["membership_id"]
          },
          {
            foreignKeyName: "subscriptions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          comentario: string
          created_at: string | null
          data: string | null
          id: string
          nome: string
          nota: number
          perfil: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comentario: string
          created_at?: string | null
          data?: string | null
          id?: string
          nome: string
          nota: number
          perfil?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comentario?: string
          created_at?: string | null
          data?: string | null
          id?: string
          nome?: string
          nota?: number
          perfil?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      video_favorites: {
        Row: {
          content_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_favorites_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_watch_history: {
        Row: {
          academy_id: string
          completed: boolean
          content_id: string
          created_at: string
          id: string
          last_watched_at: string
          profile_id: string
          total_secs: number | null
          updated_at: string
          watched_secs: number
        }
        Insert: {
          academy_id: string
          completed?: boolean
          content_id: string
          created_at?: string
          id?: string
          last_watched_at?: string
          profile_id: string
          total_secs?: number | null
          updated_at?: string
          watched_secs?: number
        }
        Update: {
          academy_id?: string
          completed?: boolean
          content_id?: string
          created_at?: string
          id?: string
          last_watched_at?: string
          profile_id?: string
          total_secs?: number | null
          updated_at?: string
          watched_secs?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_watch_history_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_watch_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_watch_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          academy_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          visited_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          visited_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          academy_id: string
          content: string
          created_at: string
          direction: string
          external_id: string | null
          id: string
          message_type: string
          metadata: Json | null
          phone: string
          status: string
          template_name: string | null
        }
        Insert: {
          academy_id: string
          content: string
          created_at?: string
          direction: string
          external_id?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          phone: string
          status?: string
          template_name?: string | null
        }
        Update: {
          academy_id?: string
          content?: string
          created_at?: string
          direction?: string
          external_id?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          phone?: string
          status?: string
          template_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          academy_id: string | null
          achievement_count: number | null
          current_streak: number | null
          membership_id: string | null
          total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      anonymize_user_data: { Args: { _profile_id: string }; Returns: boolean }
      export_user_data: { Args: { _profile_id: string }; Returns: Json }
      get_data_retention_report: { Args: never; Returns: Json }
      get_user_academy_ids: { Args: never; Returns: string[] }
      get_user_roles: {
        Args: { _academy_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      is_academy_admin: { Args: { _academy_id: string }; Returns: boolean }
      is_academy_professor: { Args: { _academy_id: string }; Returns: boolean }
      is_parent_of: { Args: { _child_profile_id: string }; Returns: boolean }
      notify_academy: {
        Args: {
          _academy_id: string
          _body: string
          _title: string
          _type?: string
        }
        Returns: number
      }
      notify_class_members: {
        Args: {
          _body: string
          _schedule_id: string
          _title: string
          _type?: string
        }
        Returns: number
      }
      notify_member: {
        Args: {
          _academy_id?: string
          _body: string
          _profile_id: string
          _title: string
          _type?: string
        }
        Returns: string
      }
    }
    Enums: {
      checkin_method: "qr" | "manual" | "biometric" | "app" | "parent"
      class_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "all_levels"
        | "kids"
        | "teens"
      enrollment_status: "active" | "inactive" | "waitlisted"
      martial_art:
        | "bjj"
        | "judo"
        | "karate"
        | "muay_thai"
        | "taekwondo"
        | "boxing"
        | "wrestling"
        | "mma"
        | "other"
      membership_status: "active" | "inactive" | "suspended" | "frozen"
      milestone_type:
        | "belt_promotion"
        | "attendance_streak"
        | "competition"
        | "skill_mastery"
        | "custom"
      relationship_type: "parent" | "guardian" | "tutor"
      session_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      user_role: "student" | "professor" | "admin" | "owner" | "parent"
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
      checkin_method: ["qr", "manual", "biometric", "app", "parent"],
      class_level: [
        "beginner",
        "intermediate",
        "advanced",
        "all_levels",
        "kids",
        "teens",
      ],
      enrollment_status: ["active", "inactive", "waitlisted"],
      martial_art: [
        "bjj",
        "judo",
        "karate",
        "muay_thai",
        "taekwondo",
        "boxing",
        "wrestling",
        "mma",
        "other",
      ],
      membership_status: ["active", "inactive", "suspended", "frozen"],
      milestone_type: [
        "belt_promotion",
        "attendance_streak",
        "competition",
        "skill_mastery",
        "custom",
      ],
      relationship_type: ["parent", "guardian", "tutor"],
      session_status: ["scheduled", "in_progress", "completed", "cancelled"],
      user_role: ["student", "professor", "admin", "owner", "parent"],
    },
  },
} as const

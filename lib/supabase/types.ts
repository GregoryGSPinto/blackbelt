// WARNING: This file is OUT OF DATE — missing 9 tables from migrations 00005, 00011, 00012.
// Missing: event_subscriptions, ai_churn_labels, ai_student_dna_cache, ai_engagement_snapshots,
//          ai_social_connections, ai_question_bank, ai_adaptive_tests, ai_test_responses,
//          ai_instructor_briefings.
// Regenerate with: npx supabase gen types typescript --local > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      academies: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          settings: Json
          address: Json | null
          phone: string | null
          email: string | null
          logo_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          settings?: Json
          address?: Json | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          settings?: Json
          address?: Json | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          status?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          display_name: string | null
          avatar_url: string | null
          phone: string | null
          cpf_hash: string | null
          birth_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          cpf_hash?: string | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          cpf_hash?: string | null
          birth_date?: string | null
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          profile_id: string
          academy_id: string
          role: string
          status: string
          belt_rank: string | null
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          academy_id: string
          role: string
          status?: string
          belt_rank?: string | null
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: string
          status?: string
          belt_rank?: string | null
          updated_at?: string
        }
      }
      parent_child_links: {
        Row: {
          id: string
          parent_id: string
          child_id: string
          relationship: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          child_id: string
          relationship?: string
          created_at?: string
        }
        Update: {
          relationship?: string
        }
      }
      class_schedules: {
        Row: {
          id: string
          academy_id: string
          name: string
          martial_art: string
          level: string
          instructor_id: string
          day_of_week: number
          start_time: string
          end_time: string
          max_capacity: number
          location: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          academy_id: string
          name: string
          martial_art: string
          level: string
          instructor_id: string
          day_of_week: number
          start_time: string
          end_time: string
          max_capacity?: number
          location?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          martial_art?: string
          level?: string
          instructor_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          max_capacity?: number
          location?: string | null
          active?: boolean
          updated_at?: string
        }
      }
      class_sessions: {
        Row: {
          id: string
          schedule_id: string
          academy_id: string
          date: string
          status: string
          instructor_id: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          academy_id: string
          date: string
          status?: string
          instructor_id: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          instructor_id?: string
          notes?: string | null
          updated_at?: string
        }
      }
      class_enrollments: {
        Row: {
          id: string
          schedule_id: string
          membership_id: string
          status: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          membership_id: string
          status?: string
          enrolled_at?: string
        }
        Update: {
          status?: string
        }
      }
      attendances: {
        Row: {
          id: string
          session_id: string
          membership_id: string
          academy_id: string
          checked_in_at: string
          checked_in_by: string | null
          checkin_method: string
          notes: string | null
        }
        Insert: {
          id?: string
          session_id: string
          membership_id: string
          academy_id: string
          checked_in_at?: string
          checked_in_by?: string | null
          checkin_method?: string
          notes?: string | null
        }
        Update: {
          notes?: string | null
        }
      }
      belt_systems: {
        Row: {
          id: string
          martial_art: string
          name: string
          ranks: Json
          created_at: string
        }
        Insert: {
          id?: string
          martial_art: string
          name: string
          ranks: Json
          created_at?: string
        }
        Update: {
          name?: string
          ranks?: Json
        }
      }
      promotions: {
        Row: {
          id: string
          membership_id: string
          academy_id: string
          belt_system_id: string
          from_rank: string | null
          to_rank: string
          promoted_by: string
          promoted_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          academy_id: string
          belt_system_id: string
          from_rank?: string | null
          to_rank: string
          promoted_by: string
          promoted_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          notes?: string | null
        }
      }
      skill_tracks: {
        Row: {
          id: string
          academy_id: string
          martial_art: string
          name: string
          description: string | null
          skills: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          academy_id: string
          martial_art: string
          name: string
          description?: string | null
          skills: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          skills?: Json
          updated_at?: string
        }
      }
      skill_assessments: {
        Row: {
          id: string
          membership_id: string
          skill_track_id: string
          skill_key: string
          score: number
          assessed_by: string
          assessed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          membership_id: string
          skill_track_id: string
          skill_key: string
          score: number
          assessed_by: string
          assessed_at?: string
          notes?: string | null
        }
        Update: {
          score?: number
          notes?: string | null
        }
      }
      milestones: {
        Row: {
          id: string
          membership_id: string
          academy_id: string
          type: string
          title: string
          description: string | null
          achieved_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          membership_id: string
          academy_id: string
          type: string
          title: string
          description?: string | null
          achieved_at?: string
          metadata?: Json | null
        }
        Update: {
          title?: string
          description?: string | null
          metadata?: Json | null
        }
      }
      domain_events: {
        Row: {
          id: string
          aggregate_id: string
          aggregate_type: string
          event_type: string
          version: number
          payload: Json
          metadata: Json | null
          occurred_at: string
          causation_id: string | null
          correlation_id: string | null
          idempotency_key: string | null
        }
        Insert: {
          id?: string
          aggregate_id: string
          aggregate_type: string
          event_type: string
          version: number
          payload: Json
          metadata?: Json | null
          occurred_at?: string
          causation_id?: string | null
          correlation_id?: string | null
          idempotency_key?: string | null
        }
        Update: Record<string, never>
      }
      snapshots: {
        Row: {
          id: string
          aggregate_id: string
          aggregate_type: string
          version: number
          state: Json
          created_at: string
        }
        Insert: {
          id?: string
          aggregate_id: string
          aggregate_type: string
          version: number
          state: Json
          created_at?: string
        }
        Update: {
          state?: Json
          version?: number
        }
      }
      plans: {
        Row: {
          id: string
          academy_id: string
          name: string
          description: string | null
          price_cents: number
          interval_months: number
          features: Json | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          academy_id: string
          name: string
          description?: string | null
          price_cents: number
          interval_months?: number
          features?: Json | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price_cents?: number
          interval_months?: number
          features?: Json | null
          active?: boolean
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          membership_id: string
          plan_id: string
          academy_id: string
          status: string
          current_period_start: string
          current_period_end: string
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          plan_id: string
          academy_id: string
          status?: string
          current_period_start: string
          current_period_end: string
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          current_period_start?: string
          current_period_end?: string
          canceled_at?: string | null
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          subscription_id: string
          academy_id: string
          amount_cents: number
          status: string
          due_date: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscription_id: string
          academy_id: string
          amount_cents: number
          status?: string
          due_date: string
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          paid_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          academy_id: string
          amount_cents: number
          method: string
          external_id: string | null
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          academy_id: string
          amount_cents: number
          method: string
          external_id?: string | null
          paid_at?: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      points_ledger: {
        Row: {
          id: string
          membership_id: string
          academy_id: string
          points: number
          reason: string
          reference_type: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          academy_id: string
          points: number
          reason: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      streaks: {
        Row: {
          id: string
          membership_id: string
          academy_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string
          updated_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          academy_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date: string
          updated_at?: string
        }
        Update: {
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          icon: string | null
          category: string
          threshold: number
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          description: string
          icon?: string | null
          category: string
          threshold: number
          points?: number
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          icon?: string | null
          threshold?: number
          points?: number
        }
      }
      member_achievements: {
        Row: {
          id: string
          membership_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: Record<string, never>
      }
      notifications: {
        Row: {
          id: string
          profile_id: string
          academy_id: string | null
          title: string
          body: string
          type: string
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          academy_id?: string | null
          title: string
          body: string
          type?: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
      lgpd_consent_log: {
        Row: {
          id: string
          profile_id: string
          consent_type: string
          granted: boolean
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          consent_type: string
          granted: boolean
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      data_export_requests: {
        Row: {
          id: string
          profile_id: string
          status: string
          file_url: string | null
          requested_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          status?: string
          file_url?: string | null
          requested_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: string
          file_url?: string | null
          completed_at?: string | null
        }
      }
      data_deletion_requests: {
        Row: {
          id: string
          profile_id: string
          status: string
          reason: string | null
          requested_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          status?: string
          reason?: string | null
          requested_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: string
          completed_at?: string | null
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          academy_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          academy_id?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      rate_limit_log: {
        Row: {
          id: string
          ip_address: string
          endpoint: string
          count: number
          window_start: string
          created_at: string
        }
        Insert: {
          id?: string
          ip_address: string
          endpoint: string
          count?: number
          window_start: string
          created_at?: string
        }
        Update: {
          count?: number
        }
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          membership_id: string
          academy_id: string
          total_points: number
          current_streak: number
          achievement_count: number
        }
      }
    }
    Functions: {
      get_user_academy_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      get_user_roles: {
        Args: { _academy_id: string }
        Returns: string[]
      }
      is_academy_admin: {
        Args: { _academy_id: string }
        Returns: boolean
      }
      is_academy_professor: {
        Args: { _academy_id: string }
        Returns: boolean
      }
      notify_member: {
        Args: { _profile_id: string; _title: string; _body: string; _type: string; _academy_id?: string }
        Returns: string
      }
      notify_class_members: {
        Args: { _schedule_id: string; _title: string; _body: string; _type: string }
        Returns: number
      }
      notify_academy: {
        Args: { _academy_id: string; _title: string; _body: string; _type: string }
        Returns: number
      }
      export_user_data: {
        Args: { _profile_id: string }
        Returns: Json
      }
      anonymize_user_data: {
        Args: { _profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'student' | 'professor' | 'admin' | 'owner' | 'parent'
      membership_status: 'active' | 'inactive' | 'suspended' | 'frozen'
      relationship_type: 'parent' | 'guardian' | 'tutor'
      martial_art: 'bjj' | 'judo' | 'karate' | 'muay_thai' | 'taekwondo' | 'boxing' | 'wrestling' | 'mma' | 'other'
      class_level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels' | 'kids' | 'teens'
      session_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
      enrollment_status: 'active' | 'inactive' | 'waitlisted'
      checkin_method: 'qr' | 'manual' | 'biometric' | 'app' | 'parent'
      milestone_type: 'belt_promotion' | 'attendance_streak' | 'competition' | 'skill_mastery' | 'custom'
    }
  }
}

// Auto-generated Supabase database types
// Matches the schema in supabase/schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          is_admin: boolean;
          profile_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_hash: string;
          is_admin?: boolean;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          is_admin?: boolean;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      arrival_profiles: {
        Row: {
          id: string;
          user_id: string;
          arrival_type: string;
          status: string;
          arrival_date: string | null;
          city: string | null;
          university: string | null;
          accommodation: string | null;
          nationality: string | null;
          english_level: string | null;
          work_interest: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          arrival_type: string;
          status: string;
          arrival_date?: string | null;
          city?: string | null;
          university?: string | null;
          accommodation?: string | null;
          nationality?: string | null;
          english_level?: string | null;
          work_interest?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          arrival_type?: string;
          status?: string;
          arrival_date?: string | null;
          city?: string | null;
          university?: string | null;
          accommodation?: string | null;
          nationality?: string | null;
          english_level?: string | null;
          work_interest?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_tasks: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          status: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminder_prefs: {
        Row: {
          id: string;
          user_id: string;
          email_reminders: boolean;
          frequency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_reminders?: boolean;
          frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_reminders?: boolean;
          frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

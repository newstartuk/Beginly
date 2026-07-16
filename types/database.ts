// Supabase database types for Beginly v1.2 stabilisation
// Keep this aligned with supabase/schema.sql until generated Supabase types are introduced.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

export interface Database {
  public: {
    Tables: {
      users: TableDef<
        {
          id: string;
          name: string;
          email: string;
          password_hash: string;
          is_admin: boolean;
          profile_completed: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          name: string;
          email: string;
          password_hash?: string;
          is_admin?: boolean;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          is_admin?: boolean;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      arrival_profiles: TableDef<
        {
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
          work_interest: boolean | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          arrival_type?: string;
          status?: string;
          arrival_date?: string | null;
          city?: string | null;
          university?: string | null;
          accommodation?: string | null;
          nationality?: string | null;
          english_level?: string | null;
          work_interest?: boolean | null;
          created_at?: string;
          updated_at?: string;
        },
        {
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
          work_interest?: boolean | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      user_tasks: TableDef<
        {
          id: string;
          user_id: string;
          task_id: string;
          status: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          task_id: string;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          task_id?: string;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      reminder_prefs: TableDef<
        {
          id: string;
          user_id: string;
          email_reminders: boolean;
          frequency: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          email_reminders?: boolean;
          frequency?: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          email_reminders?: boolean;
          frequency?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      support_tickets: TableDef<
        {
          id: string;
          user_id: string;
          category: string;
          description: string;
          email: string;
          status: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          category: string;
          description: string;
          email: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          category?: string;
          description?: string;
          email?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

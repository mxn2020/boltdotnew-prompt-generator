import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          content: any; // JSONB
          structure_type: 'standard' | 'structured' | 'modulized' | 'advanced';
          category: string;
          type: string;
          language: string;
          complexity: 'simple' | 'medium' | 'complex' | 'custom';
          is_public: boolean;
          version_major: number;
          version_minor: number;
          version_batch: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          content: any;
          structure_type: 'standard' | 'structured' | 'modulized' | 'advanced';
          category: string;
          type: string;
          language: string;
          complexity: 'simple' | 'medium' | 'complex' | 'custom';
          is_public?: boolean;
          version_major?: number;
          version_minor?: number;
          version_batch?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          content?: any;
          structure_type?: 'standard' | 'structured' | 'modulized' | 'advanced';
          category?: string;
          type?: string;
          language?: string;
          complexity?: 'simple' | 'medium' | 'complex';
          is_public?: boolean;
          version_major?: number;
          version_minor?: number;
          version_batch?: number;
          updated_at?: string;
        };
      };
    };
  };
};
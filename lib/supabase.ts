/**
 * Supabase Client Configuration
 * For server-side operations, use service role key
 * For client-side operations, use anon key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Support both formats: JWT token or publishable key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

// Server-side client (with service role key for admin operations)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Client-side client (with anon key for public operations)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types
export interface Score {
  id: string;
  wallet: string;
  day_id: number;
  score: number;
  created_at: string;
}

export interface BestScore {
  wallet: string;
  day_id: number;
  best_score: number;
  updated_at: string;
}

export interface PendingCommit {
  id: string;
  day_id: number;
  type: 'checkpoint' | 'finalize';
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'done' | 'error';
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface CommitLog {
  id: string;
  day_id: number;
  tx_hash: string;
  type: 'checkpoint' | 'finalize';
  payload: Record<string, any>;
  created_at: string;
}


import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRole) return null;
  return createClient(supabaseUrl, supabaseServiceRole);
}

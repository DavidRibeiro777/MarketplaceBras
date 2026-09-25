import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-key";

/**
 * Cliente Supabase padrão tipado para uso no client-side e server-side com RLS
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Cliente Supabase com permissões elevadas de Service Role (para Server Actions / Webhooks / Admin)
 * Caso a SERVICE_ROLE_KEY não esteja configurada, faz fallback gracioso para o client padrão
 */
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return supabase;
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

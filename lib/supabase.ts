import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseMode = "disabled" | "readonly" | "admin";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url,
    publishableKey,
    serviceRoleKey,
    configured: Boolean(url && publishableKey),
    adminConfigured: Boolean(url && serviceRoleKey),
    mode: !url || !publishableKey ? "disabled" : serviceRoleKey ? "admin" : "readonly" as SupabaseMode,
  };
}

export function createSupabasePublicClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.publishableKey) return null;
  return createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseAdminClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.serviceRoleKey) return null;
  return createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

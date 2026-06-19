import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for pipeline scripts.
 * Bypasses RLS — use only in server-side / pipeline code.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

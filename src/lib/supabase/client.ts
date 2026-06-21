import { createClient } from "@supabase/supabase-js";

/** 브라우저/서버 컴포넌트용 (anon key — RLS 적용) */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

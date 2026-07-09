import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components. Uses the public (RLS-safe)
 * anon key only — never the service role key.
 */
export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}

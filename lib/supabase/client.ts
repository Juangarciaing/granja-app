import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components. Uses the public (RLS-safe)
 * anon key only — never the service role key.
 *
 * NEXT_PUBLIC_* vars must be accessed as the literal `process.env.X`
 * expression in a file that's part of the client bundle — Next.js inlines
 * them via static text replacement at build time, and any indirection
 * (passing process.env through a parameter, as getSupabasePublicEnv's
 * default does) breaks that replacement in the browser. Passing them
 * explicitly here keeps the literal access in this client-boundary file.
 */
export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return createBrowserClient<Database>(url, anonKey);
}

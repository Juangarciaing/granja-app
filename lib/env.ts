export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

type EnvSource = Record<string, string | undefined>;

/**
 * Validates and reads the public (RLS-safe) Supabase env vars used by both
 * the browser client and the server client. Accepts an injected env source
 * so it stays a pure, easily testable function instead of reaching into
 * `process.env` directly.
 */
export function getSupabasePublicEnv(
  env: EnvSource = process.env,
): SupabasePublicEnv {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing required env var NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local (see .env.example).",
    );
  }

  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error(
      "Missing required env var NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in .env.local (see .env.example).",
    );
  }

  return { url, anonKey };
}

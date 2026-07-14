import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedRedirect } from "@/lib/auth/guard";
import { getSupabasePublicEnv } from "@/lib/env";

const AUTH_PATHS = ["/login", "/signup"] as const;
const HOME_PATH = "/dashboard";

/**
 * Refreshes the Supabase auth session on every request so server-rendered
 * pages always see an up-to-date session cookie. Also redirects an
 * already-authenticated user away from the auth-only pages (`/login`,
 * `/signup`) to `/dashboard`, server-side, before the form ever renders.
 * Invoked from the root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not remove: `getUser()` is what actually refreshes the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthenticatedRedirect(
    user,
    request.nextUrl.pathname,
    AUTH_PATHS,
    HOME_PATH,
  );

  if (redirectTo) {
    const redirectResponse = NextResponse.redirect(
      new URL(redirectTo, request.url),
    );
    // Carry over the refreshed session cookies from supabaseResponse, or
    // the session cookie gets dropped on this redirect.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

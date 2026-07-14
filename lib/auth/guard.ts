export type SessionUser = {
  id: string;
} | null;

/**
 * Pure decision function for the `(app)` layout auth guard: given the
 * current session user (or null) and the login route path, returns the
 * path to redirect to, or null when the user is already authenticated and
 * no redirect is needed. Kept pure/side-effect-free so the guard's actual
 * decision logic is unit-testable without mocking Next.js `redirect()` or
 * the Supabase server client.
 */
export function getAuthRedirect(
  user: SessionUser,
  loginPath: string,
): string | null {
  return user ? null : loginPath;
}

/**
 * Pure decision function symmetric to {@link getAuthRedirect}: given the
 * current session user (or null) and the current request path, returns the
 * home path to redirect to when an already-authenticated user is on one of
 * the auth-only pages (`/login`, `/signup`), or null when no redirect is
 * needed. Used by `updateSession` (middleware) to bounce authenticated
 * users away from the auth pages server-side, before the form renders.
 */
export function getAuthenticatedRedirect(
  user: SessionUser,
  pathname: string,
  authPaths: readonly string[],
  homePath: string,
): string | null {
  return user && authPaths.includes(pathname) ? homePath : null;
}

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

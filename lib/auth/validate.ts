export const MIN_PASSWORD_LENGTH = 8;

/**
 * Pure password-strength rule for `/signup`. The app enforces its own
 * minimum independently of the Supabase project's configured minimum
 * (default 6), so this is checked client-side before any network call.
 */
export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return null;
}

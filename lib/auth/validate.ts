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

const DUPLICATE_EMAIL_ERROR_CODE = "user_already_exists";
const DUPLICATE_EMAIL_MESSAGE_PATTERN = /already registered/i;

/**
 * Detects Supabase's "email already in use" signUp() error. Checks the
 * documented error code first; falls back to a message match since the
 * exact code string is Supabase-version-dependent and not guaranteed.
 */
export function isDuplicateEmailError(error: {
  code?: string | null;
  message: string;
}): boolean {
  return (
    error.code === DUPLICATE_EMAIL_ERROR_CODE ||
    DUPLICATE_EMAIL_MESSAGE_PATTERN.test(error.message)
  );
}

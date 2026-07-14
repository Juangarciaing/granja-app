import type { SessionUser } from "@/lib/auth/guard";

export type LandingCta = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
};

/**
 * Pure decision function for the public landing page's call-to-action set:
 * given the current session user (or null), returns the ordered CTAs to
 * render. Kept pure/side-effect-free so the branch logic is unit-testable
 * without mocking the Supabase server client or rendering JSX.
 */
export function getLandingCtas(user: SessionUser): LandingCta[] {
  return user
    ? [{ href: "/dashboard", label: "Ir a mi panel", variant: "primary" }]
    : [
        { href: "/signup", label: "Registrate", variant: "primary" },
        { href: "/login", label: "Iniciá sesión", variant: "secondary" },
      ];
}

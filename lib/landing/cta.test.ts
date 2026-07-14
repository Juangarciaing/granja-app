import { describe, expect, it } from "vitest";
import { getLandingCtas } from "@/lib/landing/cta";

describe("getLandingCtas", () => {
  it("returns signup + login CTAs when there is no session user", () => {
    expect(getLandingCtas(null)).toEqual([
      { href: "/signup", label: "Registrate", variant: "primary" },
      { href: "/login", label: "Iniciá sesión", variant: "secondary" },
    ]);
  });

  it("returns a single dashboard CTA when a session user is present", () => {
    expect(getLandingCtas({ id: "user-123" })).toEqual([
      { href: "/dashboard", label: "Ir a mi panel", variant: "primary" },
    ]);
  });
});

import { expect, test } from "@playwright/test";

/**
 * Auth guard E2E coverage. Does NOT require Supabase credentials — these
 * scenarios only exercise the unauthenticated path (`app/(app)/layout.tsx`'s
 * `getAuthRedirect` guard, spec-independent of any capability's happy path).
 * Executed and confirmed passing in this session against a production build
 * (`pnpm build && pnpm start`, per `playwright.config.ts`'s `webServer`).
 */
test.describe("Auth guard (unauthenticated)", () => {
  test("visiting the dashboard redirects to /login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();
  });

  test("visiting /sows redirects to /login", async ({ page }) => {
    await page.goto("/sows");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("visiting /config redirects to /login", async ({ page }) => {
    await page.goto("/config");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("login page renders the shared-login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Correo")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ingresar" }),
    ).toBeVisible();
  });
});

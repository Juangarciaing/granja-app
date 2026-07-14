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
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();
  });

  test("visiting / renders the public landing page (no redirect)", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", {
        name: "Llevá el control de tu granja en un solo lugar",
      }),
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

  test("signup page renders the signup form", async ({ page }) => {
    await page.goto("/signup");

    await expect(
      page.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeVisible();
    await expect(page.getByLabel("Correo")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear cuenta" }),
    ).toBeVisible();
  });

  test("navigates from login to signup via the cross-link", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Registrate" }).click();

    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole("heading", { name: "Crear cuenta" }),
    ).toBeVisible();
  });

  test("navigates from signup to login via the cross-link", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.getByRole("link", { name: "Iniciá sesión" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeVisible();
  });

  test("shows a client-side error for a password under 8 characters", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.getByLabel("Correo").fill("nuevo@example.com");
    await page.getByLabel("Contraseña").fill("short1");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(
      page.locator("form").getByRole("alert"),
    ).toHaveText("La contraseña debe tener al menos 8 caracteres.");
    await expect(page).toHaveURL(/\/signup$/);
  });
});

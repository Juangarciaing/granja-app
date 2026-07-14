import { expect, test } from "@playwright/test";

/**
 * Full authenticated user flow (spec scenarios across sow-management,
 * farrowing-tracking, feeding-config and lactation-feed-calc, exercised
 * end-to-end): login → register a sow → record a farrowing → see it on the
 * dashboard with its live daily feed → decrement the piglet counter → see
 * the dashboard recompute.
 *
 * This app has exactly one shared family login (no self-service signup,
 * per design's "Auth / multi-user" decision) and runs against a REAL linked
 * Supabase project (`.env.local`, migrations 0001+0002 already applied).
 * That means:
 *   1. There is no throwaway/seedable test user — these tests authenticate
 *      as the one real shared account.
 *   2. Every sow/farrowing this suite creates is a REAL row in the REAL
 *      database (no local Postgres/Docker available to sandbox against —
 *      see README's "Local Supabase development" note). Test data is
 *      tagged with a unique, obviously-synthetic name
 *      (`E2E <timestamp>`) so it's easy to spot and prune later; nothing
 *      here deletes rows (no delete flow exists in v1 scope per spec).
 *
 * Credentials are intentionally NOT hardcoded or committed — they must be
 * supplied via env vars the developer sets locally:
 *   E2E_TEST_EMAIL, E2E_TEST_PASSWORD
 *
 * Without them, this whole suite is skipped (not failed) — see the
 * `test.skip` guard below. The agent that authored this suite did not have
 * access to the real account's password and could NOT execute these
 * scenarios in this session; only the credential-free suites
 * (`auth-redirect.spec.ts`, `pwa.spec.ts`) were actually run and confirmed
 * green. Run this file locally once E2E_TEST_EMAIL/E2E_TEST_PASSWORD are
 * exported to get real pass/fail signal.
 */

const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;

test.describe("Full authenticated flow: sow → farrowing → live feed", () => {
  test.skip(
    !EMAIL || !PASSWORD,
    "Requires E2E_TEST_EMAIL and E2E_TEST_PASSWORD env vars for the real " +
      "shared Supabase login — not available to the agent that wrote this " +
      "suite. Set both env vars locally to run this against the real app.",
  );

  test("register sow, record farrowing, view and recompute live feed", async ({
    page,
  }) => {
    const sowName = `E2E ${Date.now()}`;

    // --- Login ---
    await page.goto("/login");
    await page.getByLabel("Correo").fill(EMAIL!);
    await page.getByLabel("Contraseña").fill(PASSWORD!);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // --- Register a sow (spec: sow-management "Register new sow") ---
    await page.getByRole("link", { name: "Ver cerdas →" }).click();
    await expect(page).toHaveURL(/\/sows$/);
    await page.getByRole("link", { name: "Registrar cerda" }).click();
    await page.getByLabel("Arete").fill(sowName);
    await page.getByRole("button", { name: "Registrar" }).click();

    // createSowAction redirects back to the sow's own detail page.
    await expect(page).toHaveURL(/\/sows\/[^/]+$/);
    await expect(page.getByLabel("Arete")).toHaveValue(sowName);

    // --- Record a farrowing (spec: farrowing-tracking "Record Farrowing") ---
    await page.getByRole("link", { name: "Registrar parto" }).click();
    await page.getByLabel("Fecha de parto").fill("2026-07-01");
    await page.getByLabel("Lechones nacidos vivos").fill("8");
    await page.getByRole("button", { name: "Registrar parto" }).click();

    // Back on the sow detail page, the new lactating farrowing is listed
    // with its live PigletCounter initialized from born_alive.
    await expect(page).toHaveURL(/\/sows\/[^/]+$/);
    await expect(page.getByText("Lactando")).toBeVisible();
    const counter = page.getByText("8", { exact: true }).first();
    await expect(counter).toBeVisible();

    // --- View it on the dashboard with its live daily feed
    //     (spec: lactation-feed-calc "Standard calculation") ---
    await page.goto("/dashboard");
    await expect(page.getByText(sowName)).toBeVisible();
    await expect(page.getByText("8 lechones")).toBeVisible();

    // --- Edit the counter and see the dashboard recompute
    //     (spec: farrowing-tracking "Piglet dies during lactation" +
    //     lactation-feed-calc "Standard calculation" reacting to it) ---
    await page.goto("/sows");
    await page.getByRole("link", { name: sowName }).click();
    const decrementButton = page.getByRole("button", { name: "-1" });
    const feedBeforeText = await page.textContent("body");

    await decrementButton.click();
    // PigletCounter debounces the persist by 500ms before calling the
    // server action — wait past that window before asserting the new
    // value survived a reload (i.e. it was actually persisted, not just
    // the optimistic local state).
    await page.waitForTimeout(700);
    await page.reload();
    await expect(page.getByText("7", { exact: true }).first()).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText("7 lechones")).toBeVisible();
    expect(await page.textContent("body")).not.toBe(feedBeforeText);
  });

  test("weaning a farrowing removes it from the active dashboard total", async ({
    page,
  }) => {
    const sowName = `E2E-wean ${Date.now()}`;

    await page.goto("/login");
    await page.getByLabel("Correo").fill(EMAIL!);
    await page.getByLabel("Contraseña").fill(PASSWORD!);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/sows/new");
    await page.getByLabel("Arete").fill(sowName);
    await page.getByRole("button", { name: "Registrar" }).click();
    await expect(page).toHaveURL(/\/sows\/[^/]+$/);

    await page.getByRole("link", { name: "Registrar parto" }).click();
    await page.getByLabel("Fecha de parto").fill("2026-06-01");
    await page.getByLabel("Lechones nacidos vivos").fill("5");
    await page.getByRole("button", { name: "Registrar parto" }).click();

    await page.goto("/dashboard");
    await expect(page.getByText(sowName)).toBeVisible();

    // Wean it (spec: farrowing-tracking "Set weaning date")
    await page.goto("/sows");
    await page.getByRole("link", { name: sowName }).click();
    await page
      .getByRole("button", { name: "Marcar como destetada" })
      .click();
    // The button only disappears once the server action's mutation has
    // been persisted and the page re-rendered with the farrowing's new
    // ('weaned') status — waiting for it (rather than a fixed timeout)
    // means the dashboard check below is not racing the mutation.
    await expect(
      page.getByRole("button", { name: "Marcar como destetada" }),
    ).not.toBeVisible();

    // spec: lactation-feed-calc "Weaned farrowing excluded"
    await page.goto("/dashboard");
    await expect(page.getByText(sowName)).not.toBeVisible();
  });
});

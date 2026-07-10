import { expect, test } from "@playwright/test";

/**
 * PWA installability E2E coverage. Does NOT require Supabase credentials —
 * the manifest and service worker are served for every request, including
 * unauthenticated ones (`middleware.ts`'s matcher explicitly excludes
 * `sw.js`/`manifest.webmanifest` from the auth-session-refresh pass, and
 * `app/manifest.ts` + `app/sw.ts` render before any auth guard runs).
 * Executed and confirmed passing in this session against a production build
 * (`pnpm build && pnpm start`) — Serwist's service worker is only emitted
 * when `NODE_ENV=production` (see `next.config.ts`'s `disable` option), so
 * these assertions specifically validate the prod build, not `pnpm dev`.
 */
test.describe("PWA installability", () => {
  test("web app manifest is served with the expected shape", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain(
      "application/manifest+json",
    );

    const manifest = await response.json();
    expect(manifest.name).toBe("Granja — Calculadora de Alimento");
    expect(manifest.short_name).toBe("Granja");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", type: "image/png" }),
        expect.objectContaining({ sizes: "512x512", type: "image/png" }),
      ]),
    );
  });

  test("manifest icon assets are served as real PNGs", async ({
    request,
  }) => {
    const icon192 = await request.get("/icons/icon-192.png");
    const icon512 = await request.get("/icons/icon-512.png");

    expect(icon192.ok()).toBe(true);
    expect(icon192.headers()["content-type"]).toBe("image/png");
    expect(icon512.ok()).toBe(true);
    expect(icon512.headers()["content-type"]).toBe("image/png");
  });

  test("the HTML document links the manifest and a theme-color", async ({
    page,
  }) => {
    // /login is reachable without auth and still renders the root layout
    // that carries the manifest link + theme-color meta tag.
    await page.goto("/login");

    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    expect(manifestHref).toBe("/manifest.webmanifest");

    const themeColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute("content");
    expect(themeColor).toBe("#166534");
  });

  test("the service worker script is served in the production build", async ({
    request,
  }) => {
    const response = await request.get("/sw.js");
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("javascript");
  });

  test("the service worker registers successfully in the browser", async ({
    page,
  }) => {
    await page.goto("/login");

    const registration = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return null;
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      return reg.active?.state ?? reg.waiting?.state ?? reg.installing?.state ?? null;
    });

    expect(registration).not.toBeNull();
  });
});

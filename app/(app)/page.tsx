import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthRedirect } from "@/lib/auth/guard";
import { buildFeedSummary } from "@/lib/dashboard/feed-summary";
import { getFeedingConfig, listActiveFarrowings, listSows } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redundant with the (app) layout's own auth guard, but deliberately not
  // relying on it alone: RSC can start this page's data-fetch concurrently
  // with the layout's redirect(), and an unauthenticated Promise.all below
  // would hit RLS-empty rows and throw PGRST116 before the redirect wins.
  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  // Live daily-feed summary: config + active (non-weaned) farrowings are
  // re-read on every request and recomputed via calcDailyFeed — there is no
  // stored/cached value to invalidate, so a feeding_config edit is reflected
  // immediately on next render (spec: "Config changed mid-lactation").
  const [config, activeFarrowings, sows] = await Promise.all([
    getFeedingConfig(supabase),
    listActiveFarrowings(supabase),
    listSows(supabase),
  ]);
  const feedSummary = buildFeedSummary(activeFarrowings, sows, config);
  const totalDailyFeedKg =
    Math.round(
      feedSummary.reduce((sum, row) => sum + row.dailyFeedKg, 0) * 100,
    ) / 100;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl">Granja</h1>
        <p className="text-sm text-ink-muted">
          Sesión iniciada como {user?.email ?? "usuario"}.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        <Link href="/sows" className="btn-secondary">
          Ver cerdas
        </Link>
        <Link href="/fattening-pigs" className="btn-secondary">
          Ver cerdos de engorde
        </Link>
        <Link href="/dairy-cows" className="btn-secondary">
          Ver vacas lecheras
        </Link>
        <Link href="/config" className="btn-secondary">
          Configuración de alimento
        </Link>
      </nav>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded bg-surface-2 px-5 py-4">
          <h2 className="text-lg">Alimento diario</h2>
          <span className="font-mono text-3xl tabular-nums text-accent">
            {totalDailyFeedKg} <span className="text-base text-ink-muted">kg/día</span>
          </span>
        </div>

        {feedSummary.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No hay partos activos en lactancia actualmente.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {feedSummary.map((row) => (
              <li key={row.farrowingId} className="tag-card">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-lg">{row.sowName}</span>
                  <span className="font-mono text-sm tabular-nums text-ink-muted">
                    {row.currentPiglets} lechones
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums text-accent">
                    {row.dailyFeedKg} kg/día
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

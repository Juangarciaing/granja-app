import Link from "next/link";

import { buildFeedSummary } from "@/lib/dashboard/feed-summary";
import { getFeedingConfig, listActiveFarrowings, listSows } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Granja</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sesión iniciada como {user?.email ?? "usuario"}.
      </p>
      <div className="flex gap-4">
        <Link href="/sows" className="text-sm font-medium hover:underline">
          Ver cerdas →
        </Link>
        <Link href="/config" className="text-sm font-medium hover:underline">
          Configuración de alimento →
        </Link>
      </div>

      <div className="flex flex-col gap-3 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Alimento diario</h2>
          <span className="text-sm text-zinc-500">
            Total: {totalDailyFeedKg} kg/día
          </span>
        </div>

        {feedSummary.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay partos activos en lactancia actualmente.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {feedSummary.map((row) => (
              <li
                key={row.farrowingId}
                className="flex items-center justify-between py-3"
              >
                <span className="font-medium">{row.sowName}</span>
                <span className="text-sm text-zinc-500">
                  {row.currentPiglets} lechones
                </span>
                <span className="text-sm font-medium">
                  {row.dailyFeedKg} kg/día
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

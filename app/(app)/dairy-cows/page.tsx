import { redirect } from "next/navigation";
import Link from "next/link";

import { MilkDropIcon } from "@/components/icons/ModuleIcons";
import { getAuthRedirect } from "@/lib/auth/guard";
import { heatStatus, nextExpectedHeatDate } from "@/lib/dairy-cows/heat-cycle";
import { listActiveDairyCows, listHeatEventsForCow } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

const HEAT_STATUS_LABELS: Record<string, string> = {
  upcoming: "Próximo",
  overdue: "Vencido",
};

const HEAT_STATUS_CHIP_CLASS: Record<string, string> = {
  upcoming: "chip-neutral",
  overdue: "chip-warn",
};

export default async function DairyCowsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const cows = await listActiveDairyCows(supabase);

  // Per-cow heat chip (spec: "List page shows heat summary chip") —
  // `listActiveDairyCows` already excludes exited cows, so every row here
  // is eligible; a cow with zero heat events simply has no projection to
  // show (design: "no events, no projection", not an error).
  const today = new Date().toISOString().slice(0, 10);
  const heatEventsByCow = new Map(
    await Promise.all(
      cows.map(async (cow) => {
        const events = await listHeatEventsForCow(supabase, cow.id);
        return [cow.id, events] as const;
      }),
    ),
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-wash text-accent">
            <MilkDropIcon className="h-6 w-6" />
          </span>
          <h1 className="text-2xl">Vacas lecheras</h1>
        </div>
        <Link href="/dairy-cows/new" className="btn-primary">
          Registrar vaca
        </Link>
      </div>

      {cows.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Todavía no hay vacas lecheras registradas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cows.map((cow) => {
            const events = heatEventsByCow.get(cow.id) ?? [];
            // events[0] is the most recent observation since
            // listHeatEventsForCow orders newest-first (DESC).
            const status =
              events.length > 0
                ? heatStatus(nextExpectedHeatDate(events[0].observed_date), today)
                : null;

            return (
              <li key={cow.id} className="tag-card">
                <Link
                  href={`/dairy-cows/${cow.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-display text-lg">{cow.ear_tag}</span>
                  {status && (
                    <span className={`chip ${HEAT_STATUS_CHIP_CLASS[status]}`}>
                      {HEAT_STATUS_LABELS[status]}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

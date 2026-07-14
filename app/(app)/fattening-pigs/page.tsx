import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthRedirect } from "@/lib/auth/guard";
import {
  getSaleWeightConfig,
  listActiveFatteningPigs,
  listPens,
  listWeightCheckinsForPig,
} from "@/lib/db/queries";
import { latestCheckinWeight, resolveLatestKnownWeight } from "@/lib/fattening-pigs/latest-weight";
import { isReadyForSale } from "@/lib/fattening-pigs/sale-readiness";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export default async function FatteningPigsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const [pigs, pens, saleWeightConfig] = await Promise.all([
    listActiveFatteningPigs(supabase),
    listPens(supabase),
    getSaleWeightConfig(supabase),
  ]);
  const penNameById = new Map(pens.map((pen) => [pen.id, pen.name]));

  // Sale-readiness indicator (spec: "Binary 'Listo para vender' Chip"). Only
  // active pigs reach here — `listActiveFatteningPigs` already excludes
  // sold/exited pigs (`exit_date is not null`), so there is no separate
  // "sold pig" branch in this classifier.
  const checkinEntries = await Promise.all(
    pigs.map(
      async (pig) =>
        [pig.id, await listWeightCheckinsForPig(supabase, pig.id)] as const,
    ),
  );
  const checkinsByPig = new Map(checkinEntries);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Cerdos de engorde</h1>
        <Link href="/fattening-pigs/new" className="btn-primary">
          Registrar cerdo
        </Link>
      </div>

      {pigs.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Todavía no hay cerdos de engorde registrados.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pigs.map((pig) => {
            const checkins = checkinsByPig.get(pig.id) ?? [];
            const latestKnownWeight = resolveLatestKnownWeight(
              pig.entry_weight,
              latestCheckinWeight(checkins),
            );
            const readyForSale = isReadyForSale(
              latestKnownWeight,
              saleWeightConfig.target_weight_kg,
            );

            return (
              <li key={pig.id} className="tag-card">
                <Link
                  href={`/fattening-pigs/${pig.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-display text-lg">{pig.ear_tag}</span>
                  {readyForSale && (
                    <span className="chip chip-good">Listo para vender</span>
                  )}
                  <span className="chip chip-neutral">
                    {pig.pen_id ? penNameById.get(pig.pen_id) ?? "Sin corral" : "Sin corral"}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-ink-muted">
                    {pig.entry_date} · {pig.entry_weight} kg
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

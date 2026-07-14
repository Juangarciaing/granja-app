import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthRedirect } from "@/lib/auth/guard";
import {
  listFatteningPigsForPen,
  listFeedLogsForPen,
  listPens,
  listUnassignedFatteningPigs,
  listWeightCheckinsForPig,
} from "@/lib/db/queries";
import { buildFcrPigWeights } from "@/lib/pens/fcr-summary";
import type { FcrPigWeight } from "@/lib/pens/fcr";
import { describeFcrResult } from "@/lib/pens/fcr-copy";
import { buildPenFcrRows } from "@/lib/pens/list-fcr";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export default async function PensPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const [pens, unassignedPigs] = await Promise.all([
    listPens(supabase),
    listUnassignedFatteningPigs(supabase),
  ]);

  // Per-pen FCR inputs: each pen needs its own feed-kg list and its
  // assigned pigs' weights (entry weight + latest check-in). No batch query
  // exists for this (PR1's query layer is per-pen/per-pig granular), so
  // this fans out with Promise.all, mirroring the dashboard's
  // config+farrowings+sows fetch-then-map pattern (`buildFeedSummary`).
  const feedKgsByPen = new Map<string, number[]>();
  const pigWeightsByPen = new Map<string, FcrPigWeight[]>();

  await Promise.all(
    pens.map(async (pen) => {
      const [feedLogs, pigs] = await Promise.all([
        listFeedLogsForPen(supabase, pen.id),
        listFatteningPigsForPen(supabase, pen.id),
      ]);
      feedKgsByPen.set(
        pen.id,
        feedLogs.map((log) => log.kg_fed),
      );

      const checkinEntries = await Promise.all(
        pigs.map(
          async (pig) =>
            [pig.id, await listWeightCheckinsForPig(supabase, pig.id)] as const,
        ),
      );
      const checkinsByPig = new Map(checkinEntries);
      pigWeightsByPen.set(pen.id, buildFcrPigWeights(pigs, checkinsByPig));
    }),
  );

  const penRows = buildPenFcrRows(pens, feedKgsByPen, pigWeightsByPen);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Corrales</h1>
        <Link href="/pens/new" className="btn-primary">
          Crear corral
        </Link>
      </div>

      {penRows.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Todavía no hay corrales creados.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {penRows.map(({ pen, fcr }) => {
            const { text, chipClass } = describeFcrResult(fcr);
            return (
              <li key={pen.id} className="tag-card">
                <Link
                  href={`/pens/${pen.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-display text-lg">{pen.name}</span>
                  <span className={`chip ${chipClass}`}>{text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/*
        "Sin corral" group (design: pens list "+ 'Sin corral' unassigned-pigs
        group") — active pigs with `pen_id is null`, listed read-only here so
        the farmer can see who still needs assignment. Assignment itself
        happens on the pig detail page (PR3), not from this list.
      */}
      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 className="text-lg">Sin corral</h2>
        {unassignedPigs.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todos los cerdos activos están asignados a un corral.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unassignedPigs.map((pig) => (
              <li key={pig.id} className="tag-card">
                <span className="font-display text-lg">{pig.ear_tag}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

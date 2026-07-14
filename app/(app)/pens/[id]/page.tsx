import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  createFeedLogAction,
  deleteFeedLogAction,
  updateFeedLogAction,
  updatePenAction,
} from "@/app/(app)/pens/[id]/actions";
import { FeedLogForm } from "@/components/pens/FeedLogForm";
import { FeedLogRow } from "@/components/pens/FeedLogRow";
import { PenForm } from "@/components/pens/PenForm";
import { getAuthRedirect } from "@/lib/auth/guard";
import {
  getPen,
  listFatteningPigsForPen,
  listFeedLogsForPen,
  listWeightCheckinsForPig,
} from "@/lib/db/queries";
import { describeFcrResult } from "@/lib/pens/fcr-copy";
import { buildFcrPigWeights } from "@/lib/pens/fcr-summary";
import { calcPenFcr } from "@/lib/pens/fcr";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

type PenDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PenDetailPage({ params }: PenDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  // Ownership guard: `getPen` relies on RLS (`pens_select_own`) to return
  // no row for a pen the caller doesn't own, so this 404s the same way
  // `getDairyCow`/`getFatteningPig` do for the analogous detail pages.
  const pen = await getPen(supabase, id).catch(() => null);
  if (!pen) {
    notFound();
  }

  const [pigs, feedLogs] = await Promise.all([
    listFatteningPigsForPen(supabase, id),
    listFeedLogsForPen(supabase, id),
  ]);

  const checkinEntries = await Promise.all(
    pigs.map(
      async (pig) =>
        [pig.id, await listWeightCheckinsForPig(supabase, pig.id)] as const,
    ),
  );
  const checkinsByPig = new Map(checkinEntries);
  const pigWeights = buildFcrPigWeights(pigs, checkinsByPig);
  const fcr = calcPenFcr(
    feedLogs.map((log) => log.kg_fed),
    pigWeights,
  );
  const { text: fcrText, chipClass: fcrChipClass } = describeFcrResult(fcr);

  const boundUpdatePenAction = updatePenAction.bind(null, id);
  const boundCreateFeedLogAction = createFeedLogAction.bind(null, id);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Link href="/pens" className="text-sm font-medium text-ink-muted hover:text-ink">
          ‹ Corrales
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{pen.name}</h1>
        <span className={`chip ${fcrChipClass}`}>{fcrText}</span>
      </div>

      {/*
        Inline rename form for the pen's own `name` field — the only
        editable pen attribute (design: `PenUpdate = Pick<..., "name">`).
        Mirrors `WeightCheckinRow`'s edit-toggle pattern, applied to the
        page's own header field instead of a child row.
      */}
      <details className="flex flex-col gap-2">
        <summary className="cursor-pointer text-sm font-medium text-ink-muted hover:text-ink">
          Renombrar corral
        </summary>
        <PenForm
          action={boundUpdatePenAction}
          submitLabel="Guardar cambios"
          defaultValues={{ name: pen.name }}
        />
      </details>

      {/*
        Assigned pigs (read-only here — assignment itself happens on the pig
        detail page, PR3, not from the pen detail page).
      */}
      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 className="text-xl">Cerdos asignados</h2>
        {pigs.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Este corral todavía no tiene cerdos asignados.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pigs.map((pig) => (
              <li key={pig.id} className="tag-card">
                <span className="font-display text-lg">{pig.ear_tag}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/*
        Feed-log history (spec-equivalent of "View a cow's production
        history"), newest-first, mirroring `MilkRecordRow`/`MilkRecordForm`
        exactly. A pen with zero feed logs still shows this section with an
        empty-state message, not an error.
      */}
      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-xl">Historial de alimento</h2>

        {feedLogs.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no hay alimento registrado para este corral.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {feedLogs.map((log) => (
              <FeedLogRow
                key={log.id}
                logDate={log.log_date}
                kgFed={log.kg_fed}
                updateAction={updateFeedLogAction.bind(null, log.id, id)}
                deleteAction={deleteFeedLogAction.bind(null, log.id, id)}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Registrar alimento de hoy</h3>
          <FeedLogForm
            action={boundCreateFeedLogAction}
            submitLabel="Registrar alimento"
          />
        </div>
      </div>
    </main>
  );
}

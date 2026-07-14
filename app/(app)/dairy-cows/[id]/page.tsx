import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { markDairyCowExitedAction } from "@/app/(app)/dairy-cows/actions";
import {
  createHeatEventAction,
  createMilkRecordAction,
  deleteHeatEventAction,
  deleteMilkRecordAction,
  updateHeatEventAction,
  updateMilkRecordAction,
} from "@/app/(app)/dairy-cows/[id]/actions";
import { HeatEventForm } from "@/components/heat-events/HeatEventForm";
import { HeatEventRow } from "@/components/heat-events/HeatEventRow";
import { MilkRecordForm } from "@/components/milk-records/MilkRecordForm";
import { MilkRecordRow } from "@/components/milk-records/MilkRecordRow";
import { getAuthRedirect } from "@/lib/auth/guard";
import { heatStatus, nextExpectedHeatDate } from "@/lib/dairy-cows/heat-cycle";
import {
  getDairyCow,
  listHeatEventsForCow,
  listMilkRecordsForCow,
} from "@/lib/db/queries";
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

type DairyCowDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DairyCowDetailPage({
  params,
}: DairyCowDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const cow = await getDairyCow(supabase, id).catch(() => null);
  if (!cow) {
    notFound();
  }

  const records = await listMilkRecordsForCow(supabase, id);
  const heatEvents = await listHeatEventsForCow(supabase, id);

  const isActive = cow.exit_date === null;
  const boundMarkExitedAction = markDairyCowExitedAction.bind(null, id);
  const boundCreateRecordAction = createMilkRecordAction.bind(null, id);
  const boundCreateHeatEventAction = createHeatEventAction.bind(null, id);

  // Projection (spec: "Suppress projection with no events or exited
  // status") — only computed when the cow is active AND has at least one
  // heat event; `heatEvents[0]` is the most recent observation since
  // `listHeatEventsForCow` orders newest-first (DESC).
  const showHeatProjection = isActive && heatEvents.length > 0;
  const nextExpected = showHeatProjection
    ? nextExpectedHeatDate(heatEvents[0].observed_date)
    : null;
  const heatProjectionStatus = nextExpected
    ? heatStatus(nextExpected, new Date().toISOString().slice(0, 10))
    : null;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Link href="/dairy-cows" className="text-sm font-medium text-ink-muted hover:text-ink">
          ‹ Vacas lecheras
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{cow.ear_tag}</h1>
        {isActive && (
          <form action={boundMarkExitedAction}>
            <button type="submit" className="btn-secondary">
              Marcar como salida
            </button>
          </form>
        )}
      </div>

      <dl className="flex flex-col gap-2 rounded bg-surface-2 px-4 py-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Estado</dt>
          <dd>
            {isActive ? (
              <span className="chip chip-good">Activa</span>
            ) : (
              <span className="chip chip-neutral">
                Salida ({cow.exit_date})
              </span>
            )}
          </dd>
        </div>
      </dl>

      {/*
        Production history (spec: "View a cow's production history") —
        ordered newest-first (design decision: no baseline anchor row, unlike
        weight_checkins' entry_weight). A cow with zero records still shows
        this section with an empty-state message, not an error (spec
        scenario: "Zero records yet").
      */}
      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-xl">Historial de producción</h2>

        {records.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no hay registros de producción para esta vaca.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {records.map((record) => (
              <MilkRecordRow
                key={record.id}
                recordDate={record.record_date}
                liters={record.liters}
                updateAction={updateMilkRecordAction.bind(null, record.id, id)}
                deleteAction={deleteMilkRecordAction.bind(null, record.id, id)}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Registrar litros de hoy</h3>
          <MilkRecordForm
            action={boundCreateRecordAction}
            submitLabel="Registrar litros"
          />
        </div>
      </div>

      {/*
        Heat (celo) history (spec: "View a cow's heat history") — ordered
        newest-first, same rationale as production history. The projection
        (next expected date + status chip) is shown only when the cow is
        active AND has >=1 heat event (spec: "Suppress projection with no
        events or exited status") — an exited cow keeps its history but
        never shows a stale forecast.
      */}
      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Registro de celo</h2>
          {showHeatProjection && nextExpected && heatProjectionStatus && (
            <span
              className={`chip ${HEAT_STATUS_CHIP_CLASS[heatProjectionStatus]}`}
            >
              {HEAT_STATUS_LABELS[heatProjectionStatus]}: {nextExpected}
            </span>
          )}
        </div>

        {heatEvents.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no hay observaciones de celo para esta vaca.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {heatEvents.map((event) => (
              <HeatEventRow
                key={event.id}
                observedDate={event.observed_date}
                notes={event.notes}
                updateAction={updateHeatEventAction.bind(null, event.id, id)}
                deleteAction={deleteHeatEventAction.bind(null, event.id, id)}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Registrar celo observado hoy</h3>
          <HeatEventForm
            action={boundCreateHeatEventAction}
            submitLabel="Registrar celo"
          />
        </div>
      </div>
    </main>
  );
}

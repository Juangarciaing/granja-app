import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { markFatteningPigSoldAction } from "@/app/(app)/fattening-pigs/actions";
import {
  assignPigToPenAction,
  createWeightCheckinAction,
  deleteWeightCheckinAction,
  updateWeightCheckinAction,
} from "@/app/(app)/fattening-pigs/[id]/actions";
import { WeightCheckinForm } from "@/components/weight-checkins/WeightCheckinForm";
import { WeightCheckinRow } from "@/components/weight-checkins/WeightCheckinRow";
import { getAuthRedirect } from "@/lib/auth/guard";
import {
  getFatteningPig,
  listPens,
  listWeightCheckinsForPig,
} from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

type FatteningPigDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FatteningPigDetailPage({
  params,
}: FatteningPigDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const pig = await getFatteningPig(supabase, id).catch(() => null);
  if (!pig) {
    notFound();
  }

  const [checkins, pens] = await Promise.all([
    listWeightCheckinsForPig(supabase, id),
    listPens(supabase),
  ]);

  const isActive = pig.exit_date === null;
  const boundMarkSoldAction = markFatteningPigSoldAction.bind(null, id);
  const boundCreateCheckinAction = createWeightCheckinAction.bind(null, id);
  const boundAssignPigToPenAction = assignPigToPenAction.bind(null, id);
  const currentPen = pens.find((pen) => pen.id === pig.pen_id);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Link href="/fattening-pigs" className="text-sm font-medium text-ink-muted hover:text-ink">
          ‹ Cerdos de engorde
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{pig.ear_tag}</h1>
        {isActive && (
          <form action={boundMarkSoldAction}>
            <button type="submit" className="btn-secondary">
              Marcar como vendido
            </button>
          </form>
        )}
      </div>

      <dl className="flex flex-col gap-2 rounded bg-surface-2 px-4 py-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Fecha de ingreso</dt>
          <dd className="font-mono tabular-nums">{pig.entry_date}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Peso inicial</dt>
          <dd className="font-mono tabular-nums">{pig.entry_weight} kg</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Estado</dt>
          <dd>
            {isActive ? (
              <span className="chip chip-good">Activo</span>
            ) : (
              <span className="chip chip-neutral">
                Vendido ({pig.exit_date})
              </span>
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Corral</dt>
          <dd>
            {currentPen ? (
              <span className="chip chip-neutral">{currentPen.name}</span>
            ) : (
              <span className="chip chip-neutral">Sin corral</span>
            )}
          </dd>
        </div>
      </dl>

      {/*
        Pig↔pen assignment (design: "assignment surface = pig detail page
        (canonical)") — a plain select bound to `assignPigToPenAction`. The
        empty-value "Sin corral" option maps to `pen_id: null` (unassign).
      */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Asignar a corral</h2>
        <form
          action={boundAssignPigToPenAction}
          className="flex flex-wrap items-center gap-2"
        >
          <select
            name="pen_id"
            defaultValue={pig.pen_id ?? ""}
            className="rounded border border-border bg-surface-1 px-3 py-2 text-ink"
          >
            <option value="">Sin corral</option>
            {pens.map((pen) => (
              <option key={pen.id} value={pen.id}>
                {pen.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Guardar corral
          </button>
        </form>
      </div>

      {/*
        Growth curve v1 (spec: "View Weight History / Growth Curve") — a
        plain chronological table, no chart. entry_weight @ entry_date is
        always shown first (it's the pig's baseline, not a check-in row),
        followed by every recorded check-in ascending by checkin_date, each
        with its delta vs. entry_weight. A pig with zero check-ins still
        shows this baseline row with no error (spec scenario: "Pig with no
        check-ins yet").
      */}
      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-xl">Historial de pesajes</h2>

        <ul className="flex flex-col divide-y divide-border">
          <li className="py-3">
            <span className="font-mono tabular-nums text-ink">{pig.entry_date}</span>
            <p className="text-sm text-ink-muted">
              <span className="font-mono tabular-nums">{pig.entry_weight} kg</span>{" "}
              · Peso inicial
            </p>
          </li>
          {checkins.map((checkin) => (
            <WeightCheckinRow
              key={checkin.id}
              checkinDate={checkin.checkin_date}
              weight={checkin.weight}
              entryWeight={pig.entry_weight}
              updateAction={updateWeightCheckinAction.bind(null, checkin.id, id)}
              deleteAction={deleteWeightCheckinAction.bind(null, checkin.id, id)}
            />
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Registrar nuevo pesaje</h3>
          <WeightCheckinForm
            action={boundCreateCheckinAction}
            submitLabel="Registrar pesaje"
          />
        </div>
      </div>
    </main>
  );
}

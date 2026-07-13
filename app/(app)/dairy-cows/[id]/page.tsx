import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { markDairyCowExitedAction } from "@/app/(app)/dairy-cows/actions";
import {
  createMilkRecordAction,
  deleteMilkRecordAction,
  updateMilkRecordAction,
} from "@/app/(app)/dairy-cows/[id]/actions";
import { MilkRecordForm } from "@/components/milk-records/MilkRecordForm";
import { MilkRecordRow } from "@/components/milk-records/MilkRecordRow";
import { getAuthRedirect } from "@/lib/auth/guard";
import { getDairyCow, listMilkRecordsForCow } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

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

  const isActive = cow.exit_date === null;
  const boundMarkExitedAction = markDairyCowExitedAction.bind(null, id);
  const boundCreateRecordAction = createMilkRecordAction.bind(null, id);

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
    </main>
  );
}

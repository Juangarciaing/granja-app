import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateSowAction } from "@/app/(app)/sows/actions";
import { updateCounterAction, weanFarrowingAction } from "@/app/(app)/farrowings/actions";
import { PigletCounter } from "@/components/farrowings/PigletCounter";
import { SowForm } from "@/components/sows/SowForm";
import { getAuthRedirect } from "@/lib/auth/guard";
import { getSow, listFarrowingsForSow } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

type SowDetailPageProps = {
  params: Promise<{ id: string }>;
};

const FARROWING_STATUS_LABELS: Record<string, string> = {
  lactating: "Lactando",
  weaned: "Destetada",
  closed: "Cerrado",
};

const FARROWING_STATUS_CHIP_CLASS: Record<string, string> = {
  lactating: "chip-good",
  weaned: "chip-neutral",
  closed: "chip-neutral",
};

export default async function SowDetailPage({ params }: SowDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const sow = await getSow(supabase, id).catch(() => null);
  if (!sow) {
    notFound();
  }

  const farrowings = await listFarrowingsForSow(supabase, id);
  // The migration enforces at most one 'lactating' farrowing per sow at a
  // time (partial unique index), so "Registrar parto" is only offered when
  // none is currently active.
  const hasActiveFarrowing = farrowings.some((f) => f.status === "lactating");

  const boundUpdateSowAction = updateSowAction.bind(null, id);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <Link href="/sows" className="text-sm font-medium text-ink-muted hover:text-ink">
          ‹ Cerdas
        </Link>
        <h1 className="text-2xl">Editar cerda</h1>
        <div className="mt-4">
          <SowForm
            action={boundUpdateSowAction}
            defaultValues={{
              name: sow.name,
              birth_date: sow.birth_date,
              status: sow.status,
              notes: sow.notes,
            }}
            submitLabel="Guardar cambios"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Partos</h2>
          {!hasActiveFarrowing && (
            <Link href={`/sows/${id}/farrowings/new`} className="btn-primary">
              Registrar parto
            </Link>
          )}
        </div>

        {farrowings.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no hay partos registrados para esta cerda.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {farrowings.map((farrowing) => (
              <li key={farrowing.id} className="tag-card flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono tabular-nums text-ink">
                    {farrowing.farrowing_date}
                  </span>
                  <span
                    className={`chip ${FARROWING_STATUS_CHIP_CLASS[farrowing.status] ?? "chip-neutral"}`}
                  >
                    {FARROWING_STATUS_LABELS[farrowing.status] ?? farrowing.status}
                  </span>
                </div>
                <p className="text-sm text-ink-muted">
                  Nacidos vivos:{" "}
                  <span className="font-mono tabular-nums">{farrowing.born_alive}</span>
                </p>

                {farrowing.status === "lactating" ? (
                  <div className="flex flex-col gap-3">
                    <PigletCounter
                      initialCount={farrowing.current_piglets}
                      onDecrement={updateCounterAction.bind(
                        null,
                        farrowing.id,
                        id,
                      )}
                    />
                    <form
                      action={weanFarrowingAction.bind(null, farrowing.id, id)}
                    >
                      <button type="submit" className="btn-secondary">
                        Marcar como destetada
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">
                    Lechones al destete:{" "}
                    <span className="font-mono tabular-nums">
                      {farrowing.current_piglets}
                    </span>
                    {farrowing.weaning_date
                      ? ` · Destete: ${farrowing.weaning_date}`
                      : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

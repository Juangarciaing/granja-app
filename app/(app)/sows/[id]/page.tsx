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
        <h1 className="text-2xl font-semibold">Editar cerda</h1>
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

      <div className="flex flex-col gap-3 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Partos</h2>
          {!hasActiveFarrowing && (
            <Link
              href={`/sows/${id}/farrowings/new`}
              className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
            >
              Registrar parto
            </Link>
          )}
        </div>

        {farrowings.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Todavía no hay partos registrados para esta cerda.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {farrowings.map((farrowing) => (
              <li key={farrowing.id} className="flex flex-col gap-2 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{farrowing.farrowing_date}</span>
                  <span className="text-sm text-zinc-500">
                    {FARROWING_STATUS_LABELS[farrowing.status] ?? farrowing.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">
                  Nacidos vivos: {farrowing.born_alive}
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
                      <button
                        type="submit"
                        className="rounded border px-3 py-1 text-sm"
                      >
                        Marcar como destetada
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Lechones al destete: {farrowing.current_piglets}
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

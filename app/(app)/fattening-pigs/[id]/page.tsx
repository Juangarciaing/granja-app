import { notFound } from "next/navigation";

import { markFatteningPigSoldAction } from "@/app/(app)/fattening-pigs/actions";
import { getFatteningPig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

type FatteningPigDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FatteningPigDetailPage({
  params,
}: FatteningPigDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const pig = await getFatteningPig(supabase, id).catch(() => null);
  if (!pig) {
    notFound();
  }

  const isActive = pig.fecha_salida === null;
  const boundMarkSoldAction = markFatteningPigSoldAction.bind(null, id);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{pig.arete}</h1>
        {isActive && (
          <form action={boundMarkSoldAction}>
            <button type="submit" className="rounded border px-3 py-1 text-sm">
              Marcar como vendido
            </button>
          </form>
        )}
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Fecha de ingreso</dt>
          <dd>{pig.fecha_ingreso}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Peso inicial</dt>
          <dd>{pig.peso_inicial} kg</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Estado</dt>
          <dd>{isActive ? "Activo" : `Vendido (${pig.fecha_salida})`}</dd>
        </div>
      </dl>

      {/*
        Weight check-in history/growth curve (weight_checkins CRUD + this
        section's UI) lands in PR2 — see Engram sdd/control-peso-engorde/tasks
        Phase 3/4. Left as a placeholder so this page's layout doesn't need
        to change shape when that lands.
      */}
      <div className="flex flex-col gap-2 border-t pt-6">
        <h2 className="text-xl font-semibold">Historial de pesajes</h2>
        <p className="text-sm text-zinc-500">Próximamente.</p>
      </div>
    </main>
  );
}

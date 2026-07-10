import Link from "next/link";

import { listActiveFatteningPigs } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

export default async function FatteningPigsPage() {
  const supabase = await createClient();
  const pigs = await listActiveFatteningPigs(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cerdos de engorde</h1>
        <Link
          href="/fattening-pigs/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
        >
          Registrar cerdo
        </Link>
      </div>

      {pigs.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Todavía no hay cerdos de engorde registrados.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {pigs.map((pig) => (
            <li key={pig.id} className="flex items-center justify-between py-3">
              <div>
                <Link
                  href={`/fattening-pigs/${pig.id}`}
                  className="font-medium hover:underline"
                >
                  {pig.ear_tag}
                </Link>
                <p className="text-sm text-zinc-500">
                  Ingreso: {pig.entry_date} · Peso inicial: {pig.entry_weight} kg
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

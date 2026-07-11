import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthRedirect } from "@/lib/auth/guard";
import { listActiveFatteningPigs } from "@/lib/db/queries";
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

  const pigs = await listActiveFatteningPigs(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
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
          {pigs.map((pig) => (
            <li key={pig.id} className="tag-card">
              <Link
                href={`/fattening-pigs/${pig.id}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="font-display text-lg">{pig.ear_tag}</span>
                <span className="font-mono text-sm tabular-nums text-ink-muted">
                  {pig.entry_date} · {pig.entry_weight} kg
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

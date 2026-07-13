import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthRedirect } from "@/lib/auth/guard";
import { listActiveDairyCows } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export default async function DairyCowsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const cows = await listActiveDairyCows(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Vacas lecheras</h1>
        <Link href="/dairy-cows/new" className="btn-primary">
          Registrar vaca
        </Link>
      </div>

      {cows.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Todavía no hay vacas lecheras registradas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cows.map((cow) => (
            <li key={cow.id} className="tag-card">
              <Link
                href={`/dairy-cows/${cow.id}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="font-display text-lg">{cow.ear_tag}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

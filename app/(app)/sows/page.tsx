import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthRedirect } from "@/lib/auth/guard";
import { listSows } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  sold: "Vendida",
  culled: "Descartada",
  dead: "Muerta",
};

export default async function SowsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const sows = await listSows(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cerdas</h1>
        <Link
          href="/sows/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
        >
          Registrar cerda
        </Link>
      </div>

      {sows.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Todavía no hay cerdas registradas.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {sows.map((sow) => (
            <li key={sow.id} className="flex items-center justify-between py-3">
              <div>
                <Link
                  href={`/sows/${sow.id}`}
                  className="font-medium hover:underline"
                >
                  {sow.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {STATUS_LABELS[sow.status] ?? sow.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

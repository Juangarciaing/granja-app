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

const STATUS_CHIP_CLASS: Record<string, string> = {
  active: "chip-good",
  sold: "chip-neutral",
  culled: "chip-warn",
  dead: "chip-warn",
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
      <Link href="/" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Cerdas</h1>
        <Link href="/sows/new" className="btn-primary">
          Registrar cerda
        </Link>
      </div>

      {sows.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Todavía no hay cerdas registradas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sows.map((sow) => (
            <li key={sow.id} className="tag-card">
              <Link
                href={`/sows/${sow.id}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="font-display text-lg">{sow.name}</span>
                <span className={`chip ${STATUS_CHIP_CLASS[sow.status] ?? "chip-neutral"}`}>
                  {STATUS_LABELS[sow.status] ?? sow.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

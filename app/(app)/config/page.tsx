import Link from "next/link";
import { redirect } from "next/navigation";

import { updateConfigAction } from "@/app/(app)/config/actions";
import { ConfigForm } from "@/components/config/ConfigForm";
import { getAuthRedirect } from "@/lib/auth/guard";
import { getFeedingConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

/**
 * Edit page for the singleton `feeding_config` row. No "create" state to
 * render — PR1's auto-provisioning trigger guarantees the row already
 * exists by the time an authenticated user reaches this page.
 *
 * Same explicit guard as the dashboard page and for the same reason: RSC can
 * start this page's data-fetch concurrently with the (app) layout's
 * redirect(), and an unauthenticated getFeedingConfig() would hit an
 * RLS-empty row and throw PGRST116 before the redirect wins.
 */
export default async function ConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const config = await getFeedingConfig(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>
      <h1 className="text-2xl">Configuración de alimento</h1>
      <p className="text-sm text-ink-muted">
        Estos valores se usan para calcular el alimento diario de todas las
        cerdas lactando: ración base + (alimento por lechón × lechones
        vivos).
      </p>
      <ConfigForm
        action={updateConfigAction}
        defaultValues={{
          base_kg: config.base_kg,
          kg_per_piglet: config.kg_per_piglet,
        }}
      />
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { updateConfigAction, updateSaleWeightConfigAction } from "@/app/(app)/config/actions";
import { ConfigForm } from "@/components/config/ConfigForm";
import { SaleWeightConfigForm } from "@/components/config/SaleWeightConfigForm";
import { getAuthRedirect } from "@/lib/auth/guard";
import { getFeedingConfig, getSaleWeightConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

/**
 * Edit page hosting both singleton config rows: `feeding_config` (module 1)
 * and `sale_weight_config` (module 5). No "create" state for either — both
 * rows are guaranteed to already exist by the time an authenticated user
 * reaches this page (auto-provisioning triggers + migration 0006's backfill
 * for existing accounts). Each section owns an independent form/server
 * action pair (spec: "Config Page Hosts Both Settings Groups") — submitting
 * one never touches the other's values.
 *
 * Same explicit guard as the dashboard page and for the same reason: RSC can
 * start this page's data-fetch concurrently with the (app) layout's
 * redirect(), and an unauthenticated getFeedingConfig()/getSaleWeightConfig()
 * would hit an RLS-empty row and throw PGRST116 before the redirect wins.
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

  const [config, saleWeightConfig] = await Promise.all([
    getFeedingConfig(supabase),
    getSaleWeightConfig(supabase),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <Link href="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Inicio
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">Configuración</h1>
        <p className="text-sm text-ink-muted">
          Ajustes generales de la granja: alimento de lactancia y peso
          objetivo de venta para engorde.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Alimento lactancia</h2>
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
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Peso objetivo de venta</h2>
        <p className="text-sm text-ink-muted">
          Los cerdos de engorde cuyo último peso registrado alcance este
          objetivo se marcan como listos para vender.
        </p>
        <SaleWeightConfigForm
          action={updateSaleWeightConfigAction}
          defaultValues={{
            target_weight_kg: saleWeightConfig.target_weight_kg,
          }}
        />
      </section>
    </main>
  );
}

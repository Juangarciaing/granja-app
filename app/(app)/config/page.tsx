import { updateConfigAction } from "@/app/(app)/config/actions";
import { ConfigForm } from "@/components/config/ConfigForm";
import { getFeedingConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

/**
 * Edit page for the singleton `feeding_config` row. No "create" state to
 * render — PR1's auto-provisioning trigger guarantees the row already
 * exists by the time an authenticated user reaches this page.
 */
export default async function ConfigPage() {
  const supabase = await createClient();
  const config = await getFeedingConfig(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Configuración de alimento</h1>
      <p className="text-sm text-zinc-500">
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

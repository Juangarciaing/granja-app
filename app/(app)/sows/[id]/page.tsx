import { notFound } from "next/navigation";

import { updateSowAction } from "@/app/(app)/sows/actions";
import { SowForm } from "@/components/sows/SowForm";
import { getSow } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

type SowDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SowDetailPage({ params }: SowDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const sow = await getSow(supabase, id).catch(() => null);
  if (!sow) {
    notFound();
  }

  const boundUpdateSowAction = updateSowAction.bind(null, id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
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
    </main>
  );
}

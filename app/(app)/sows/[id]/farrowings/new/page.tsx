import { notFound } from "next/navigation";

import { createFarrowingAction } from "@/app/(app)/farrowings/actions";
import { FarrowingForm } from "@/components/farrowings/FarrowingForm";
import { getSow } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

type NewFarrowingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewFarrowingPage({
  params,
}: NewFarrowingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const sow = await getSow(supabase, id).catch(() => null);
  if (!sow) {
    notFound();
  }

  const boundCreateFarrowingAction = createFarrowingAction.bind(null, id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Registrar parto — {sow.name}</h1>
      <FarrowingForm action={boundCreateFarrowingAction} />
    </main>
  );
}

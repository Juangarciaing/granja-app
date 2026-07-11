import Link from "next/link";
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
      <Link href={`/sows/${id}`} className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ {sow.name}
      </Link>
      <h1 className="text-2xl">
        Registrar parto — <span className="font-display">{sow.name}</span>
      </h1>
      <FarrowingForm action={boundCreateFarrowingAction} />
    </main>
  );
}

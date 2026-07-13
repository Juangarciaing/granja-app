import Link from "next/link";

import { createDairyCowAction } from "@/app/(app)/dairy-cows/actions";
import { DairyCowForm } from "@/components/dairy-cows/DairyCowForm";

export default function NewDairyCowPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/dairy-cows" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Vacas lecheras
      </Link>
      <h1 className="text-2xl">Registrar vaca lechera</h1>
      <DairyCowForm action={createDairyCowAction} submitLabel="Registrar" />
    </main>
  );
}

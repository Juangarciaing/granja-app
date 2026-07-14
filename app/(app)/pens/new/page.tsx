import Link from "next/link";

import { createPenAction } from "@/app/(app)/pens/actions";
import { PenForm } from "@/components/pens/PenForm";

export default function NewPenPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/pens" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Corrales
      </Link>
      <h1 className="text-2xl">Crear corral</h1>
      <PenForm action={createPenAction} submitLabel="Crear corral" />
    </main>
  );
}

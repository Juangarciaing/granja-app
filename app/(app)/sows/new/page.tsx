import Link from "next/link";

import { createSowAction } from "@/app/(app)/sows/actions";
import { SowForm } from "@/components/sows/SowForm";

export default function NewSowPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/sows" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Cerdas
      </Link>
      <h1 className="text-2xl">Registrar cerda</h1>
      <SowForm action={createSowAction} submitLabel="Registrar" />
    </main>
  );
}

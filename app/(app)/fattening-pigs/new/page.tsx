import Link from "next/link";

import { createFatteningPigAction } from "@/app/(app)/fattening-pigs/actions";
import { FatteningPigForm } from "@/components/fattening-pigs/FatteningPigForm";

export default function NewFatteningPigPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/fattening-pigs" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Cerdos de engorde
      </Link>
      <h1 className="text-2xl">Registrar cerdo de engorde</h1>
      <FatteningPigForm action={createFatteningPigAction} submitLabel="Registrar" />
    </main>
  );
}

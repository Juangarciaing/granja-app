import { createSowAction } from "@/app/(app)/sows/actions";
import { SowForm } from "@/components/sows/SowForm";

export default function NewSowPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Registrar cerda</h1>
      <SowForm action={createSowAction} submitLabel="Registrar" />
    </main>
  );
}

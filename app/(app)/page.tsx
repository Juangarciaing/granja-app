import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Granja</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sesión iniciada como {user?.email ?? "usuario"}.
      </p>
      <p className="text-sm text-zinc-500">
        El resumen de cerdas, partos y alimento diario se agrega en las
        siguientes fases del proyecto.
      </p>
    </main>
  );
}

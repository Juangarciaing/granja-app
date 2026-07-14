import { redirect } from "next/navigation";
import Link from "next/link";

import { createFatteningPigAction } from "@/app/(app)/fattening-pigs/actions";
import { FatteningPigForm } from "@/components/fattening-pigs/FatteningPigForm";
import { getAuthRedirect } from "@/lib/auth/guard";
import { listPens } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export default async function NewFatteningPigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Explicit guard (same race-condition rationale as the dashboard page):
  // this page now fetches `pens` for the optional pen select, so it can no
  // longer rely solely on the (app) layout's redirect().
  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  const pens = await listPens(supabase);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/fattening-pigs" className="text-sm font-medium text-ink-muted hover:text-ink">
        ‹ Cerdos de engorde
      </Link>
      <h1 className="text-2xl">Registrar cerdo de engorde</h1>
      <FatteningPigForm
        action={createFatteningPigAction}
        submitLabel="Registrar"
        pens={pens}
      />
    </main>
  );
}

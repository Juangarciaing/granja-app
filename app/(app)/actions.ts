"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Ends the current session and sends the user back to /login. Lives at the
 * (app) route-group root since every authenticated page should be able to
 * log out, not just the dashboard.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

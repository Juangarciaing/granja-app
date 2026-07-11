import { redirect } from "next/navigation";

import { getAuthRedirect } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = getAuthRedirect(user, LOGIN_PATH);
  if (redirectTo) {
    redirect(redirectTo);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface-0 text-ink">
      {children}
    </div>
  );
}

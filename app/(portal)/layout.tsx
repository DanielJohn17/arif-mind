import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUserProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentUserProfile();

  if (isSupabaseConfigured() && !profile) {
    redirect("/");
  }

  return (
    <AppShell
      userName={profile?.full_name ?? "Demo User"}
      role={profile?.role ?? "admin"}
    >
      {children}
    </AppShell>
  );
}

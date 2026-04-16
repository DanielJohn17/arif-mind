 "use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, Compass, LayoutDashboard, Map, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
  { href: "/lessons", label: "Lessons", icon: Compass },
  { href: "/localization", label: "Localization", icon: Map },
  { href: "/experts", label: "Expert Finder", icon: Users },
];

type AppShellProps = {
  children: React.ReactNode;
  userName?: string;
  role?: string;
};

export function AppShell({
  children,
  userName = "Demo User",
  role = "admin",
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen w-full flex-col gap-6 px-4 py-4 md:px-6 lg:flex-row lg:px-8">
        <aside className="w-full lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72">
          <Card className="h-full border-white/50 bg-sidebar text-sidebar-foreground shadow-2xl shadow-black/10">
            <CardContent className="flex h-full flex-col gap-6 p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-sidebar-foreground/60">
                      ArifPay
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">ArifMind</h1>
                  </div>
                  <div className="size-11 rounded-2xl bg-linear-to-br from-[#1f8f4d] via-[#f0c837] to-[#da3a32]" />
                </div>
                <p className="text-sm text-sidebar-foreground/70">
                  Internal intelligence for API docs, field insights, localization, and operational learning.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium">{userName}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="bg-[#1f8f4d]/20 text-[#97f0b5] hover:bg-[#1f8f4d]/20">
                    {role.replace("_", " ")}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="border-0 bg-white/10 text-sidebar-foreground"
                  >
                    Demo mode ready
                  </Badge>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-white text-sidebar shadow-lg"
                          : "text-sidebar-foreground/75 hover:bg-white/8 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Bell className="size-4 text-[#f0c837]" />
                    Weekly pulse
                  </div>
                  <p className="mt-2 text-sm text-sidebar-foreground/70">
                    Most repeated question this week: settlement callback verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    buttonVariants(),
                    "h-11 w-full bg-white text-sidebar hover:bg-white/90"
                  )}
                >
                  Log out
                </button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-6 py-1">
          {children}
        </main>
      </div>
    </div>
  );
}

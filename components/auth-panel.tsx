"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

type AuthPanelProps = {
  theme?: "light" | "dark";
};

export function AuthPanel({ theme = "dark" }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const isLightMode = theme === "light";

  const badgeTone = isLightMode
    ? "bg-[#e7efff] text-[#0f6fff] hover:bg-[#e7efff]"
    : "bg-white/10 text-white hover:bg-white/10";
  const headingTone = isLightMode ? "text-[#0f172a]" : "text-white";
  const subTone = isLightMode ? "text-[#475569]" : "text-white/80";
  const cardTone = isLightMode
    ? "border-white bg-white text-[#0f172a]"
    : "border-white/10 bg-white/10 text-white";
  const inputTone = isLightMode
    ? "border-[#e2e8f0] bg-white text-[#0f172a] placeholder:text-[#94a3b8]"
    : "border-white/20 bg-white/10 text-white placeholder:text-white/70";
  const buttonTone = isLightMode
    ? "bg-[#0f6fff] text-white hover:bg-[#0b5bd1]"
    : "bg-white text-[#0f6fff] hover:bg-white/90";
  const infoCardTone = isLightMode
    ? "border-white bg-white text-[#0f172a]"
    : "border-white/10 bg-white/5 text-white";
  const infoTextTone = isLightMode ? "text-[#64748b]" : "text-white/70";
  const infoBadgeTone = isLightMode
    ? "bg-[#eef2ff] text-[#3b4cca] hover:bg-[#eef2ff]"
    : "bg-white/10 text-white hover:bg-white/10";

  async function handleSignInWithPassword() {
    if (!isSupabaseConfigured()) {
      setMessage("Supabase env vars are missing, so ArifMind is currently running in demo mode.");
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase client is unavailable.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);
    setMessage(
      error
        ? error.message
        : "Signed in successfully. Redirecting to the portal..."
    );

    if (!error) {
      // Portal routes are protected by `[app/(portal)/layout.tsx]` and redirect to `/login`
      // when profile lookup fails. After signing in, force a refresh so cookies are used.
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setMessage("Signed out. Refresh the page if you want to test the login gate again.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center space-y-6">
          <Badge className={cn("w-fit", badgeTone)}>Authentication</Badge>
          <div className="space-y-3">
            <h1 className={cn("text-4xl font-semibold tracking-tight", headingTone)}>
              Hello!
            </h1>
            <p className={cn("text-sm", subTone)}>
              Sign in with your ArifPay credentials to access operational knowledge, lessons, and
              expert insights.
            </p>
          </div>
          <Card className={cn("shadow-2xl shadow-black/20", cardTone)}>
            <CardContent className="space-y-4 p-6">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                className={cn("h-11 rounded-full", inputTone)}
              />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className={cn("h-11 rounded-full", inputTone)}
              />
              <Button
                onClick={handleSignInWithPassword}
                disabled={isLoading || !email || !password}
                className={cn("h-11 w-full rounded-full", buttonTone)}
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
              <button
                type="button"
                onClick={handleSignOut}
                className={cn("text-left text-xs", isLightMode ? "text-[#64748b] hover:text-[#0f172a]" : "text-white/70 hover:text-white")}
              >
                Sign out
              </button>
              {message ? <p className={cn("text-xs", infoTextTone)}>{message}</p> : null}
            </CardContent>
          </Card>
        </div>

        <Card className={cn("shadow-2xl shadow-black/15", infoCardTone)}>
          <CardHeader>
            <CardTitle>Prototype security model</CardTitle>
            <CardDescription className={infoTextTone}>
              Authenticated users can read knowledge, while admins manage publishing and edits.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-4 text-sm leading-6", isLightMode ? "text-[#0f172a]" : "text-white/85")}>
            <div className={cn("flex items-center gap-3 rounded-2xl p-4", isLightMode ? "border border-[#e2e8f0] bg-[#f8fafc]" : "border border-white/10 bg-white/5")}>
              <ShieldCheck className={cn("size-5", isLightMode ? "text-[#0f6fff]" : "text-[#f0c837]")} />
              `admin`, `employee`, and `field_agent` roles are enforced through RLS policies.
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={infoBadgeTone}>Supabase Auth</Badge>
              <Badge className={infoBadgeTone}>RLS</Badge>
              <Badge className={infoBadgeTone}>Email + password</Badge>
            </div>
            <p className={infoTextTone}>
              If environment variables are not present, the portal still renders with seeded demo data so stakeholders can review the experience immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

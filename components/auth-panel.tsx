"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleMagicLink() {
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });

    setIsLoading(false);
    setMessage(
      error
        ? "Magic link could not be sent. Confirm the auth provider and redirect URL in Supabase."
        : "Magic link sent. Check your inbox to continue."
    );
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setMessage("Signed out. Refresh the page if you want to test the login gate again.");
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Authentication"
        title="Supabase auth for employees and field agents."
        description="Use magic-link sign-in for the prototype. Roles and row-level security are driven from the `profiles` table in Supabase."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Magic link sign-in</CardTitle>
            <CardDescription>
              This prototype expects Supabase email auth with a valid redirect URL configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@arifpay.com"
              className="h-11 rounded-xl"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleMagicLink}
                disabled={isLoading || !email}
                className="h-11 rounded-xl"
              >
                {isLoading ? "Sending..." : "Send magic link"}
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="h-11 rounded-xl">
                Sign out
              </Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-[#151d2f] text-white shadow-2xl shadow-black/15">
          <CardHeader>
            <CardTitle>Prototype security model</CardTitle>
            <CardDescription className="text-white/70">
              Authenticated users can read knowledge, while admins manage publishing and edits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-white/85">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="size-5 text-[#1f8f4d]" />
              `admin`, `employee`, and `field_agent` roles are enforced through RLS policies.
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/10">Supabase Auth</Badge>
              <Badge className="bg-white/10 text-white hover:bg-white/10">RLS</Badge>
              <Badge className="bg-white/10 text-white hover:bg-white/10">Magic link</Badge>
            </div>
            <p className="text-white/70">
              If environment variables are not present, the portal still renders with seeded demo data so stakeholders can review the experience immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

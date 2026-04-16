"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
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
    ? "bg-primary/10 text-primary hover:bg-primary/10"
    : "bg-white/10 text-white hover:bg-white/10";
  const headingTone = isLightMode ? "text-foreground" : "text-white";
  const subTone = isLightMode ? "text-muted-foreground" : "text-white/80";
  const cardTone = isLightMode
    ? "border-white bg-white text-foreground"
    : "border-white/10 bg-white/10 text-white";
  const inputTone = isLightMode
    ? "border-input bg-white text-foreground placeholder:text-muted-foreground"
    : "border-white/20 bg-white/10 text-white placeholder:text-white/70";
  const buttonTone = isLightMode
    ? "bg-primary text-primary-foreground hover:bg-primary/90"
    : "bg-white text-primary hover:bg-white/90";
  const infoTextTone = isLightMode ? "text-muted-foreground" : "text-white/70";

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

  return (
    <div className="space-y-6">
      <div className="flex h-full flex-col justify-center space-y-6">
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && email && password && !isLoading) {
                  handleSignInWithPassword();
                }
              }}
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className={cn("h-11 rounded-full", inputTone)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && email && password && !isLoading) {
                  handleSignInWithPassword();
                }
              }}
            />
            <Button
              onClick={handleSignInWithPassword}
              disabled={isLoading || !email || !password}
              className={cn("h-11 w-full rounded-full", buttonTone)}
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
            {message ? <p className={cn("text-xs", infoTextTone)}>{message}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "API intelligence, instantly",
    description:
      "Ask product and integration questions in plain language and get grounded answers with clear request snippets.",
    icon: Sparkles,
  },
  {
    title: "Lessons that prevent repeats",
    description:
      "Capture incidents with root causes and prevention steps so engineering and operations move faster together.",
    icon: ShieldCheck,
  },
  {
    title: "Field knowledge on-demand",
    description:
      "Surface localization insights, merchant behavior, and expert context right when teams need it most.",
    icon: BookOpen,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#1f8f4d]/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-[380px] w-[380px] rounded-full bg-[#f0c837]/20 blur-3xl" />
          <div className="absolute bottom-0 right-[-180px] h-[460px] w-[460px] rounded-full bg-[#2f6fed]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-6">
            <Badge className="w-fit bg-[#e8f6ee] text-[#1f8f4d] hover:bg-[#e8f6ee]">
              Knowledge command center
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
              ArifMind turns operational knowledge into decisive action.
            </h1>
            <p className="text-lg text-[#475569]">
              Give teams a single source for API guidance, incident learnings, and field insights.
              Stay aligned across engineering, operations, and support with real-time, grounded answers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className={cn(
                  buttonVariants(),
                  "h-11 rounded-xl bg-[#0f6fff] px-6 text-white hover:bg-[#095fd6]"
                )}
              >
                Log in to ArifMind
              </Link>
              <Link
                href="/wiki"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 rounded-xl border-[#cbd5f5] px-6 text-[#1e3a8a] hover:bg-white"
                )}
              >
                Explore the wiki
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#64748b]">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#1f8f4d]" />
                API workflows grounded in ArifPay specs
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#f0c837]" />
                Incident learnings, searchable by tags
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#2f6fed]" />
                Localization insights for field teams
              </span>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-lg">
              <Image
                src="/hero1.png"
                alt="ArifMind dashboard preview"
                width={820}
                height={560}
                className="rounded-3xl border border-white/70 shadow-2xl shadow-black/10"
                priority
              />
              <Image
                src="/hero2.png"
                alt="ArifMind API assistant preview"
                width={520}
                height={360}
                className="absolute -bottom-14 -left-10 hidden rounded-2xl border border-white/70 shadow-xl shadow-black/10 lg:block"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="border-white/80 bg-white/90 shadow-lg shadow-black/5"
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e8f6ee] text-[#1f8f4d]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#0f172a]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#64748b]">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-[#0b1121] p-6 text-white shadow-2xl shadow-black/15">
            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#2f6fed]/40 blur-3xl" />
            <div className="relative space-y-4">
              <Badge className="bg-white/10 text-white hover:bg-white/10">Product tour</Badge>
              <h3 className="text-2xl font-semibold">See how teams move faster with ArifMind.</h3>
              <p className="text-sm leading-6 text-white/70">
                From API onboarding to field troubleshooting, ArifMind keeps every decision grounded
                in the right context. Use real-time lessons learned to cut repeat incidents and
                shorten escalation loops.
              </p>
              <Image
                src="/hero3.png"
                alt="Lessons learned preview"
                width={720}
                height={480}
                className="rounded-2xl border border-white/10 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { ArrowRight, BookOpen, Globe2, Lightbulb, Search, Users } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getDashboardMetrics,
  getExpertProfiles,
  getLessonsLearned,
  getLocalizationEntries,
  getWikiArticles,
} from "@/lib/data";

const quickLinks = [
  {
    href: "/wiki",
    title: "Searchable Wiki",
    description: "Browse API docs, runbooks, and manuals without chasing people in Slack.",
    icon: BookOpen,
  },
  {
    href: "/lessons",
    title: "Lessons Learned",
    description: "Capture incidents, RCA details, and prevention steps in one place.",
    icon: Lightbulb,
  },
  {
    href: "/localization",
    title: "Localization Vault",
    description: "Filter regional language and merchant behavior insights for Ethiopia.",
    icon: Globe2,
  },
  {
    href: "/experts",
    title: "Expert Finder",
    description: "Find the teammate with the exact superpower you need right now.",
    icon: Users,
  },
];

export default async function DashboardPage() {
  const [metrics, lessons, entries, experts, articles] = await Promise.all([
    getDashboardMetrics(),
    getLessonsLearned(),
    getLocalizationEntries(),
    getExpertProfiles(),
    getWikiArticles(),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Knowledge command center"
        title="ArifMind keeps the right answers close."
        description="A professional, mobile-friendly portal for operational knowledge, engineering lessons, regional localization intelligence, and fast expert discovery across ArifPay."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/wiki"
              className={cn(buttonVariants(), "h-11 rounded-xl px-5")}
            >
              <Search className="size-4" />
              Search knowledge
            </Link>
            <Link
              href="/lessons"
              className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-xl px-5")}
            >
              Log a lesson
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Core capabilities</CardTitle>
            <CardDescription>
              The four highest-value knowledge workflows for the prototype.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border/70 bg-muted/30 p-4 transition-transform hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </a>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-[#151d2f] text-white shadow-2xl shadow-black/15">
          <CardHeader>
            <CardTitle>Executive pulse</CardTitle>
            <CardDescription className="text-white/70">
              A fast summary of this month&apos;s most relevant knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-white/85">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium">Most common weakness</p>
              <p className="mt-2">
                Incident patterns still cluster around callback reliability and settlement retries,
                especially during regional volume spikes.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-medium">Top field insight</p>
              <p className="mt-2">
                Localization succeeds fastest when field onboarding scripts match the merchant&apos;s
                preferred language and explain offline behavior clearly.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Featured wiki assets</CardTitle>
            <CardDescription>Knowledge that gets referenced most often.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {articles.slice(0, 3).map((article) => (
              <div key={article.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {article.audience}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Open technical attention</CardTitle>
            <CardDescription>Incidents still needing focus or monitoring.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.slice(0, 3).map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      lesson.severity === "Critical"
                        ? "bg-[#da3a32]/10 text-[#da3a32] hover:bg-[#da3a32]/10"
                        : "bg-[#f0c837]/15 text-[#9a7700] hover:bg-[#f0c837]/15"
                    }
                  >
                    {lesson.severity}
                  </Badge>
                  <Badge variant="outline">{lesson.status}</Badge>
                </div>
                <h3 className="mt-3 font-semibold">{lesson.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.rootCause}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Available experts</CardTitle>
            <CardDescription>Who can unblock a team right away.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {experts.slice(0, 3).map((expert) => (
              <div key={expert.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{expert.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {expert.role} · {expert.team}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {expert.availability}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expert.superpowers.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle>Localization coverage snapshot</CardTitle>
          <CardDescription>
            Regional knowledge entries currently available for field and product teams.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{entry.region}</h3>
                <Badge variant="outline">{entry.reviewStatus}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{entry.primaryLanguage}</p>
              <p className="mt-3 text-sm leading-6">{entry.transactionBehavior}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

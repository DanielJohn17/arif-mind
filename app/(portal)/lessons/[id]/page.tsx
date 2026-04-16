import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getLessonLearnedById } from "@/lib/data";
import { cn } from "@/lib/utils";
import { LessonExplainer } from "@/components/lesson-explainer";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const lesson = await getLessonLearnedById(resolvedParams.id);

  if (!lesson) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/lessons"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
        >
          <ArrowLeft className="size-4" />
          Back to Lessons
        </Link>
      </div>

      <div className="rounded-3xl border border-border/70 bg-white/90 p-6 md:p-10 shadow-lg shadow-black/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
            <p className="text-lg text-muted-foreground">
              {lesson.productArea} · Owner: {lesson.owner}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                lesson.severity === "Critical"
                  ? "bg-[#da3a32]/10 text-[#da3a32] hover:bg-[#da3a32]/10 text-sm py-1 px-3"
                  : lesson.severity === "High"
                    ? "bg-[#f0c837]/15 text-[#9a7700] hover:bg-[#f0c837]/15 text-sm py-1 px-3"
                    : "bg-primary/10 text-primary hover:bg-primary/10 text-sm py-1 px-3"
              }
            >
              {lesson.severity} Severity
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">{lesson.status}</Badge>
          </div>
        </div>

        {lesson.tags && lesson.tags.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {lesson.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-center gap-3 text-lg font-semibold text-destructive">
              <AlertTriangle className="size-5" />
              Root Cause
            </div>
            <p className="mt-4 text-base leading-7 text-foreground">{lesson.rootCause}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-3 text-lg font-semibold text-primary">
              <CheckCircle2 className="size-5" />
              Immediate Fix
            </div>
            <p className="mt-4 text-base leading-7 text-foreground">
              {lesson.immediateFix}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#151d2f] p-6 text-white md:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Sparkles className="size-5 text-[#f0c837]" />
              Prevention & Expert Advice
            </div>
            <LessonExplainer lesson={lesson} />
          </div>
          
          <div className="mt-6 space-y-6 text-white/90">
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-white/50 mb-2">Prevention Strategy</h4>
              <p className="text-base leading-7">{lesson.prevention}</p>
            </div>
            <div className="h-px w-full bg-white/10" />
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-white/50 mb-2">Expert Advice</h4>
              <p className="text-base leading-7">{lesson.expertAdvice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
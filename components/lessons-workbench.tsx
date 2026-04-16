"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LessonLearned } from "@/lib/types";

type LessonsWorkbenchProps = {
  initialLessons: LessonLearned[];
};

type LessonFormValues = {
  title: string;
  productArea: string;
  severity: LessonLearned["severity"];
  rootCause: string;
  immediateFix: string;
  prevention: string;
  expertAdvice: string;
};

export function LessonsWorkbench({ initialLessons }: LessonsWorkbenchProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<LessonFormValues>({
    defaultValues: {
      severity: "Medium",
    },
  });

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const statusMatch = statusFilter === "All" || lesson.status === statusFilter;
      const severityMatch = severityFilter === "All" || lesson.severity === severityFilter;

      return statusMatch && severityMatch;
    });
  }, [lessons, severityFilter, statusFilter]);

  const onSubmit = handleSubmit(async (values) => {
    const optimisticLesson: LessonLearned = {
      id: crypto.randomUUID(),
      title: values.title,
      status: "Open",
      severity: values.severity,
      productArea: values.productArea,
      owner: "Current User",
      rootCause: values.rootCause,
      immediateFix: values.immediateFix,
      prevention: values.prevention,
      expertAdvice: values.expertAdvice,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();

      if (supabase) {
        const { error } = await supabase.from("lessons_learned").insert({
          title: optimisticLesson.title,
          status: optimisticLesson.status,
          severity: optimisticLesson.severity,
          product_area: optimisticLesson.productArea,
          owner: optimisticLesson.owner,
          root_cause: optimisticLesson.rootCause,
          immediate_fix: optimisticLesson.immediateFix,
          prevention: optimisticLesson.prevention,
          expert_advice: optimisticLesson.expertAdvice,
        });

        if (error) {
          setSubmitMessage("Supabase is configured, but the lesson could not be saved yet.");
          return;
        }
      }
    }

    setLessons((current) => [optimisticLesson, ...current]);
    setSubmitMessage(
      isSupabaseConfigured()
        ? "Lesson captured and sent to Supabase."
        : "Lesson captured in demo mode. Add Supabase env vars to persist it."
    );
    reset({ severity: "Medium" });
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Technical lessons learned"
        title="Capture incidents before they become repeat mistakes."
        description="Log root causes, immediate fixes, prevention steps, and expert advice in a format engineering and operations can both reuse."
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Log a technical lesson</CardTitle>
            <CardDescription>
              Use the same structure every time: issue, root cause, fix, prevention, and expert notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input {...register("title", { required: true })} placeholder="Incident title" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("productArea", { required: true })}
                  placeholder="Product area"
                />
                <select
                  {...register("severity")}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <Textarea
                {...register("rootCause", { required: true })}
                placeholder="Root cause"
                className="min-h-24"
              />
              <Textarea
                {...register("immediateFix", { required: true })}
                placeholder="Immediate fix"
                className="min-h-24"
              />
              <Textarea
                {...register("prevention", { required: true })}
                placeholder="Prevention for next time"
                className="min-h-24"
              />
              <Textarea
                {...register("expertAdvice", { required: true })}
                placeholder="Expert advice and insight"
                className="min-h-24"
              />
              <Button type="submit" className="h-11 w-full rounded-xl" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Saving lesson..." : "Save lesson"}
              </Button>
              {submitMessage ? (
                <p className="text-sm text-muted-foreground">{submitMessage}</p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lessons log</CardTitle>
                <CardDescription>
                  Filter by severity and status to focus current engineering attention.
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>Resolved</option>
                  <option>Monitoring</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
                >
                  <option>All</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lesson.productArea} · {lesson.owner}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="size-4 text-[#da3a32]" />
                      Root cause
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.rootCause}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="size-4 text-primary" />
                      Immediate fix
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {lesson.immediateFix}
                    </p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-[#151d2f] p-4 text-sm leading-6 text-white/85">
                  <div className="flex items-center gap-2 font-medium text-white">
                    <Sparkles className="size-4 text-[#f0c837]" />
                    Prevention and expert advice
                  </div>
                  <p className="mt-2">{lesson.prevention}</p>
                  <p className="mt-2 text-white/70">{lesson.expertAdvice}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

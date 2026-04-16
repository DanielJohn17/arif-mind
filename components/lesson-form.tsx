"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LessonLearned } from "@/lib/types";

type LessonFormValues = {
  title: string;
  productArea: string;
  severity: LessonLearned["severity"];
  rootCause: string;
  immediateFix: string;
  prevention: string;
  expertAdvice: string;
  tags: string;
};

export function LessonForm() {
  const router = useRouter();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState, control } = useForm<LessonFormValues>({
    defaultValues: {
      severity: "Medium",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const optimisticLesson: Partial<LessonLearned> = {
      title: values.title,
      status: "Open",
      severity: values.severity,
      productArea: values.productArea,
      owner: "Current User",
      rootCause: values.rootCause,
      immediateFix: values.immediateFix,
      prevention: values.prevention,
      expertAdvice: values.expertAdvice,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
          tags: optimisticLesson.tags,
        });

        if (error) {
          setSubmitMessage("Supabase is configured, but the lesson could not be saved yet.");
          return;
        }
      }
    }

    // Since we're navigating back to the list, we can just redirect.
    // In a real app, you might want to show a toast message or revalidate the path.
    router.push("/lessons");
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SectionHeading
        eyebrow="Technical lessons learned"
        title="Log a technical lesson"
        description="Capture incidents before they become repeat mistakes. Use the same structure every time: issue, root cause, fix, prevention, and expert notes."
      />

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>
            Provide detailed insights so engineering and operations can easily reuse them.
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
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-10 rounded-xl bg-background w-full">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Input
              {...register("tags")}
              placeholder="Tags (comma separated)"
            />
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
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => router.push("/lessons")}>
                Cancel
              </Button>
              <Button type="submit" className="h-11 flex-1 rounded-xl" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Saving lesson..." : "Save lesson"}
              </Button>
            </div>
            {submitMessage ? (
              <p className="text-sm text-muted-foreground">{submitMessage}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
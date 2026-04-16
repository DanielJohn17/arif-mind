"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Search, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LessonLearned } from "@/lib/types";

type LessonsWorkbenchProps = {
  initialLessons: LessonLearned[];
};

export function LessonsWorkbench({ initialLessons }: LessonsWorkbenchProps) {
  const [lessons] = useState(initialLessons);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const lesson of lessons) {
      if (lesson.tags) {
        for (const tag of lesson.tags) {
          tags.add(tag);
        }
      }
    }
    return Array.from(tags).sort();
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const searchMatch =
        !searchQuery ||
        [lesson.title, lesson.rootCause, lesson.productArea, (lesson.tags ?? []).join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === "All" || lesson.status === statusFilter;
      const severityMatch = severityFilter === "All" || lesson.severity === severityFilter;
      const tagMatch = tagFilter === "All" || lesson.tags?.includes(tagFilter);

      return searchMatch && statusMatch && severityMatch && tagMatch;
    });
  }, [lessons, searchQuery, severityFilter, statusFilter, tagFilter]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Technical lessons learned"
        title="Capture incidents before they become repeat mistakes."
        description="Log root causes, immediate fixes, prevention steps, and expert advice in a format engineering and operations can both reuse."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lessons/new"
              className={cn(buttonVariants(), "h-11 rounded-xl px-5")}
            >
              Log a lesson
            </Link>
          </div>
        }
      />

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lessons log</CardTitle>
              <CardDescription>
                Filter by keyword, severity, status, or tags to focus current engineering attention.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="h-10 w-full rounded-xl bg-background pl-10 sm:w-[200px]"
                />
              </div>

              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "All")}>
                <SelectTrigger className="h-10 rounded-xl bg-background w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val || "All")}>
                <SelectTrigger className="h-10 rounded-xl bg-background w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={(val) => setTagFilter(val || "All")}>
                <SelectTrigger className="h-10 rounded-xl bg-background w-[140px]">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Tags</SelectItem>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lesson.productArea} · {lesson.owner}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Badge
                      className={
                        lesson.severity === "Critical"
                          ? "bg-[#da3a32]/10 text-[#da3a32] hover:bg-[#da3a32]/10"
                          : lesson.severity === "High"
                            ? "bg-[#f0c837]/15 text-[#9a7700] hover:bg-[#f0c837]/15"
                            : "bg-primary/10 text-primary hover:bg-primary/10"
                      }
                    >
                      {lesson.severity}
                    </Badge>
                    <Badge variant="outline">{lesson.status}</Badge>
                  </div>
                </div>
                {lesson.tags && lesson.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lesson.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
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
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No lessons match your filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
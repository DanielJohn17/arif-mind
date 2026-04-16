"use client";

import { useMemo, useState } from "react";
import { Globe2, Mic, SendHorizonal } from "lucide-react";
import { useForm } from "react-hook-form";

import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LocalizationEntry } from "@/lib/types";

type LocalizationDirectoryProps = {
  initialEntries: LocalizationEntry[];
};

type LocalizationFormValues = {
  region: string;
  primaryLanguage: string;
  keyTerms: string;
  localBusinessPractice: string;
  transactionBehavior: string;
  notes: string;
};

export function LocalizationDirectory({
  initialEntries,
}: LocalizationDirectoryProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<LocalizationFormValues>();

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesQuery =
        !query ||
        [entry.region, entry.primaryLanguage, entry.notes, entry.keyTerms.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesStatus = status === "All" || entry.reviewStatus === status;
      return matchesQuery && matchesStatus;
    });
  }, [entries, query, status]);

  const onSubmit = handleSubmit(async (values) => {
    const optimisticEntry: LocalizationEntry = {
      id: crypto.randomUUID(),
      region: values.region,
      primaryLanguage: values.primaryLanguage,
      keyTerms: values.keyTerms.split(",").map((item) => item.trim()).filter(Boolean),
      localBusinessPractice: values.localBusinessPractice,
      transactionBehavior: values.transactionBehavior,
      notes: values.notes,
      contributor: "Current User",
      reviewStatus: "Pending",
    };

    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();

      if (supabase) {
        const { error } = await supabase.from("localization_entries").insert({
          region: optimisticEntry.region,
          primary_language: optimisticEntry.primaryLanguage,
          key_terms: optimisticEntry.keyTerms,
          local_business_practice: optimisticEntry.localBusinessPractice,
          transaction_behavior: optimisticEntry.transactionBehavior,
          notes: optimisticEntry.notes,
          contributor: optimisticEntry.contributor,
          review_status: optimisticEntry.reviewStatus,
        });

        if (error) {
          setSubmitMessage("Supabase is configured, but the localization note could not be saved.");
          return;
        }
      }
    }

    setEntries((current) => [optimisticEntry, ...current]);
    setSubmitMessage(
      isSupabaseConfigured()
        ? "Localization insight saved to Supabase."
        : "Localization insight added in demo mode."
    );
    reset();
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Localization directory"
        title="Regional language and merchant behavior insight for Ethiopia."
        description="Designed for field agents on mobile: browse entries quickly, filter by review status, and submit new cultural or language observations from the field."
      />

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Regional knowledge cards</CardTitle>
                <CardDescription>Map-first is deferred; cards and filters come first for speed.</CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search region, language, or key term"
                  className="h-10 w-full rounded-xl sm:w-64"
                />
                <Select value={status} onValueChange={(val) => setStatus(val || "All")}>
                  <SelectTrigger className="h-10 rounded-xl border border-border bg-background px-3 text-sm w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Needs Follow-up">Needs Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{entry.region}</h3>
                    <p className="text-sm text-muted-foreground">{entry.primaryLanguage}</p>
                  </div>
                  <Badge variant="outline">{entry.reviewStatus}</Badge>
                </div>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="font-medium">Key terms</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.keyTerms.map((term) => (
                        <Badge key={term} variant="secondary">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Business practice</p>
                    <p className="mt-2 leading-6 text-muted-foreground">
                      {entry.localBusinessPractice}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Transaction behavior</p>
                    <p className="mt-2 leading-6 text-muted-foreground">
                      {entry.transactionBehavior}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-white/70 bg-[#151d2f] text-white shadow-2xl shadow-black/15">
            <CardHeader>
              <CardTitle>Field signal</CardTitle>
              <CardDescription className="text-white/70">
                Localization patterns are strongest when onboarding language matches the merchant&apos;s daily workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-white/85">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <Globe2 className="size-4 text-[#1f8f4d]" />
                Language preference should be captured during onboarding, not after support tickets start.
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <Mic className="size-4 text-[#f0c837]" />
                Voice-led demos improve trust in regions where device behavior needs spoken explanation.
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle>Submit a new regional note</CardTitle>
              <CardDescription>
                Capture language nuances, business practices, and merchant observations from the field.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input {...register("region", { required: true })} placeholder="Region" />
                  <Input
                    {...register("primaryLanguage", { required: true })}
                    placeholder="Primary language"
                  />
                </div>
                <Input
                  {...register("keyTerms", { required: true })}
                  placeholder="Key terms, comma separated"
                />
                <Textarea
                  {...register("localBusinessPractice", { required: true })}
                  placeholder="Local business practice"
                />
                <Textarea
                  {...register("transactionBehavior", { required: true })}
                  placeholder="Transaction behavior"
                />
                <Textarea {...register("notes", { required: true })} placeholder="Field notes" />
                <Button type="submit" className="h-11 w-full rounded-xl" disabled={formState.isSubmitting}>
                  <SendHorizonal className="size-4" />
                  {formState.isSubmitting ? "Submitting..." : "Submit field insight"}
                </Button>
                {submitMessage ? (
                  <p className="text-sm text-muted-foreground">{submitMessage}</p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

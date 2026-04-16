"use client";

import { useMemo, useState } from "react";
import { PhoneCall, Search, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ExpertProfile } from "@/lib/types";

type ExpertFinderProps = {
  experts: ExpertProfile[];
};

export function ExpertFinder({ experts }: ExpertFinderProps) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("All");

  const filteredExperts = useMemo(() => {
    return experts.filter((expert) => {
      const matchesQuery =
        !query ||
        [
          expert.name,
          expert.role,
          expert.team,
          expert.region,
          expert.languages.join(" "),
          expert.superpowers.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesAvailability =
        availability === "All" || expert.availability === availability;

      return matchesQuery && matchesAvailability;
    });
  }, [availability, experts, query]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Expert finder"
        title="Find the right human shortcut."
        description="A yellow-pages style directory of ArifPay staff, their superpowers, language coverage, and current availability."
      />

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by skill, team, region, language, or person"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <select
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none"
          >
            <option>All</option>
            <option>Available</option>
            <option>Busy</option>
            <option>On Field Duty</option>
          </select>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="size-14 border border-border/70">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {expert.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle>{expert.name}</CardTitle>
                  <CardDescription>
                    {expert.role} · {expert.team} · {expert.region}
                  </CardDescription>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {expert.availability}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Superpowers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expert.superpowers.map((power) => (
                    <Badge key={power} variant="secondary">
                      <Sparkles className="size-3.5" />
                      {power}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Languages</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expert.languages.map((language) => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-3 text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span className="flex items-center gap-2 font-medium">
                  <PhoneCall className="size-4 text-primary" />
                  {expert.contactChannel}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

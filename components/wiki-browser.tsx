"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { WikiArticle } from "@/lib/types";

type WikiBrowserProps = {
  articles: WikiArticle[];
};

export function WikiBrowser({ articles }: WikiBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesQuery =
        !query ||
        [article.title, article.summary, article.content, article.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCategory = category === "All" || article.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [articles, category, query]);

  const featured = filteredArticles.find((article) => article.featured) ?? filteredArticles[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Searchable wiki"
        title="Operational and product knowledge in one index."
        description="Browse API documentation, operational manuals, and product guides with searchable summaries, categories, and tags."
      />

      <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search runbooks, APIs, manuals, and onboarding guides"
              className="h-11 rounded-xl border-border/70 bg-background pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none"
          >
            <option>All</option>
            <option>API Documentation</option>
            <option>Operational Manual</option>
            <option>Product Guide</option>
          </select>
        </CardContent>
      </Card>

      {featured ? (
        <Card className="border-white/70 bg-[#151d2f] text-white shadow-2xl shadow-black/15">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/10">Featured</Badge>
              <Badge className="bg-[#1f8f4d]/25 text-[#baf6cf] hover:bg-[#1f8f4d]/25">
                {featured.category}
              </Badge>
            </div>
            <CardTitle className="pt-2 text-2xl">{featured.title}</CardTitle>
            <CardDescription className="text-white/70">{featured.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-white/85">
            <p>{featured.content}</p>
            <div className="flex flex-wrap gap-2">
              {featured.tags.map((tag) => (
                <Badge key={tag} className="bg-white/8 text-white hover:bg-white/8">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{article.category}</Badge>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  {article.audience}
                </Badge>
              </div>
              <CardTitle className="pt-2">{article.title}</CardTitle>
              <CardDescription>{article.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{article.content}</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="size-4" />
                Updated {article.updatedAt}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

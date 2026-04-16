"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { WikiArticle, WikiAskResponse } from "@/lib/types";

type WikiBrowserProps = {
  articles: WikiArticle[];
};

export function WikiBrowser({ articles: _articles }: WikiBrowserProps) {
  const [question, setQuestion] = useState("");
  const [askResult, setAskResult] = useState<WikiAskResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  async function handleAsk() {
    if (!question.trim()) {
      return;
    }

    setIsAsking(true);
    setAskError(null);

    try {
      const response = await fetch("/api/wiki/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const body = (await response.json()) as
        | WikiAskResponse
        | {
            error?: string;
          };

      if (!response.ok) {
        throw new Error(
          "error" in body && body.error
            ? body.error
            : "Failed to get an answer from the wiki assistant."
        );
      }

      setAskResult(body as WikiAskResponse);
    } catch (error) {
      setAskResult(null);
      setAskError(
        error instanceof Error
          ? error.message
          : "Failed to get an answer from the wiki assistant."
      );
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/90 shadow-lg shadow-black/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              AI assistant
            </Badge>
          </div>
          <CardTitle className="pt-2 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Ask ArifMind about the ArifPay API
          </CardTitle>
          <CardDescription>
            Ask a natural-language question and get responses grounded in the API collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder=""
            className="min-h-24 rounded-xl border-border/70 bg-background"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={handleAsk}
              disabled={isAsking || !question.trim()}
              className="h-11 rounded-xl"
            >
              {isAsking ? "Searching knowledge base..." : "Ask the wiki"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Answers are grounded in the API collection.
            </p>
          </div>

          {askError ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
              {askError}
            </div>
          ) : null}

          {askResult ? (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Answer
                </p>
                <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">
                  {askResult.answer}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

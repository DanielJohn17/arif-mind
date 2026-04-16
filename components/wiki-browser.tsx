"use client";

import { useState } from "react";
import { Sparkles, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatInput, ChatInputSubmit, ChatInputTextArea } from "@/components/ui/chat-input";
import type { WikiAskResponse } from "@/lib/types";

export function WikiBrowser() {
  const [question, setQuestion] = useState("");
  const [activeQuestion, setActiveQuestion] = useState("");
  const [askResult, setAskResult] = useState<WikiAskResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleAsk() {
    if (!question.trim()) {
      return;
    }

    const currentQuestion = question;
    setQuestion("");
    setActiveQuestion(currentQuestion);
    setIsAsking(true);
    setAskError(null);
    setAskResult(null); // Clear previous result while asking

    try {
      const response = await fetch("/api/wiki/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
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
      
      let errorMessage = error instanceof Error
        ? error.message
        : "Failed to get an answer from the wiki assistant.";

      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        } else if (parsed.message) {
          errorMessage = parsed.message;
        }
      } catch (e) {
        // Not valid JSON, keep original message
      }

      setAskError(errorMessage);
      setQuestion(currentQuestion); // Repopulate input box on error for reprompting
    } finally {
      setIsAsking(false);
    }
  }

  const copyToClipboard = () => {
    if (askResult?.answer) {
      navigator.clipboard.writeText(askResult.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isInitialState = !askResult && !isAsking && !askError;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6 flex flex-col min-h-full">
          {isInitialState && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in zoom-in duration-500 text-center py-12">
            <div className="space-y-4 max-w-lg">
              <div className="mx-auto w-fit flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                <Sparkles className="size-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Ask ArifMind</h1>
              <p className="text-muted-foreground text-lg">
                Ask a natural-language question and get responses grounded in the ArifPay API collection.
              </p>
            </div>

            <div className="grid gap-4 w-full sm:grid-cols-2 max-w-2xl mx-auto mt-8">
              <a
                href="https://developer.arifpay.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/70 p-5 transition-colors hover:border-primary/40 hover:bg-muted/30 text-left group"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">External Docs</Badge>
                  <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-primary">Arifpay Developer Portal</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Developer Hub for seamless, secure, and scalable integrations.
                </p>
              </a>

              <a
                href="https://developer.arifpay.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/70 p-5 transition-colors hover:border-primary/40 hover:bg-muted/30 text-left group"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Testing</Badge>
                  <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-primary">Arifpay Sandbox</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Test & Integration Learning Environment. Flexible sandbox testing.
                </p>
              </a>
            </div>
          </div>
        )}

        {isAsking && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-3 max-w-[85%] text-base shadow-sm">
                {activeQuestion}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                <Sparkles className="size-5 text-primary" />
                <span className="text-muted-foreground">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}

        {askError && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-3 max-w-[85%] text-base shadow-sm">
                {activeQuestion}
              </div>
            </div>
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
              {askError}
            </div>
          </div>
        )}

        {askResult && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-3 max-w-[85%] text-base shadow-sm">
                {askResult.question}
              </div>
            </div>

            <div className="flex justify-start">
              <div className="relative space-y-4 rounded-3xl border border-border/70 bg-white/90 shadow-sm p-6 md:p-8 w-full max-w-[90%]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 gap-2 h-9 rounded-lg"
                >
                  {copied ? <CheckCircle2 className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </Button>

                <div className="flex items-center gap-2 text-primary font-medium mb-6">
                  <Sparkles className="size-5" />
                  ArifMind Answer
                </div>
                
                <div className="text-sm md:text-base text-foreground/90 max-w-none">
                  <ReactMarkdown
                    components={{
                      h1({ children, ...props }) {
                        return <h1 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-foreground" {...props}>{children}</h1>;
                      },
                      h2({ children, ...props }) {
                        return <h2 className="mt-8 mb-4 text-xl font-bold tracking-tight text-foreground border-b pb-2" {...props}>{children}</h2>;
                      },
                      h3({ children, ...props }) {
                        return <h3 className="mt-6 mb-3 text-lg font-semibold text-foreground" {...props}>{children}</h3>;
                      },
                      h4({ children, ...props }) {
                        return <h4 className="mt-6 mb-2 text-base font-semibold text-foreground" {...props}>{children}</h4>;
                      },
                      p({ children, ...props }) {
                        return <p className="mb-4 leading-7 text-foreground" {...props}>{children}</p>;
                      },
                      ul({ children, ...props }) {
                        return <ul className="mb-6 ml-6 list-disc space-y-2 text-foreground" {...props}>{children}</ul>;
                      },
                      ol({ children, ...props }) {
                        return <ol className="mb-6 ml-6 list-decimal space-y-2 text-foreground" {...props}>{children}</ol>;
                      },
                      li({ children, ...props }) {
                        return <li className="leading-7 pl-2" {...props}>{children}</li>;
                      },
                      strong({ children, ...props }) {
                        return <strong className="font-bold text-foreground" {...props}>{children}</strong>;
                      },
                      blockquote({ children, ...props }) {
                        return <blockquote className="border-l-4 border-primary/40 pl-4 py-1 italic text-muted-foreground mb-4 bg-muted/20 rounded-r-lg" {...props}>{children}</blockquote>;
                      },
                      code({ className, children, ...props }) {
                        const isBlock = Boolean(className);
                        if (isBlock) {
                          return (
                            <pre className="my-4 overflow-x-auto rounded-xl bg-muted p-4 text-sm leading-6 border">
                              <code className="font-mono text-foreground" {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        }
                        return (
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground border" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {askResult.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/40 shrink-0 sticky bottom-0">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            variant="default"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onSubmit={handleAsk}
            loading={isAsking}
            className="bg-white/80 shadow-lg shadow-black/5"
          >
            <ChatInputTextArea placeholder="Ask ArifMind about the API..." />
            <ChatInputSubmit />
          </ChatInput>
          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground">
              Answers are grounded in the official API collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

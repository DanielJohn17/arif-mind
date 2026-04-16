"use client";

import { useState } from "react";
import { Bot, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LessonLearned } from "@/lib/types";

export function LessonExplainer({ lesson }: { lesson: LessonLearned }) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lessons/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate explanation");
      
      setExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !explanation && !isLoading) {
      fetchExplanation();
    }
  };

  const copyToClipboard = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger 
        render={
          <Button variant="secondary" className="gap-2 rounded-xl bg-white text-black hover:bg-white/90 font-medium shadow">
            <Bot className="size-4" />
            Explain More with AI
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="size-5 text-primary" />
            AI Explanation
          </DialogTitle>
          <DialogDescription>
            A deeper breakdown of the root cause, fix, and prevention steps for this incident.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-4">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p>Analyzing lesson details...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          ) : explanation ? (
            <div className="space-y-4 relative group">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="absolute -top-12 right-0 gap-2 h-9 rounded-lg hidden sm:flex"
              >
                {copied ? <CheckCircle2 className="size-4 text-green-500" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy Markdown"}
              </Button>
              
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
                  {explanation}
                </ReactMarkdown>
              </div>

              {/* Mobile copy button */}
              <Button
                variant="secondary"
                onClick={copyToClipboard}
                className="w-full gap-2 mt-6 sm:hidden"
              >
                {copied ? <CheckCircle2 className="size-4 text-green-500" /> : <Copy className="size-4" />}
                {copied ? "Copied to Clipboard" : "Copy Markdown"}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { NextResponse } from "next/server";
import { z } from "zod";

import { answerWikiQuestion } from "@/lib/wiki-rag";

const requestSchema = z.object({
  question: z.string().trim().min(3).max(1000),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { question } = requestSchema.parse(json);
    const result = await answerWikiQuestion(question);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Please provide a valid question.",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to answer wiki question.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


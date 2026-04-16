import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { lesson } = await req.json();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson is required" }, { status: 400 });
    }

    const systemInstruction = `You are ArifMind, a highly intelligent engineering knowledge base assistant at ArifPay. 
You are detached but very professional, giving a clear, deep breakdown of the incident provided.
Do NOT hallucinate information about ArifPay. Stick ONLY to analyzing the lesson data provided.
Format your answer beautifully in Markdown using clear headings, bullet points, and code blocks if relevant.

Structure your response to include:
1. Executive Summary (1-2 sentences)
2. Deeper Analysis of the Root Cause
3. Immediate Fix Breakdown (Why did it work?)
4. Long-term Prevention Strategy (Technical or operational steps to avoid recurrence)
5. Actionable Advice for Teams`;

    const prompt = `Please explain the following lesson learned in detail:
    
Title: ${lesson.title}
Product Area: ${lesson.productArea}
Severity: ${lesson.severity}
Root Cause: ${lesson.rootCause}
Immediate Fix: ${lesson.immediateFix}
Prevention: ${lesson.prevention}
Expert Advice: ${lesson.expertAdvice}
Tags: ${lesson.tags?.join(", ")}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    if (response.text) {
      return NextResponse.json({ explanation: response.text });
    }

    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  } catch (error) {
    console.error("Lesson explainer error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the AI explanation." },
      { status: 500 }
    );
  }
}
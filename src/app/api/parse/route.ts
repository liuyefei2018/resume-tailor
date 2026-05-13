import { NextRequest, NextResponse } from "next/server";
import { completeJSON } from "@/lib/llm";
import { parserSystemPrompt, parserUserMessage } from "@/lib/prompts";
import { createSession, updateSession } from "@/lib/session-store";

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json();
    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { error: "rawText is required" },
        { status: 400 }
      );
    }

    // Step 1: Parse with LLM
    const parsedData = await completeJSON<Record<string, unknown>>([
      { role: "system", content: parserSystemPrompt() },
      parserUserMessage(rawText),
    ]);

    // Step 2: Create session with parsed data
    const sessionId = createSession(rawText);
    updateSession(sessionId, {
      parsedData,
      status: "digging",
    });

    // Step 3: Get first digger question
    const firstQuestion = await generateDiggerQuestion(parsedData);

    return NextResponse.json({
      sessionId,
      parsedData,
      firstQuestion,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}

async function generateDiggerQuestion(parsedData: Record<string, unknown>): Promise<string> {
  const { complete } = await import("@/lib/llm");
  const dataStr = JSON.stringify(parsedData, null, 2);
  
  const res = await complete([
    {
      role: "system",
      content: `You are a career coach. Based on this parsed resume data, ask ONE specific question to start mining achievements.

Focus on the biggest gap first. Ask about ONE specific experience or missing detail at a time.

Be specific. Reference specific companies, projects or roles.

Output ONLY the question, no explanation.`,
    },
    {
      role: "user",
      content: `Parsed resume data:\n${dataStr}\n\nAsk the first question.`,
    },
  ]);

  return res;
}

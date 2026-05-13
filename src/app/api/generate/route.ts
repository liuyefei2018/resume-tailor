import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/llm";
import { writerSystemPrompt, writerUserMessage } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { parsedData, conversationLog } = await request.json();
    if (!parsedData || !conversationLog) {
      return NextResponse.json(
        { error: "parsedData and conversationLog are required" },
        { status: 400 }
      );
    }

    // Generate resume using Writer prompt
    const logString = conversationLog
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    const resume = await complete(
      [
        { role: "system", content: writerSystemPrompt() },
        writerUserMessage(
          JSON.stringify(parsedData, null, 2),
          logString
        ),
      ],
      { temperature: 0.3 }
    );

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}

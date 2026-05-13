import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/llm";
import { writerSystemPrompt, writerUserMessage } from "@/lib/prompts";
import { getSession, updateSession } from "@/lib/session-store";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Generate resume using Writer prompt
    const conversationLog = session.conversationLog
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const resume = await complete(
      [
        { role: "system", content: writerSystemPrompt() },
        writerUserMessage(
          JSON.stringify(session.parsedData, null, 2),
          conversationLog
        ),
      ],
      { temperature: 0.3 }
    );

    // Store generated resume
    updateSession(sessionId, {
      generatedResume: resume,
      status: "done",
    });

    return NextResponse.json({
      resume,
      sessionId,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}

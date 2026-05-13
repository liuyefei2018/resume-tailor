import { NextRequest } from "next/server";
import { complete } from "@/lib/llm";
import { diggerSystemPrompt } from "@/lib/prompts";
import { getSession, addToConversationLog } from "@/lib/session-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();
    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: "sessionId and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add user message to log
    addToConversationLog(sessionId, { role: "user", content: message });

    // Build conversation context
    const contextMessages = [
      { role: "system" as const, content: diggerSystemPrompt() },
      {
        role: "user" as const,
        content: `Here is the parsed resume data we're working with:\n${JSON.stringify(session.parsedData, null, 2)}\n\nCurrent conversation log:\n${session.conversationLog.map((m) => `${m.role}: ${m.content}`).join("\n")}`,
      },
    ];

    // Get AI response (non-streaming for simplicity)
    const aiResponse = await complete(contextMessages, {
      temperature: 0.7,
    });

    // Add AI response to log
    addToConversationLog(sessionId, { role: "assistant", content: aiResponse });

    // Check if digging is complete
    const isDone = aiResponse.includes("【ALL GAPS FILLED】");

    return new Response(
      JSON.stringify({
        message: aiResponse.replace("【ALL GAPS FILLED】", "").trim(),
        isDone,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

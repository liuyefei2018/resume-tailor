import { NextRequest } from "next/server";
import { complete } from "@/lib/llm";
import { diggerSystemPrompt } from "@/lib/prompts";
import type { ChatMessage } from "@/lib/llm";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { message, parsedData, conversationLog } = await request.json();
    if (!message || !parsedData) {
      return new Response(
        JSON.stringify({ error: "message and parsedData are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add user message to conversation log
    const updatedLog: ChatMessage[] = [
      ...(conversationLog || []),
      { role: "user", content: message },
    ];

    // Build conversation context
    const logString = updatedLog.map((m) => `${m.role}: ${m.content}`).join("\n");
    const contextMessages = [
      { role: "system" as const, content: diggerSystemPrompt() },
      {
        role: "user" as const,
        content: `Here is the parsed resume data we're working with:\n${JSON.stringify(parsedData, null, 2)}\n\nCurrent conversation log:\n${logString}`,
      },
    ];

    // Get AI response
    const aiResponse = await complete(contextMessages, {
      temperature: 0.7,
    });

    // Add AI response to conversation log
    const finalLog = [
      ...updatedLog,
      { role: "assistant" as const, content: aiResponse },
    ];

    // Check if digging is complete
    const isDone = aiResponse.includes("【ALL GAPS FILLED】");

    return new Response(
      JSON.stringify({
        message: aiResponse.replace("【ALL GAPS FILLED】", "").trim(),
        isDone,
        conversationLog: finalLog,
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

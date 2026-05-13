/**
 * DeepSeek LLM client — OpenAI-compatible SDK
 */
import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY is not set. " +
      "Create a .env.local file with your key from https://platform.deepseek.com/api_keys"
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
  });
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Non-streaming completion — for Parser & Writer (single-response)
 */
export async function complete(messages: ChatMessage[], options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const client = getClient();
  const model = options?.model ?? process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4096,
  });
  
  return res.choices[0]?.message?.content ?? "";
}

/**
 * Streaming completion — for Digger (conversation UX)
 */
export async function* completeStream(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number }
): AsyncGenerator<string> {
  const client = getClient();
  const model = options?.model ?? process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/**
 * Structured JSON output — for Parser (forces JSON mode)
 */
export async function completeJSON<T>(
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number }
): Promise<T> {
  const client = getClient();
  const model = options?.model ?? process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const res = await client.chat.completions.create({
    model,
    messages: [
      ...messages,
      {
        role: "user",
        content: "Respond ONLY with valid JSON. No markdown, no code fences, no explanation.",
      },
    ],
    temperature: options?.temperature ?? 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}

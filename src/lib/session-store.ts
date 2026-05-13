import { type ChatMessage } from "./llm";

type SessionStatus =
  | "parsing"
  | "digging"
  | "generating"
  | "done";

export type ParsedData = Record<string, unknown>;

export interface Session {
  id: string;
  status: SessionStatus;
  rawText: string;
  parsedData: ParsedData | null;
  conversationLog: ChatMessage[];
  generatedResume: string | null;
  createdAt: Date;
}

const sessions = new Map<string, Session>();

export function createSession(rawText: string): string {
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    status: "parsing",
    rawText,
    parsedData: null,
    conversationLog: [],
    generatedResume: null,
    createdAt: new Date(),
  };
  sessions.set(id, session);
  return id;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<Session>): void {
  const session = sessions.get(id);
  if (!session) throw new Error(`Session ${id} not found`);
  Object.assign(session, updates);
}

export function addToConversationLog(id: string, message: ChatMessage): void {
  const session = sessions.get(id);
  if (!session) throw new Error(`Session ${id} not found`);
  session.conversationLog.push(message);
}

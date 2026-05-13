"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Phase = "input" | "parsing" | "digging" | "generating" | "done";

export default function ResumeNewPage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [conversationLog, setConversationLog] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [resume, setResume] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setPhase("parsing");
    setError(null);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setParsedData(data.parsedData);
      setConversationLog([]);
      setMessages([
        { role: "assistant", content: data.firstQuestion || "I've analyzed your background. Let me start asking about your experience." },
      ]);
      setPhase("digging");
    } catch (e: any) {
      setError(e.message || "Failed to parse resume");
      setPhase("input");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !parsedData) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          parsedData,
          conversationLog,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConversationLog(data.conversationLog || []);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (data.isDone) {
        setPhase("generating");
        await handleGenerate();
      }
    } catch (e: any) {
      setError(e.message || "Failed to send message");
    }
  };

  const handleGenerate = async () => {
    if (!parsedData) return;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsedData, conversationLog }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResume(data.resume);
      setPhase("done");
    } catch (e: any) {
      setError(e.message || "Failed to generate resume");
      setPhase("digging");
    }
  };

  const copyToClipboard = () => {
    if (resume) navigator.clipboard.writeText(resume);
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-slate-800">
          ResumeTailor ✦
        </h1>
        <p className="text-slate-500 mt-2 text-xl">
          Raw experience in → Polished English resume out
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-4 mb-8 text-lg">
        {(["input", "digging", "done"] as const).map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                phase === step || (step === "input" && phase !== "input" && phase !== "digging")
                  ? "bg-blue-600 text-white"
                  : phase === "digging" && (step === "input" || step === "digging")
                  ? "bg-blue-600 text-white"
                  : phase === "done"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-slate-700 font-semibold">
              {step === "input" ? "Paste" : step === "digging" ? "Chat" : "Resume"}
            </span>
            {i < 2 && <span className="text-slate-300 mx-2">→</span>}
          </div>
        ))}
      </div>

      {/* Phase: Input */}
      {phase === "input" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-lg font-semibold text-slate-700 mb-3">
            Paste your raw career experience (Chinese or English)
          </label>
          <textarea
            className="w-full h-96 p-6 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg leading-relaxed"
            placeholder={`Example: I worked at 58同城 for 9 years. Started as senior engineer, later became tech lead then tech manager. Managed a team of 40 people...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="px-10 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg
                         hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              Start Mining →
            </button>
          </div>
        </div>
      )}

      {/* Phase: Parsing */}
      {phase === "parsing" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin w-12 h-12 border-[3px] border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500 text-xl">Analyzing your experience...</p>
        </div>
      )}

      {/* Phase: Digging */}
      {(phase === "digging" || phase === "generating") && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Chat messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 text-lg leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-slate-100 text-slate-800 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {phase === "generating" && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-md px-6 py-4 text-lg text-slate-500">
                  Generating your resume... <span className="animate-pulse">✦</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {phase === "digging" && (
            <div className="border-t border-slate-200 p-4 flex gap-2">
              <input
                type="text"
                className="flex-1 px-6 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Type your answer..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg
                           hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}

      {/* Phase: Done */}
      {phase === "done" && resume && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase("input");
                setRawText("");
                setParsedData(null);
                setConversationLog([]);
                setMessages([]);
                setResume(null);
              }}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-lg font-medium"
            >
              ← Start Over
            </button>
            <button
              onClick={copyToClipboard}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Copy to Clipboard
            </button>
          </div>
          <pre className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-lg leading-relaxed whitespace-pre-wrap font-sans">
            {resume}
          </pre>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-base">
          {error}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-sm text-slate-400 mt-8">
        Powered by DeepSeek. Your data is not stored on our servers.
      </p>
    </main>
  );
}

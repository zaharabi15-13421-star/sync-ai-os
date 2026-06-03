import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X, Minimize2, Loader2, ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const SUGGESTIONS = [
  "How do I generate social media content?",
  "Walk me through onboarding a new brand",
  "Design a launch banner for a Gen Z sneaker drop",
  "Why is my CTR dropping?",
];

const GREETING: UIMessage = {
  id: "zarvis-greeting",
  role: "assistant",
  parts: [
    {
      type: "text",
      text:
        "Hey, I'm **Mr. Zarvis** — your in-house brand & marketing strategist inside BrandSync AI. \n\nTell me what you're working on (a campaign, a brand decision, a metric that's off) and I'll diagnose it, recommend the play, and quantify the upside. Where do we start?",
    },
  ],
};

function partsToText(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

type AnyPart = UIMessage["parts"][number] & {
  type: string;
  toolName?: string;
  state?: string;
  input?: { prompt?: string };
  output?: { image?: string; prompt?: string; error?: string };
};

export function ZarvisChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const transport = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    })
  ).current;

  const { messages, sendMessage, status, error } = useChat({
    id: "zarvis-global",
    messages: [GREETING],
    transport,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open, status]);

  const isLoading = status === "submitted" || status === "streaming";

  const submit = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    setInput("");
    sendMessage({ text: value });
  };

  return (
    <>
      {/* Floating Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[100] group"
            aria-label="Open Mr. Zarvis"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-60 group-hover:opacity-90 transition" />
            <span className="relative flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 pl-3 pr-4 py-3 shadow-2xl border border-white/20 text-white">
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
                <Bot className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
              </span>
              <span className="text-sm font-medium tracking-tight">Ask Mr. Zarvis</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-6 right-6 z-[100] w-[min(420px,calc(100vw-1.5rem))] h-[min(640px,calc(100vh-3rem))] flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,18,38,0.92) 0%, rgba(12,10,28,0.96) 100%)",
            }}
          >
            {/* Header */}
            <div className="relative px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-purple-600/30">
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                background: "radial-gradient(120% 80% at 0% 0%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(120% 80% at 100% 0%, rgba(168,85,247,0.35), transparent 60%)",
              }} />
              <div className="relative flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-white/20">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#1a1830]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-white tracking-tight">Mr. Zarvis</h3>
                    <Sparkles className="h-3 w-3 text-indigo-300" />
                  </div>
                  <p className="text-[11px] text-indigo-200/80 truncate">
                    Brand & Marketing Strategist · Online
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m) => {
                const isUser = m.role === "user";
                const userText = isUser ? partsToText(m) : "";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
                  >
                    {!isUser && (
                      <div className="h-7 w-7 flex-none rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-1 ring-white/15">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[82%] text-[13px] leading-relaxed space-y-2",
                        isUser
                          ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white px-3.5 py-2 shadow-md"
                          : "text-foreground/90"
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{userText}</p>
                      ) : (
                        (m.parts as AnyPart[]).map((p, i) => {
                          if (p.type === "text") {
                            return (
                              <div
                                key={i}
                                className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-strong:text-indigo-200 prose-headings:text-white prose-a:text-indigo-300"
                              >
                                <ReactMarkdown>{p.text || ""}</ReactMarkdown>
                              </div>
                            );
                          }
                          if (p.type === "tool-generateImage" || p.toolName === "generateImage") {
                            const out = p.output;
                            const promptText = p.input?.prompt || out?.prompt;
                            if (out?.image) {
                              return (
                                <figure
                                  key={i}
                                  className="rounded-xl overflow-hidden border border-white/10 bg-black/30"
                                >
                                  <img
                                    src={out.image}
                                    alt={promptText || "Generated visual"}
                                    className="w-full h-auto block"
                                  />
                                  {promptText && (
                                    <figcaption className="px-2.5 py-1.5 text-[10px] text-white/60 border-t border-white/5">
                                      <ImageIcon className="inline h-3 w-3 mr-1 -mt-0.5" />
                                      {promptText}
                                    </figcaption>
                                  )}
                                </figure>
                              );
                            }
                            if (out?.error) {
                              return (
                                <div key={i} className="text-[11px] text-rose-300/90 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5">
                                  Couldn't generate that image: {out.error}
                                </div>
                              );
                            }
                            return (
                              <div key={i} className="flex items-center gap-2 text-[11px] text-indigo-200/80 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Designing visual…
                              </div>
                            );
                          }
                          return null;
                        })
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {status === "submitted" && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 flex-none rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-1 ring-white/15">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-200/80 px-2 py-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Mr. Zarvis is thinking…
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  Couldn't reach Mr. Zarvis. Try again in a moment.
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/40 text-indigo-100/90 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="border-t border-white/10 bg-black/20 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
                className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-indigo-400/50 focus-within:bg-white/10 transition px-3 py-2"
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  placeholder="Ask Mr. Zarvis anything about brand, ads, growth…"
                  className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder:text-white/40 max-h-32"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 flex-none rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
                  aria-label="Send"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </form>
              <p className="mt-1.5 text-[10px] text-white/40 text-center">
                Powered by BrandSync AI · Mr. Zarvis may suggest strategies — verify before launch.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

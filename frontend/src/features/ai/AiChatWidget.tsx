import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "../auth/auth.store";
import {
  createConversation,
  getAiStatus,
  getMessages,
  listConversations,
} from "./ai.api";
import { useAiChat } from "./useAiChat";

/**
 * Widget flotante de chat IA "GG" (Game Guide).
 * - Boton flotante esquina inferior derecha
 * - Click → panel cyber con conversaciones + mensajes + input
 * - Streaming token-a-token via SignalR
 */
export function AiChatWidget() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const qc = useQueryClient();

  const statusQ = useQuery({
    queryKey: ["ai-status"],
    queryFn: getAiStatus,
    staleTime: 30_000,
    enabled: !!user,
  });

  const convosQ = useQuery({
    queryKey: ["ai-convos"],
    queryFn: listConversations,
    enabled: !!user && open,
  });

  const messagesQ = useQuery({
    queryKey: ["ai-messages", activeConvoId],
    queryFn: () => (activeConvoId ? getMessages(activeConvoId) : Promise.resolve([])),
    enabled: !!activeConvoId,
  });

  const { messages, setMessages, streaming, sendMessage, isConnected } = useAiChat(activeConvoId);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes del servidor cuando cambia la conversacion
  useEffect(() => {
    if (messagesQ.data) {
      setMessages(messagesQ.data);
    }
  }, [messagesQ.data, setMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  // Auto-crear conversacion la primera vez que se abre el panel
  useEffect(() => {
    if (open && user && convosQ.data && !activeConvoId) {
      if (convosQ.data.length > 0) {
        setActiveConvoId(convosQ.data[0].id);
      } else {
        createConversation().then((c) => {
          setActiveConvoId(c.id);
          qc.invalidateQueries({ queryKey: ["ai-convos"] });
        });
      }
    }
  }, [open, user, convosQ.data, activeConvoId, qc]);

  if (!user) return null;

  const ollamaUp = statusQ.data?.available ?? false;

  return (
    <>
      {/* Boton flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full font-mono text-sm uppercase tracking-widest2 transition-all ${
          open
            ? "bg-neon-magenta text-ink-900 shadow-glow-magenta"
            : "bg-neon-cyan text-ink-900 shadow-glow-cyan animate-glow-pulse"
        }`}
        title={open ? "Cerrar GG" : "Abrir GG"}
      >
        {open ? "✕" : "GG"}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 w-[min(420px,calc(100vw-2rem))] h-[min(620px,calc(100vh-8rem))] rounded-xl shadow-panel border border-line-glow bg-ink-800 flex flex-col overflow-hidden animate-rise"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,19,34,0.98) 0%, rgba(5,6,10,0.98) 100%)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-line bg-ink-700/50 flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <div className="flex-1">
              <div className="font-display font-bold text-neon-cyan tracking-widest2">
                GG · GAME GUIDE
              </div>
              <div className="text-[0.65rem] font-mono uppercase tracking-widest2 flex items-center gap-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    ollamaUp ? "bg-neon-green animate-glow-pulse" : "bg-neon-red"
                  }`}
                />
                <span className="text-fg-muted">
                  {ollamaUp ? "online" : "ollama offline"}
                </span>
                {!isConnected && <span className="text-fg-dim ml-2">// reconectando</span>}
              </div>
            </div>
            <button
              onClick={() => {
                createConversation().then((c) => {
                  setActiveConvoId(c.id);
                  setMessages([]);
                  qc.invalidateQueries({ queryKey: ["ai-convos"] });
                });
              }}
              className="font-mono text-[0.65rem] uppercase tracking-widest2 text-fg-muted hover:text-neon-cyan"
              title="Nueva conversacion"
            >
              [+ new]
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!ollamaUp && (
              <div className="bg-ink-700/50 border border-neon-red/40 rounded-lg p-3 text-xs font-mono">
                <div className="text-neon-red mb-1">[!] Ollama no esta corriendo</div>
                <div className="text-fg-muted">
                  Instalá: <span className="text-neon-cyan">brew install ollama</span>
                  <br />
                  Arrancá: <span className="text-neon-cyan">brew services start ollama</span>
                  <br />
                  Modelo: <span className="text-neon-cyan">ollama pull qwen2.5:7b</span>
                </div>
              </div>
            )}

            {messages.length === 0 && ollamaUp && streaming.status === "idle" && (
              <div className="text-center py-8 text-fg-muted text-sm">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-display uppercase tracking-widest2">Listo, player</div>
                <div className="text-xs mt-1 font-mono">
                  preguntá: "¿que sillas hay?", "mis pedidos", "kpis hoy"
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={`${m.id}-${i}`} message={m} />
            ))}

            {streaming.status === "streaming" && (
              <MessageBubble
                message={{
                  id: -1,
                  role: "assistant",
                  content: streaming.buffer || "▮",
                  toolName: null,
                  createdAtUtc: new Date().toISOString(),
                }}
                streaming
              />
            )}

            {streaming.status === "error" && (
              <div className="bg-neon-red/10 border border-neon-red/40 rounded-lg p-3 text-xs">
                <div className="text-neon-red font-mono uppercase tracking-widest2">[error]</div>
                <div className="text-fg mt-1">{streaming.message}</div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!activeConvoId || streaming.status === "streaming") return;
              sendMessage(draft);
              setDraft("");
            }}
            className="border-t border-line p-3 flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={ollamaUp ? "Escribi un mensaje..." : "Esperando Ollama..."}
              disabled={!ollamaUp || streaming.status === "streaming" || !activeConvoId}
              className="flex-1 bg-ink-900 border border-line rounded px-3 py-2 text-sm font-mono text-fg placeholder:text-fg-dim focus:border-neon-cyan focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!ollamaUp || !draft.trim() || streaming.status === "streaming" || !activeConvoId}
              className="bg-neon-cyan text-ink-900 px-4 py-2 rounded font-display font-bold tracking-widest2 disabled:opacity-40 hover:shadow-glow-cyan transition-all"
            >
              ▶
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: { id?: number; role: string; content: string; toolName: string | null; createdAtUtc?: string };
  streaming?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-neon-magenta/20 border border-neon-magenta/40 text-fg"
            : "bg-ink-700/60 border border-line text-fg"
        } ${streaming ? "animate-glow-pulse" : ""}`}
      >
        {!isUser && (
          <div className="font-mono text-[0.6rem] uppercase tracking-widest2 text-neon-cyan mb-1">
            GG{streaming && " · transmitiendo"}
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

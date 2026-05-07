import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../auth/auth.store";
import type { AiMessage } from "./ai.types";

type StreamingState =
  | { status: "idle" }
  | { status: "streaming"; messageId: string; buffer: string }
  | { status: "error"; messageId: string; message: string };

export type AiChatMessage = AiMessage & { _streaming?: boolean };

export function useAiChat(conversationId: number | null) {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [streaming, setStreaming] = useState<StreamingState>({ status: "idle" });
  const [connectionState, setConnectionState] = useState<HubConnectionState>(HubConnectionState.Disconnected);
  const connectionRef = useRef<HubConnection | null>(null);

  // Conectar al hub
  useEffect(() => {
    if (!token) return;

    const conn = new HubConnectionBuilder()
      .withUrl(`/hubs/ai?access_token=${encodeURIComponent(token)}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = conn;
    setConnectionState(HubConnectionState.Connecting);

    conn.on("AiStreamStart", ({ messageId }: { messageId: string }) => {
      setStreaming({ status: "streaming", messageId, buffer: "" });
    });

    conn.on("AiStreamToken", ({ messageId, token: tk }: { messageId: string; token: string }) => {
      setStreaming((s) =>
        s.status === "streaming" && s.messageId === messageId
          ? { ...s, buffer: s.buffer + tk }
          : s
      );
    });

    conn.on("AiStreamEnd", ({ messageId }: { messageId: string }) => {
      setStreaming((s) => {
        if (s.status === "streaming" && s.messageId === messageId && s.buffer) {
          setMessages((prev) => [
            ...prev,
            {
              id: -Date.now(),
              role: "assistant",
              content: s.buffer,
              toolName: null,
              createdAtUtc: new Date().toISOString(),
            },
          ]);
        }
        return { status: "idle" };
      });
    });

    conn.on("AiStreamError", ({ messageId, message }: { messageId: string; message: string }) => {
      setStreaming({ status: "error", messageId, message });
    });

    conn
      .start()
      .then(() => setConnectionState(HubConnectionState.Connected))
      .catch((err) => {
        console.error("AI hub start failed", err);
        setConnectionState(HubConnectionState.Disconnected);
      });

    return () => {
      conn.stop().catch(() => {});
    };
  }, [token]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !connectionRef.current) return;
      const conn = connectionRef.current;
      if (conn.state !== HubConnectionState.Connected) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      // Echo optimista del mensaje del usuario
      setMessages((prev) => [
        ...prev,
        {
          id: -Date.now(),
          role: "user",
          content: trimmed,
          toolName: null,
          createdAtUtc: new Date().toISOString(),
        },
      ]);

      try {
        await conn.invoke("SendMessage", conversationId, trimmed);
      } catch (err) {
        console.error("SendMessage error", err);
        setStreaming({ status: "error", messageId: "send", message: String(err) });
      }
    },
    [conversationId]
  );

  return {
    messages,
    setMessages,
    streaming,
    sendMessage,
    isConnected: connectionState === HubConnectionState.Connected,
  };
}

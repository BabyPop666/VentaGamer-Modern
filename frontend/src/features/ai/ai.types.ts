export type AiConversationSummary = {
  id: number;
  title: string;
  updatedAtUtc: string;
  messageCount: number;
};

export type AiMessage = {
  id: number;
  role: "user" | "assistant" | "tool";
  content: string;
  toolName: string | null;
  createdAtUtc: string;
};

export type AiStatus = { available: boolean };

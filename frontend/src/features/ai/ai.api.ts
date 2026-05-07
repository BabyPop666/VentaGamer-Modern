import { api } from "../../lib/api";
import type { AiConversationSummary, AiMessage, AiStatus } from "./ai.types";

export const getAiStatus = async (): Promise<AiStatus> =>
  (await api.get<AiStatus>("/ai/status")).data;

export const listConversations = async (): Promise<AiConversationSummary[]> =>
  (await api.get<AiConversationSummary[]>("/ai/conversations")).data;

export const createConversation = async (): Promise<{ id: number }> =>
  (await api.post<{ id: number }>("/ai/conversations")).data;

export const getMessages = async (id: number): Promise<AiMessage[]> =>
  (await api.get<AiMessage[]>(`/ai/conversations/${id}/messages`)).data;

export const deleteConversation = async (id: number): Promise<void> => {
  await api.delete(`/ai/conversations/${id}`);
};

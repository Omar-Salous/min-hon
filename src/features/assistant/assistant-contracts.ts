import type { ProductId } from "@/features/commerce/commerce-types";

export type AssistantQuickReply = {
  label: string;
  prompt: string;
};

export type AssistantRecommendation = {
  productId: ProductId;
  reason: string;
  emphasis?: string;
};

export type AssistantProfileSummary = {
  occasion?: string;
  preferredStyle?: string;
  colors?: string;
  size?: string;
  intent?: "gift" | "personal" | "full-look";
  weather?: string;
};

export type AssistantMessageMetadata = {
  quickReplies?: AssistantQuickReply[];
  recommendations?: AssistantRecommendation[];
  stylingNotes?: string[];
  storyNote?: string;
  weatherNote?: string;
  profileSummary?: AssistantProfileSummary;
};

export type AssistantChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt?: string;
  metadata?: AssistantMessageMetadata;
};

export type AssistantConversationPayload = {
  chatSessionId: string | null;
  messages: AssistantChatMessage[];
};

export type AssistantRequest = {
  sessionId: string;
  message: string;
  chatSessionId?: string;
  messages?: AssistantChatMessage[];
};

export type AssistantResponse = {
  chatSessionId: string;
  userMessage: AssistantChatMessage;
  assistantMessage: AssistantChatMessage;
};

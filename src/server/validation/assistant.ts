import { z } from "zod";

const sessionIdSchema = z.string().trim().min(8).max(120);
const chatSessionIdSchema = z.string().trim().min(1).max(120);
const productIdSchema = z.enum(["tshirt", "hand-watch", "bracelet", "cap", "hoodie"]);

const quickReplySchema = z.object({
  label: z.string().trim().min(1).max(80),
  prompt: z.string().trim().min(1).max(240),
});

const recommendationSchema = z.object({
  productId: productIdSchema,
  reason: z.string().trim().min(1).max(320),
  emphasis: z.string().trim().max(120).nullable(),
});

const assistantHistoryMessageSchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["assistant", "user"]),
  text: z.string().trim().min(1).max(2000),
});

const profileSummarySchema = z.object({
  occasion: z.string().trim().max(120).nullable(),
  preferredStyle: z.string().trim().max(120).nullable(),
  colors: z.string().trim().max(120).nullable(),
  size: z.string().trim().max(40).nullable(),
  intent: z.enum(["gift", "personal", "full-look"]).nullable(),
  weather: z.string().trim().max(120).nullable(),
});

export const assistantRequestSchema = z.object({
  sessionId: sessionIdSchema,
  chatSessionId: chatSessionIdSchema.optional(),
  message: z.string().trim().min(1).max(2000),
  messages: z.array(assistantHistoryMessageSchema).max(20).optional(),
});

export const assistantConversationQuerySchema = z.object({
  sessionId: sessionIdSchema,
  chatSessionId: chatSessionIdSchema.optional(),
});

export const assistantResponseSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  quickReplies: z.array(quickReplySchema).max(5).default([]),
  recommendations: z.array(recommendationSchema).max(3).default([]),
  stylingNotes: z.array(z.string().trim().min(1).max(240)).max(3).default([]),
  storyNote: z.string().trim().max(320).nullable(),
  weatherNote: z.string().trim().max(320).nullable(),
  profileSummary: profileSummarySchema,
});

export type AssistantRequestPayload = z.infer<typeof assistantRequestSchema>;
export type AssistantConversationQuery = z.infer<typeof assistantConversationQuerySchema>;
export type AssistantResponsePayload = z.infer<typeof assistantResponseSchema>;

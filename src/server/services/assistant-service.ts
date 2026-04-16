import { ChatMessageRole, ChatSessionStatus } from "@prisma/client";
import {
  getDatabaseUnavailableMessage,
  isDatabaseAvailable,
  prisma,
} from "@/lib/prisma";
import type {
  AssistantChatMessage,
  AssistantMessageMetadata,
  AssistantProfileSummary,
  AssistantRecommendation,
  AssistantResponse,
} from "@/features/assistant/assistant-contracts";
import { listProducts } from "@/server/services/commerce-service";
import {
  AssistantProviderError,
  createAssistantProviderReply,
  getAssistantProviderConfig,
  isAssistantProviderConfigured,
  type AssistantProviderMessage,
} from "@/server/services/assistant-provider";
import {
  assistantResponseSchema,
  type AssistantRequestPayload,
  type AssistantResponsePayload,
} from "@/server/validation/assistant";

type PersistedChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  metadata: unknown;
  createdAt: Date;
};

type ProductCatalogEntry = Awaited<ReturnType<typeof listProducts>>[number];
type AssistantHistoryInputMessage = NonNullable<AssistantRequestPayload["messages"]>[number];
type NormalizedAssistantResponsePayload = {
  message: string;
  quickReplies: AssistantResponsePayload["quickReplies"];
  recommendations: AssistantRecommendation[];
  stylingNotes: string[];
  storyNote?: string;
  weatherNote?: string;
  profileSummary: AssistantProfileSummary;
};
const ASSISTANT_FALLBACK_SESSION_ID = "assistant-fallback-session";
const MAX_HISTORY_MESSAGES = 16;

function getAssistantDatabaseClient() {
  if (!prisma || !isDatabaseAvailable()) {
    return null;
  }

  return prisma;
}

export function isAssistantLiveConfigured() {
  return isAssistantProviderConfigured();
}

const assistantResponseJsonSchema = {
  name: "min_hon_style_assistant_response",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      message: { type: "string" },
      quickReplies: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            prompt: { type: "string" },
          },
          required: ["label", "prompt"],
        },
      },
      recommendations: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            productId: {
              type: "string",
              enum: ["tshirt", "hand-watch", "bracelet", "cap", "hoodie"],
            },
            reason: { type: "string" },
            emphasis: {
              type: ["string", "null"],
            },
          },
          required: ["productId", "reason", "emphasis"],
        },
      },
      stylingNotes: {
        type: "array",
        items: { type: "string" },
      },
      storyNote: {
        type: ["string", "null"],
      },
      weatherNote: {
        type: ["string", "null"],
      },
      profileSummary: {
        type: "object",
        additionalProperties: false,
        properties: {
          occasion: { type: ["string", "null"] },
          preferredStyle: { type: ["string", "null"] },
          colors: { type: ["string", "null"] },
          size: { type: ["string", "null"] },
          intent: {
            anyOf: [
              {
                type: "string",
                enum: ["gift", "personal", "full-look"],
              },
              {
                type: "null",
              },
            ],
          },
          weather: { type: ["string", "null"] },
        },
        required: ["occasion", "preferredStyle", "colors", "size", "intent", "weather"],
      },
    },
    required: [
      "message",
      "quickReplies",
      "recommendations",
      "stylingNotes",
      "storyNote",
      "weatherNote",
      "profileSummary",
    ],
  },
} as const;

export async function getAssistantConversation(input: {
  sessionId: string;
  chatSessionId?: string;
}) {
  const db = getAssistantDatabaseClient();
  if (!db) {
    return {
      chatSessionId: null,
      messages: [],
    };
  }

  const chatSession = await resolveChatSession(input);

  if (!chatSession) {
    return {
      chatSessionId: null,
      messages: [],
    };
  }

  const messages = await db.chatMessage.findMany({
    where: { chatSessionId: chatSession.id },
    orderBy: { createdAt: "asc" },
  });

  return {
    chatSessionId: chatSession.id,
    messages: messages
      .map(serializeChatMessage)
      .filter((message): message is AssistantChatMessage => message !== null),
  };
}

export async function archiveAssistantConversation(input: {
  sessionId: string;
  chatSessionId: string;
}) {
  const db = getAssistantDatabaseClient();
  if (!db) {
    return null;
  }

  const chatSession = await db.chatSession.findFirst({
    where: {
      id: input.chatSessionId,
      sessionId: input.sessionId,
    },
  });

  if (!chatSession) {
    return null;
  }

  return db.chatSession.update({
    where: { id: chatSession.id },
    data: {
      status: ChatSessionStatus.ARCHIVED,
    },
  });
}

export async function replyToAssistant(input: AssistantRequestPayload): Promise<AssistantResponse> {
  const db = getAssistantDatabaseClient();
  const provider = getAssistantProviderConfig();

  if (!isAssistantProviderConfigured()) {
    return createAssistantFallbackResponse(input.message, getProviderSetupMessage());
  }

  const [chatSession, catalog] = await Promise.all([
    db ? ensureChatSession(input) : Promise.resolve(null),
    listProducts(),
  ]);

  const existingMessages = db && chatSession
    ? await db.chatMessage.findMany({
        where: { chatSessionId: chatSession.id },
        orderBy: { createdAt: "desc" },
        take: MAX_HISTORY_MESSAGES,
      })
    : createEphemeralHistory(input.messages, input.message);

  const userMessage = db && chatSession
    ? await db.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: ChatMessageRole.USER,
          content: input.message,
        },
      })
    : createEphemeralUserMessage(input.message);

  if (db && chatSession && !chatSession.title) {
    await db.chatSession.update({
      where: { id: chatSession.id },
      data: {
        title: buildChatTitle(input.message),
      },
    });
  }

  let assistantReply: NormalizedAssistantResponsePayload;

  try {
    assistantReply = await createAssistantReply({
      catalog,
      history: db && chatSession ? [...existingMessages.reverse(), userMessage] : existingMessages,
    });
  } catch (error) {
    console.error("MIN HON Style Assistant backend error:", error);

    if (error instanceof AssistantProviderError && isQuotaError(error)) {
      assistantReply = createUnavailableAssistantResponse(
        "The assistant is temporarily unavailable while API quota is being restored.",
      );
    } else if (error instanceof AssistantProviderError && provider.provider === "ollama") {
      assistantReply = createUnavailableAssistantResponse(
        createOllamaUnavailableMessage(error, provider.endpoint, provider.model),
      );
    } else {
      assistantReply = createUnavailableAssistantResponse(
        "The assistant is temporarily unavailable right now. Please try again shortly.",
      );
    }
  }

  const assistantMessage = db && chatSession
    ? await db.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: ChatMessageRole.ASSISTANT,
          content: assistantReply.message,
          metadata: createAssistantMetadata(assistantReply),
        },
      })
    : createEphemeralAssistantMessage(assistantReply);

  return {
    chatSessionId: chatSession?.id ?? ASSISTANT_FALLBACK_SESSION_ID,
    userMessage: serializePersistedMessage(userMessage),
    assistantMessage: serializePersistedMessage(assistantMessage),
  };
}

async function resolveChatSession(input: { sessionId: string; chatSessionId?: string }) {
  const db = getAssistantDatabaseClient();
  if (!db) {
    return null;
  }

  if (input.chatSessionId) {
    return db.chatSession.findFirst({
      where: {
        id: input.chatSessionId,
        sessionId: input.sessionId,
      },
    });
  }

  return db.chatSession.findFirst({
    where: {
      sessionId: input.sessionId,
      status: ChatSessionStatus.ACTIVE,
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function ensureChatSession(input: { sessionId: string; chatSessionId?: string }) {
  const db = getAssistantDatabaseClient();
  if (!db) {
    throw new Error(getDatabaseUnavailableMessage("The Style Assistant conversation history"));
  }

  const existing = await resolveChatSession(input);

  if (existing) {
    return existing;
  }

  return db.chatSession.create({
    data: {
      sessionId: input.sessionId,
      status: ChatSessionStatus.ACTIVE,
      title: "MIN HON Style Assistant",
    },
  });
}

async function createAssistantReply(input: {
  catalog: ProductCatalogEntry[];
  history: PersistedChatMessage[];
}) {
  const responsePayload = await createAssistantProviderReply({
    prompt: buildDeveloperPrompt(input.catalog),
    responseSchemaName: assistantResponseJsonSchema.name,
    responseSchema: assistantResponseJsonSchema.schema,
    history: input.history.map<AssistantProviderMessage>((message) => ({
      role: mapRoleForModel(message.role),
      content: message.content,
    })),
  });

  const parsed = assistantResponseSchema.parse(responsePayload) as AssistantResponsePayload;
  return sanitizeRecommendations(normalizeAssistantResponsePayload(parsed), input.catalog);
}

function isQuotaError(error: AssistantProviderError) {
  return error.code === "insufficient_quota" || error.code === "billing_hard_limit_reached";
}

function buildDeveloperPrompt(catalog: ProductCatalogEntry[]) {
  return [
    "You are the MIN HON Style Assistant, a concise virtual fashion consultant and personal stylist for the MIN HON brand.",
    "Brand voice: warm, calm, tasteful, emotionally intelligent, never pushy.",
    "Your job is to guide shoppers toward the right MIN HON pieces using only the catalog provided below.",
    "Always stay grounded in the real catalog. Never invent products, colors, sizes, prices, or QR features not described below.",
    "Ask for missing context progressively when needed. You should make sure the conversation covers: occasion, preferred style, colors, size when apparel is relevant, whether the shopper wants a gift, a personal piece, or a full look, and the weather or climate they are dressing for.",
    "If the customer has not given one of those details yet, prioritize asking for the most helpful missing detail instead of over-recommending too early.",
    "When enough context exists, recommend one to three products from the catalog. For full-look requests, combine pieces into a coherent MIN HON look and explain how the pieces work together.",
    "Use weather in the reasoning whenever the shopper shares it. If weather is unknown, ask a short question about it.",
    "Mention QR-linked story or digital content only when the customer is asking for a gift, keepsake, personal story, customization, or emotional meaning.",
    "Be safe and respectful. Do not shame bodies, sizing, or appearance. If sizing is unclear, offer gentle guidance and mention non-sized options when useful.",
    "Keep the main message to about 2 to 5 sentences and keep recommendations concise.",
    "Return valid JSON matching the required schema.",
    "",
    `Current date: ${new Date().toISOString()}`,
    "Catalog:",
    ...catalog.map(formatCatalogEntry),
  ].join("\n");
}

function formatCatalogEntry(product: ProductCatalogEntry) {
  const sizing = product.sizes?.length ? product.sizes.join(", ") : "No size selection needed";
  const notes =
    product.id === "tshirt"
      ? "Best for: everyday wear, warm weather, personalization, full-look base layer, QR-story moments."
      : product.id === "hoodie"
        ? "Best for: cold or windy weather, layering, personalization, fuller looks, QR-story moments."
        : product.id === "hand-watch"
          ? "Best for: gifting, keepsakes, elevated styling, personal dedications."
          : product.id === "bracelet"
            ? "Best for: gifting, daily wear, warm styling, personal touches."
            : "Best for: travel, warm or windy weather, relaxed styling, full-look finishing touch.";

  return [
    `- ${product.id}: ${product.name}`,
    `  Subtitle: ${product.subtitle}`,
    `  Price: $${product.price}`,
    `  Description: ${product.description}`,
    `  Colors: ${product.colors.join(", ")}`,
    `  Sizes: ${sizing}`,
    `  ${notes}`,
  ].join("\n");
}

function sanitizeRecommendations(
  payload: NormalizedAssistantResponsePayload,
  catalog: ProductCatalogEntry[],
): NormalizedAssistantResponsePayload {
  const validIds = new Set(catalog.map((product) => product.id));

  return {
    ...payload,
    recommendations: payload.recommendations.filter((item) => validIds.has(item.productId)),
    quickReplies: payload.quickReplies.slice(0, 5),
    stylingNotes: payload.stylingNotes.slice(0, 3),
  };
}

function normalizeAssistantResponsePayload(
  payload: AssistantResponsePayload,
): NormalizedAssistantResponsePayload {
  return {
    ...payload,
    storyNote: payload.storyNote ?? undefined,
    weatherNote: payload.weatherNote ?? undefined,
    recommendations: payload.recommendations.map((item) => ({
      ...item,
      emphasis: item.emphasis ?? undefined,
    })),
    profileSummary: {
      occasion: payload.profileSummary.occasion ?? undefined,
      preferredStyle: payload.profileSummary.preferredStyle ?? undefined,
      colors: payload.profileSummary.colors ?? undefined,
      size: payload.profileSummary.size ?? undefined,
      intent: payload.profileSummary.intent ?? undefined,
      weather: payload.profileSummary.weather ?? undefined,
    },
  };
}

function mapRoleForModel(role: ChatMessageRole) {
  if (role === ChatMessageRole.ASSISTANT) {
    return "assistant";
  }

  if (role === ChatMessageRole.SYSTEM) {
    return "system";
  }

  return "user";
}

function createAssistantMetadata(
  payload: NormalizedAssistantResponsePayload,
): AssistantMessageMetadata {
  return {
    quickReplies: payload.quickReplies,
    recommendations: payload.recommendations,
    stylingNotes: payload.stylingNotes,
    storyNote: payload.storyNote,
    weatherNote: payload.weatherNote,
    profileSummary: payload.profileSummary,
  };
}

function serializeChatMessage(message: PersistedChatMessage): AssistantChatMessage | null {
  if (message.role === ChatMessageRole.SYSTEM) {
    return null;
  }

  return serializePersistedMessage(message);
}

function serializePersistedMessage(message: PersistedChatMessage): AssistantChatMessage {
  return {
    id: message.id,
    role: message.role === ChatMessageRole.ASSISTANT ? "assistant" : "user",
    text: message.content,
    createdAt: message.createdAt.toISOString(),
    metadata: isAssistantMetadata(message.metadata) ? message.metadata : undefined,
  };
}

function isAssistantMetadata(value: unknown): value is AssistantMessageMetadata {
  return typeof value === "object" && value !== null;
}

function buildChatTitle(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ");
  return normalized.length <= 60 ? normalized : `${normalized.slice(0, 57)}...`;
}

function createEphemeralHistory(
  messages: AssistantHistoryInputMessage[] | undefined,
  currentMessage: string,
) {
  const history = (messages ?? [])
    .filter((message) => message.text.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map<PersistedChatMessage>((message, index) => ({
      id: message.id ?? `ephemeral-history-${index}`,
      role: message.role === "assistant" ? ChatMessageRole.ASSISTANT : ChatMessageRole.USER,
      content: message.text,
      metadata: null,
      createdAt: new Date(),
    }));

  if (history.at(-1)?.content === currentMessage) {
    return history;
  }

  return [...history, createEphemeralUserMessage(currentMessage)];
}

function createEphemeralUserMessage(message: string): PersistedChatMessage {
  return {
    id: `ephemeral-user-${Date.now()}`,
    role: ChatMessageRole.USER,
    content: message,
    metadata: null,
    createdAt: new Date(),
  };
}

function createEphemeralAssistantMessage(
  payload: NormalizedAssistantResponsePayload,
): PersistedChatMessage {
  return {
    id: `ephemeral-assistant-${Date.now()}`,
    role: ChatMessageRole.ASSISTANT,
    content: payload.message,
    metadata: createAssistantMetadata(payload),
    createdAt: new Date(),
  };
}

function createAssistantFallbackResponse(message: string, fallbackReason: string): AssistantResponse {
  const createdAt = new Date().toISOString();

  return {
    chatSessionId: ASSISTANT_FALLBACK_SESSION_ID,
    userMessage: {
      id: `fallback-user-${Date.now()}`,
      role: "user",
      text: message,
      createdAt,
    },
    assistantMessage: {
      id: `fallback-assistant-${Date.now()}`,
      role: "assistant",
      text: "I received your message, but the live MIN HON Style Assistant is not available yet. You can keep browsing the storefront normally and try the chat again once the assistant provider is ready.",
      createdAt,
      metadata: {
        stylingNotes: [fallbackReason],
      },
    },
  };
}

function createUnavailableAssistantResponse(message: string): NormalizedAssistantResponsePayload {
  return {
    message,
    quickReplies: [],
    recommendations: [],
    stylingNotes: [
      "Free-text chat stays available as the main experience, but live recommendations pause cleanly until the provider responds again.",
    ],
    profileSummary: {},
  };
}

function getProviderSetupMessage() {
  const provider = getAssistantProviderConfig();

  if (provider.provider === "ollama") {
    return `Local assistant mode is configured for Ollama at ${provider.endpoint} using the ${provider.model} model.`;
  }

  return `OpenAI assistant mode is selected, but OPENAI_API_KEY is not configured for the ${provider.model} model.`;
}

function createOllamaUnavailableMessage(
  error: AssistantProviderError,
  endpoint: string,
  model: string,
) {
  if (error.code === "ollama_model_not_found") {
    return `Local Ollama mode is active, but the ${model} model is not available yet. Run \`ollama pull ${model}\` and try again.`;
  }

  if (error.code === "ollama_unreachable") {
    return `Local Ollama mode is active, but Ollama is not reachable at ${endpoint}. Start Ollama and make sure ${model} is available, then try again.`;
  }

  return `Local Ollama mode is active, but the assistant could not get a valid response from ${endpoint}. Please confirm Ollama is running with the ${model} model and try again.`;
}

"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BrandImage } from "@/components/ui/brand-image";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CommerceHero, CommerceSectionIntro } from "@/features/commerce/commerce-ui";
import { productsById } from "@/features/commerce/commerce-data";
import { useCommerce } from "@/features/commerce/commerce-provider";
import { formatPrice } from "@/features/commerce/commerce-utils";
import type {
  AssistantChatMessage,
  AssistantConversationPayload,
  AssistantQuickReply,
  AssistantResponse,
} from "@/features/assistant/assistant-contracts";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "min-hon-style-assistant-chat-session-id";

const examplePrompts = [
  "I need a gift for a meaningful occasion.",
  "Build me a full look for cool weather.",
  "Recommend something personal with a story element.",
  "I want a minimal everyday piece in olive or clay.",
];

const welcomeMessage: AssistantChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  text:
    "Welcome to the MIN HON Style Assistant. I can help with gifting, personal pieces, full looks, and weather-based styling using the real collection. Tell me naturally what you need, and I will guide the conversation from there.",
  metadata: {
    quickReplies: [
      { label: "Gift styling", prompt: "I need a gift recommendation." },
      { label: "Personal piece", prompt: "Help me find a personal story-led piece." },
      { label: "Full look", prompt: "Build me a complete MIN HON look." },
      { label: "Weather help", prompt: "Recommend pieces for today's weather." },
    ],
  },
};

async function readJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const body = (await response.json().catch(() => null)) as { error?: string } | T | null;

  if (!response.ok) {
    throw new Error(
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${response.status}`,
    );
  }

  return body as T;
}

export function StyleAssistantPage() {
  const { sessionId } = useCommerce();
  const [messages, setMessages] = useState<AssistantChatMessage[]>([welcomeMessage]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === "assistant") ?? null;
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isSubmitting, messages]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedChatSessionId = window.localStorage.getItem(STORAGE_KEY);
    setChatSessionId(storedChatSessionId);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const currentSessionId = sessionId;
    let cancelled = false;

    async function loadConversation() {
      setIsLoadingConversation(true);

      try {
        const params = new URLSearchParams();
        params.set("sessionId", currentSessionId);

        if (chatSessionId) {
          params.set("chatSessionId", chatSessionId);
        }

        const conversation = await readJson<AssistantConversationPayload>(`/api/assistant?${params}`);

        if (cancelled) {
          return;
        }

        if (conversation.chatSessionId) {
          setChatSessionId(conversation.chatSessionId);
          window.localStorage.setItem(STORAGE_KEY, conversation.chatSessionId);
        }

        setMessages(
          conversation.messages.length > 0 ? conversation.messages : [welcomeMessage],
        );
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setMessages([welcomeMessage]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load the assistant.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingConversation(false);
        }
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [chatSessionId, sessionId]);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !sessionId || isSubmitting) {
      return;
    }

    const optimisticUserMessage: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, optimisticUserMessage]);
    setDraft("");
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await readJson<AssistantResponse>("/api/assistant", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          chatSessionId: chatSessionId ?? undefined,
          message: trimmedMessage,
          messages: messages.slice(-16),
        }),
      });

      setChatSessionId(response.chatSessionId);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, response.chatSessionId);
      }

      setMessages((currentMessages) => {
        const withoutOptimisticUser = currentMessages.filter(
          (currentMessage) => currentMessage.id !== optimisticUserMessage.id,
        );

        return [...withoutOptimisticUser, response.userMessage, response.assistantMessage];
      });
    } catch (submitError) {
      setMessages((currentMessages) =>
        currentMessages.filter((currentMessage) => currentMessage.id !== optimisticUserMessage.id),
      );
      setDraft(trimmedMessage);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The assistant could not respond right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(draft);
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!draft.trim() || !sessionId || isSubmitting) {
      return;
    }

    void sendMessage(draft);
  };

  const handleQuickReply = async (reply: AssistantQuickReply) => {
    await sendMessage(reply.prompt);
  };

  const handleStartOver = async () => {
    if (sessionId && chatSessionId) {
      try {
        const params = new URLSearchParams({
          sessionId,
          chatSessionId,
        });
        await fetch(`/api/assistant?${params}`, { method: "DELETE" });
      } catch {
        // Reset the local UI even if archival fails.
      }
    }

    setMessages([welcomeMessage]);
    setDraft("");
    setError(null);
    setChatSessionId(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <>
      <CommerceHero
        eyebrow="Style Assistant"
        arabicLabel={"\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0623\u0646\u0627\u0642\u0629"}
        title="A real MIN HON styling assistant for gifting, weather-based picks, personal pieces, and complete looks."
        description="The assistant now runs through a real backend route, uses the MIN HON catalog as grounding context, and keeps each recommendation tied to products the site actually offers."
        asideTitle="Server-backed stylist"
        asideText="Ask naturally and the assistant will guide the conversation through occasion, style, color, size, gifting intent, weather, and story-led recommendations."
        asideFootnote={"\u0645\u0633\u0627\u0639\u062f \u0623\u0646\u0627\u0642\u0629 \u062d\u0642\u064a\u0642\u064a \u0645\u062f\u0639\u0648\u0645 \u0628\u0627\u0644\u062e\u0627\u062f\u0645 \u0648\u0645\u0631\u062a\u0628\u0637 \u0628\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,250,242,0.96),rgba(246,240,229,0.88))] px-6 py-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    MIN HON Assistant
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight">Guided conversation</h2>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    Real backend responses, real catalog grounding, and the same calm MIN HON presentation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => void handleStartOver()}>
                    Start over
                  </Button>
                  <ButtonLink href="/customize">Go to Customize</ButtonLink>
                </div>
              </div>
            </div>

            <div className="max-h-[68vh] space-y-4 overflow-y-auto bg-[rgba(255,252,247,0.8)] px-4 py-5 sm:px-6">
              {messages.map((message) => (
                <ChatMessageBlock
                  key={message.id}
                  message={message}
                  onQuickReply={handleQuickReply}
                />
              ))}

              {isLoadingConversation || isSubmitting ? <TypingIndicator /> : null}
              <div ref={endRef} />
            </div>

            <div className="border-t border-[var(--border)] bg-[rgba(255,250,242,0.92)] px-4 py-4 sm:px-6">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Ask the stylist
                </label>
                <p className="text-sm leading-7 text-[var(--muted)]">
                  Type your message naturally. Suggestions are optional, and you can press Enter to send.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="Try: I need a black hoodie, I want something for warm weather, I need a gift for a friend, or I like minimalist style."
                    className="min-h-[3.5rem] flex-1 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--highlight)]"
                    disabled={!sessionId || isSubmitting}
                    rows={2}
                  />
                  <div className="flex shrink-0 flex-col justify-between gap-3 sm:w-40">
                    <Button type="submit" disabled={!draft.trim() || !sessionId || isSubmitting}>
                      {isSubmitting ? "Styling..." : "Send"}
                    </Button>
                    <p className="text-xs leading-6 text-[var(--muted)]">
                      Press `Enter` to send or `Shift + Enter` for a new line. Recommendations stay tied to the active MIN HON catalog.
                    </p>
                  </div>
                </div>
              </form>

              {error ? (
                <div className="mt-3 rounded-[1.2rem] border border-[var(--border-strong)] bg-[rgba(122,70,50,0.08)] px-4 py-3 text-sm leading-7 text-[var(--foreground)]">
                  {error}
                </div>
              ) : null}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <CommerceSectionIntro
                eyebrow="Suggested Starts"
                title="Helpful ways to begin"
                description="You can ignore these and type your own message at any time, or use one to nudge the conversation toward occasion, weather, gifting, or full-look guidance."
              />
              <div className="mt-5 grid gap-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm leading-7 text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--surface-strong)]"
                    onClick={() => void sendMessage(prompt)}
                    disabled={!sessionId || isSubmitting}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <CommerceSectionIntro
                eyebrow="What It Uses"
                title="Grounded recommendation context"
                description="The backend uses the site catalog, persisted chat history, and brand-safe instructions before it calls the active assistant provider. In local development, that provider is Ollama."
              />
              <div className="mt-5 grid gap-3">
                <InsightRow title="Catalog-aware" text="Recommendations are limited to active MIN HON products already used by the storefront." />
                <InsightRow title="Session-backed" text="Chat sessions and messages are stored in Prisma so the assistant can be resumed and improved later." />
                <InsightRow title="Story-aware" text="QR-linked story or digital content is only surfaced when gifting, keepsakes, customization, or personal storytelling is relevant." />
                <InsightRow title="Weather-aware" text="The assistant asks about climate and uses it directly in product reasoning and full-look suggestions." />
              </div>
            </Card>

            {lastAssistantMessage?.metadata?.profileSummary ? (
              <Card className="p-6 sm:p-7">
                <CommerceSectionIntro
                  eyebrow="Current Read"
                  title="What the assistant has picked up"
                  description="A quick snapshot of the preference signals currently guiding the recommendations."
                />
                <div className="mt-5 grid gap-3">
                  {Object.entries(lastAssistantMessage.metadata.profileSummary).map(([key, value]) =>
                    value ? (
                      <div
                        key={key}
                        className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--background)] px-4 py-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                          {key}
                        </p>
                        <p className="mt-2 text-sm leading-7">{value}</p>
                      </div>
                    ) : null,
                  )}
                </div>
              </Card>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}

function ChatMessageBlock({
  message,
  onQuickReply,
}: {
  message: AssistantChatMessage;
  onQuickReply: (reply: AssistantQuickReply) => void;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[52rem] space-y-3", isAssistant ? "" : "items-end")}>
        <div
          className={cn(
            "rounded-[1.8rem] px-5 py-4 text-sm leading-7 shadow-[0_14px_32px_rgba(68,50,28,0.08)]",
            isAssistant
              ? "border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(245,238,228,0.94))] text-[var(--foreground)]"
              : "border border-[var(--accent-deep)] bg-[linear-gradient(180deg,var(--accent)_0%,var(--accent-deep)_100%)] text-white",
          )}
        >
          {message.text}
        </div>

        {message.metadata?.recommendations?.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {message.metadata.recommendations.map((card) => (
              <AssistantProductCard
                key={`${message.id}-${card.productId}`}
                productId={card.productId}
                reason={card.reason}
                emphasis={card.emphasis}
              />
            ))}
          </div>
        ) : null}

        {message.metadata?.stylingNotes?.length ? (
          <div className="space-y-2">
            {message.metadata.stylingNotes.map((note) => (
              <div
                key={note}
                className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,250,242,0.74)] px-4 py-3 text-xs leading-6 text-[var(--muted)]"
              >
                {note}
              </div>
            ))}
          </div>
        ) : null}

        {message.metadata?.weatherNote ? (
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,250,242,0.74)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
            {message.metadata.weatherNote}
          </div>
        ) : null}

        {message.metadata?.storyNote ? (
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,250,242,0.74)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
            {message.metadata.storyNote}
          </div>
        ) : null}

        {message.metadata?.quickReplies?.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Optional suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {message.metadata.quickReplies.map((reply) => (
                <button
                  key={`${message.id}-${reply.label}`}
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--surface-strong)]"
                  onClick={() => onQuickReply(reply)}
                >
                  {reply.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AssistantProductCard({
  productId,
  reason,
  emphasis,
}: {
  productId: keyof typeof productsById;
  reason: string;
  emphasis?: string;
}) {
  const product = productsById[productId];

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 sm:grid-cols-[145px_1fr]">
        <BrandImage
          src={product.image.src}
          alt={product.image.alt}
          className="min-h-[220px] border-b border-[var(--border)] sm:min-h-full sm:border-b-0 sm:border-r"
          sizes="(max-width: 640px) 100vw, 145px"
          contentClassName="p-4"
          content={
            <div className="space-y-2">
              {emphasis ? (
                <span className="inline-flex rounded-full border border-white/30 bg-[rgba(255,250,242,0.16)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {emphasis}
                </span>
              ) : null}
              <p className="text-lg font-semibold text-white">{product.name}</p>
              <p className="text-sm font-medium text-white/82">{formatPrice(product.price)}</p>
            </div>
          }
        />

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {product.subtitle}
            </p>
            <h3 className="text-2xl font-semibold">{product.name}</h3>
            <p className="text-sm leading-7 text-[var(--muted)]">{reason}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {product.colors.map((color) => (
              <span
                key={color}
                className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1"
              >
                {color}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/customize">Customize</ButtonLink>
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[rgba(255,250,242,0.9)] px-5 py-2.5 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--surface-strong)]"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)] shadow-[0_10px_22px_rgba(68,50,28,0.08)]">
        <span>MIN HON Assistant is thinking</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--highlight)]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--highlight)] [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--highlight)] [animation-delay:240ms]" />
        </span>
      </div>
    </div>
  );
}

function InsightRow({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{text}</p>
    </div>
  );
}

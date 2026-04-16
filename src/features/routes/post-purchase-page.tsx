"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import {
  CommerceHero,
  CommerceSectionIntro,
} from "@/features/commerce/commerce-ui";
import { Container } from "@/components/ui/container";
import { useCommerce } from "@/features/commerce/commerce-provider";
import type { DeliveryReview } from "@/features/commerce/commerce-types";

const postPurchaseActions = [
  {
    title: "Share the piece",
    text: "Invite word of mouth and social storytelling when the product becomes part of a real moment.",
  },
  {
    title: "Reorder or create again",
    text: "Start a new piece when another story, gift, or memory is ready to be carried forward.",
  },
];

export function PostPurchasePage() {
  const { lastOrder, reviews, saveReview } = useCommerce();
  const [draftEdits, setDraftEdits] = useState<Record<string, { rating: number; reviewText: string }>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const persistedDrafts = useMemo(() => {
    if (!lastOrder) {
      return {};
    }

    return lastOrder.items.reduce<Record<string, { rating: number; reviewText: string }>>(
      (accumulator, item) => {
        const existingReview = reviews.find(
          (review) => review.orderId === lastOrder.id && review.itemId === item.id,
        );

        accumulator[item.id] = {
          rating: existingReview?.rating ?? 0,
          reviewText: existingReview?.reviewText ?? "",
        };

        return accumulator;
      },
      {},
    );
  }, [lastOrder, reviews]);

  if (!lastOrder) {
    return (
      <section className="py-20">
        <Container>
          <Card className="p-8 sm:p-10">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold">No delivered order available yet</h1>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Complete a purchase flow first, then this page can collect ratings and post-delivery feedback.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/customize">Start Creating</ButtonLink>
                <ButtonLink href="/order-confirmation" variant="secondary">
                  View Last Confirmation
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const handleDraftChange = (itemId: string, value: Partial<{ rating: number; reviewText: string }>) => {
    setDraftEdits((currentDrafts) => ({
      ...currentDrafts,
      [itemId]: {
        rating: currentDrafts[itemId]?.rating ?? persistedDrafts[itemId]?.rating ?? 0,
        reviewText: currentDrafts[itemId]?.reviewText ?? persistedDrafts[itemId]?.reviewText ?? "",
        ...value,
      },
    }));
  };

  const handleSaveReview = async ({
    itemId,
    productId,
    productName,
  }: {
    itemId: string;
    productId: DeliveryReview["productId"];
    productName: string;
  }) => {
    const draft = draftEdits[itemId] ?? persistedDrafts[itemId];

    if (!draft || draft.rating < 1) {
      setFeedbackMessage({
        tone: "error",
        text: "Choose a star rating before saving your post-delivery feedback.",
      });
      return;
    }

    await saveReview({
      orderId: lastOrder.id,
      itemId,
      productId,
      productName,
      rating: draft.rating as DeliveryReview["rating"],
      reviewText: draft.reviewText,
    });

    setDraftEdits((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[itemId];
      return nextDrafts;
    });
    setFeedbackMessage({
      tone: "success",
      text: `Your review for ${productName} has been saved.`,
    });
  };

  return (
    <>
      <CommerceHero
        eyebrow="Post Purchase"
        arabicLabel={"\u0628\u0639\u062f \u0627\u0644\u0634\u0631\u0627\u0621"}
        title="The relationship continues after delivery through reflection, rating, and another story to tell."
        description="This page now gives customers a gentle place to rate the delivered piece and leave thoughtful feedback after the order arrives."
        asideTitle="After delivery"
        asideText="The post-purchase step stays emotional and human while also collecting useful feedback for the future experience."
        asideFootnote={"\u0628\u0639\u062f \u0648\u0635\u0648\u0644 \u0627\u0644\u0642\u0637\u0639\u0629\u060c \u062a\u0628\u062f\u0623 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062a\u0642\u064a\u064a\u0645 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0642\u0635\u0629 \u062c\u062f\u064a\u062f\u0629."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <CommerceSectionIntro
                eyebrow="Review & Rating"
                title="How did the delivered piece feel?"
                description="Rate each item from your latest order and write a short review when you want to capture the feeling after delivery."
              />

              <div className="mt-6 space-y-4">
                {lastOrder.items.map((item) => {
                  const draft = draftEdits[item.id] ?? persistedDrafts[item.id] ?? { rating: 0, reviewText: "" };

                  return (
                    <div
                      key={item.id}
                      className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold">{item.productName}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {item.customTitle || "Personalized piece"}
                            </p>
                          </div>
                          <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                            {item.color}
                            {item.size ? ` / ${item.size}` : ""}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold">Rating</p>
                            <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                              {draft.rating > 0 ? `${draft.rating} of 5 stars selected` : "Select 1 to 5 stars"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 5 }, (_, index) => {
                              const ratingValue = index + 1;
                              const active = draft.rating >= ratingValue;

                              return (
                                <button
                                  key={ratingValue}
                                  type="button"
                                  aria-label={`Rate ${item.productName} ${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
                                  aria-pressed={draft.rating === ratingValue}
                                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl transition ${
                                    active
                                      ? "border-[var(--highlight)] bg-[linear-gradient(180deg,rgba(184,134,80,0.18),rgba(255,250,242,1))] text-[var(--highlight)] shadow-[0_12px_22px_rgba(184,134,80,0.16)]"
                                      : "border-[var(--border)] bg-[var(--background)] text-[var(--border-strong)] hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:text-[var(--highlight)]"
                                  }`}
                                  onClick={() => handleDraftChange(item.id, { rating: ratingValue })}
                                >
                                  {"\u2605"}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <label className="block space-y-2">
                          <span className="text-sm font-semibold">Review</span>
                          <textarea
                            value={draft.reviewText}
                            onChange={(event) =>
                              handleDraftChange(item.id, { reviewText: event.target.value })
                            }
                            placeholder="Tell us how it felt after delivery, what stood out, or what could be improved."
                            rows={4}
                            className="w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 outline-none"
                          />
                          <p className="text-xs leading-6 text-[var(--muted)]">
                            Optional, but helpful for capturing how the quality, packaging, or customization felt after delivery.
                          </p>
                        </label>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="secondary"
                            onClick={() =>
                              void handleSaveReview({
                                itemId: item.id,
                                productId: item.productId,
                                productName: item.productName,
                              })
                            }
                          >
                            Save Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {feedbackMessage ? (
                <div
                  className={`mt-5 rounded-2xl px-4 py-3 text-sm leading-7 ${
                    feedbackMessage.tone === "success"
                      ? "border border-[rgba(77,107,74,0.26)] bg-[rgba(241,248,239,0.96)] text-[var(--accent-deep)]"
                      : "border border-[rgba(179,111,83,0.35)] bg-[rgba(255,248,244,0.96)] text-[#8a513c]"
                  }`}
                >
                  {feedbackMessage.text}
                </div>
              ) : null}
            </Card>

            <div className="grid gap-4">
              {postPurchaseActions.map((action) => (
                <Card key={action.title} className="p-6">
                  <h3 className="text-2xl font-semibold">{action.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{action.text}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-[linear-gradient(135deg,rgba(77,107,74,0.10),rgba(255,253,248,1)_52%,rgba(184,134,80,0.08))] p-6 sm:p-7">
            <div className="space-y-5">
              <CommerceSectionIntro
                eyebrow="Return Path"
                title="Where to go next"
                description="After rating the order, the customer can continue exploring, start another personalized piece, or simply return later."
              />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                Ratings and written feedback are saved locally in this prototype, so the review stays available on this device while shared account history and backend review storage come later.
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/explore">Return to Explore</ButtonLink>
                <ButtonLink href="/customize" variant="secondary">
                  Create Another Piece
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}

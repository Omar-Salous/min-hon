"use client";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BrandImage } from "@/components/ui/brand-image";
import { Card } from "@/components/ui/card";
import {
  CommerceHero,
  CommerceSectionIntro,
  SummaryRow,
} from "@/features/commerce/commerce-ui";
import { useCommerce } from "@/features/commerce/commerce-provider";
import { formatPrice } from "@/features/commerce/commerce-utils";
import { Container } from "@/components/ui/container";

export function CartPage() {
  const {
    hydrated,
    cartItems,
    subtotal,
    shipping,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCommerce();
  const hasItems = cartItems.length > 0;

  return (
    <>
      <CommerceHero
        eyebrow="Cart"
        arabicLabel={"\u0627\u0644\u0633\u0644\u0629"}
        title="Review the pieces you chose and move forward when everything feels right."
        description="The cart should feel calm and reassuring, giving users a clear sense of what they selected without pressure or clutter."
        asideTitle="Order snapshot"
        asideText="This step holds the story in one place: product, message, options, and the path to checkout."
        asideFootnote={"\u062e\u0630 \u0644\u062d\u0638\u0629 \u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0642\u0637\u0639 \u0642\u0628\u0644 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0625\u0644\u0649 \u0627\u0644\u062f\u0641\u0639."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <CommerceSectionIntro
              eyebrow="Order Summary"
              title="The pieces currently in your cart"
              description="Products stay visible and editable here so first-time users can confirm everything before checkout."
            />

            {!hydrated ? (
              <Card className="p-6 text-sm text-[var(--muted)]">Loading your cart...</Card>
            ) : !hasItems ? (
              <Card className="p-6 sm:p-7">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Your cart is still empty</h3>
                  <p className="text-sm leading-7 text-[var(--muted)]">
                    Start from Customize or Explore, then add a personalized piece here with its title, story, and selected options.
                  </p>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    Tip: uploading artwork on the Customize page will also carry that image into the cart preview.
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink href="/customize">Start Creating</ButtonLink>
                    <ButtonLink href="/explore" variant="secondary">
                      Explore Products
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onDecrease={() => void updateQuantity(item.id, item.quantity - 1)}
                    onIncrease={() => void updateQuantity(item.id, item.quantity + 1)}
                    onRemove={() => void removeFromCart(item.id)}
                  />
                ))}
              </>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Subtotal"
                  title="Order totals"
                  description="A simple summary panel keeps pricing, delivery, and the next step easy to scan."
                />
                {hasItems ? (
                  <div className="space-y-3">
                    <SummaryRow label="Items subtotal" value={formatPrice(subtotal)} />
                    <SummaryRow label="Estimated delivery" value={formatPrice(shipping)} />
                    <div className="border-t border-[var(--border)] pt-3">
                      <SummaryRow label="Estimated total" value={formatPrice(total)} emphasized />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    Your totals will appear here as soon as at least one piece is added to the cart.
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/checkout">Continue to Checkout</ButtonLink>
                  <ButtonLink href="/explore" variant="secondary">
                    Continue Browsing
                  </ButtonLink>
                </div>

                {hasItems ? (
                  <Button variant="ghost" className="justify-start px-0" onClick={() => void clearCart()}>
                    Clear cart
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card className="bg-[linear-gradient(135deg,rgba(77,107,74,0.10),rgba(255,253,248,1)_52%,rgba(184,134,80,0.08))] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Calm reassurance
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                This flow is intentionally paced so the user can still adjust product choices before entering shipping and payment.
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

function CartItemCard({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: ReturnType<typeof useCommerce>["cartItems"][number];
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const detailRows = [
    `Color: ${item.color}`,
    item.size ? `Size: ${item.size}` : null,
    `Title: ${item.customTitle}`,
    item.customStory ? `Story: ${item.customStory}` : null,
    item.uploadedImageUrl ? "Artwork: Uploaded image included" : null,
  ].filter(Boolean) as string[];

  return (
    <Card className="p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <BrandImage
          src={item.uploadedImageUrl || item.productImage.src}
          alt={item.uploadedImageUrl ? `${item.productName} uploaded artwork` : item.productImage.alt}
          className="aspect-[4/5] rounded-[1.5rem] border border-[var(--border)]"
          sizes="160px"
        />

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {item.subtitle}
              </p>
              <h3 className="text-2xl font-semibold">{item.productName}</h3>
              <p className="text-sm text-[var(--muted)]">{formatPrice(item.unitPrice)} each</p>
            </div>
            <p className="text-lg font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
          </div>

          <div className="grid gap-2">
            {detailRows.map((detail) => (
              <div
                key={detail}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-7"
              >
                {detail}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-2">
              <Button variant="ghost" className="min-h-0 px-3 py-1" onClick={onDecrease}>
                -
              </Button>
              <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
              <Button variant="ghost" className="min-h-0 px-3 py-1" onClick={onIncrease}>
                +
              </Button>
            </div>
            <Button variant="secondary" className="min-h-0 px-4 py-2 text-sm" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

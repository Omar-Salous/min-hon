"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import {
  CommerceHero,
  CommerceSectionIntro,
  SummaryRow,
  TimelineCard,
} from "@/features/commerce/commerce-ui";
import { useCommerce } from "@/features/commerce/commerce-provider";
import { formatPrice } from "@/features/commerce/commerce-utils";
import { Container } from "@/components/ui/container";

export function OrderConfirmationPage() {
  const { lastOrder } = useCommerce();

  if (!lastOrder) {
    return (
      <section className="py-20">
        <Container>
          <Card className="p-8 sm:p-10">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold">No recent order found</h1>
              <p className="text-sm leading-7 text-[var(--muted)]">
                Complete a cart and payment flow first, then your confirmation details will appear here.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/customize">Start Creating</ButtonLink>
                <ButtonLink href="/cart" variant="secondary">
                  Open Cart
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <>
      <CommerceHero
        eyebrow="Order Confirmation"
        arabicLabel={"\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628"}
        title="Your order is confirmed and the story is now moving toward delivery."
        description="This page reassures the customer immediately, summarizes the order, and makes the next step feel obvious."
        asideTitle="Confirmation"
        asideText="The tone here is less transactional and more reassuring: the piece is now in progress and the customer knows what comes next."
        asideFootnote={"\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0637\u0644\u0628\u0643\u060c \u0648\u0633\u0646\u062a\u0627\u0628\u0639 \u0645\u0639\u0643 \u0645\u0631\u062d\u0644\u0629 \u0628\u0645\u0631\u062d\u0644\u0629."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Order Summary"
                  title="What was confirmed"
                  description="A clean recap helps the customer feel secure and reduces uncertainty."
                />
                <div className="space-y-3">
                  <SummaryRow label="Order number" value={lastOrder.id} emphasized />
                  <SummaryRow label="Items" value={`${lastOrder.itemCount} customized product${lastOrder.itemCount > 1 ? "s" : ""}`} />
                  <SummaryRow
                    label="Payment method"
                    value={lastOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Credit or Debit Card"}
                  />
                  <SummaryRow label="Estimated delivery" value="3-5 business days" />
                  <div className="border-t border-[var(--border)] pt-3">
                    <SummaryRow label="Final total" value={formatPrice(lastOrder.total)} emphasized />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Confirmed Pieces"
                  title="The products in this order"
                  description="Your confirmation now reflects the actual cart items that moved through checkout."
                />
                <div className="space-y-3">
                  {lastOrder.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.productName} x{item.quantity}</p>
                          <p className="text-[var(--muted)]">{item.color}{item.size ? ` / ${item.size}` : ""}</p>
                          <p className="text-[var(--muted)]">{item.customTitle}</p>
                        </div>
                        <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <TimelineCard
              title="What happens next"
              items={[
                {
                  title: "Order confirmed",
                  text: "Your selections and delivery information are now recorded.",
                  active: true,
                },
                {
                  title: "Preparation begins",
                  text: "The product moves into internal production and packaging stages.",
                },
                {
                  title: "Delivery update",
                  text: "You can follow the order status once it moves forward in the journey.",
                },
              ]}
            />
          </div>

          <Card className="p-6 sm:p-7">
            <div className="space-y-5">
              <CommerceSectionIntro
                eyebrow="Next Actions"
                title="Keep the journey moving"
                description="Confirmation should point clearly toward delivery tracking or another browse path."
              />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                Delivering to {lastOrder.checkoutDetails.firstName} {lastOrder.checkoutDetails.lastName}, {lastOrder.checkoutDetails.city}. You can now track delivery, return to the collection, or begin shaping another piece whenever you are ready.
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/delivery">Track Delivery</ButtonLink>
                <ButtonLink href="/explore" variant="secondary">
                  Continue Browsing
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
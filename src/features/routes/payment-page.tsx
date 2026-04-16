"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import {
  CommerceField,
  CommerceHero,
  CommerceSectionIntro,
  SummaryRow,
} from "@/features/commerce/commerce-ui";
import { useCommerce } from "@/features/commerce/commerce-provider";
import { formatPrice } from "@/features/commerce/commerce-utils";
import { Container } from "@/components/ui/container";

export function PaymentPage() {
  const router = useRouter();
  const {
    cartItems,
    checkoutDetails,
    paymentMethod,
    cardDetails,
    shipping,
    total,
    updatePaymentMethod,
    updateCardDetails,
    completeOrder,
  } = useCommerce();
  const [errorMessage, setErrorMessage] = useState("");

  const needsCardFields = paymentMethod === "card";

  const hasMissingCardFields = useMemo(() => {
    if (!needsCardFields) {
      return false;
    }

    return Object.values(cardDetails).some((value) => !value.trim());
  }, [cardDetails, needsCardFields]);

  const handleCompletePayment = async () => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty, so there is no payment to complete.");
      return;
    }

    if (!checkoutDetails.firstName || !checkoutDetails.addressLine) {
      setErrorMessage("Return to checkout first so delivery details are in place.");
      return;
    }

    if (hasMissingCardFields) {
      setErrorMessage("Complete the card fields before confirming payment.");
      return;
    }

    const order = await completeOrder();
    if (!order) {
      setErrorMessage("Something went wrong while preparing the order.");
      return;
    }

    setErrorMessage("");
    router.push("/order-confirmation");
  };

  return (
    <>
      <CommerceHero
        eyebrow="Payment"
        arabicLabel={"\u0627\u0644\u062f\u0641\u0639"}
        title="Choose the payment option that feels easiest and most comfortable."
        description="This step keeps payment calm and transparent, with room for local preferences like cash on delivery."
        asideTitle="Payment step"
        asideText="The customer should understand both the method and the next step before completing the order."
        asideFootnote={"\u0627\u062e\u062a\u0631 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0623\u0646\u0633\u0628\u060c \u0648\u0623\u0643\u0645\u0644 \u0627\u0644\u0637\u0644\u0628 \u0628\u0627\u0637\u0645\u0626\u0646\u0627\u0646."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Payment Methods"
                  title="Select how you want to pay"
                  description="Both options are presented clearly so the customer can continue with confidence."
                />

                <div className="grid gap-4">
                  <PaymentMethodCard
                    title="Cash on Delivery"
                    description="Pay when the order arrives. A familiar and low-friction choice for local delivery."
                    active={paymentMethod === "cod"}
                    onClick={() => updatePaymentMethod("cod")}
                  />
                  <PaymentMethodCard
                    title="Credit or Debit Card"
                    description="Use a card form for immediate payment when online confirmation is preferred."
                    active={paymentMethod === "card"}
                    onClick={() => updatePaymentMethod("card")}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Card Form"
                  title="Card payment fields"
                  description="Frontend-only for now, but structured like a clear and trustworthy payment form."
                />

                {needsCardFields ? (
                  <div className="grid gap-4">
                    <CommerceField label="Cardholder name">
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(event) => updateCardDetails({ cardholderName: event.target.value })}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                      />
                    </CommerceField>
                    <CommerceField label="Card number">
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(event) => updateCardDetails({ cardNumber: event.target.value })}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                      />
                    </CommerceField>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CommerceField label="Expiry">
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(event) => updateCardDetails({ expiry: event.target.value })}
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                        />
                      </CommerceField>
                      <CommerceField label="CVC">
                        <input
                          type="text"
                          value={cardDetails.cvc}
                          onChange={(event) => updateCardDetails({ cvc: event.target.value })}
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                        />
                      </CommerceField>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    Cash on delivery is selected, so no extra payment fields are needed here.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Trust & Summary"
                  title="Final review"
                  description="The user should understand the total and feel reassured before confirming payment."
                />
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <SummaryRow
                      key={item.id}
                      label={`${item.productName} x${item.quantity}`}
                      value={formatPrice(item.unitPrice * item.quantity)}
                    />
                  ))}
                  <SummaryRow label="Delivery" value={formatPrice(shipping)} />
                  <div className="border-t border-[var(--border)] pt-3">
                    <SummaryRow label="Final total" value={formatPrice(total)} emphasized />
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                  Clear totals, calm language, and familiar payment options help reduce friction at the most sensitive step of the flow.
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-[rgba(179,111,83,0.35)] bg-[rgba(255,248,244,0.96)] px-4 py-3 text-sm leading-7 text-[#8a513c]">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void handleCompletePayment()}>Complete Payment</Button>
                  <ButtonLink href="/checkout" variant="secondary">
                    Back to Checkout
                  </ButtonLink>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

function PaymentMethodCard({
  title,
  description,
  active = false,
  onClick,
}: {
  title: string;
  description: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-[1.7rem] border p-5 text-left transition ${
        active
          ? "border-[var(--accent)] bg-[linear-gradient(180deg,rgba(77,107,74,0.08),rgba(255,253,248,1))] shadow-[0_16px_30px_rgba(50,73,48,0.12)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--highlight)]"
      }`}
    >
      <p className="text-xl font-semibold">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
    </button>
  );
}

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
import type { CheckoutDetails } from "@/features/commerce/commerce-types";

type RequiredCheckoutField = Exclude<keyof CheckoutDetails, "deliveryNotes">;

const requiredCheckoutFields: RequiredCheckoutField[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "addressLine",
  "city",
  "area",
  "postalCode",
];

export function CheckoutPage() {
  const router = useRouter();
  const {
    hydrated,
    cartItems,
    checkoutDetails,
    subtotal,
    shipping,
    total,
    updateCheckoutDetails,
  } = useCommerce();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const missingRequiredFields = useMemo(() => {
    return requiredCheckoutFields.filter((field) => !checkoutDetails[field].trim());
  }, [checkoutDetails]);
  const hasMissingRequiredFields = missingRequiredFields.length > 0;

  const fieldLabels: Record<RequiredCheckoutField, string> = {
    firstName: "first name",
    lastName: "last name",
    email: "email",
    phone: "phone",
    addressLine: "address line",
    city: "city",
    area: "area",
    postalCode: "postal code",
  };

  const handleContinue = () => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty, so there is nothing to check out yet.");
      setSuccessMessage("");
      return;
    }

    if (hasMissingRequiredFields) {
      const missingSummary = missingRequiredFields
        .slice(0, 3)
        .map((field) => fieldLabels[field])
        .join(", ");
      const moreCount = missingRequiredFields.length - Math.min(missingRequiredFields.length, 3);
      setErrorMessage(
        `Complete the delivery details before continuing to payment. Still needed: ${missingSummary}${moreCount > 0 ? ` and ${moreCount} more field${moreCount > 1 ? "s" : ""}` : ""}.`,
      );
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("Delivery details look complete. Moving you to payment.");
    router.push("/payment");
  };

  return (
    <>
      <CommerceHero
        eyebrow="Checkout"
        arabicLabel={"\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628"}
        title="Add the delivery details with a form that feels clear, secure, and easy to trust."
        description="Checkout should guide first-time users naturally through shipping and contact information without making the experience feel heavy."
        asideTitle="Shipping step"
        asideText="This page gathers what is needed to deliver the order and keep the customer informed."
        asideFootnote={"\u0623\u062f\u062e\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0628\u0648\u0636\u0648\u062d\u060c \u062b\u0645 \u0627\u0646\u062a\u0642\u0644 \u0628\u0633\u0644\u0627\u0633\u0629 \u0625\u0644\u0649 \u0627\u0644\u062f\u0641\u0639."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <Card className="p-6 sm:p-8">
            <div className="space-y-6">
              <CommerceSectionIntro
                eyebrow="Shipping & Contact"
                title="Delivery information"
                description="A frontend-only shipping form for now, saved locally so your progress is not lost while moving through the prototype."
              />

              {!hydrated ? <p className="text-sm text-[var(--muted)]">Loading your checkout details...</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <CommerceField label="First name">
                  <input
                    type="text"
                    value={checkoutDetails.firstName}
                    onChange={(event) => updateCheckoutDetails({ firstName: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required</p>
                </CommerceField>

                <CommerceField label="Last name">
                  <input
                    type="text"
                    value={checkoutDetails.lastName}
                    onChange={(event) => updateCheckoutDetails({ lastName: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required</p>
                </CommerceField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CommerceField label="Email">
                  <input
                    type="email"
                    value={checkoutDetails.email}
                    onChange={(event) => updateCheckoutDetails({ email: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required for confirmation updates</p>
                </CommerceField>

                <CommerceField label="Phone">
                  <input
                    type="tel"
                    value={checkoutDetails.phone}
                    onChange={(event) => updateCheckoutDetails({ phone: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required for delivery contact</p>
                </CommerceField>
              </div>

              <CommerceField label="Address line">
                <input
                  type="text"
                  value={checkoutDetails.addressLine}
                  onChange={(event) => updateCheckoutDetails({ addressLine: event.target.value })}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                />
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required</p>
              </CommerceField>

              <div className="grid gap-4 sm:grid-cols-3">
                <CommerceField label="City">
                  <input
                    type="text"
                    value={checkoutDetails.city}
                    onChange={(event) => updateCheckoutDetails({ city: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required</p>
                </CommerceField>

                <CommerceField label="Area">
                  <input
                    type="text"
                    value={checkoutDetails.area}
                    onChange={(event) => updateCheckoutDetails({ area: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required</p>
                </CommerceField>

                <CommerceField label="Postal code">
                  <input
                    type="text"
                    value={checkoutDetails.postalCode}
                    onChange={(event) => updateCheckoutDetails({ postalCode: event.target.value })}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                  />
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Required</p>
                </CommerceField>
              </div>

              <CommerceField label="Delivery notes">
                <textarea
                  value={checkoutDetails.deliveryNotes}
                  onChange={(event) => updateCheckoutDetails({ deliveryNotes: event.target.value })}
                  rows={5}
                  className="w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 outline-none"
                />
              </CommerceField>

              {errorMessage ? (
                <div className="rounded-2xl border border-[rgba(179,111,83,0.35)] bg-[rgba(255,248,244,0.96)] px-4 py-3 text-sm leading-7 text-[#8a513c]">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-[rgba(77,107,74,0.26)] bg-[rgba(241,248,239,0.96)] px-4 py-3 text-sm leading-7 text-[var(--accent-deep)]">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleContinue}>Continue to Payment</Button>
                <ButtonLink href="/cart" variant="secondary">
                  Back to Cart
                </ButtonLink>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <div className="space-y-5">
                <CommerceSectionIntro
                  eyebrow="Order Sidebar"
                  title="Review before payment"
                  description="The order stays visible so the user never loses context."
                />
                {cartItems.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                    Your cart is empty. Add a piece first, then return here to complete delivery details.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <SummaryRow
                        key={item.id}
                        label={`${item.productName} x${item.quantity}`}
                        value={formatPrice(item.unitPrice * item.quantity)}
                      />
                    ))}
                    <SummaryRow label="Estimated delivery" value={formatPrice(shipping)} />
                    <div className="border-t border-[var(--border)] pt-3">
                      <SummaryRow label="Estimated total" value={formatPrice(total)} emphasized />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Reassurance
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Shipping details are collected locally for this prototype so you can move through the full journey without losing your progress.
              </p>
              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                Subtotal: {formatPrice(subtotal)}
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

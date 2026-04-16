import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import {
  CommerceHero,
  CommerceSectionIntro,
  TimelineCard,
} from "@/features/commerce/commerce-ui";
import { Container } from "@/components/ui/container";

export function DeliveryPage() {
  return (
    <>
      <CommerceHero
        eyebrow="Delivery"
        arabicLabel={"\u0627\u0644\u062a\u0648\u0635\u064a\u0644"}
        title="Follow the delivery with a clear sense of progress and reassurance."
        description="Delivery updates should be understandable at a glance, especially for customers moving through the flow for the first time."
        asideTitle="Delivery status"
        asideText="This step keeps the customer informed and supported until the order has fully arrived."
        asideFootnote={"\u0645\u062a\u0627\u0628\u0639\u0629 \u0648\u0627\u0636\u062d\u0629 \u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 \u062a\u062c\u0639\u0644 \u0627\u0644\u062a\u062c\u0631\u0628\u0629 \u0623\u0647\u062f\u0623 \u0648\u0623\u0643\u062b\u0631 \u0637\u0645\u0623\u0646\u064a\u0646\u0629."}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <TimelineCard
            title="Delivery timeline"
            items={[
              {
                title: "Preparing order",
                text: "The product is being finalized and packed.",
              },
              {
                title: "Out for delivery",
                text: "The order is on the way and nearing its final destination.",
                active: true,
              },
              {
                title: "Delivered",
                text: "The order is received and the post-purchase experience begins.",
              },
            ]}
          />

          <div className="space-y-4">
            <Card className="p-6 sm:p-7">
              <CommerceSectionIntro
                eyebrow="Reassurance"
                title="The order is progressing as expected"
                description="This page is designed to keep uncertainty low and communication calm."
              />
              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                If anything changes, the customer should know where the order stands, when to expect it, and how to get help if needed.
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Continue after delivery
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Once the order is received, the flow can move naturally into review, sharing, or another story to create.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/post-purchase">Go to Post-Purchase</ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Contact Support
                </ButtonLink>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

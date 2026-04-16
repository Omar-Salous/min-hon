import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const contactMethods = [
  {
    title: "Email",
    value: "hello@minhon.com",
    note: "For questions, collaborations, gifting requests, and general support.",
  },
  {
    title: "Phone / WhatsApp",
    value: "+970 000 000 000",
    note: "For direct communication and quick support touchpoints.",
  },
  {
    title: "Social Presence",
    value: "Instagram / Facebook",
    note: "For brand discovery, updates, launches, and everyday connection.",
  },
];

const communicationPoints = [
  "Product questions and customization help",
  "Gift planning or order support",
  "Wholesale, collaborations, or brand partnerships",
];

export function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactSection />
    </>
  );
}

function ContactHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(184,134,80,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(77,107,74,0.10),_transparent_30%)]" />
      <Container className="relative grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
            <span>Contact</span>
            <span className="h-1 w-1 rounded-full bg-[var(--highlight)]" />
            <span dir="rtl" lang="ar">
              {"\u062a\u0648\u0627\u0635\u0644"}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Reach out when you want help shaping the right piece or simply want to connect.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              The Contact page should feel as warm and reassuring as the rest of the brand: clear, uncluttered, and easy to trust.
            </p>
            <p
              className="max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-7"
              dir="rtl"
              lang="ar"
            >
              {"\u0625\u0630\u0627 \u0643\u0627\u0646 \u0644\u062f\u064a\u0643 \u0633\u0624\u0627\u0644 \u0623\u0648 \u062a\u0631\u064a\u062f \u0645\u0633\u0627\u0639\u062f\u0629\u060c \u0641\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062e\u0635\u0635\u062a \u0644\u062a\u0643\u0648\u0646 \u0648\u0627\u0636\u062d\u0629 \u0648\u0645\u0631\u064a\u062d\u0629 \u0648\u0642\u0631\u064a\u0628\u0629."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/customize">Start Creating</ButtonLink>
            <ButtonLink href="/explore" variant="secondary">
              Explore First
            </ButtonLink>
          </div>
        </div>

        <Card className="overflow-hidden bg-[linear-gradient(160deg,#faf3e8_0%,#ede1ce_100%)] p-0">
          <div className="grid min-h-[340px] gap-4 p-5 sm:grid-cols-2">
            <ContactVisual title="General support" subtitle="Questions and help" tall />
            <ContactVisual title="Gift planning" subtitle="Meaningful occasions" />
            <ContactVisual title="Collaboration" subtitle="Partnerships and ideas" />
            <ContactVisual title="Community" subtitle="Stay connected" />
          </div>
        </Card>
      </Container>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Contact Form"
              title="Send a message"
              description="This is a UI-only form for now, designed to feel simple, elegant, and easy to approach."
            />

            <div className="grid gap-4">
              <Field label="Name">
                <input
                  type="text"
                  value="Your name"
                  readOnly
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="Email or phone">
                <input
                  type="text"
                  value="name@example.com"
                  readOnly
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="What can we help with?">
                <div className="flex flex-wrap gap-2">
                  {communicationPoints.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </Field>

              <Field label="Message">
                <textarea
                  value="I would like help choosing the best product for a meaningful gift."
                  readOnly
                  rows={6}
                  className="w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 outline-none"
                />
              </Field>

              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href="/contact">Send Message</ButtonLink>
                <ButtonLink href="/customize" variant="secondary">
                  Go to Customize
                </ButtonLink>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-6 sm:p-8">
            <SectionIntro
              eyebrow="Contact Information"
              title="How to reach MIN HON"
              description="A calm information block for support, brand communication, and social discovery."
            />
          </Card>

          {contactMethods.map((method) => (
            <Card key={method.title} className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                {method.title}
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{method.value}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{method.note}</p>
            </Card>
          ))}

          <Card className="bg-[linear-gradient(135deg,rgba(77,107,74,0.10),rgba(255,253,248,1)_52%,rgba(184,134,80,0.08))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Communication Touchpoints
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Warm, clear, and easy to approach.</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Whether the customer is asking about customization, gifting, delivery, or brand collaboration, the communication experience should feel consistent with the product experience.
            </p>
            <p className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-7" dir="rtl" lang="ar">
              {"\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0645\u0646 \u0647\u0648\u0646 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0634\u0639\u0631 \u0628\u0627\u0644\u0648\u0636\u0648\u062d \u0648\u0627\u0644\u062f\u0641\u0621 \u0648\u0627\u0644\u0627\u0647\u062a\u0645\u0627\u0645."}
            </p>
          </Card>
        </div>
      </Container>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-base leading-8 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function ContactVisual({
  title,
  subtitle,
  tall = false,
}: {
  title: string;
  subtitle: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.65rem] border border-[var(--border)] bg-[rgba(255,255,255,0.45)] p-4 ${
        tall ? "sm:row-span-2" : ""
      }`}
    >
      <div
        className={`flex h-full min-h-[132px] items-end rounded-[1.15rem] border border-dashed border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(223,232,220,0.55))] p-4 ${
          tall ? "sm:min-h-[274px]" : ""
        }`}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            {subtitle}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
}

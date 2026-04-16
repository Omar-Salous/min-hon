import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type CommerceHeroProps = {
  eyebrow: string;
  arabicLabel?: string;
  title: string;
  description: string;
  asideTitle: string;
  asideText: string;
  asideFootnote?: string;
};

export function CommerceHero({
  eyebrow,
  arabicLabel,
  title,
  description,
  asideTitle,
  asideText,
  asideFootnote,
}: CommerceHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(184,134,80,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(77,107,74,0.12),_transparent_30%)]" />
      <Container className="relative grid gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
            <span>{eyebrow}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--highlight)]" />
            {arabicLabel ? (
              <span dir="rtl" lang="ar">
                {arabicLabel}
              </span>
            ) : null}
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {description}
            </p>
          </div>
        </div>

        <Card className="overflow-hidden bg-[linear-gradient(160deg,#faf3e8_0%,#ede1ce_100%)] p-0">
          <div className="rounded-[2rem] p-5 sm:p-6">
            <div className="rounded-[1.6rem] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.45)] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                {asideTitle}
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--foreground)]/85">
                {asideText}
              </p>
              {asideFootnote ? (
                <p
                  className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-7"
                  dir="rtl"
                  lang="ar"
                >
                  {asideFootnote}
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

type CommerceSectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CommerceSectionIntro({
  eyebrow,
  title,
  description,
}: CommerceSectionIntroProps) {
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

type CommerceFieldProps = {
  label: string;
  children: ReactNode;
};

export function CommerceField({ label, children }: CommerceFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

export function SummaryRow({ label, value, emphasized = false }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={emphasized ? "font-semibold" : "text-[var(--muted)]"}>{label}</span>
      <span className={emphasized ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

type ProductCardProps = {
  title: string;
  subtitle: string;
  details: string[];
  actionLabel?: string;
  secondaryActionLabel?: string;
};

export function ProductCard({
  title,
  subtitle,
  details,
  actionLabel,
  secondaryActionLabel,
}: ProductCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="rounded-[1.7rem] border border-[var(--border)] bg-[linear-gradient(180deg,#f8f1e6_0%,#e8dbc7_100%)] p-4">
          <div className="flex aspect-[4/5] items-center justify-center rounded-[1.2rem] border border-dashed border-[var(--border)] bg-white/45 text-sm font-medium text-[var(--muted)]">
            {title}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              {subtitle}
            </p>
            <h3 className="text-2xl font-semibold">{title}</h3>
          </div>

          <div className="grid gap-2">
            {details.map((detail) => (
              <div
                key={detail}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-7"
              >
                {detail}
              </div>
            ))}
          </div>

          {actionLabel || secondaryActionLabel ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {actionLabel ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
                  {actionLabel}
                </span>
              ) : null}
              {secondaryActionLabel ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
                  {secondaryActionLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

type TimelineItem = {
  title: string;
  text: string;
  active?: boolean;
};

type TimelineCardProps = {
  title: string;
  items: TimelineItem[];
};

export function TimelineCard({ title, items }: TimelineCardProps) {
  return (
    <Card className="p-6 sm:p-7">
      <div className="space-y-5">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    item.active
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface-strong)] text-[var(--foreground)]"
                  }`}
                >
                  0{index + 1}
                </div>
                {index < items.length - 1 ? (
                  <div className="mt-2 h-full w-px bg-[var(--border)]" />
                ) : null}
              </div>

              <div className="pb-4">
                <p className="text-base font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

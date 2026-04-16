import { ButtonLink } from "@/components/ui/button-link";
import { BrandImage } from "@/components/ui/brand-image";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { brandImages } from "@/lib/brand-assets";

const valuePillars = [
  {
    title: "Storytelling first",
    description:
      "Products begin with a memory, phrase, or feeling before they become an object.",
  },
  {
    title: "Co-creation",
    description:
      "Customers do not just choose a design. They help shape what the final piece means.",
  },
  {
    title: "Heritage-inspired calm",
    description:
      "The visual language draws from warmth, belonging, and subtle cultural references without overdecorating the experience.",
  },
];

const emotionalNotes = [
  {
    title: "For the giver",
    text: "MIN HON helps people give something more intimate than a standard gift.",
  },
  {
    title: "For the receiver",
    text: "Each piece is meant to feel personal, remembered, and worth keeping close.",
  },
  {
    title: "For the story itself",
    text: "Design becomes a vessel for identity, affection, and the details people do not want to lose.",
  },
];

export function AboutPage() {
  return (
    <>
      <AboutHero />
      <BrandStorySection />
      <ValuesSection />
      <EmotionalConnectionSection />
      <AboutCtaSection />
    </>
  );
}

function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(184,134,80,0.10),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(77,107,74,0.12),_transparent_30%)]" />
      <Container className="relative grid gap-8 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
            <span>About</span>
            <span className="h-1 w-1 rounded-full bg-[var(--highlight)]" />
            <span dir="rtl" lang="ar">
              {"\u0645\u0646 \u0647\u0648\u0646"}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              A brand built around memory, meaning, and the feeling of giving something that lasts.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              MIN HON was imagined as more than a place to print on products. It is a space where heritage, tenderness, and personal storytelling become part of what people wear, hold, keep, and gift.
            </p>
            <p
              className="max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-7"
              dir="rtl"
              lang="ar"
            >
              {"\u0645\u0646 \u0647\u0648\u0646 \u0639\u0644\u0627\u0645\u0629 \u062a\u062d\u0648\u0644 \u0627\u0644\u0630\u0643\u0631\u0649 \u0648\u0627\u0644\u0647\u062f\u064a\u0629 \u0648\u0627\u0644\u0647\u0648\u064a\u0629 \u0625\u0644\u0649 \u0642\u0637\u0639 \u062f\u0627\u0641\u0626\u0629 \u0648\u0642\u0631\u064a\u0628\u0629 \u0645\u0646 \u0627\u0644\u0642\u0644\u0628."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/explore">Explore the Collection</ButtonLink>
            <ButtonLink href="/customize" variant="secondary">
              Start Creating
            </ButtonLink>
          </div>
        </div>

        <Card className="overflow-hidden bg-[linear-gradient(160deg,#faf3e8_0%,#ecddc8_100%)] p-0">
          <div className="grid min-h-[360px] gap-4 p-5 sm:grid-cols-2">
            <AboutVisual title="Origin" subtitle="Brand story" image={brandImages.hand} tall />
            <AboutVisual title="Identity" subtitle="Warm and rooted" image={brandImages.ring2} />
            <AboutVisual title="Values" subtitle="Story-led design" image={brandImages.nick} />
            <AboutVisual title="Audience" subtitle="Meaningful gifting" image={brandImages.watch7} />
          </div>
        </Card>
      </Container>
    </section>
  );
}

function BrandStorySection() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <SectionIntro
            eyebrow="Brand Story"
            title="What MIN HON stands for"
            description="The project references point toward a story-led brand rooted in emotional connection, gifting, and cultural warmth."
          />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <BrandImage
              src={brandImages.hand3.src}
              alt={brandImages.hand3.alt}
              className="min-h-[280px]"
              sizes="(max-width: 1024px) 100vw, 35vw"
            />
            <div className="space-y-5 p-8 text-[var(--muted)] sm:p-10">
              <p className="text-base leading-8">
                MIN HON sits between heritage and modern simplicity. Its purpose is not to make customization feel loud or technical, but personal, soft, and deeply considered.
              </p>
              <p className="text-base leading-8">
                The brand idea lives in the phrase &quot;Start Your Story.&quot; That means every piece begins with a person, a bond, a memory, a sentence, or a small emotional detail worth preserving.
              </p>
              <p className="text-base leading-8">
                Whether the product is a T-shirt, keepsake, cap, hoodie, or accessory, the real product is the feeling carried through it: affection, belonging, remembrance, or quiet pride.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12 sm:py-16">
      <Container className="space-y-8">
        <SectionIntro
          eyebrow="Mission, Identity, Values"
          title="A calm identity shaped by story, care, and cultural feeling."
          description="This page gives the brand room to explain not only what it sells, but why it feels different."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {valuePillars.map((pillar) => (
            <Card key={pillar.title} className="h-full p-6">
              <h3 className="text-2xl font-semibold">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{pillar.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EmotionalConnectionSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="space-y-8">
        <SectionIntro
          eyebrow="Emotional Connection"
          title="Designed to feel close, not generic."
          description="MIN HON is strongest when people recognize themselves, their relationships, and their stories in the final piece."
        />

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden p-0">
            <BrandImage
              src={brandImages.watch1.src}
              alt={brandImages.watch1.alt}
              className="min-h-[360px]"
              sizes="(max-width: 1024px) 100vw, 52vw"
              contentClassName="p-8"
              content={
                <div className="space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/80">
                    Why it matters
                  </p>
                  <h3 className="max-w-2xl text-3xl font-semibold tracking-tight text-white">
                    A meaningful object can hold identity, tenderness, memory, and place all at once.
                  </h3>
                  <p className="text-base leading-8 text-white/82">
                    The emotional layer is not an extra feature. It is the reason the brand exists. Every design choice should help users feel seen, connected, and proud to give or keep the final piece.
                  </p>
                  <p className="max-w-xl rounded-2xl border border-white/20 bg-[rgba(255,250,242,0.18)] px-4 py-3 text-sm leading-7 text-white/88" dir="rtl" lang="ar">
                    {"\u0627\u0644\u0642\u0637\u0639\u0629 \u0627\u0644\u062c\u0645\u064a\u0644\u0629 \u0644\u0627 \u062a\u0643\u0641\u064a \u0648\u062d\u062f\u0647\u0627\u060c \u0628\u0644 \u064a\u062c\u0628 \u0623\u0646 \u062a\u062d\u0645\u0644 \u0625\u062d\u0633\u0627\u0633\u0627\u064b \u0648\u0630\u0643\u0631\u0649 \u0648\u0645\u0639\u0646\u0649."}
                  </p>
                </div>
              }
            />
          </Card>

          <div className="grid gap-4">
            {emotionalNotes.map((note) => (
              <Card key={note.title} className="p-6">
                <h3 className="text-xl font-semibold">{note.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{note.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function AboutCtaSection() {
  return (
    <section className="pb-16 pt-4 sm:pb-20">
      <Container>
        <Card className="border-[color:var(--accent)] bg-[linear-gradient(135deg,rgba(77,107,74,0.12),rgba(255,253,248,1)_55%,rgba(184,134,80,0.08))] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Continue with MIN HON
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Explore the collection or create something that carries your own story.
              </h2>
              <p className="text-base leading-8 text-[var(--muted)]">
                The About page now leads naturally into discovery or customization instead of ending as a static brand summary.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/explore">Explore</ButtonLink>
              <ButtonLink href="/customize" variant="secondary">
                Customize
              </ButtonLink>
            </div>
          </div>
        </Card>
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

function AboutVisual({
  title,
  subtitle,
  image,
  tall = false,
}: {
  title: string;
  subtitle: string;
  image: { src: string; alt: string };
  tall?: boolean;
}) {
  return (
    <BrandImage
      src={image.src}
      alt={image.alt}
      className={`rounded-[1.65rem] border border-[var(--border)] ${tall ? "sm:row-span-2 sm:min-h-[292px]" : "min-h-[140px]"}`}
      sizes="(max-width: 640px) 100vw, 30vw"
      content={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
            {subtitle}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
      }
    />
  );
}

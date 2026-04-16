"use client";

import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { StoreProductCard } from "@/components/ui/store-product-card";
import { products } from "@/features/commerce/commerce-data";
import { brandImages } from "@/lib/brand-assets";

const categoryEntries = products.map((product) => ({
  name: product.name,
  subtitle: product.subtitle,
  image: product.image,
}));

const featuredProducts = [products[0], products[1], products[4], products[2]];
const bestSellers = [products[4], products[0], products[1], products[3]];

const trustHighlights = [
  {
    title: "Story-led customization",
    text: "Start from a real product, then add a title, message, image, or memory through the existing Customize flow.",
  },
  {
    title: "Clear storefront journey",
    text: "Browse, add to cart, checkout, and review the order through a working frontend shopping path.",
  },
  {
    title: "Warm premium presentation",
    text: "MIN HON still keeps its soft, refined mood while becoming easier to shop like a real store.",
  },
];

const shoppingPaths = [
  {
    title: "Shop ready-to-customize pieces",
    text: "Start from the collection and move into customization only when the product feels right.",
    href: "/explore",
    label: "Browse Collection",
  },
  {
    title: "Create something personal",
    text: "Go directly into customization for names, stories, gifts, and uploaded artwork.",
    href: "/customize",
    label: "Start Creating",
  },
  {
    title: "Ask the assistant first",
    text: "Use the MIN HON Assistant for outfit ideas, gifting help, and weather-based suggestions.",
    href: "/assistant",
    label: "Open Assistant",
  },
];

export function HomePage() {
  return (
    <>
      <StoreHeroSection />
      <CategoryBrowseSection />
      <FeaturedCollectionSection />
      <BestSellerSection />
      <ShoppingPathsSection />
      <TrustSection />
    </>
  );
}

function StoreHeroSection() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <Container className="grid gap-8 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            <span>Storefront</span>
            <span className="h-1 w-1 rounded-full bg-[var(--highlight)]" />
            <span dir="rtl" lang="ar">
              {"\u0645\u062a\u062c\u0631 \u0645\u0646 \u0647\u0648\u0646"}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Shop story-led pieces with a clearer, faster path from browsing to personalization.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              MIN HON now leads with practical shopping: browse products earlier, compare pieces more easily, then move into customization, gifting, or styling support when needed.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/explore">Shop Collection</ButtonLink>
            <ButtonLink href="/customize" variant="secondary">
              Customize a Piece
            </ButtonLink>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric value="5" label="core products" />
            <HeroMetric value="Frontend" label="working shopping flow" />
            <HeroMetric value="Warm" label="premium MIN HON tone" />
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[380px] border-b border-[var(--border)] sm:border-b-0 sm:border-r">
              <Image
                src={brandImages.nick.src}
                alt={brandImages.nick.alt}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 34vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,29,25,0.06),rgba(32,29,25,0.36))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/78">
                  Featured shopping moment
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Everyday pieces, elevated with personal meaning.</h2>
              </div>
            </div>
            <div className="grid gap-0">
              <HeroTile title="New arrivals" text="Fresh product direction with customization ready" image={brandImages.watch6} />
              <HeroTile title="Gift-ready picks" text="Pieces that feel thoughtful without extra complexity" image={brandImages.hand2} />
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function CategoryBrowseSection() {
  return (
    <section className="py-12 sm:py-14">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="Shop by Category"
          title="Browse product types first"
          description="A more practical storefront starts by making the main categories easy to scan and compare right away."
          actionHref="/explore"
          actionLabel="View All Products"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {categoryEntries.map((entry) => (
            <Link
              key={entry.name}
              href="/explore"
              className="group rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:shadow-[0_18px_34px_rgba(68,50,28,0.1)]"
            >
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[1.2rem] border border-[var(--border)]">
                <Image
                  src={entry.image.src}
                  alt={entry.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 20vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-lg font-semibold">{entry.name}</h3>
                <p className="text-sm text-[var(--muted)]">{entry.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeaturedCollectionSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12 sm:py-14">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="Featured"
          title="Featured products"
          description="Clearer product cards, visible pricing, and direct actions make the homepage feel more like a working store."
          actionHref="/customize"
          actionLabel="Customize Any Product"
        />

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <StoreProductCard
              key={product.id}
              product={product}
              badge={index === 0 ? "Featured" : index === 1 ? "Gift Pick" : "Store Pick"}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function BestSellerSection() {
  return (
    <section className="py-12 sm:py-14">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="Best Sellers"
          title="Popular pieces customers would likely compare"
          description="This section gives the storefront a more familiar ecommerce rhythm with repeatable merchandising blocks."
          actionHref="/assistant"
          actionLabel="Need Help Choosing?"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bestSellers.map((product, index) => (
            <StoreProductCard
              key={product.id}
              product={product}
              badge={index === 0 ? "Best Seller" : "Popular"}
              note={index === 0 ? "A strong everyday favorite with enough room for customization." : undefined}
              compact
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ShoppingPathsSection() {
  return (
    <section className="py-2 pb-12 sm:pb-14">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="Shop Your Way"
          title="Different ways to enter the MIN HON experience"
          description="The brand still supports personalization and storytelling, but the journey now begins with clearer storefront choices."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {shoppingPaths.map((path) => (
            <Card key={path.title} className="p-6">
              <h3 className="text-2xl font-semibold">{path.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{path.text}</p>
              <div className="mt-5">
                <ButtonLink href={path.href} variant="secondary">
                  {path.label}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[320px] border-b border-[var(--border)] lg:border-b-0 lg:border-r">
              <Image
                src={brandImages.hand.src}
                alt={brandImages.hand.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,29,25,0.1),rgba(32,29,25,0.45))]" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/78">
                  Why MIN HON
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  A practical storefront, still rooted in memory, gifting, and personal storytelling.
                </h2>
              </div>
            </div>

            <div className="grid gap-4 p-8 sm:p-10">
              {trustHighlights.map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--background)] p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href="/contact">Contact Support</ButtonLink>
                <ButtonLink href="/about" variant="secondary">
                  Learn About MIN HON
                </ButtonLink>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-base leading-8 text-[var(--muted)]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} variant="secondary">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}

function HeroTile({
  title,
  text,
  image,
}: {
  title: string;
  text: string;
  image: { src: string; alt: string };
}) {
  return (
    <div className="relative min-h-[190px] border-b border-[var(--border)] last:border-b-0">
      <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 100vw, 24vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,29,25,0.06),rgba(32,29,25,0.38))]" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/82">{text}</p>
      </div>
    </div>
  );
}

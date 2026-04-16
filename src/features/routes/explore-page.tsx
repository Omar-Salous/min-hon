import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { StoreProductCard } from "@/components/ui/store-product-card";
import { products } from "@/features/commerce/commerce-data";

const newArrivals = [products[1], products[2], products[0], products[3]];
const bestSellers = [products[4], products[0], products[1], products[2]];
const categoryBlocks = products.map((product) => ({
  name: product.name,
  subtitle: product.subtitle,
  description: product.description,
}));

const collectionCalls = [
  {
    title: "Gift-ready pieces",
    text: "Strong options for thoughtful gifting, keepsakes, and memorable occasions.",
    href: "/assistant",
    label: "Get Gift Advice",
  },
  {
    title: "Customized pieces",
    text: "Move into personalization when you want to add a story, uploaded artwork, or dedication.",
    href: "/customize",
    label: "Start Customizing",
  },
  {
    title: "Need styling help?",
    text: "Use the MIN HON Assistant for weather-based suggestions, full looks, and curated picks.",
    href: "/assistant",
    label: "Open Assistant",
  },
];

export function ExplorePage() {
  return (
    <>
      <ExploreStoreHero />
      <NewArrivalsSection />
      <BestSellersSection />
      <BrowseCategorySection />
      <StoreSupportSection />
    </>
  );
}

function ExploreStoreHero() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <Container className="grid gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            <span>Explore Store</span>
            <span className="h-1 w-1 rounded-full bg-[var(--highlight)]" />
            <span dir="rtl" lang="ar">
              {"\u0627\u0633\u062a\u0643\u0634\u0627\u0641 \u0627\u0644\u0645\u062a\u062c\u0631"}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Explore the collection through simpler storefront sections and clearer product browsing.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              New arrivals, best sellers, and product categories now sit earlier and read more like a store catalog while still leading naturally into customization and styling support.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/customize">Customize a Product</ButtonLink>
            <ButtonLink href="/assistant" variant="secondary">
              Ask the Assistant
            </ButtonLink>
          </div>
        </div>

        <Card className="p-6 sm:p-7">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Shopping shortcuts
            </p>
            <div className="grid gap-3">
              <ShortcutRow title="New Arrivals" text="See the latest highlighted pieces first." />
              <ShortcutRow title="Best Sellers" text="Compare the products most likely to convert first-time shoppers." />
              <ShortcutRow title="Customization" text="Jump to personalization when the store product is only the starting point." />
              <ShortcutRow title="Styling Support" text="Use the assistant for gifting, weather, and full-look recommendations." />
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function NewArrivalsSection() {
  return (
    <section className="py-12 sm:py-14">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="New Arrivals"
          title="New arrivals"
          description="A straightforward product grid brings the store catalog forward earlier in the page."
          actionHref="/customize"
          actionLabel="Customize from Here"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product, index) => (
            <StoreProductCard
              key={product.id}
              product={product}
              badge={index === 0 ? "New" : "Just Added"}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function BestSellersSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] py-12 sm:py-14">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="Best Sellers"
          title="Best sellers"
          description="A second product-led block makes the shopping page feel more familiar and easier to scan."
          actionHref="/cart"
          actionLabel="Go to Cart"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bestSellers.map((product, index) => (
            <StoreProductCard
              key={product.id}
              product={product}
              badge={index === 0 ? "Top Seller" : "Popular"}
              compact
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function BrowseCategorySection() {
  return (
    <section className="py-12 sm:py-14">
      <Container className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Browse by Product"
            title="Category browsing, simplified"
            description="Instead of story-heavy tiles, the store now uses cleaner category blocks that focus on what the shopper is actually buying."
          />
          <ButtonLink href="/assistant" variant="secondary">
            Need a Recommendation?
          </ButtonLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryBlocks.map((category) => (
            <Card key={category.name} className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {category.subtitle}
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{category.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{category.description}</p>
              <div className="mt-5">
                <ButtonLink href="/customize" variant="secondary">
                  Shop {category.name}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StoreSupportSection() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container className="space-y-6">
        <SectionHeader
          eyebrow="Store Support"
          title="Help shoppers move forward faster"
          description="These supporting blocks keep MIN HON's more personal side visible without turning the page back into an editorial layout."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {collectionCalls.map((item) => (
            <Card key={item.title} className="p-6">
              <h3 className="text-2xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              <div className="mt-5">
                <ButtonLink href={item.href} variant="secondary">
                  {item.label}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
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

function ShortcutRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--background)] px-4 py-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{text}</p>
    </div>
  );
}

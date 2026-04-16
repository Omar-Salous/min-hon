import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { products } from "@/features/commerce/commerce-data";
import { brandLogo } from "@/lib/brand-assets";

const customerLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Style Assistant", href: "/assistant" },
  { label: "Customize", href: "/customize" },
  { label: "Cart", href: "/cart" },
];

const collectionLinks = products.map((product) => ({
  label: product.name,
  href: "/explore",
}));

export function MainSiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(241,231,215,0.94))]">
      <Container className="grid gap-10 py-12 lg:grid-cols-[1.15fr_0.9fr_0.9fr_1fr] lg:py-14">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-card)]">
              <Image src={brandLogo.src} alt={brandLogo.alt} fill sizes="56px" className="object-cover" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.04em]">MIN HON</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Warm premium ecommerce</p>
            </div>
          </div>

          <p className="max-w-sm text-sm leading-7 text-[var(--muted)]">
            Shop practical, story-led pieces, personalize them through the working customize flow, and move through the full frontend storefront with clarity.
          </p>

          <div className="grid gap-3 text-sm text-[var(--muted)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">Email:</span> hello@minhon.com
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Phone / WhatsApp:</span> +970 000 000 000
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Support hours:</span> Daily styling and order guidance
            </p>
          </div>
        </div>

        <FooterColumn title="Shop">
          {siteConfig.mainNavigation.slice(0, 4).map((item) => (
            <FooterLink key={item.href} href={item.href} label={item.label} />
          ))}
        </FooterColumn>

        <FooterColumn title="Customer Care">
          {customerLinks.map((item) => (
            <FooterLink key={item.href + item.label} href={item.href} label={item.label} />
          ))}
          {siteConfig.commerceNavigation.map((item) => (
            <FooterLink key={item.href} href={item.href} label={item.label} />
          ))}
        </FooterColumn>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Collections
          </p>
          <div className="grid gap-2 text-sm">
            {collectionLinks.map((item) => (
              <FooterLink key={item.label} href={item.href} label={item.label} />
            ))}
          </div>
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-4 text-sm leading-7 text-[var(--muted)]">
            Need help choosing? Use the MIN HON Assistant for gifting, weather-based styling, and full-look suggestions.
          </div>
        </div>
      </Container>

      <div className="border-t border-[var(--border)] bg-[rgba(246,240,229,0.68)]">
        <Container className="flex flex-col gap-2 py-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>{"\u00A9"} 2026 MIN HON. All storefront interactions in this prototype remain frontend-only.</p>
          <p>
            {"Displayed in "}
            {"\u20AA"}
            {" | English-first with Arabic-ready support"}
          </p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{title}</p>
      <div className="grid gap-2 text-sm">{children}</div>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="transition hover:text-[var(--accent)]">
      {label}
    </Link>
  );
}
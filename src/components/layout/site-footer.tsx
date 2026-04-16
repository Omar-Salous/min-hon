import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const footerLinks = [
    ...siteConfig.mainNavigation,
    ...siteConfig.commerceNavigation,
  ];

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <Container className="grid gap-8 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-semibold">MIN HON</p>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
            A modular Next.js scaffold for story-driven custom products, ready
            for bilingual content and future commerce logic.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Sitemap
          </p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[var(--accent)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Language & Support
          </p>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <p>English-first scaffold with Arabic-ready content regions.</p>
            <p dir="rtl" lang="ar">
              التصميم الحالي يدعم إضافة المحتوى العربي واتجاه RTL لاحقاً.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

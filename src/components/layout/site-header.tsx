import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import type { NavigationItem } from "@/config/site";

type SiteHeaderProps = {
  navigation: NavigationItem[];
};

export function SiteHeader({ navigation }: SiteHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <Container className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Story-led gifting
            </p>
            <div>
              <p className="text-2xl font-semibold">MIN HON</p>
              <p className="text-sm text-[var(--muted)]" dir="rtl" lang="ar">
                من هون
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
              dir="rtl"
              lang="ar"
            >
              العربية جاهزة لاحقاً
            </div>
            <ButtonLink href="/customize">Start Creating</ButtonLink>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-full border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--surface-strong)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

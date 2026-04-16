"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { brandLogo } from "@/lib/brand-assets";
import { useCommerce } from "@/features/commerce/commerce-provider";
import type { NavigationItem } from "@/config/site";

type MainSiteHeaderProps = {
  navigation: NavigationItem[];
};

type HeaderLanguage = "en" | "ar";
const LANGUAGE_STORAGE_KEY = "min-hon-language-preference";

export function MainSiteHeader({ navigation }: MainSiteHeaderProps) {
  const pathname = usePathname();
  const { itemCount } = useCommerce();
  const [selectedLanguage, setSelectedLanguage] = useState<HeaderLanguage>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedValue === "ar" ? "ar" : "en";
  });
  const [showArabicMessage, setShowArabicMessage] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
  }, [selectedLanguage]);

  const handleLanguageChange = (language: HeaderLanguage) => {
    setSelectedLanguage(language);
    setShowArabicMessage(language === "ar");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(255,250,242,0.95)] backdrop-blur-xl">
      <div className="border-b border-[var(--border)] bg-[rgba(246,240,229,0.72)]">
        <Container className="flex flex-col gap-2 py-2 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Free local styling guidance inside MIN HON Assistant</span>
            <span className="hidden h-3 w-px bg-[var(--border)] sm:block" />
            <span>Support: hello@minhon.com</span>
            <span className="hidden h-3 w-px bg-[var(--border)] sm:block" />
            <span>
              {"Displayed in "}
              {"\u20AA"}
            </span>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[0_10px_18px_rgba(75,57,32,0.06)]">
              <button
                type="button"
                aria-pressed={selectedLanguage === "en"}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                  selectedLanguage === "en"
                    ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                )}
                onClick={() => handleLanguageChange("en")}
              >
                English
              </button>
              <button
                type="button"
                aria-pressed={selectedLanguage === "ar"}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                  selectedLanguage === "ar"
                    ? "bg-[var(--highlight-soft)] text-[var(--highlight)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]",
                )}
                onClick={() => handleLanguageChange("ar")}
              >
                <span dir="rtl" lang="ar">
                  {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
                </span>
              </button>
            </div>

            <div
              className={cn(
                "absolute right-0 top-[calc(100%+0.5rem)] w-[16rem] rounded-[1.15rem] border border-[var(--border)] bg-[rgba(255,250,242,0.98)] p-4 shadow-[0_18px_32px_rgba(75,57,32,0.12)] transition-all duration-300",
                showArabicMessage
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0",
              )}
              aria-hidden={!showArabicMessage}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Language Preview
              </p>
              <p className="mt-2 text-sm font-semibold">Arabic coming soon</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]" dir="rtl" lang="ar">
                {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u062c\u0627\u0647\u0632\u0629 \u0644\u0627\u062d\u0642\u0627\u064b"}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-[1.4rem] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-card)] sm:h-14 sm:w-14">
              <Image
                src={brandLogo.src}
                alt={brandLogo.alt}
                fill
                priority
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">MIN HON</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Practical story-led storefront</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/assistant" variant="secondary" className="min-h-10 px-4 py-2 text-sm">
              Ask the Assistant
            </ButtonLink>
            <ButtonLink href="/customize" className="min-h-10 px-4 py-2 text-sm">
              Start Creating
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="overflow-x-auto">
          <ul className="flex min-w-max items-center gap-5 border-b border-[var(--border)] pb-2 text-sm md:min-w-0">
            {navigation.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex items-center gap-2 pb-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                      active
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.href === "/cart" && itemCount > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {itemCount}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition",
                        active ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--border-strong)]",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

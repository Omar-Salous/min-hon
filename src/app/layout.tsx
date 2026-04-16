import type { ReactNode } from "react";
import type { Metadata } from "next";
import { MainSiteFooter } from "@/components/layout/main-site-footer";
import { MainSiteHeader } from "@/components/layout/main-site-header";
import { siteConfig } from "@/config/site";
import { CommerceProvider } from "@/features/commerce/commerce-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MIN HON",
    template: "%s | MIN HON",
  },
  description:
    "Story-led custom gifts and culturally rooted products built around personal expression.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CommerceProvider>
          <div className="flex min-h-screen flex-col">
            <MainSiteHeader navigation={siteConfig.mainNavigation} />
            <main className="flex-1">{children}</main>
            <MainSiteFooter />
          </div>
        </CommerceProvider>
      </body>
    </html>
  );
}

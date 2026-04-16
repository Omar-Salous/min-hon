import { ButtonLink } from "@/components/ui/button-link";
import { BrandImage } from "@/components/ui/brand-image";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/features/commerce/commerce-utils";
import type { ProductData } from "@/features/commerce/commerce-types";

type StoreProductCardProps = {
  product: ProductData;
  badge?: string;
  note?: string;
  compact?: boolean;
};

export function StoreProductCard({
  product,
  badge,
  note,
  compact = false,
}: StoreProductCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] p-0 hover:translate-y-[-2px]">
      <div className="relative">
        <BrandImage
          src={product.image.src}
          alt={product.image.alt}
          className={compact ? "aspect-[4/4.2] border-b border-[var(--border)]" : "aspect-[4/4.8] border-b border-[var(--border)]"}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          overlayClassName="bg-[linear-gradient(180deg,rgba(32,29,25,0.04),rgba(32,29,25,0.18))]"
        />
        {badge ? (
          <span className="absolute left-4 top-4 rounded-full border border-[var(--border)] bg-[rgba(255,250,242,0.92)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] shadow-[0_10px_20px_rgba(68,50,28,0.08)]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            {product.subtitle}
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {note || product.description}
              </p>
            </div>
            <span className="shrink-0 text-lg font-semibold">{formatPrice(product.price)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1">
            {product.colors.length} colors
          </span>
          {product.sizes?.length ? (
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1">
              Sizes available
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-1">
          <ButtonLink href="/customize" className="min-h-10 px-4 py-2 text-sm">
            Customize
          </ButtonLink>
          <ButtonLink
            href="/explore"
            variant="secondary"
            className="min-h-10 px-4 py-2 text-sm"
          >
            View Details
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

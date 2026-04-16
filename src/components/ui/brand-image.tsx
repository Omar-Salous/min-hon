import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  contentClassName?: string;
  content?: ReactNode;
  priority?: boolean;
  sizes?: string;
};

export function BrandImage({
  src,
  alt,
  className,
  imageClassName,
  overlayClassName,
  contentClassName,
  content,
  priority = false,
  sizes = "100vw",
}: BrandImageProps) {
  const shouldUseUnoptimizedImage = src.startsWith("blob:") || src.startsWith("data:");

  return (
    <div className={cn("group relative overflow-hidden transition-transform duration-500 ease-out", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={shouldUseUnoptimizedImage}
        className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]", imageClassName)}
      />
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(180deg,rgba(32,29,25,0.02),rgba(32,29,25,0.42))] transition-opacity duration-500 group-hover:opacity-90",
          overlayClassName,
        )}
      />
      {content ? (
        <div className={cn("absolute inset-x-0 bottom-0 p-4 transition-transform duration-500 ease-out group-hover:translate-y-[-2px]", contentClassName)}>{content}</div>
      ) : null}
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-[0.01em] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variant === "primary" &&
          "border border-[var(--accent-deep)] bg-[linear-gradient(180deg,var(--accent)_0%,var(--accent-deep)_100%)] text-white shadow-[0_10px_24px_rgba(50,73,48,0.22)] hover:-translate-y-0.5 hover:brightness-[1.03] hover:shadow-[0_18px_34px_rgba(50,73,48,0.28)]",
        variant === "secondary" &&
          "border border-[var(--border-strong)] bg-[rgba(255,250,242,0.9)] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:border-[var(--highlight)] hover:bg-[var(--surface-strong)] hover:shadow-[0_12px_26px_rgba(75,57,32,0.12)]",
        variant === "ghost" &&
          "border border-transparent bg-transparent px-3 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

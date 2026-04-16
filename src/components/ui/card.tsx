import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,250,242,0.98)_0%,rgba(255,247,237,0.94)_100%)] p-6 shadow-[var(--shadow-card)] ring-1 ring-white/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[0_18px_42px_rgba(68,50,28,0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

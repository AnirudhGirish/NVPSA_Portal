import type { ReactNode } from "react";

export function SectionBadge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-heritage/20 bg-heritage/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-heritage-dark ${className}`}
    >
      {children}
    </span>
  );
}

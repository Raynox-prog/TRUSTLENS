"use client";

import { ObsidianGridBackground } from "./obsidian-grid-background";

export { ObsidianGridBackground };

export function ShieldlyBackground({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "page";
  className?: string;
}) {
  return <ObsidianGridBackground variant={variant} className={className} />;
}

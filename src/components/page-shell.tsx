import type { ReactNode } from "react";
import { AppShell } from "./layout/app-shell";

export function PageShell({ children }: { children: ReactNode }) {
  return <AppShell showSidebar={true}>{children}</AppShell>;
}

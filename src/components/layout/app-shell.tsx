"use client";

import { useState, type ReactNode } from "react";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { MobileNavigation } from "./mobile-navigation";
import { Footer } from "@/components/footer";

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppShell({ children, showSidebar = true }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#080B10] text-[#F4F7FA] obsidian-grid-bg">
      {/* Top Header */}
      <AppHeader onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />

      {/* Central Layout: Sidebar + Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar collapsed={sidebarCollapsed} />}
        <main className="relative flex-1 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <MobileNavigation />
    </div>
  );
}

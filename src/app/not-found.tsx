import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9257F6]/20 border border-[#A66AFF]/40 text-[#B9A9E9]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#B9A9E9]">
            404 — Page Not Found
          </p>
          <h1 className="text-3xl font-extrabold text-[#F0E5D0] sm:text-4xl">
            We couldn&apos;t verify that destination.
          </h1>
          <p className="text-sm text-[#B8C6BB]">
            The page you requested does not exist on AVERON AI. Return to the
            homepage or launch a new investigation below.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9257F6] to-[#A66AFF] px-6 py-3 text-sm font-bold text-white shadow-[0_0_26px_rgba(146,87,246,0.45)]"
          >
            <span>Return Home</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-full border border-[#F0E5D0]/20 bg-[#1B4536]/80 px-6 py-3 text-sm font-bold text-[#F0E5D0]"
          >
            <span>Open Analyzer</span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

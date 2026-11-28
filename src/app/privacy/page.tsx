import Link from "next/link";
import {
  Database,
  EyeOff,
  Lock,
  Server,
  ShieldAlert,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";

const SECTIONS = [
  {
    icon: Server,
    title: "1. What Data You Submit & How It Is Processed",
    body: [
      "Text Analysis (/api/analyze/text): Submitted message text is validated for length (5–10,000 characters), checked by AVERON AI server-side threat rules, and—when GEMINI_API_KEY or OPENAI_API_KEY is configured on the server—transmitted server-side to Google Gemini or OpenAI solely to generate structured threat findings.",
      "Screenshot Analysis (/api/analyze/image): Uploaded PNG, JPG, JPEG, or WEBP files (max 8 MB) are verified by MIME type and binary magic bytes in server memory. When an AI API key is configured, the image is sent server-side as base64 to the configured multimodal vision provider.",
      "Website Analysis (/api/analyze/url): Submitted URLs are validated against SSRF guards (blocking private IP ranges, localhost, and non-HTTP/HTTPS schemes). AVERON AI performs lexical domain checks, optional safe HEAD redirect probes without executing scripts, and—only when GOOGLE_SAFE_BROWSING_API_KEY is configured—queries Google Safe Browsing v4.",
    ],
  },
  {
    icon: EyeOff,
    title: "2. Ephemeral Screenshot Policy (No Raw Image Storage)",
    body: [
      "AVERON AI does NOT save uploaded screenshot files to disk, object storage, or PostgreSQL.",
      "Raw image buffers exist only in server memory for the duration of the HTTP analysis request and are discarded once the report response is produced.",
      "Only non-binary structured metadata (sanitized filename, verified format, pixel dimensions, byte size, risk score, and text findings) is persisted in the investigation report.",
    ],
  },
  {
    icon: Database,
    title: "3. What Is Stored in PostgreSQL & Retention",
    body: [
      "To power the Results page (/results) and Dashboard (/dashboard), AVERON AI stores structured investigation reports in its database: analysis type, a short preview of the submitted text (truncated to 260 characters) or normalized URL, risk score, risk level, verdict, detected threats, recommendations, limitations, duration, and timestamp.",
      "Do not submit confidential passwords, live OTPs, government ID numbers, or unredacted sensitive records unless necessary. If testing a real message containing personal data, redact private account numbers before pasting.",
      "Reports remain stored until deleted by you from the Dashboard.",
    ],
  },
  {
    icon: Trash2,
    title: "4. Your Deletion Controls",
    body: [
      "You can delete any individual stored investigation report at any time from /dashboard using the trash icon (DELETE /api/reports/[id]).",
      "You can also remove all stored reports at once via the 'Clear All' button on /dashboard (DELETE /api/reports).",
    ],
  },
  {
    icon: Lock,
    title: "5. Security Measures & Honest Limitations",
    body: [
      "All third-party API keys (GEMINI_API_KEY, OPENAI_API_KEY, GOOGLE_SAFE_BROWSING_API_KEY) are kept strictly on the server and are never exposed to the browser.",
      "IP-based in-memory rate limiting is applied to analysis endpoints to prevent abuse. Sensitive submitted payloads are not written to server logs.",
      "When third-party AI or Safe Browsing APIs are enabled by the operator, data transmitted to those services is also subject to Google's or OpenAI's respective API data handling terms. When those keys are not configured, analysis runs locally on the AVERON server with zero third-party AI transmission.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "6. No Unsupported Security Promises",
    body: [
      "AVERON AI is an advisory threat-intelligence tool, not a guarantee of safety.",
      "Attackers constantly mutate scam techniques, domains, and phone numbers. A low risk score does not guarantee absolute safety.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-white/5 pb-6 space-y-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy & Security Policy</span>
          </span>
          <h1 className="font-heading text-3xl font-bold text-[#F4F7FA]">
            Data Handling & Ephemeral Privacy
          </h1>
          <p className="text-xs sm:text-sm text-[#A0AAB8]">
            Transparency on how AVERON AI processes untrusted messages, screenshots, and URLs.
          </p>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.title} className="obsidian-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[[var(--theme-primary)]]/10 border border-[[var(--theme-primary)]]/25 text-[[var(--theme-primary)]]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-heading text-base font-bold text-[#F4F7FA]">
                    {sec.title}
                  </h2>
                </div>
                <div className="space-y-2 text-xs text-[#A0AAB8] leading-relaxed">
                  {sec.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

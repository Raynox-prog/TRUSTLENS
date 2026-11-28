"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Globe,
  ArrowRight,
  RefreshCw,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Lock,
  FileSearch,
  Upload,
  Cpu,
  Scale,
  CheckCircle2,
  AlertOctagon,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SimulatedIndicator {
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  explanation: string;
  evidence: string;
  source: string;
  whyItMatters: string;
}

interface SimulatedStageResult {
  id: string;
  label: string;
  techDetail: string;
  findings: string[];
}

interface SimulationScenario {
  id: string;
  label: string;
  code: string;
  icon: typeof Globe;
  description: string;
  url: string;
  riskScore: number;
  riskLevel: "critical" | "high" | "moderate";
  riskLabel: string;
  verdict: string;
  summary: string;
  stageResults: SimulatedStageResult[];
  indicators: SimulatedIndicator[];
  recommendations: string[];
  redirectChain?: Array<{ url: string; status: number }>;
}

// ─── Stage definitions ────────────────────────────────────────────────────────

const SIM_STAGES: Array<{ id: string; label: string; icon: typeof Upload }> = [
  { id: "extract", label: "URL Extraction", icon: Upload },
  { id: "domain", label: "Domain Investigation", icon: FileSearch },
  { id: "intel", label: "Threat Intelligence", icon: Cpu },
  { id: "evaluate", label: "Risk Evaluation", icon: Scale },
  { id: "verdict", label: "Security Verdict", icon: ShieldCheck },
];

// ─── Scenarios ───────────────────────────────────────────────────────────────

const SCENARIOS: SimulationScenario[] = [
  {
    id: "phishing",
    label: "Phishing Website",
    code: "01",
    icon: AlertOctagon,
    description:
      "A fictional domain imitating a popular banking login page — designed to harvest credentials.",
    url: "http://paypa1-secure-login.account-verify.example/signin",
    riskScore: 94,
    riskLevel: "critical",
    riskLabel: "Critical Risk",
    verdict: "High-confidence phishing portal detected.",
    summary:
      "This URL combines typosquatting of the PayPal brand, an unencrypted HTTP connection, multiple phishing-associated path keywords, and a suspicious TLD pattern — all classic attributes of a credential-harvesting phishing site.",
    stageResults: [
      {
        id: "extract",
        label: "URL Extraction",
        techDetail: "Parsing URL structure and extracting components for analysis.",
        findings: [
          "Protocol: HTTP (unencrypted — credentials sent in cleartext)",
          "Hostname: paypa1-secure-login.account-verify.example",
          "Path: /signin — contains credential-related keyword",
          "URL length: 58 characters (above average for phishing patterns)",
          "Subdomain depth: 2 levels (paypa1-secure-login.account-verify)",
        ],
      },
      {
        id: "domain",
        label: "Domain Investigation",
        techDetail: "Investigating domain registration data and DNS characteristics.",
        findings: [
          "Registered domain: account-verify.example",
          "Subdomain contains 'paypa1' — digit-substitution typosquat",
          "No MX records present (domain not configured for email)",
          "Domain age: Hypothetically registered 3 days ago",
          "HTTPS certificate: None — HTTP only connection",
        ],
      },
      {
        id: "intel",
        label: "Threat Intelligence",
        techDetail: "Cross-referencing against threat intelligence databases.",
        findings: [
          "SIMULATED: Google Safe Browsing — SOCIAL_ENGINEERING listing found",
          "SIMULATED: URLhaus — Phishing campaign cluster match",
          "Brand impersonation: PayPal (paypal.com) — digit-swap 'paypa1'",
          "Threat keywords in path: signin, secure, login, verify, account",
        ],
      },
      {
        id: "evaluate",
        label: "Risk Evaluation",
        techDetail: "Combining evidence into a calibrated risk score.",
        findings: [
          "+75 pts — External threat intelligence match (SOCIAL_ENGINEERING)",
          "+36 pts — Confirmed typosquatting: PayPal brand impersonation",
          "+14 pts — Unencrypted HTTP connection",
          "+12 pts — Excessive subdomain depth (2+ levels)",
          "+20 pts — Multiple phishing keywords in URL path",
          "Diminishing-returns cap applied above 70 pts",
          "Final calibrated score: 94 / 100",
        ],
      },
      {
        id: "verdict",
        label: "Security Verdict",
        techDetail: "Generating final security assessment and recommendations.",
        findings: [
          "VERDICT: Critical Risk (Score 94/100)",
          "Classification: Phishing Portal",
          "Confidence: HIGH",
          "Action: Block immediately — do not enter any credentials",
        ],
      },
    ],
    indicators: [
      {
        name: "Brand Typosquatting",
        severity: "critical",
        explanation: "Domain uses digit-substitution 'paypa1' to impersonate PayPal.",
        evidence: "paypa1-secure-login.account-verify.example vs paypal.com",
        source: "Lexical Analysis + Levenshtein Distance",
        whyItMatters:
          "Victims who do not scrutinise the URL carefully will mistake this for the legitimate PayPal website.",
      },
      {
        name: "External Threat Match (Simulated)",
        severity: "critical",
        explanation: "SIMULATED: URL flagged by Google Safe Browsing as SOCIAL_ENGINEERING.",
        evidence: "Match type: SOCIAL_ENGINEERING | Platform: ANY_PLATFORM",
        source: "Google Safe Browsing v4 (Simulated)",
        whyItMatters:
          "Active threat intelligence databases contain verified phishing reports from millions of users.",
      },
      {
        name: "Unencrypted HTTP Connection",
        severity: "high",
        explanation: "Login page served over HTTP — any credentials entered will be transmitted in cleartext.",
        evidence: "Protocol: http:// (no TLS certificate)",
        source: "URL Structure Analysis",
        whyItMatters:
          "Any interceptor on the network path can read usernames and passwords submitted over HTTP.",
      },
      {
        name: "Deep Subdomain Nesting",
        severity: "high",
        explanation: "2 levels of subdomains used to bury the actual registered domain.",
        evidence: "paypa1-secure-login → account-verify → example",
        source: "Domain Anatomy Analysis",
        whyItMatters:
          "Attackers use deep subdomains to push the real root domain out of view in browser address bars.",
      },
    ],
    recommendations: [
      "Do not enter any login credentials, passwords, or card details on this URL.",
      "Navigate manually to paypal.com by typing it in the browser address bar.",
      "Report this phishing URL to Google Safe Browsing at safebrowsing.google.com/safebrowsing/report_phish/.",
      "Verify any PayPal communication at the official website — never follow links in messages.",
    ],
  },
  {
    id: "redirect",
    label: "Suspicious Redirect",
    code: "02",
    icon: ArrowRight,
    description:
      "A fictional shortened URL that chains through multiple suspicious redirect hops before reaching a credential-harvesting destination.",
    url: "https://redirect-demo.example/go?id=urgent-kyc",
    riskScore: 71,
    riskLevel: "high",
    riskLabel: "High Risk",
    verdict: "Multi-hop redirect chain with suspicious destination detected.",
    summary:
      "This URL resolves through three redirect hops, each traversing progressively more suspicious infrastructure. The final destination exhibits phishing-associated patterns. URL shorteners and redirect chains are routinely used to evade URL-based content filters.",
    redirectChain: [
      { url: "https://redirect-demo.example/go?id=urgent-kyc", status: 302 },
      { url: "https://link-proxy.example/out/abc123", status: 301 },
      { url: "http://kyc-verification-urgent.example/update", status: 200 },
    ],
    stageResults: [
      {
        id: "extract",
        label: "URL Extraction",
        techDetail: "Parsing initial URL structure before following redirect chain.",
        findings: [
          "Initial URL: https://redirect-demo.example/go?id=urgent-kyc",
          "Protocol: HTTPS (initial hop only)",
          "Query parameter 'id' contains: urgent-kyc",
          "Redirect behavior expected from path pattern /go",
        ],
      },
      {
        id: "domain",
        label: "Domain Investigation",
        techDetail: "Tracing redirect chain using SSRF-safe HEAD requests.",
        findings: [
          "Hop 1: redirect-demo.example → HTTP 302 → link-proxy.example",
          "Hop 2: link-proxy.example → HTTP 301 → kyc-verification-urgent.example",
          "Hop 3: kyc-verification-urgent.example → HTTP 200 (final destination)",
          "Final destination uses HTTP (unencrypted) despite initial HTTPS",
          "SSRF guard active: each hop DNS-validated before following",
        ],
      },
      {
        id: "intel",
        label: "Threat Intelligence",
        techDetail: "Analysing final destination against threat feeds.",
        findings: [
          "SIMULATED: Final domain 'kyc-verification-urgent.example' — URLhaus match",
          "Phishing keywords in final URL: kyc, verification, urgent, update",
          "Redirect chain commonly used to evade link-scanning filters",
          "Final destination: HTTP only — no TLS on data-collection endpoint",
        ],
      },
      {
        id: "evaluate",
        label: "Risk Evaluation",
        techDetail: "Weighing redirect chain evidence against known attack patterns.",
        findings: [
          "+22 pts — URL shortener / redirect service masking destination",
          "+12 pts — Multi-hop redirect chain (3 hops recorded)",
          "+20 pts — Phishing keywords in final URL path",
          "+14 pts — Final destination served over plain HTTP",
          "+36 pts — Suspicious final domain pattern (simulated threat match)",
          "Combined score: 71 / 100",
        ],
      },
      {
        id: "verdict",
        label: "Security Verdict",
        techDetail: "Final verdict based on redirect chain analysis.",
        findings: [
          "VERDICT: High Risk (Score 71/100)",
          "Classification: Suspicious Redirect Chain",
          "Confidence: MEDIUM",
          "Action: Avoid — destination endpoint is suspicious",
        ],
      },
    ],
    indicators: [
      {
        name: "Multi-Hop Redirect Chain",
        severity: "high",
        explanation: "URL traverses 3 redirect hops before reaching its final destination.",
        evidence: "302 → 301 → 200 chain across 3 different domains",
        source: "SSRF-Safe Redirect Inspector",
        whyItMatters:
          "Redirect chains are used to evade URL-based email and content filters that only check the initial link.",
      },
      {
        name: "Suspicious Final Destination",
        severity: "high",
        explanation: "Final URL contains KYC/verification urgency keywords and uses plain HTTP.",
        evidence: "http://kyc-verification-urgent.example/update",
        source: "Lexical Analysis + Threat Intelligence (Simulated)",
        whyItMatters:
          "Fake KYC updates are a common banking fraud vector designed to harvest identity documents and login credentials.",
      },
      {
        name: "Protocol Downgrade",
        severity: "medium",
        explanation: "Initial HTTPS connection silently degrades to HTTP at the final data-collection endpoint.",
        evidence: "Initial: https:// → Final: http:// (unencrypted)",
        source: "Redirect Chain Analysis",
        whyItMatters:
          "Protocol downgrade means any data submitted at the final page travels in cleartext, fully readable to anyone monitoring the network.",
      },
    ],
    recommendations: [
      "Do not follow multi-hop redirects from unsolicited links — always verify the final destination manually.",
      "Any URL that asks you to perform a KYC update should be verified directly through your bank's official app.",
      "Use a URL preview tool or hover over links before clicking to inspect the initial destination.",
      "Report suspicious redirect chains to your organisation's security team.",
    ],
  },
  {
    id: "domain",
    label: "Suspicious Domain",
    code: "03",
    icon: Globe,
    description:
      "A fictional newly registered domain with characteristics common to malicious infrastructure — no established history, suspicious TLD, and urgency keywords.",
    url: "https://secure-banking-kyc-update.xyz/verify/account",
    riskScore: 62,
    riskLevel: "high",
    riskLabel: "High Risk",
    verdict: "Suspicious newly registered domain with high-risk characteristics.",
    summary:
      "This domain exhibits multiple red flags common to disposable phishing infrastructure: a suspicious .xyz TLD with disproportionately high abuse rates, excessive hyphenation, banking and KYC urgency keywords, and a hypothetical registration age of under 48 hours. No established web presence could be verified.",
    stageResults: [
      {
        id: "extract",
        label: "URL Extraction",
        techDetail: "Parsing domain structure and identifying pattern anomalies.",
        findings: [
          "Protocol: HTTPS (certificate present — but TLS ≠ legitimacy)",
          "Registered domain: secure-banking-kyc-update.xyz",
          "TLD: .xyz — high-abuse top-level domain",
          "Hyphen count: 4 hyphens in hostname",
          "Path contains: /verify/account — high-risk keywords",
        ],
      },
      {
        id: "domain",
        label: "Domain Investigation",
        techDetail: "Analysing domain age, registration data and DNS configuration.",
        findings: [
          "Hypothetical domain age: Registered 1 day, 14 hours ago",
          "Registrar: Hypothetically registered via privacy-masked registrar",
          "DNS: A record resolves to a shared hosting IP block",
          "No historical web presence or search index entries",
          "MX records: None configured (domain not set up for email)",
        ],
      },
      {
        id: "intel",
        label: "Threat Intelligence",
        techDetail: "Checking threat feeds for domain-level reputation signals.",
        findings: [
          "SIMULATED: URLhaus — Domain cluster match (banking phishing)",
          "TLD '.xyz' has >15× the phishing abuse rate of '.com'",
          "Phishing keywords: secure, banking, kyc, update, verify, account",
          "Pattern matches known disposable phishing infrastructure templates",
        ],
      },
      {
        id: "evaluate",
        label: "Risk Evaluation",
        techDetail: "Weighing all available evidence to produce a calibrated score.",
        findings: [
          "+16 pts — Suspicious TLD (.xyz high-abuse rate)",
          "+20 pts — Multiple phishing keywords in domain + path (6 found)",
          "+10 pts — Excessive hyphenation in hostname (4 hyphens)",
          "+36 pts — Simulated threat intelligence match",
          "+0 pts — HTTPS present (noted but does not reduce phishing risk)",
          "Total: 62 / 100 — High Risk",
        ],
      },
      {
        id: "verdict",
        label: "Security Verdict",
        techDetail: "Generating final verdict based on domain-level threat signals.",
        findings: [
          "VERDICT: High Risk (Score 62/100)",
          "Classification: Suspicious Domain",
          "Confidence: MEDIUM",
          "Action: Avoid — do not enter personal or financial information",
        ],
      },
    ],
    indicators: [
      {
        name: "Suspicious TLD (.xyz)",
        severity: "medium",
        explanation: "The .xyz TLD has a phishing abuse rate >15× that of .com.",
        evidence: "Domain: secure-banking-kyc-update.xyz",
        source: "TLD Abuse Rate Analysis",
        whyItMatters:
          "Attackers choose high-abuse TLDs because they are cheap, easy to register anonymously, and fast to create at scale.",
      },
      {
        name: "Excessive Keyword Density",
        severity: "high",
        explanation: "Domain and path contain 6 high-risk phishing keywords.",
        evidence: "secure, banking, kyc, update, verify, account",
        source: "Lexical Pattern Analysis",
        whyItMatters:
          "Packing banking and urgency keywords into a domain name is a deliberate tactic to make a fraudulent site appear official to inattentive users.",
      },
      {
        name: "Newly Registered Domain (Simulated)",
        severity: "high",
        explanation:
          "SIMULATED: Domain hypothetically registered under 48 hours before this scan.",
        evidence: "Hypothetical registration date: 1d 14h ago",
        source: "WHOIS Domain Intelligence (Simulated)",
        whyItMatters:
          "Phishing sites typically exist for only days before being taken down. Newly registered domains with suspicious naming patterns are a primary attack vector.",
      },
      {
        name: "No Established Web Presence",
        severity: "medium",
        explanation: "No historical content, search index entries, or reputation signals found.",
        evidence: "Zero historical web presence detected",
        source: "Domain History Analysis",
        whyItMatters:
          "Legitimate banking and financial services have years of indexed presence. Brand-new domains claiming to be financial services are almost always fraudulent.",
      },
    ],
    recommendations: [
      "Never enter personal information, login credentials, or banking details on newly registered or unrecognised domains.",
      "Verify any banking communication by calling the number on your physical bank card — not numbers provided in messages.",
      "Check domain age using whois.domaintools.com before trusting any financial website.",
      "Look for domain names that match official bank names exactly — legitimate banks do not use .xyz or hyphenated domain names.",
    ],
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function severityColor(sev: string) {
  switch (sev) {
    case "critical":
      return "text-rose-300 bg-rose-500/15 border-rose-500/30";
    case "high":
      return "text-amber-300 bg-amber-500/15 border-amber-500/30";
    case "medium":
      return "text-yellow-300 bg-yellow-500/15 border-yellow-500/30";
    default:
      return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
  }
}

function riskGaugeColor(level: string) {
  switch (level) {
    case "critical":
      return "#f43f5e";
    case "high":
      return "#f59e0b";
    case "moderate":
      return "#eab308";
    default:
      return "#10b981";
  }
}

// ─── Mini CSS risk gauge ──────────────────────────────────────────────────────

function SimRiskGauge({ score, level }: { score: number; level: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = riskGaugeColor(level);

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" aria-label={`Risk score: ${score}`}>
      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke="#1B4536"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dashoffset 0.9s ease" }}
      />
      <text
        x="55"
        y="51"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize="20"
        fontWeight="800"
        fontFamily="monospace"
      >
        {score}
      </text>
      <text
        x="55"
        y="68"
        textAnchor="middle"
        fill="#B8C6BB"
        fontSize="8.5"
        fontFamily="monospace"
      >
        / 100
      </text>
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CyberattackSimulation() {
  const [selectedId, setSelectedId] = useState<string>("phishing");
  const [activeStage, setActiveStage] = useState<number>(-1); // -1 = not started
  const [paused, setPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [expandedIndicator, setExpandedIndicator] = useState<number | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    clearTimer();
    setActiveStage(0);
    setPaused(false);
    setShowResult(false);
    setExpandedIndicator(null);
    setExpandedStage(null);

    let stage = 0;
    intervalRef.current = setInterval(() => {
      stage++;
      if (stage >= SIM_STAGES.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setActiveStage(SIM_STAGES.length); // all done
        setTimeout(() => setShowResult(true), 350);
      } else {
        setActiveStage(stage);
      }
    }, 1600);
  }, [clearTimer]);

  const handlePause = useCallback(() => {
    if (paused) {
      // Resume
      setPaused(false);
      let stage = activeStage;
      intervalRef.current = setInterval(() => {
        stage++;
        if (stage >= SIM_STAGES.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setActiveStage(SIM_STAGES.length);
          setTimeout(() => setShowResult(true), 350);
        } else {
          setActiveStage(stage);
        }
      }, 1600);
    } else {
      clearTimer();
      setPaused(true);
    }
  }, [paused, activeStage, clearTimer]);

  const handleReset = useCallback(() => {
    clearTimer();
    setActiveStage(-1);
    setPaused(false);
    setShowResult(false);
    setExpandedIndicator(null);
    setExpandedStage(null);
  }, [clearTimer]);

  const handleSelectScenario = useCallback(
    (id: string) => {
      clearTimer();
      setSelectedId(id);
      setActiveStage(-1);
      setPaused(false);
      setShowResult(false);
      setExpandedIndicator(null);
      setExpandedStage(null);
    },
    [clearTimer]
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const isRunning = activeStage >= 0 && activeStage < SIM_STAGES.length && !paused;
  const isDone = activeStage >= SIM_STAGES.length;

  return (
    <section
      className="relative bg-[var(--obsidian-base,#090D0C)] py-16 sm:py-20"
      aria-label="Interactive Cyberattack Simulation"
    >
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,229,208,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,229,208,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#1B4536]/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#A66AFF]" />
            <span>Educational Simulation — Not a Live Scan</span>
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl lg:text-5xl">
            See How AVERON Defends You
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#B8C6BB] sm:text-base">
            Select a scenario to watch the five-layer security engine detect a threat in real time.
            All domains are fictional — this is a controlled educational demonstration.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SCENARIOS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScenario(s.id)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-[#9257F6]/60 bg-[#9257F6]/12 shadow-[0_0_20px_rgba(146,87,246,0.2)]"
                    : "border-[#F0E5D0]/12 bg-[#101715]/80 hover:border-[#F0E5D0]/25 hover:bg-[#101715]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl text-xs",
                      isActive
                        ? "bg-[#9257F6] text-white"
                        : "bg-[#1B4536]/80 text-[#A66AFF]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B9A9E9]">
                    Scenario {s.code}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#F0E5D0]">{s.label}</p>
                <p className="text-xs leading-snug text-[#B8C6BB]">{s.description}</p>
              </button>
            );
          })}
        </div>

        {/* Main simulation panel */}
        <div className="rounded-[28px] border border-[#F0E5D0]/12 bg-[#101715]/95 shadow-[0_24px_64px_rgba(6,20,15,0.65)] backdrop-blur-xl">
          {/* Top bar */}
          <div className="flex flex-col gap-3 border-b border-[#F0E5D0]/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#A66AFF]">
                  Simulated URL
                </span>
              </div>
              <code className="block break-all font-mono text-xs text-[#F0E5D0]">
                {scenario.url}
              </code>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {activeStage === -1 && (
                <button
                  type="button"
                  onClick={startAnimation}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9257F6] to-[#A66AFF] px-5 py-2.5 font-bold text-sm text-white shadow-[0_0_20px_rgba(146,87,246,0.5)] transition-all hover:scale-[1.02]"
                >
                  <Play className="h-4 w-4" />
                  Run Simulation
                </button>
              )}

              {(isRunning || paused) && !isDone && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#F0E5D0]/15 bg-[#1B4536]/70 px-4 py-2 font-mono text-xs font-semibold text-[#F0E5D0] transition-colors hover:bg-[#234B3B]"
                  >
                    {paused ? (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        Pause
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#F0E5D0]/12 bg-transparent px-3 py-2 font-mono text-xs text-[#B8C6BB] transition-colors hover:text-[#F0E5D0]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </>
              )}

              {isDone && (
                <button
                  type="button"
                  onClick={startAnimation}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#9257F6]/40 bg-[#9257F6]/15 px-4 py-2 font-mono text-xs font-bold text-[#F0E5D0] transition-colors hover:bg-[#9257F6]/25"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[#A66AFF]" />
                  Replay
                </button>
              )}
            </div>
          </div>

          {/* Five stage progress */}
          <div className="border-b border-[#F0E5D0]/8 p-5">
            <div className="grid grid-cols-5 gap-2">
              {SIM_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isDoneStage = isDone || idx < activeStage;
                const isCurrent = idx === activeStage && !isDone;
                const isPending = idx > activeStage && !isDone;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() =>
                      setExpandedStage((prev) => (prev === idx ? null : idx))
                    }
                    disabled={!isDoneStage && !isCurrent}
                    className={cn(
                      "flex flex-col items-center rounded-xl border p-2 text-center transition-all duration-300",
                      isCurrent
                        ? "border-[#A66AFF] bg-[#9257F6]/20 shadow-[0_0_14px_rgba(146,87,246,0.35)]"
                        : isDoneStage
                        ? "cursor-pointer border-emerald-500/30 bg-emerald-950/15 hover:bg-emerald-950/25"
                        : "border-[#F0E5D0]/8 bg-[#102B22]/40 opacity-45"
                    )}
                    aria-label={`Stage ${idx + 1}: ${stage.label}`}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-xs",
                        isCurrent
                          ? "bg-[#A66AFF] text-white"
                          : isDoneStage
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-[#1B4536]/50 text-[#B8C6BB]/50"
                      )}
                    >
                      {isDoneStage ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Icon className="h-3.5 w-3.5 animate-pulse" />
                      ) : (
                        <Icon className="h-3 w-3" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 w-full truncate font-mono text-[9px] sm:text-[10px] font-bold leading-tight",
                        isCurrent
                          ? "text-[#F0E5D0]"
                          : isDoneStage
                          ? "text-emerald-400"
                          : "text-[#B8C6BB]/45"
                      )}
                    >
                      {stage.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage detail expansion */}
            {expandedStage !== null &&
              scenario.stageResults[expandedStage] &&
              (isDone || expandedStage < activeStage) && (
                <div className="mt-4 rounded-xl border border-[#F0E5D0]/10 bg-[#102B22]/70 p-4 text-xs">
                  <p className="mb-2 font-mono font-bold text-[#A66AFF]">
                    {scenario.stageResults[expandedStage].label} — Technical Detail
                  </p>
                  <p className="mb-3 text-[#B8C6BB]">
                    {scenario.stageResults[expandedStage].techDetail}
                  </p>
                  <ul className="space-y-1.5">
                    {scenario.stageResults[expandedStage].findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[#F0E5D0]">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span className="font-mono">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Active stage telemetry */}
            {activeStage >= 0 && !isDone && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#9257F6]/25 bg-[#9257F6]/8 px-3.5 py-2.5 text-xs">
                {paused ? (
                  <Pause className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A66AFF]" />
                ) : (
                  <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-[#A66AFF]" />
                )}
                <div>
                  <span className="font-mono font-bold text-[#A66AFF]">
                    Stage {activeStage + 1} of {SIM_STAGES.length}:{" "}
                    {SIM_STAGES[activeStage]?.label}
                  </span>
                  <p className="mt-0.5 text-[#B8C6BB]">
                    {scenario.stageResults[activeStage]?.techDetail}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Results section */}
          {showResult && (
            <div className="p-5 space-y-5">
              {/* Simulated disclaimer banner */}
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-2.5">
                <Info className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs font-semibold text-amber-200">
                  SIMULATED EDUCATIONAL RESULT — NOT A LIVE SECURITY SCAN. All domains
                  are fictional. These results are for demonstration purposes only.
                </p>
              </div>

              {/* Verdict banner */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="shrink-0">
                  <SimRiskGauge score={scenario.riskScore} level={scenario.riskLevel} />
                </div>
                <div className="space-y-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider",
                      scenario.riskLevel === "critical"
                        ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                        : scenario.riskLevel === "high"
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                        : "border-yellow-500/40 bg-yellow-500/15 text-yellow-300"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {scenario.riskLabel}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#F0E5D0] sm:text-xl">
                    {scenario.verdict}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#B8C6BB]">{scenario.summary}</p>
                </div>
              </div>

              {/* Redirect chain (Scenario 2) */}
              {scenario.redirectChain && scenario.redirectChain.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B9A9E9]">
                    Redirect Chain Traced
                  </p>
                  <div className="space-y-1.5">
                    {scenario.redirectChain.map((hop, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-xl bg-[#102B22]/80 px-3.5 py-2.5 font-mono text-xs"
                      >
                        <span className="shrink-0 rounded bg-[#9257F6]/25 px-2 py-0.5 text-[10px] font-bold text-[#A66AFF]">
                          HTTP {hop.status}
                        </span>
                        <span className="break-all text-[#F0E5D0]">{hop.url}</span>
                        {i < scenario.redirectChain!.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#B9A9E9]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicators */}
              <div className="space-y-2.5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B9A9E9]">
                  Detected Threat Indicators ({scenario.indicators.length})
                </p>
                {scenario.indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-[#F0E5D0]/10 bg-[#173D30]/60"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIndicator((prev) => (prev === idx ? null : idx))
                      }
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#1B4536]/60"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-extrabold uppercase",
                            severityColor(ind.severity)
                          )}
                        >
                          {ind.severity}
                        </span>
                        <span className="text-sm font-bold text-[#F0E5D0]">
                          {ind.name}
                        </span>
                      </div>
                      {expandedIndicator === idx ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-[#B9A9E9]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#B9A9E9]" />
                      )}
                    </button>

                    {expandedIndicator === idx && (
                      <div className="border-t border-[#F0E5D0]/8 p-4 space-y-3 text-xs">
                        <p className="text-[#B8C6BB] leading-relaxed">{ind.explanation}</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 font-mono">
                          <div className="rounded-xl bg-[#102B22]/80 p-2.5">
                            <span className="block text-[10px] uppercase text-[#B8C6BB]/65">
                              Evidence
                            </span>
                            <span className="text-[#F0E5D0] break-all">{ind.evidence}</span>
                          </div>
                          <div className="rounded-xl bg-[#102B22]/80 p-2.5">
                            <span className="block text-[10px] uppercase text-[#B8C6BB]/65">
                              Source
                            </span>
                            <span className="text-[#A66AFF]">{ind.source}</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#F0E5D0]/10 bg-[#102B22]/60 p-2.5">
                          <span className="block font-mono text-[10px] font-bold uppercase text-emerald-400 mb-1">
                            Why It Matters
                          </span>
                          <span className="text-[#B8C6BB] leading-relaxed">{ind.whyItMatters}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div className="space-y-2.5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#B9A9E9] flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-[#A66AFF]" />
                  Recommended Protective Actions
                </p>
                {scenario.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl bg-[#102B22]/70 px-3.5 py-3 text-xs"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="text-[#F0E5D0] leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="border-t border-[#F0E5D0]/8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[#B8C6BB]/65">
                  This is a simulated educational demonstration. Results are not from live
                  analysis.
                </span>
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 font-bold text-[#A66AFF] hover:text-[#F0E5D0] transition-colors"
                >
                  <span>Try a real URL scan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Pre-start prompt */}
          {activeStage === -1 && (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9257F6]/15 border border-[#9257F6]/30">
                <ShieldCheck className="h-7 w-7 text-[#A66AFF]" />
              </div>
              <div>
                <p className="font-bold text-[#F0E5D0]">Select a scenario above and press Run Simulation</p>
                <p className="mt-1 text-xs text-[#B8C6BB]">
                  Watch all five security layers activate sequentially and analyse the threat.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom disclaimer */}
        <p className="mt-6 text-center font-mono text-[10px] text-[#B8C6BB]/55">
          All simulated domains (*.example) are reserved by IANA for documentation purposes and do not
          represent real websites. Simulated threat intelligence results are for educational
          demonstration only and are never stored in AVERON's real scan database.
        </p>
      </div>
    </section>
  );
}

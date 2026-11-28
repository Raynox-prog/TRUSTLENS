import net from "node:net";
import {
  type AIOutput,
  type DetectedThreat,
  type ThreatSeverity,
  type UrlInspectionDetails,
  scoreToRiskLevel,
} from "@/lib/types";
import {
  inspectSafeRedirectChain,
  normalizeAndValidatePublicUrl,
} from "@/lib/security/ssrf";

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rb.gy",
  "cutt.ly",
  "shorturl.at",
  "tiny.cc",
  "rebrand.ly",
  "bl.ink",
  "v.gd",
  "lnkd.in",
  "s.id",
  "clck.ru",
]);

const SUSPICIOUS_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "zip",
  "mov",
  "buzz",
  "loan",
  "work",
  "support",
  "online",
  "site",
  "icu",
  "cyou",
  "cfd",
  "sbs",
  "rest",
  "quest",
]);

const PHISHING_URL_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "verification",
  "kyc",
  "otp",
  "secure",
  "security",
  "account",
  "update",
  "banking",
  "wallet",
  "refund",
  "unlock",
  "suspend",
  "resolution",
  "confirm",
  "password",
  "billing",
  "support",
  "parcel",
  "redeliver",
  "claim",
];

const PROTECTED_BRANDS: Array<{ brand: string; domain: string; token: string }> = [
  { brand: "PayPal", domain: "paypal.com", token: "paypal" },
  { brand: "Apple", domain: "apple.com", token: "apple" },
  { brand: "Microsoft", domain: "microsoft.com", token: "microsoft" },
  { brand: "Google", domain: "google.com", token: "google" },
  { brand: "Amazon", domain: "amazon.com", token: "amazon" },
  { brand: "Netflix", domain: "netflix.com", token: "netflix" },
  { brand: "Chase", domain: "chase.com", token: "chase" },
  { brand: "Bank of America", domain: "bankofamerica.com", token: "bankofamerica" },
  { brand: "Wells Fargo", domain: "wellsfargo.com", token: "wellsfargo" },
  { brand: "HDFC Bank", domain: "hdfcbank.com", token: "hdfcbank" },
  { brand: "ICICI Bank", domain: "icicibank.com", token: "icicibank" },
  { brand: "SBI", domain: "onlinesbi.sbi", token: "onlinesbi" },
  { brand: "DHL", domain: "dhl.com", token: "dhl" },
  { brand: "FedEx", domain: "fedex.com", token: "fedex" },
  { brand: "USPS", domain: "usps.com", token: "usps" },
  { brand: "Coinbase", domain: "coinbase.com", token: "coinbase" },
  { brand: "Binance", domain: "binance.com", token: "binance" },
  { brand: "WhatsApp", domain: "whatsapp.com", token: "whatsapp" },
  { brand: "Instagram", domain: "instagram.com", token: "instagram" },
  { brand: "Facebook", domain: "facebook.com", token: "facebook" },
  { brand: "Stripe", domain: "stripe.com", token: "stripe" },
];

function deobfuscateHomoglyphs(input: string): string {
  return input
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/rn/g, "m")
    .replace(/vv/g, "w");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function parseDomainParts(hostname: string): {
  registeredDomain: string;
  subdomains: string[];
  tld: string;
} {
  const clean = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (net.isIP(clean) !== 0) {
    return { registeredDomain: clean, subdomains: [], tld: "" };
  }
  const labels = clean.split(".").filter(Boolean);
  if (labels.length <= 2) {
    return {
      registeredDomain: labels.join("."),
      subdomains: [],
      tld: labels[labels.length - 1] ?? "",
    };
  }

  // Handle common 2-part public suffixes like co.uk, com.au, co.in
  const lastTwo = labels.slice(-2).join(".");
  const multiPartSuffixes = new Set([
    "co.uk",
    "org.uk",
    "gov.uk",
    "co.in",
    "nic.in",
    "gov.in",
    "com.au",
    "com.br",
    "co.jp",
  ]);
  const rootCount = multiPartSuffixes.has(lastTwo) && labels.length >= 3 ? 3 : 2;
  return {
    registeredDomain: labels.slice(-rootCount).join("."),
    subdomains: labels.slice(0, labels.length - rootCount),
    tld: labels[labels.length - 1] ?? "",
  };
}

export function extractUrlsFromText(text: string): string[] {
  const fullUrlRegex = /https?:\/\/[^\s"'<>()]+/gi;
  const fullMatches = (text.match(fullUrlRegex) ?? []).map((u) =>
    u.replace(/[.,!?;:]+$/, "")
  );

  // Remove full URLs and email addresses before scanning for bare domains so we never double-count
  const remainder = text
    .replace(fullUrlRegex, " ")
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, " ");

  const bareMatches = (
    remainder.match(
      /\b(?:[a-z0-9-]+\.)+(?:com|net|org|xyz|top|click|ly|in|co|io|tk|gq|online|site|support)(?:\/[^\s"'<>()]*)?/gi
    ) ?? []
  ).map((u) => u.replace(/[.,!?;:]+$/, ""));

  const seenNormalized = new Set<string>();
  const results: string[] = [];
  for (const candidate of [...fullMatches, ...bareMatches]) {
    const key = candidate.replace(/^https?:\/\//i, "").toLowerCase();
    if (!seenNormalized.has(key)) {
      seenNormalized.add(key);
      results.push(candidate);
    }
  }
  return results.slice(0, 10);
}

interface TextRule {
  type: string;
  severity: ThreatSeverity;
  weight: number;
  patterns: RegExp[];
  explanation: string;
  recommendation: string;
}

const TEXT_THREAT_RULES: TextRule[] = [
  {
    type: "OTP & Credential Theft",
    severity: "critical",
    weight: 34,
    patterns: [
      /\b(share|send|forward|verify|enter|confirm|provide|tell)\b.{0,40}\b(otp|one[- ]time[- ]pass(?:code|word)|verification code|6[- ]digit code|cvv|pin|password|passcode|login credentials)\b/i,
      /\b(otp|upi pin|atm pin|cvv|security code)\b.{0,35}\b(immediately|urgent|now|to receive|to credit|to verify|to unblock)\b/i,
    ],
    explanation:
      "Legitimate banks, payment apps, and support teams never ask you to share an OTP, PIN, CVV, or password.",
    recommendation:
      "Never share OTPs, UPI PINs, passwords, or card CVV codes with anyone over SMS, WhatsApp, email, or phone.",
  },
  {
    type: "UPI & Payment Refund Fraud",
    severity: "critical",
    weight: 32,
    patterns: [
      /\b(upi|collect request|qr code|gpay|phonepe|paytm)\b.{0,65}\b(pin|approve|accept|scan|receive|refund|cashback|credit)\b/i,
      /\b(enter|input).{0,25}\bupi pin\b.{0,35}\b(receive|refund|cashback|credit)\b/i,
    ],
    explanation:
      "Entering a UPI PIN or approving a collect request always sends money OUT of your account—it is never required to receive a refund or cashback.",
    recommendation:
      "Decline any unexpected UPI collect requests and never enter your UPI PIN to receive money or refunds.",
  },
  {
    type: "Account Suspension Threat",
    severity: "high",
    weight: 24,
    patterns: [
      /\b(account|card|netbanking|kyc|service|sim|access)\b.{0,45}\b(blocked|suspended|frozen|terminated|deactivated|permanently limited|revoked|locked|expired)\b/i,
    ],
    explanation:
      "Sudden account suspension or permanent lockout threats are used to trigger panic and bypass careful verification.",
    recommendation:
      "Pause and verify account status directly by opening the official app or typing the organization's known website manually.",
  },
  {
    type: "High-Pressure Urgency Coercion",
    severity: "medium",
    weight: 14,
    patterns: [
      /\b(final notice|immediate action required|urgent alert|act now to avoid)\b/i,
      /\b(verify|confirm|update|pay|transfer|settle|respond|blocked|suspended|revoked|terminated|expires?)\b.{0,35}\b(within|in)\s+\d+\s*(minutes?|mins?|hours?|hrs?)\b/i,
      /\b(verify|update|confirm|transfer|pay|send|forward)\b.{0,30}\b(immediately|right now|urgently)\b/i,
    ],
    explanation:
      "Artificial countdown deadlines and high-pressure wording push victims to act before checking legitimacy.",
    recommendation:
      "Slow down whenever a message imposes a tight deadline tied to verification, credentials, or payment.",
  },
  {
    type: "Fake Police / Government Impersonation",
    severity: "critical",
    weight: 34,
    patterns: [
      /\b(cyber ?crime|police|customs|narcotics|tax enforcement|irs|income tax|federal|enforcement directorate|cbi|arrest warrant|digital arrest)\b/i,
      /\b(illegal parcel|warrant issued|avoid arrest|asset freeze|legal action|court summons)\b.{0,60}\b(transfer|pay|deposit|skype|video call|verify|wire)\b/i,
    ],
    explanation:
      "Law enforcement and government agencies do not conduct 'digital arrests' over video calls or demand security deposits via wire transfer or gift cards.",
    recommendation:
      "Hang up or ignore threatening police/tax demands and independently verify using official government contact numbers.",
  },
  {
    type: "Fake Banking / KYC Phishing",
    severity: "high",
    weight: 26,
    patterns: [
      /\b(kyc|pan card|aadhaar|netbanking|debit card|credit card|bank account)\b.{0,50}\b(expired|update|verify|reactivate|blocked|suspended)\b/i,
      /\b(hdfc|icici|sbi|axis|chase|paypal|wells fargo|bank of america|citibank)\b.{0,50}\b(update|verify|limited|suspended|blocked|kyc)\b/i,
    ],
    explanation:
      "Attackers spoof routine KYC and banking notices to funnel victims onto cloned login pages.",
    recommendation:
      "Do not use links inside banking messages. Call the number printed on the back of your physical bank card.",
  },
  {
    type: "Fake Customer Support / Remote Access Scam",
    severity: "high",
    weight: 28,
    patterns: [
      /\b(anydesk|teamviewer|quicksupport|rustdesk|remote access|remote support app|screen share)\b/i,
      /\b(refund desk|customer care|helpline|tech support)\b.{0,55}\b(install|download|call immediately|remote)\b/i,
    ],
    explanation:
      "Fraudulent support agents persuade victims to install remote-control apps like AnyDesk or TeamViewer to drain bank accounts.",
    recommendation:
      "Never install remote-access software at the request of an unsolicited support agent.",
  },
  {
    type: "Payment, Gift Card & Crypto Demand",
    severity: "high",
    weight: 26,
    patterns: [
      /\b(gift cards?|apple gift|google play card|steam card|redemption codes?|wire transfer|western union|usdt|bitcoin|crypto wallet)\b/i,
      /\b(processing fee|customs fee|redelivery fee|security deposit|prepaid task|refundable verification funds?)\b/i,
    ],
    explanation:
      "Demands for gift cards, crypto transfers, or upfront fees use irreversible payment rails favored by scammers.",
    recommendation:
      "Never pay fees, deposits, or obligations using gift cards, cryptocurrency, or unverified wire transfers.",
  },
  {
    type: "Investment, Job & Task Fraud",
    severity: "high",
    weight: 25,
    patterns: [
      /\b(guaranteed|risk[- ]free)\b.{0,35}\b(returns?|profit|income|daily)\b/i,
      /\b(earn|make)\s*[$₹€£]?\d[\d,\-]*\s*(daily|per day|weekly)\b/i,
      /\b(telegram|whatsapp)\b.{0,45}\b(mentor|vip tasks?|prepaid tasks?|signal group|double your|liquidity wallet)\b/i,
    ],
    explanation:
      "Promises of guaranteed high daily returns or paid simple tasks requiring upfront deposits are hallmarks of investment and task scams.",
    recommendation:
      "Avoid any job or investment opportunity that guarantees risk-free profits or requires you to deposit money to unlock earnings.",
  },
  {
    type: "Lottery & Prize Scam",
    severity: "high",
    weight: 24,
    patterns: [
      /\b(congratulations|you have won|won \$|won ₹|lottery|jackpot|international digital draw|lucky winner)\b/i,
    ],
    explanation:
      "Unsolicited prize notifications lure targets into paying advance fees or submitting identity documents.",
    recommendation:
      "Treat unsolicited prize or lottery wins as fraudulent—legitimate prizes never require upfront payment to claim.",
  },
  {
    type: "Delivery & Parcel Phishing",
    severity: "medium",
    weight: 20,
    patterns: [
      /\b(usps|ups|fedex|dhl|india post|royal mail|parcel|package|courier)\b.{0,65}\b(incomplete address|held at warehouse|redelivery|could not be delivered|customs fee)\b/i,
    ],
    explanation:
      "Fake courier alerts exploit small redelivery fees to harvest full payment card details.",
    recommendation:
      "Track deliveries exclusively through the retailer's order page or the carrier's official website.",
  },
  {
    type: "Identity Theft Harvesting",
    severity: "critical",
    weight: 30,
    patterns: [
      /\b(social security number|ssn|passport photo|photo of your passport|mother'?s maiden name|routing number|aadhaar number|pan number)\b/i,
    ],
    explanation:
      "Requesting government ID numbers, passport images, or security-question answers over messaging exposes you to identity theft.",
    recommendation:
      "Never transmit SSNs, passport scans, PAN/Aadhaar details, or bank routing numbers via chat or unverified links.",
  },
  {
    type: "Social Engineering Secrecy & Manipulation",
    severity: "medium",
    weight: 18,
    patterns: [
      /\b(do not tell anyone|don't tell anyone|strictly confidential|do not call me|do not inform anyone|keep this secret|accidentally entered your phone number)\b/i,
    ],
    explanation:
      "Isolating the target from friends, coworkers, or secondary verification channels is a classic social engineering tactic.",
    recommendation:
      "Verify unusual requests out-of-band using a trusted contact method or by consulting someone you trust.",
  },
];

function extractSnippet(text: string, regex: RegExp): string {
  const match = text.match(regex);
  if (!match || match.index === undefined) return text.slice(0, 140);
  const start = Math.max(0, match.index - 24);
  const end = Math.min(text.length, match.index + match[0].length + 36);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`;
}

export function runDeterministicTextAnalysis(text: string): {
  output: AIOutput;
  extractedUrls: string[];
} {
  const threats: DetectedThreat[] = [];
  const recommendations = new Set<string>();
  let score = 0;

  for (const rule of TEXT_THREAT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        threats.push({
          type: rule.type,
          severity: rule.severity,
          evidence: extractSnippet(text, pattern),
          explanation: rule.explanation,
        });
        recommendations.add(rule.recommendation);
        score += rule.weight;
        break;
      }
    }
  }

  // Inspect any URLs embedded inside the message
  const extractedUrls = extractUrlsFromText(text);
  for (const rawUrl of extractedUrls) {
    const validated = normalizeAndValidatePublicUrl(rawUrl);
    if (!validated.ok) continue;
    const urlEval = evaluateUrlLexicalSignals(validated.url);
    if (urlEval.riskDelta > 0) {
      score += Math.min(35, urlEval.riskDelta);
      threats.push({
        type: urlEval.isShortener
          ? "Suspicious Shortened Link"
          : "Phishing / Suspicious Link",
        severity: urlEval.riskDelta >= 25 ? "high" : "medium",
        evidence: rawUrl,
        explanation: urlEval.reasons.join(" "),
      });
      recommendations.add(
        "Do not click links embedded in unsolicited messages; navigate to official websites independently."
      );
    }
  }

  // Diminishing returns curve above 70 so multiple overlapping cues don't trivially max out at 100
  if (score > 70) {
    score = Math.min(98, Math.round(70 + (score - 70) * 0.55));
  }
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel = scoreToRiskLevel(finalScore);

  let verdict: string;
  let summary: string;
  if (riskLevel === "critical") {
    verdict = "High-confidence scam or phishing indicators detected.";
    summary = `Deterministic threat analysis identified ${threats.length} severe deception signals commonly associated with financial fraud, credential theft, or impersonation.`;
  } else if (riskLevel === "high") {
    verdict = "Suspicious social engineering or phishing attempt detected.";
    summary = `Multiple warning signs (${threats.length}) were identified in the submitted message, including manipulative language or risky links.`;
  } else if (riskLevel === "moderate") {
    verdict = "Moderate suspicious cues detected — verify before acting.";
    summary = `Some cautionary patterns (${threats.length}) appeared in the text. Independently verify the sender before taking action.`;
  } else {
    verdict = "No obvious scam signatures detected — independent verification still advised.";
    summary =
      "Automated pattern inspection did not detect overt scam triggers in this text. However, absence of detected warning signs does not prove the message is legitimate.";
  }

  if (recommendations.size === 0) {
    recommendations.add(
      "Independently verify the sender's identity through an official channel before sharing any personal or financial details."
    );
    recommendations.add(
      "Remain cautious of unexpected requests even when no automated warning signs are triggered."
    );
  }

  return {
    extractedUrls,
    output: {
      riskLevel,
      riskScore: finalScore,
      verdict,
      summary,
      detectedThreats: threats,
      recommendations: Array.from(recommendations).slice(0, 8),
      confidence:
        threats.length >= 3 ? "high" : threats.length >= 1 ? "medium" : "low",
      limitations: [
        "Absence of detected warning signs never guarantees legitimacy; subtle or novel social engineering may evade automated rules.",
      ],
    },
  };
}

function evaluateUrlLexicalSignals(parsed: URL): {
  riskDelta: number;
  isShortener: boolean;
  reasons: string[];
  isIpAddress: boolean;
  isPunycode: boolean;
  hasAtSymbolTrick: boolean;
  hasSuspiciousTld: boolean;
  suspiciousKeywords: string[];
  typosquattingMatches: Array<{
    brand: string;
    officialDomain: string;
    reason: string;
  }>;
  registeredDomain: string;
  subdomains: string[];
  tld: string;
} {
  const hostname = parsed.hostname.toLowerCase();
  const unbracketed = hostname.replace(/^\[|\]$/g, "");
  const isIpAddress = net.isIP(unbracketed) !== 0;
  const { registeredDomain, subdomains, tld } = parseDomainParts(hostname);
  const isPunycode = hostname.includes("xn--");
  const isShortener = URL_SHORTENERS.has(registeredDomain);
  const hasAtSymbolTrick = Boolean(parsed.username || parsed.password);
  const hasSuspiciousTld = SUSPICIOUS_TLDS.has(tld);

  const fullLower = `${hostname}${parsed.pathname}${parsed.search}`.toLowerCase();
  const suspiciousKeywords = PHISHING_URL_KEYWORDS.filter((kw) =>
    fullLower.includes(kw)
  );

  // Typosquatting & lookalike brand checks
  const typosquattingMatches: Array<{
    brand: string;
    officialDomain: string;
    reason: string;
  }> = [];

  if (!isIpAddress) {
    const hostTokens = hostname
      .split(/[.-]+/)
      .filter((t) => t.length >= 3);

    for (const entry of PROTECTED_BRANDS) {
      if (registeredDomain === entry.domain) continue;

      // 1. Brand embedded in subdomain or hyphenated domain on unrelated root
      if (
        hostname.includes(entry.token) ||
        deobfuscateHomoglyphs(hostname).includes(entry.token)
      ) {
        typosquattingMatches.push({
          brand: entry.brand,
          officialDomain: entry.domain,
          reason: `Hostname contains "${entry.brand}" lookalike/brand token while registered under unrelated domain "${registeredDomain}".`,
        });
        continue;
      }

      // 2. Levenshtein close typo on any domain token
      for (const tok of hostTokens) {
        const cleanTok = deobfuscateHomoglyphs(tok);
        if (Math.abs(cleanTok.length - entry.token.length) <= 2 && entry.token.length >= 5) {
          const dist = levenshtein(cleanTok, entry.token);
          if (dist > 0 && dist <= 2) {
            typosquattingMatches.push({
              brand: entry.brand,
              officialDomain: entry.domain,
              reason: `Domain token "${tok}" closely resembles "${entry.brand}" (${entry.domain}) with edit distance ${dist}.`,
            });
            break;
          }
        }
      }
    }
  }

  let riskDelta = 0;
  const reasons: string[] = [];

  if (parsed.protocol !== "https:") {
    riskDelta += 14;
    reasons.push("Connection uses unencrypted HTTP rather than HTTPS.");
  }
  if (isIpAddress) {
    riskDelta += 34;
    reasons.push("URL points directly to a raw IP address instead of a verifiable domain name.");
  }
  if (isPunycode) {
    riskDelta += 26;
    reasons.push("Domain uses Punycode (xn--) encoding, often exploited for visual IDN homograph spoofing.");
  }
  if (isShortener) {
    riskDelta += 22;
    reasons.push(`Domain "${registeredDomain}" is a URL shortener concealing the true destination.`);
  }
  if (hasAtSymbolTrick) {
    riskDelta += 32;
    reasons.push("URL contains '@' userinfo syntax used to disguise the actual destination host.");
  }
  if (hasSuspiciousTld) {
    riskDelta += 16;
    reasons.push(`Top-level domain ".${tld}" has a disproportionately high abuse rate in phishing campaigns.`);
  }
  if (typosquattingMatches.length > 0) {
    riskDelta += 36;
    reasons.push(typosquattingMatches[0].reason);
  }
  if (subdomains.length >= 2) {
    riskDelta += 12;
    reasons.push(`Deep subdomain nesting (${subdomains.length} levels) may obscure the real root domain "${registeredDomain}".`);
  }
  if (suspiciousKeywords.length >= 2) {
    riskDelta += Math.min(20, suspiciousKeywords.length * 6);
    reasons.push(`Contains high-risk phishing keywords: ${suspiciousKeywords.slice(0, 5).join(", ")}.`);
  }
  if ((hostname.match(/-/g) ?? []).length >= 3) {
    riskDelta += 10;
    reasons.push("Excessive hyphens in hostname are a common pattern in disposable phishing domains.");
  }

  return {
    riskDelta,
    isShortener,
    reasons,
    isIpAddress,
    isPunycode,
    hasAtSymbolTrick,
    hasSuspiciousTld,
    suspiciousKeywords,
    typosquattingMatches,
    registeredDomain,
    subdomains,
    tld,
  };
}

async function checkGoogleSafeBrowsing(url: string): Promise<{
  checked: boolean;
  provider: string;
  flagged: boolean;
  matches: string[];
  note: string;
}> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY?.trim();
  if (!apiKey) {
    return {
      checked: false,
      provider: "Google Safe Browsing v4",
      flagged: false,
      matches: [],
      note: "Not checked — GOOGLE_SAFE_BROWSING_API_KEY is not configured on this server.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client: { clientId: "shieldly-web", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );
    clearTimeout(timer);

    if (!response.ok) {
      return {
        checked: false,
        provider: "Google Safe Browsing v4",
        flagged: false,
        matches: [],
        note: `Google Safe Browsing request failed (HTTP ${response.status}). External reputation could not be verified.`,
      };
    }

    const data = (await response.json()) as {
      matches?: Array<{ threatType?: string }>;
    };
    const matches = (data.matches ?? [])
      .map((m) => m.threatType)
      .filter((t): t is string => Boolean(t));

    return {
      checked: true,
      provider: "Google Safe Browsing v4",
      flagged: matches.length > 0,
      matches,
      note:
        matches.length > 0
          ? `Flagged by Google Safe Browsing: ${matches.join(", ")}.`
          : "Checked against Google Safe Browsing v4 — no active listing found (newly created phishing sites may not yet be listed).",
    };
  } catch {
    clearTimeout(timer);
    return {
      checked: false,
      provider: "Google Safe Browsing v4",
      flagged: false,
      matches: [],
      note: "Google Safe Browsing check timed out or encountered a network error.",
    };
  }
}

export async function runDeterministicUrlInspection(
  rawUrl: string,
  parsed: URL
): Promise<{
  inspection: UrlInspectionDetails;
  output: AIOutput;
}> {
  const lexical = evaluateUrlLexicalSignals(parsed);

  // Run SSRF-safe redirect inspection and optional Google Safe Browsing check in parallel
  const [redirectResult, reputation] = await Promise.all([
    inspectSafeRedirectChain(parsed),
    checkGoogleSafeBrowsing(parsed.toString()),
  ]);

  const inspection: UrlInspectionDetails = {
    originalUrl: rawUrl,
    normalizedUrl: parsed.toString(),
    protocol: parsed.protocol.replace(":", ""),
    isHttps: parsed.protocol === "https:",
    hostname: parsed.hostname.toLowerCase(),
    registeredDomain: lexical.registeredDomain,
    subdomains: lexical.subdomains,
    tld: lexical.tld,
    port: parsed.port || null,
    path: parsed.pathname + parsed.search,
    isIpAddress: lexical.isIpAddress,
    isPunycode: lexical.isPunycode,
    isUrlShortener: lexical.isShortener,
    hasAtSymbolTrick: lexical.hasAtSymbolTrick,
    hasSuspiciousTld: lexical.hasSuspiciousTld,
    suspiciousKeywords: lexical.suspiciousKeywords,
    typosquattingMatches: lexical.typosquattingMatches,
    redirectChain: redirectResult.chain,
    reachabilityNote: redirectResult.note,
    externalReputation: reputation,
  };

  const threats: DetectedThreat[] = [];
  const recommendations = new Set<string>();
  let score = 0;

  if (reputation.checked && reputation.flagged) {
    score += 75;
    threats.push({
      type: "External Threat Intelligence Match",
      severity: "critical",
      evidence: reputation.matches.join(", "),
      explanation: `Google Safe Browsing flagged this URL under: ${reputation.matches.join(", ")}.`,
    });
    recommendations.add("Do not visit this website or enter any credentials or payment details.");
  }

  if (lexical.typosquattingMatches.length > 0) {
    score += 36;
    for (const match of lexical.typosquattingMatches.slice(0, 3)) {
      threats.push({
        type: "Typosquatting / Brand Lookalike",
        severity: "critical",
        evidence: `${parsed.hostname} (Official: ${match.officialDomain})`,
        explanation: match.reason,
      });
      recommendations.add(
        `Navigate manually to the official domain (${match.officialDomain}) instead of following this link.`
      );
    }
  }

  if (lexical.isIpAddress) {
    score += 34;
    threats.push({
      type: "IP-Based URL",
      severity: "high",
      evidence: parsed.hostname,
      explanation:
        "Legitimate consumer services rarely host login or payment portals directly on raw IP addresses.",
    });
    recommendations.add("Avoid entering credentials or personal data on raw IP-address websites.");
  }

  if (lexical.hasAtSymbolTrick) {
    score += 32;
    threats.push({
      type: "URL Authority Obfuscation (@ Trick)",
      severity: "critical",
      evidence: parsed.toString(),
      explanation:
        "Browsers ignore text before '@' in URLs and connect to the host after '@', a classic phishing disguise.",
    });
  }

  if (lexical.isPunycode) {
    score += 26;
    threats.push({
      type: "Punycode / Homograph Domain",
      severity: "high",
      evidence: parsed.hostname,
      explanation:
        "Internationalized Punycode domains can visually mimic familiar Latin characters to spoof trusted brands.",
    });
  }

  if (lexical.isShortener) {
    score += 22;
    threats.push({
      type: "URL Shortener Obfuscation",
      severity: "medium",
      evidence: lexical.registeredDomain,
      explanation:
        "Shortened links conceal the true destination domain and are frequently abused in SMS and WhatsApp phishing.",
    });
    recommendations.add(
      "Do not trust shortened links from unsolicited messages until the final destination is verified."
    );
  }

  if (lexical.hasSuspiciousTld) {
    score += 16;
    threats.push({
      type: "High-Abuse Top-Level Domain",
      severity: "medium",
      evidence: `.${lexical.tld} (${lexical.registeredDomain})`,
      explanation:
        "This TLD is inexpensive to register in bulk and frequently appears in short-lived phishing campaigns.",
    });
  }

  if (lexical.suspiciousKeywords.length >= 2) {
    score += Math.min(20, lexical.suspiciousKeywords.length * 6);
    threats.push({
      type: "Credential-Harvesting URL Pattern",
      severity: "high",
      evidence: lexical.suspiciousKeywords.slice(0, 6).join(", "),
      explanation:
        "The URL combines multiple account-security or verification keywords commonly used on cloned login forms.",
    });
  }

  if (lexical.subdomains.length >= 2) {
    score += 12;
    threats.push({
      type: "Deep Subdomain Spoofing",
      severity: "medium",
      evidence: `${lexical.subdomains.join(".")} → root: ${lexical.registeredDomain}`,
      explanation:
        "Attackers prepend trusted brand names as subdomains so users overlook the actual registered root domain.",
    });
  }

  if (!inspection.isHttps) {
    score += 14;
    threats.push({
      type: "Unencrypted HTTP Protocol",
      severity: "medium",
      evidence: parsed.protocol,
      explanation:
        "Data transmitted over plain HTTP is not encrypted in transit. Never submit sensitive information over HTTP.",
    });
    recommendations.add("Never enter passwords, OTPs, or card numbers on non-HTTPS pages.");
  }

  if (redirectResult.chain.length > 2) {
    score += 14;
    threats.push({
      type: "Multi-Hop Redirect Chain",
      severity: "medium",
      evidence: redirectResult.chain.map((r) => `${r.status} → ${r.url}`).join(" | "),
      explanation:
        "Multiple redirects are often used to evade automated link filters before landing on a phishing page.",
    });
  }

  if (score > 72) {
    score = Math.min(99, Math.round(72 + (score - 72) * 0.58));
  }
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const riskLevel = scoreToRiskLevel(finalScore);

  const limitations: string[] = [
    "HTTPS encryption only protects data in transit and never guarantees that a website is legitimate.",
    "SHIELDLY never executes scripts from submitted websites; dynamic client-side phishing content is not rendered.",
  ];
  if (!reputation.checked) {
    limitations.push(reputation.note);
  }

  if (recommendations.size === 0) {
    recommendations.add(
      "Verify the registered root domain carefully before signing in or entering payment details."
    );
    recommendations.add(
      "Prefer bookmarks or official apps over clicking links received in unsolicited messages."
    );
  } else {
    recommendations.add(
      "If you already entered credentials on a suspicious site, change your password immediately and enable 2FA."
    );
  }

  const verdict =
    riskLevel === "critical"
      ? "Critical phishing or deceptive domain indicators detected."
      : riskLevel === "high"
        ? "High-risk suspicious URL structure detected."
        : riskLevel === "moderate"
          ? "Moderate URL risk signals found — proceed with caution."
          : "No obvious structural red flags detected — legitimacy is not automatically confirmed.";

  const summary =
    threats.length > 0
      ? `Domain and structural inspection of "${lexical.registeredDomain}" surfaced ${threats.length} security indicator(s). ${
          reputation.checked ? reputation.note : "External Safe Browsing API was not configured for this check."
        }`
      : `Structural inspection of "${lexical.registeredDomain}" found no obvious typosquatting, IP obfuscation, or suspicious keyword patterns. Because phishing sites can use clean HTTPS domains, always verify the source independently.`;

  return {
    inspection,
    output: {
      riskLevel,
      riskScore: finalScore,
      verdict,
      summary,
      detectedThreats: threats,
      recommendations: Array.from(recommendations).slice(0, 8),
      confidence:
        reputation.checked && reputation.flagged
          ? "high"
          : threats.length >= 2
            ? "high"
            : threats.length === 1
              ? "medium"
              : "low",
      limitations,
    },
  };
}

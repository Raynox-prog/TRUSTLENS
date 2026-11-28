import { z } from "zod";

export const RiskLevelSchema = z.enum(["low", "moderate", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export type ThreatSeverity = z.infer<typeof SeveritySchema>;

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceSchema>;

export const AnalysisTypeSchema = z.enum(["text", "image", "url"]);
export type AnalysisType = z.infer<typeof AnalysisTypeSchema>;

export const DetectedThreatSchema = z.object({
  type: z.string().min(1).max(120),
  severity: SeveritySchema,
  evidence: z.string().min(1).max(600),
  explanation: z.string().min(1).max(800),
});
export type DetectedThreat = z.infer<typeof DetectedThreatSchema>;

export const AIOutputSchema = z.object({
  riskLevel: RiskLevelSchema,
  riskScore: z.number().int().min(0).max(100),
  verdict: z.string().min(1).max(300),
  summary: z.string().min(1).max(1200),
  detectedThreats: z.array(DetectedThreatSchema).max(20),
  recommendations: z.array(z.string().min(1).max(400)).min(1).max(12),
  confidence: ConfidenceSchema,
  limitations: z.array(z.string().min(1).max(400)).max(12),
});
export type AIOutput = z.infer<typeof AIOutputSchema>;

export interface UrlInspectionDetails {
  originalUrl: string;
  normalizedUrl: string;
  protocol: string;
  isHttps: boolean;
  hostname: string;
  registeredDomain: string;
  subdomains: string[];
  tld: string;
  port: string | null;
  path: string;
  isIpAddress: boolean;
  isPunycode: boolean;
  isUrlShortener: boolean;
  hasAtSymbolTrick: boolean;
  hasSuspiciousTld: boolean;
  suspiciousKeywords: string[];
  typosquattingMatches: Array<{
    brand: string;
    officialDomain: string;
    reason: string;
  }>;
  redirectChain: Array<{
    url: string;
    status: number;
  }>;
  reachabilityNote: string;
  externalReputation: {
    checked: boolean;
    provider: string;
    flagged: boolean;
    matches: string[];
    note: string;
  };
}

export interface ImageInspectionDetails {
  fileName: string;
  mimeType: string;
  detectedFormat: "PNG" | "JPEG" | "WEBP";
  sizeBytes: number;
  width: number | null;
  height: number | null;
  extractedMetadataText: string | null;
  retainedOnServer: false;
}

export interface AnalysisMetadata {
  engineLabel: string;
  aiProviderUsed: "gemini" | "openai" | "heuristic-only";
  aiModel: string | null;
  aiFallbackReason: string | null;
  externalReputationChecked: boolean;
  extractedUrls?: string[];
  urlInspection?: UrlInspectionDetails;
  imageInspection?: ImageInspectionDetails;
}

export interface AnalysisReportDTO {
  id: string;
  status: "success";
  analysisType: AnalysisType;
  inputSummary: string;
  riskLevel: RiskLevel;
  riskScore: number;
  verdict: string;
  summary: string;
  detectedThreats: DetectedThreat[];
  recommendations: string[];
  confidence: ConfidenceLevel;
  limitations: string[];
  metadata: AnalysisMetadata;
  durationMs: number;
  createdAt: string;
}

export function scoreToRiskLevel(score: number): RiskLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped <= 29) return "low";
  if (clamped <= 59) return "moderate";
  if (clamped <= 79) return "high";
  return "critical";
}

export function riskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "Low Risk";
    case "moderate":
      return "Moderate Risk";
    case "high":
      return "High Risk";
    case "critical":
      return "Critical Risk";
  }
}

export interface ScamCategoryInfo {
  id: string;
  name: string;
  shortDesc: string;
  exampleText?: string;
  exampleUrl?: string;
  mode: "text" | "url";
}

export const SUPPORTED_SCAM_CATEGORIES: ScamCategoryInfo[] = [
  {
    id: "phishing",
    name: "Phishing",
    shortDesc: "Deceptive messages designed to steal passwords, logins, or card details.",
    mode: "text",
    exampleText:
      "Security Alert: Unusual sign-in detected on your email account. Verify your password immediately at http://account-verify-secure.xyz/login or access will be permanently revoked in 15 minutes.",
  },
  {
    id: "fake-banking",
    name: "Fake Banking Messages",
    shortDesc: "Spoofed bank alerts demanding urgent KYC updates or card reactivation.",
    mode: "text",
    exampleText:
      "Dear Customer, Your HDFC Bank account KYC has expired today. Your netbanking and debit card will be blocked in 10 minutes. Update PAN & OTP immediately at http://hdfc-kyc-update.top/verify",
  },
  {
    id: "otp-theft",
    name: "OTP Theft",
    shortDesc: "Social engineering tricks asking victims to read back one-time passcodes.",
    mode: "text",
    exampleText:
      "Hi, I accidentally entered your phone number for a verification code. Please forward the 6-digit OTP you just received right now, it is urgent!",
  },
  {
    id: "upi-fraud",
    name: "UPI Fraud",
    shortDesc: "Fake refund requests, collect links, or QR scans that debit funds instead of crediting.",
    mode: "text",
    exampleText:
      "Congratulations! Your cashback refund of ₹4,999 is approved. Open your UPI app, approve the collect request and enter your UPI PIN to receive the amount immediately.",
  },
  {
    id: "fake-support",
    name: "Fake Customer Support",
    shortDesc: "Fraudulent helpline numbers asking to install AnyDesk or TeamViewer.",
    mode: "text",
    exampleText:
      "Amazon Refund Desk: Call our helpline +1-800-555-0192 immediately and install AnyDesk remote support app so our agent can process your pending refund.",
  },
  {
    id: "gov-impersonation",
    name: "Government Impersonation",
    shortDesc: "Fake tax authority, customs, or national ID suspension notices.",
    mode: "text",
    exampleText:
      "FINAL NOTICE from Tax Enforcement Department: Unpaid tax balance detected under your ID. Settle penalty via wire transfer within 2 hours to avoid asset freeze.",
  },
  {
    id: "fake-police",
    name: "Fake Police Threats",
    shortDesc: "Digital arrest scams claiming legal warrants, narcotics parcels, or imminent detention.",
    mode: "text",
    exampleText:
      "CYBER CRIME POLICE NOTICE: An arrest warrant has been issued in your name regarding an illegal customs parcel. Join Skype video call immediately for digital verification and transfer security deposit to avoid arrest.",
  },
  {
    id: "payment-scams",
    name: "Payment Scams",
    shortDesc: "Urgent invoice fraud, gift card demands, and irreversible crypto transfers.",
    mode: "text",
    exampleText:
      "URGENT from CEO: I am stuck in a confidential board meeting. Purchase 5 Apple Gift Cards ($200 each) right now and send me the redemption codes. Do not call me.",
  },
  {
    id: "lottery-scams",
    name: "Lottery & Prize Scams",
    shortDesc: "Unsolicited jackpot notices demanding upfront processing fees.",
    mode: "text",
    exampleText:
      "CONGRATULATIONS! Your mobile number won $500,000 in the International Digital Draw! Pay a small $150 processing fee via gift card to claim your prize today.",
  },
  {
    id: "job-scams",
    name: "Job & Task Scams",
    shortDesc: "Too-good-to-be-true remote offers requiring prepaid task deposits.",
    mode: "text",
    exampleText:
      "Part-time Work From Home! Earn $300-$800 daily just liking YouTube videos. Join our Telegram mentor and deposit $100 USDT to unlock VIP prepaid tasks with guaranteed 40% profit.",
  },
  {
    id: "investment-fraud",
    name: "Investment Fraud",
    shortDesc: "Guaranteed-return crypto trading groups and pig-butchering platforms.",
    mode: "text",
    exampleText:
      "Exclusive AI Crypto Signal Group: Guaranteed 15% daily risk-free returns! Send USDT to our liquidity wallet today to double your portfolio within 48 hours.",
  },
  {
    id: "delivery-scams",
    name: "Delivery & Parcel Scams",
    shortDesc: "Fake courier SMS claiming address failure or small customs fees.",
    mode: "text",
    exampleText:
      "USPS Notice: Your package could not be delivered due to an incomplete street address. Confirm your address and pay $1.99 redelivery fee at https://bit.ly/3parcel-fee within 12 hours.",
  },
  {
    id: "account-suspension",
    name: "Account Suspension Threats",
    shortDesc: "Panic-inducing alerts threatening permanent lockouts within minutes.",
    mode: "text",
    exampleText:
      "URGENT: Your PayPal account has been permanently limited due to suspicious transactions. Confirm your card CVV and SSN within 30 minutes at http://paypa1-resolution-center.xyz",
  },
  {
    id: "shortened-links",
    name: "Suspicious Shortened Links",
    shortDesc: "Obfuscated redirect links hiding malicious final destinations.",
    mode: "url",
    exampleUrl: "https://bit.ly/verify-urgent-bank-kyc",
  },
  {
    id: "fake-websites",
    name: "Fake & Lookalike Websites",
    shortDesc: "Typosquatted domains, punycode homographs, and cloned login portals.",
    mode: "url",
    exampleUrl: "http://paypa1-secure-login.account-verify.xyz/signin",
  },
  {
    id: "social-engineering",
    name: "Social Engineering",
    shortDesc: "Psychological coercion combining secrecy, authority, fear, and time pressure.",
    mode: "text",
    exampleText:
      "Keep this strictly confidential and do not inform anyone. As senior compliance officer, I require your login credentials and security answers immediately to stop unauthorized wire activity.",
  },
  {
    id: "identity-theft",
    name: "Identity Theft",
    shortDesc: "Harvesting Aadhaar, SSN, passport photos, PAN, or date-of-birth records.",
    mode: "text",
    exampleText:
      "Mandatory Verification: Reply with a photo of your passport, Social Security Number, mother's maiden name, and bank routing number to prevent service termination.",
  },
];

export const EXAMPLE_TEXT_MESSAGES = [
  {
    label: "Fake Bank KYC + OTP",
    category: "Banking & OTP Theft",
    text: "URGENT ALERT: Dear Customer, your bank account KYC has expired and your account will be blocked in 10 minutes. Update your PAN and verify your 6-digit OTP immediately at http://secure-bank-kyc-update.xyz/login to avoid permanent suspension.",
  },
  {
    label: "Fake Police / Digital Arrest",
    category: "Government Impersonation",
    text: "CYBER CRIME POLICE DEPARTMENT: An arrest warrant has been issued against your national ID for an intercepted customs parcel. Do not tell anyone. Join video verification immediately and transfer refundable verification funds via wire transfer within 1 hour to avoid arrest.",
  },
  {
    label: "UPI Refund Collect Scam",
    category: "UPI & Payment Fraud",
    text: "Customer Care Refund: Your cancelled order refund of ₹8,450 is pending. Open your UPI app, accept the collect request from refund-desk@upi, and enter your UPI PIN now to credit the amount to your bank account.",
  },
  {
    label: "Delivery Address Phishing",
    category: "Delivery Scam",
    text: "DHL Express: Your parcel #DH94821 is held at warehouse due to an incomplete address. Pay a small $2.40 redelivery fee and confirm card details within 12 hours: https://bit.ly/dhl-redeliver-urgent",
  },
  {
    label: "Crypto / Job Task Fraud",
    category: "Investment & Job Scam",
    text: "Remote Hiring Alert! Earn $400 daily reviewing products from home. Message our HR manager on WhatsApp/Telegram and deposit $150 USDT into the merchant portal for guaranteed 35% daily risk-free returns!",
  },
];

export const EXAMPLE_URLS = [
  {
    label: "Typosquatted PayPal",
    url: "http://paypa1-security-center.verify-login.xyz/account/update",
  },
  {
    label: "Shortened Bank KYC Link",
    url: "https://bit.ly/urgent-kyc-verify-now",
  },
  {
    label: "IP-Based Login Portal",
    url: "http://198.51.100.42/secure/banking/otp-verify",
  },
  {
    label: "Lookalike Apple Subdomain",
    url: "https://apple.com.id-locked-support.top/signin",
  },
];

# SHIELDLY — Think Before You Click.

SHIELDLY is a full-stack, multi-page AI-powered cybersecurity platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Zod**, **Drizzle ORM (PostgreSQL)**, **pdf-lib**, and server-side multimodal AI (**Google Gemini** or **OpenAI**).

> **Mission:** *"Making digital spaces safer by helping people recognize deception before it causes harm."*

---

## Core Capabilities

- **Text Analysis (`POST /api/analyze/text`)**: Evaluates suspicious SMS, WhatsApp messages, and emails across 17 real-world scam categories (phishing, fake banking alerts, OTP theft, UPI collect fraud, fake police/government threats, fake customer support, job/investment/lottery/delivery scams, social engineering, and identity theft).
- **Multimodal Screenshot Analysis (`POST /api/analyze/image`)**: Drag-and-drop PNG/JPG/JPEG/WEBP uploader with MIME + binary magic-byte signature validation, 8 MB file limit, real upload progress, ephemeral in-memory processing (raw images are never retained on disk or database), and multimodal AI vision support.
- **SSRF-Hardened Website Checker (`POST /api/analyze/url`)**: Dissects domain structure, HTTPS protocol (explicitly noting HTTPS ≠ legitimacy), typosquatting & brand lookalikes, Punycode (`xn--`), IP-based URLs, URL shorteners, safe multi-hop redirect inspection (no script execution), and optional **Google Safe Browsing v4** checks.
- **Detailed Investigation Reports & PDF Export (`/results`, `POST /api/report`)**: Animated 0–100 risk gauge (`0–29 Low`, `30–59 Moderate`, `60–79 High`, `80–100 Critical`), evidence quotes, recommendations, honest engine/limitation attribution, clipboard export, and real downloadable PDF generation.
- **PostgreSQL Investigation Dashboard (`/dashboard`)**: Displays exclusively real stored investigations, risk distribution, high-risk spotlight, filtering, PDF downloads, and one-click report deletion.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Flagship SHIELDLY homepage with signature hero, 17 threat categories, and live interactive demo |
| `/analyze` | Unified 3-mode Analyzer (Text, Screenshot, Website) |
| `/results` | Full investigation report viewer with PDF download & copy report |
| `/website-checker` | Specialized deep URL & domain security inspector |
| `/dashboard` | Real stored investigation history, risk distribution, and deletion controls |
| `/how-it-works` | Interactive 5-stage animated pipeline (`Submit → Extract → Investigate → Evaluate → Protect`) |
| `/about` | Mission and engineering philosophy |
| `/privacy` | Transparent data handling, ephemeral screenshot policy, and retention disclosures |

---

## 1. Local Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or hosted via Neon / Supabase / Vercel Postgres)

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_db"

# Configure GEMINI_API_KEY and/or OPENAI_API_KEY for live multimodal AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Optional alternative LLM provider
# OPENAI_API_KEY="your-openai-api-key"
# OPENAI_MODEL="gpt-4o-mini"

# Optional Google Safe Browsing v4 API key
# GOOGLE_SAFE_BROWSING_API_KEY="your-safe-browsing-key"
```

> **Transparency Note:** If neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` is configured, SHIELDLY runs its local deterministic cybersecurity engine and explicitly discloses in every report that live LLM reasoning / multimodal vision was not active. SHIELDLY never fabricates AI responses and never claims an external database check occurred unless it actually executed.

### Push PostgreSQL Schema
```bash
npx drizzle-kit push
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Verify Production Build Locally
```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build
```

---

## 2. Push to GitHub (Excluding Secrets)

Verify that `.env` and `.env.local` are ignored by Git before pushing:

```bash
git init
git status   # Confirm .env / .env.local do NOT appear in untracked files
git add .
git commit -m "Initial SHIELDLY full-stack cybersecurity platform"
git branch -M main
git remote add origin https://github.com/<your-username>/shieldly.git
git push -u origin main
```

---

## 3. Deploy to Vercel

1. **Provision a Cloud PostgreSQL Database**: Create a free PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Storage and copy its connection string (`DATABASE_URL`).
2. **Push Schema to Production DB**:
   ```bash
   DATABASE_URL="your-production-postgres-url" npx drizzle-kit push
   ```
3. **Import into Vercel**:
   - Sign in to [vercel.com](https://vercel.com) and click **Add New → Project**.
   - Select your `shieldly` GitHub repository.
   - Framework Preset will automatically detect **Next.js**.
4. **Configure Vercel Environment Variables**:
   In **Settings → Environment Variables**, add:
   - `DATABASE_URL` (Required)
   - `GEMINI_API_KEY` (Recommended for multimodal Vision + Text + URL analysis) and optional `GEMINI_MODEL=gemini-2.5-flash`
   - `OPENAI_API_KEY` (Optional fallback/alternative) and optional `OPENAI_MODEL=gpt-4o-mini`
   - `GOOGLE_SAFE_BROWSING_API_KEY` (Optional external URL reputation lookup)
5. **Deploy**:
   Click **Deploy**. Once live, verify `/api/health` returns `{"ok":true}` and test Text, Screenshot, and Website analysis on your production URL.

---

## Security Highlights
- **Server-Side API Keys**: Zero secrets in client bundles (`NEXT_PUBLIC_*` is never used for credentials).
- **Prompt Injection Defense**: All user content is wrapped inside `<UNTRUSTED_INPUT>` boundaries and model responses are strictly validated with Zod.
- **SSRF Protection**: Blocks private IPv4/IPv6 CIDRs, loopback, cloud metadata endpoints (`169.254.169.254`), `.local`/`.internal` suffixes, unsafe protocols, and DNS rebinding before any outbound HEAD check.
- **Ephemeral Screenshot Processing**: Binary signature + MIME verification in memory; raw images are discarded after processing.
- **Rate Limiting**: Per-IP sliding-window rate limits across analysis and PDF report routes.

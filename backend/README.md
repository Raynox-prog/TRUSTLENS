# SHIELDLY AI — Standalone Backend API

This folder contains the standalone Node.js & Express backend API for **SHIELDLY AI**, ready to be hosted independently on **Render** (or any cloud Node.js host).

---

## 🚀 Quick Deploy to Render

### Option A: Deploy from GitHub (Recommended)
1. Push your project to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Set the following settings:
   - **Name**: `shieldly-backend`
   - **Runtime**: `Node`
   - **Root Directory**: `backend` (if in monorepo, otherwise leave blank)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add your **Environment Variables** in the Render settings:
   - `GEMINI_API_KEY` = your Google Gemini API key (from [AI Studio](https://aistudio.google.com/apikey))
   - `GEMINI_MODEL` = `gemini-2.5-flash`
   - `CORS_ORIGIN` = `*` (or your Vercel URL e.g. `https://shieldly.vercel.app`)
   - `DATABASE_URL` = *(Optional)* PostgreSQL connection string
7. Click **Create Web Service**.

Once deployed, Render will assign you a live URL, for example:
`https://shieldly-backend.onrender.com`

---

## 🔗 Connect Frontend on Vercel

In your Vercel project settings (**Settings** -> **Environment Variables**), add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

The website will immediately route all threat detection, text analysis, screenshot OCR, and PDF reports directly to your Render backend!

---

## 💻 Local Development

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Add your GEMINI_API_KEY into backend/.env
# 3. Start development server on port 5000
npm run dev
```

Test endpoints:
- Health: `http://localhost:5000/health`
- Status: `http://localhost:5000/api/status`
- Analyze URL: `POST http://localhost:5000/api/analyze/url`
- Analyze Text: `POST http://localhost:5000/api/analyze/text`
- Analyze Screenshot: `POST http://localhost:5000/api/analyze/image`

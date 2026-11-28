/**
 * SHIELDLY AI - Unified API URL Resolver
 * 
 * Supports:
 * - VITE_API_URL (as requested for hosting on Render / Vercel)
 * - NEXT_PUBLIC_API_URL
 * - NEXT_PUBLIC_BACKEND_URL
 * 
 * When configured (e.g. https://shieldly-backend.onrender.com),
 * frontend requests will be sent directly to the external Render backend.
 * When not configured or empty, requests fall back to relative path (Next.js internal API).
 */

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side execution
    const clientEnv =
      (process.env.VITE_API_URL as string | undefined) ||
      (process.env.NEXT_PUBLIC_API_URL as string | undefined) ||
      (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ||
      "";
    return clientEnv.trim().replace(/\/+$/, "");
  }

  // Server-side execution
  const serverEnv =
    (process.env.VITE_API_URL as string | undefined) ||
    (process.env.NEXT_PUBLIC_API_URL as string | undefined) ||
    (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined) ||
    (process.env.BACKEND_URL as string | undefined) ||
    "";
  return serverEnv.trim().replace(/\/+$/, "");
}

export function getApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (!base) {
    return cleanEndpoint;
  }

  return `${base}${cleanEndpoint}`;
}

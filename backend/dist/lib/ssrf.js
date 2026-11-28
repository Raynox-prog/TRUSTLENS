"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrivateOrReservedIPv4 = isPrivateOrReservedIPv4;
exports.isPrivateOrReservedIPv6 = isPrivateOrReservedIPv6;
exports.isPrivateIpAddress = isPrivateIpAddress;
exports.normalizeAndValidatePublicUrl = normalizeAndValidatePublicUrl;
exports.assertSafePublicResolution = assertSafePublicResolution;
exports.inspectSafeRedirectChain = inspectSafeRedirectChain;
const promises_1 = __importDefault(require("node:dns/promises"));
const node_net_1 = __importDefault(require("node:net"));
const BLOCKED_HOSTNAMES = new Set([
    "localhost",
    "localhost.localdomain",
    "ip6-localhost",
    "ip6-loopback",
    "metadata.google.internal",
    "metadata",
    "169.254.169.254",
    "0.0.0.0",
]);
const BLOCKED_SUFFIXES = [
    ".localhost",
    ".local",
    ".internal",
    ".home.arpa",
    ".lan",
    ".intranet",
    ".corp",
];
function isPrivateOrReservedIPv4(ip) {
    const parts = ip.split(".").map((n) => Number(n));
    if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
        return true;
    }
    const [a, b, c] = parts;
    // 0.0.0.0/8 (this network)
    if (a === 0)
        return true;
    // 10.0.0.0/8 (RFC1918)
    if (a === 10)
        return true;
    // 100.64.0.0/10 (CGNAT)
    if (a === 100 && b >= 64 && b <= 127)
        return true;
    // 127.0.0.0/8 (loopback)
    if (a === 127)
        return true;
    // 169.254.0.0/16 (link-local & cloud metadata)
    if (a === 169 && b === 254)
        return true;
    // 172.16.0.0/12 (RFC1918)
    if (a === 172 && b >= 16 && b <= 31)
        return true;
    // 192.0.0.0/24 (IETF protocol assignments)
    if (a === 192 && b === 0 && c === 0)
        return true;
    // 192.168.0.0/16 (RFC1918)
    if (a === 192 && b === 168)
        return true;
    // 198.18.0.0/15 (benchmarking)
    if (a === 198 && (b === 18 || b === 19))
        return true;
    // 224.0.0.0/4 (multicast) and 240.0.0.0/4 (reserved/broadcast)
    if (a >= 224)
        return true;
    return false;
}
function isPrivateOrReservedIPv6(ip) {
    const normalized = ip.toLowerCase().replace(/^\[|\]$/g, "");
    // Mapped IPv4 ::ffff:a.b.c.d
    const mappedMatch = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mappedMatch) {
        return isPrivateOrReservedIPv4(mappedMatch[1]);
    }
    if (normalized === "::" || normalized === "::1")
        return true;
    // fc00::/7 Unique local address (fc.. or fd..)
    if (normalized.startsWith("fc") || normalized.startsWith("fd"))
        return true;
    // fe80::/10 Link-local
    if (/^fe[89ab]/.test(normalized))
        return true;
    // ff00::/8 Multicast
    if (normalized.startsWith("ff"))
        return true;
    return false;
}
function isPrivateIpAddress(ip) {
    const clean = ip.replace(/^\[|\]$/g, "");
    const version = node_net_1.default.isIP(clean);
    if (version === 4)
        return isPrivateOrReservedIPv4(clean);
    if (version === 6)
        return isPrivateOrReservedIPv6(clean);
    return false;
}
function normalizeAndValidatePublicUrl(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed || trimmed.length > 2048) {
        return {
            ok: false,
            error: "Please enter a valid URL between 1 and 2048 characters.",
        };
    }
    // Explicitly block dangerous non-web schemes before normalization
    if (/^(javascript|data|file|ftp|vbscript|blob|chrome|about|ws|wss):/i.test(trimmed)) {
        return {
            ok: false,
            error: "Unsupported or unsafe URL protocol. Only http:// and https:// URLs are permitted.",
        };
    }
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    let parsed;
    try {
        parsed = new URL(candidate);
    }
    catch {
        return {
            ok: false,
            error: "Invalid URL format. Please provide a valid web address (e.g., https://example.com).",
        };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return {
            ok: false,
            error: "Only HTTP and HTTPS protocols are allowed.",
        };
    }
    const host = parsed.hostname.toLowerCase();
    const unbracketed = host.replace(/^\[|\]$/g, "");
    if (!unbracketed || BLOCKED_HOSTNAMES.has(unbracketed)) {
        return {
            ok: false,
            error: "Blocked for SSRF protection: localhost and internal metadata hosts cannot be inspected.",
        };
    }
    if (BLOCKED_SUFFIXES.some((suffix) => unbracketed.endsWith(suffix))) {
        return {
            ok: false,
            error: "Blocked for SSRF protection: internal network hostnames cannot be inspected.",
        };
    }
    // Block integer/hex/octal IP obfuscation tricks or bare single-label internal hostnames
    if (node_net_1.default.isIP(unbracketed) !== 0) {
        if (isPrivateIpAddress(unbracketed)) {
            return {
                ok: false,
                error: "Blocked for SSRF protection: private, loopback, or reserved IP addresses are disallowed.",
            };
        }
    }
    else {
        if (!unbracketed.includes(".")) {
            return {
                ok: false,
                error: "Blocked: single-label internal hostnames are not valid public domains.",
            };
        }
    }
    // Block sensitive internal service ports
    const blockedPorts = new Set(["22", "23", "25", "53", "110", "143", "445", "3306", "5432", "6379", "9200", "27017"]);
    if (parsed.port && blockedPorts.has(parsed.port)) {
        return {
            ok: false,
            error: `Blocked for SSRF protection: port ${parsed.port} is restricted.`,
        };
    }
    return { ok: true, url: parsed };
}
async function assertSafePublicResolution(hostname) {
    const clean = hostname.replace(/^\[|\]$/g, "");
    if (node_net_1.default.isIP(clean) !== 0) {
        if (isPrivateIpAddress(clean)) {
            return { safe: false, resolvedIps: [clean], reason: "Private/reserved IP blocked" };
        }
        return { safe: true, resolvedIps: [clean] };
    }
    try {
        const records = await Promise.race([
            promises_1.default.lookup(clean, { all: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("DNS lookup timed out")), 2500)),
        ]);
        const ips = records.map((r) => r.address);
        for (const ip of ips) {
            if (isPrivateIpAddress(ip)) {
                return {
                    safe: false,
                    resolvedIps: ips,
                    reason: "Hostname resolved to a private or reserved IP address (SSRF blocked)",
                };
            }
        }
        return { safe: true, resolvedIps: ips };
    }
    catch {
        return {
            safe: false,
            resolvedIps: [],
            reason: "Domain could not be resolved via DNS (may be unregistered, offline, or sandbox-restricted)",
        };
    }
}
async function inspectSafeRedirectChain(initialUrl, maxHops = 3, timeoutMs = 3000) {
    const chain = [];
    let currentUrl = initialUrl;
    for (let hop = 0; hop < maxHops; hop++) {
        const dnsCheck = await assertSafePublicResolution(currentUrl.hostname);
        if (!dnsCheck.safe) {
            return {
                chain,
                note: dnsCheck.reason ?? "Skipped outbound redirect probe due to DNS/SSRF guard.",
            };
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(currentUrl.toString(), {
                method: "HEAD",
                redirect: "manual",
                signal: controller.signal,
                headers: {
                    "User-Agent": "SHIELDLY-Security-Inspector/1.0 (+no-script-execution)",
                },
            });
            clearTimeout(timer);
            chain.push({ url: currentUrl.toString(), status: res.status });
            if (res.status >= 300 && res.status < 400) {
                const location = res.headers.get("location");
                if (!location) {
                    return { chain, note: `Redirect response (${res.status}) without Location header.` };
                }
                let nextParsed;
                try {
                    nextParsed = new URL(location, currentUrl);
                }
                catch {
                    return { chain, note: "Redirect target could not be parsed safely." };
                }
                const validated = normalizeAndValidatePublicUrl(nextParsed.toString());
                if (!validated.ok) {
                    return {
                        chain,
                        note: `Blocked unsafe redirect target: ${validated.error}`,
                    };
                }
                currentUrl = validated.url;
                continue;
            }
            return {
                chain,
                note: chain.length > 1
                    ? `Followed ${chain.length - 1} redirect hop(s) safely without executing scripts.`
                    : `Server responded with HTTP ${res.status} (HEAD check only; no scripts executed).`,
            };
        }
        catch {
            clearTimeout(timer);
            return {
                chain,
                note: chain.length > 0
                    ? "Redirect probe stopped early due to timeout or connection refusal."
                    : "Outbound HEAD check did not receive a response (host unreachable, timed out, or network-restricted); lexical & domain inspection completed.",
            };
        }
    }
    return {
        chain,
        note: `Stopped after maximum ${maxHops} redirect hops (potential redirect chain obfuscation).`,
    };
}

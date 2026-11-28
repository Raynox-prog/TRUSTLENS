"use client";

/**
 * ParticleCanvas — fixed full-viewport particle layer, z-index: 1.
 *
 * LAYERING STRATEGY (defined in layout.tsx):
 *   z:0  body background  (#080B10 solid — the darkest base)
 *   z:1  THIS canvas      (fixed, transparent canvas drawn on top of body)
 *   z:2  #content-root div wrapping all {children}  (transparent, so canvas shows through)
 *
 * Individual page elements that DO have opaque backgrounds (cards, navbars,
 * obsidian-card divs) correctly cover the canvas — particles only appear
 * in genuinely dark/transparent areas of the UI, which is the desired effect.
 */

import { useEffect, useRef } from "react";
import { useTheme } from "./theme-context";

// ─── helpers ──────────────────────────────────────────────────────────────────

function hex2rgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map(x => x + x).join("") : c, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

const rnd = (lo: number, hi: number) => Math.random() * (hi - lo) + lo;

// ─── particle types ────────────────────────────────────────────────────────────

type Kind = "dot" | "ring" | "diamond" | "cube";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  alpha: number; alphaTarget: number; alphaSpeed: number;
  rotation: number; rotationSpeed: number;
  kind: Kind;
  usePrimary: boolean;
  trail: Array<{ x: number; y: number }>;
}

function mkParticle(W: number, H: number, kind: Kind): Particle {
  const speed = kind === "cube" ? rnd(0.04, 0.12) : rnd(0.08, 0.26);
  const angle = rnd(0, Math.PI * 2);
  const r = kind === "cube" ? rnd(8, 15)
    : kind === "ring" ? rnd(3, 8)
    : kind === "diamond" ? rnd(2.5, 6)
    : rnd(1.5, 4.0);

  return {
    x: rnd(0, W), y: rnd(0, H),
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    radius: r,
    alpha: rnd(0.35, 0.65),
    alphaTarget: rnd(0.35, 0.80),
    alphaSpeed: rnd(0.003, 0.012),
    rotation: rnd(0, Math.PI * 2),
    rotationSpeed: rnd(-0.008, 0.008),
    kind,
    usePrimary: Math.random() < 0.60,
    trail: [],
  };
}

// ─── draw functions ───────────────────────────────────────────────────────────

function dot(ctx: CanvasRenderingContext2D, p: Particle,
  r: number, g: number, b: number) {
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.fill();
}

function ring(ctx: CanvasRenderingContext2D, p: Particle,
  r: number, g: number, b: number) {
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.75})`;
  ctx.fill();
}

function diamond(ctx: CanvasRenderingContext2D, p: Particle,
  r: number, g: number, b: number) {
  const s = p.radius * 1.3;
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.lineTo(s * 0.65, 0);
  ctx.lineTo(0, s);  ctx.lineTo(-s * 0.65, 0);
  ctx.closePath();
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.18})`;
  ctx.fill();
}

function cube(ctx: CanvasRenderingContext2D, p: Particle,
  r: number, g: number, b: number) {
  const s = p.radius;
  const off = s * 0.55;
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.beginPath(); ctx.rect(-s, -s, s * 2, s * 2); ctx.stroke();
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.38})`;
  ctx.beginPath(); ctx.rect(-s + off, -s - off, s * 2, s * 2); ctx.stroke();
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.28})`;
  ctx.lineWidth = 0.6;
  for (const [cx, cy] of [[-s, -s], [s, -s], [s, s], [-s, s]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + off, cy - off); ctx.stroke();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const TRAIL = 14;

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const W         = useRef(0);
  const H         = useRef(0);

  const { theme } = useTheme();
  const themeRef  = useRef({ p: theme.primary, s: theme.secondary });
  themeRef.current = { p: theme.primary, s: theme.secondary };

  useEffect(() => {
    // Note: we intentionally do NOT bail out for prefers-reduced-motion here.
    // The particles are static decorations; we just slow them down significantly.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speedScale = reducedMotion ? 0.15 : 1.0;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── size canvas to viewport ──────────────────────────────────────────────
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w   = window.innerWidth;
      const h   = window.innerHeight;

      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;

      W.current = w;
      H.current = h;

      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr); }

      const mob   = w < 768;
      const cubes = mob ? 1 : 4;
      const rings = mob ? 2 : 5;
      const dia   = mob ? 1 : 4;
      const dots  = Math.max(0, (mob ? 12 : 28) - cubes - rings - dia);

      const makeP = (kind: Kind) => {
        const p = mkParticle(w, h, kind);
        p.vx *= speedScale;
        p.vy *= speedScale;
        return p;
      };

      particles.current = [
        ...Array.from({ length: cubes }, () => makeP("cube")),
        ...Array.from({ length: rings }, () => makeP("ring")),
        ...Array.from({ length: dia   }, () => makeP("diamond")),
        ...Array.from({ length: dots  }, () => makeP("dot")),
      ];
    }

    // ── animation tick ───────────────────────────────────────────────────────
    function tick() {
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const w = W.current; const h = H.current;
      if (!w || !h) { rafRef.current = requestAnimationFrame(tick); return; }

      const [pr, pg, pb] = hex2rgb(themeRef.current.p);
      const [sr, sg, sb] = hex2rgb(themeRef.current.s);

      ctx.clearRect(0, 0, w, h);

      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed;

        if (p.x < -20)   p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20)   p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        const diff = p.alphaTarget - p.alpha;
        if (Math.abs(diff) < 0.004) p.alphaTarget = rnd(0.28, 0.82);
        p.alpha = Math.max(0.1, Math.min(0.85, p.alpha + diff * p.alphaSpeed * 10));

        const [r, g, b] = p.usePrimary ? [pr, pg, pb] : [sr, sg, sb];

        // trail
        if (p.kind === "dot") {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > TRAIL) p.trail.shift();
          for (let i = 1; i < p.trail.length; i++) {
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${(i / p.trail.length) * 0.22})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        switch (p.kind) {
          case "dot":     dot(ctx, p, r, g, b);     break;
          case "ring":    ring(ctx, p, r, g, b);    break;
          case "diamond": diamond(ctx, p, r, g, b); break;
          case "cube":    cube(ctx, p, r, g, b);    break;
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // ── init ──────────────────────────────────────────────────────────────────
    resize();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(timer); timer = setTimeout(resize, 160); };
    window.addEventListener("resize", onResize, { passive: true });

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(tick); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        pointerEvents: "none",
        zIndex:        1,
        display:       "block",
      }}
    />
  );
}

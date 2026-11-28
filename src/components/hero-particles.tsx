"use client";

/**
 * HeroParticles — absolutely-positioned Canvas 2D particle layer.
 *
 * Place as the FIRST child of a `position:relative` container.
 * z-index: 1   →  behind all sibling content (which uses z-index ≥ 2).
 * pointer-events: none  →  never blocks clicks or inputs.
 */

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme/theme-context";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function hex2rgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3
    ? c.split("").map(x => x + x).join("")
    : c, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

const rnd = (lo: number, hi: number) => Math.random() * (hi - lo) + lo;

// ─── particle data ────────────────────────────────────────────────────────────

interface P {
  x: number; y: number;
  vx: number; vy: number;
  r: number;          // base radius
  alpha: number;      // current opacity
  alphaT: number;     // target opacity
  alphaS: number;     // lerp speed
  rot: number;
  rotV: number;
  kind: "dot" | "ring" | "diamond" | "cube";
  colorIdx: 0 | 1;    // 0=primary, 1=secondary
  trail: Array<{ x: number; y: number }>;
}

function mkP(W: number, H: number, isCube = false): P {
  const speed = rnd(0.10, 0.30);
  const ang = rnd(0, Math.PI * 2);
  const kind: P["kind"] = isCube
    ? "cube"
    : (Math.random() < 0.60 ? "dot"
      : Math.random() < 0.60 ? "ring"
      : "diamond");

  return {
    x: rnd(0, W),
    y: rnd(0, H),
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed,
    r: isCube ? rnd(7, 13) : (kind === "dot" ? rnd(1.5, 4.0) : rnd(3, 7)),
    alpha: rnd(0.30, 0.65),
    alphaT: rnd(0.30, 0.70),
    alphaS: rnd(0.004, 0.012),
    rot: rnd(0, Math.PI * 2),
    rotV: rnd(-0.008, 0.008),
    kind,
    colorIdx: Math.random() < 0.60 ? 0 : 1,
    trail: [],
  };
}

// ─── draw helpers ─────────────────────────────────────────────────────────────

function drawDot(ctx: CanvasRenderingContext2D, p: P,
  r: number, g: number, b: number) {
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.fill();
}

function drawRing(ctx: CanvasRenderingContext2D, p: P,
  r: number, g: number, b: number) {
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.8})`;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // inner dot
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.6})`;
  ctx.fill();
}

function drawDiamond(ctx: CanvasRenderingContext2D, p: P,
  r: number, g: number, b: number) {
  const s = p.r;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.4);
  ctx.lineTo(s * 0.8, 0);
  ctx.lineTo(0, s * 1.4);
  ctx.lineTo(-s * 0.8, 0);
  ctx.closePath();
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.25})`;
  ctx.fill();
}

function drawCube(ctx: CanvasRenderingContext2D, p: P,
  r: number, g: number, b: number) {
  const s = p.r;
  const off = s * 0.5;
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha})`;
  ctx.lineWidth = 0.9;
  // front face
  ctx.strokeRect(-s, -s, s * 2, s * 2);
  // back face
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.45})`;
  ctx.strokeRect(-s + off, -s - off, s * 2, s * 2);
  // connecting edges
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.3})`;
  ctx.lineWidth = 0.6;
  const corners: [number, number][] = [[-s,-s],[s,-s],[s,s],[-s,s]];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + off, cy - off);
    ctx.stroke();
  }
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: P["trail"],
  r: number, g: number, b: number) {
  if (trail.length < 3) return;
  for (let i = 1; i < trail.length; i++) {
    const a = (i / trail.length) * 0.22;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const TRAIL_LEN = 14;

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<P[]>([]);
  // Store logical (CSS-pixel) dimensions so the tick loop never reads the DOM
  const dims      = useRef({ W: 0, H: 0 });

  const { theme } = useTheme();
  // Keep theme in a ref; the rAF loop reads it without triggering re-renders
  const themeRef  = useRef({ primary: theme.primary, secondary: theme.secondary });
  themeRef.current = { primary: theme.primary, secondary: theme.secondary };

  useEffect(() => {
    // Skip for users who prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── size canvas to its own CSS bounding rect ───────────────────────────
    function resize() {
      if (!canvas) return;
      const rect  = canvas.getBoundingClientRect();
      const W     = Math.round(rect.width  || window.innerWidth);
      const H     = Math.round(rect.height || window.innerHeight);
      const dpr   = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width  = W * dpr;
      canvas.height = H * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any previous scale
        ctx.scale(dpr, dpr);
      }

      dims.current = { W, H };

      const isMobile  = W < 768;
      const total     = isMobile ? 12 : 28;
      const cubeCount = isMobile ? 1  : 4;

      particles.current = [
        ...Array.from({ length: cubeCount }, () => mkP(W, H, true)),
        ...Array.from({ length: total - cubeCount }, () => mkP(W, H)),
      ];
    }

    // ── animation tick ─────────────────────────────────────────────────────
    function tick() {
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      const { W, H } = dims.current;
      if (W === 0 || H === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const [pr, pg, pb] = hex2rgb(themeRef.current.primary);
      const [sr, sg, sb] = hex2rgb(themeRef.current.secondary);

      ctx.clearRect(0, 0, W, H);

      for (const p of particles.current) {
        // move
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;

        // wrap
        if (p.x < -20)   p.x = W + 20;
        else if (p.x > W + 20) p.x = -20;
        if (p.y < -20)   p.y = H + 20;
        else if (p.y > H + 20) p.y = -20;

        // breathe alpha
        const diff = p.alphaT - p.alpha;
        if (Math.abs(diff) < 0.005)
          p.alphaT = rnd(0.25, 0.72);
        p.alpha += diff * p.alphaS * 10;
        p.alpha  = Math.max(0.05, Math.min(0.80, p.alpha));

        // trail (only for dots with meaningful speed)
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.12) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > TRAIL_LEN) p.trail.shift();
        }

        const [r, g, b] = p.colorIdx === 0 ? [pr, pg, pb] : [sr, sg, sb];

        // draw trail
        if (p.kind === "dot" && p.trail.length > 2) {
          drawTrail(ctx, p.trail, r, g, b);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        switch (p.kind) {
          case "dot":     drawDot(ctx, p, r, g, b);     break;
          case "ring":    drawRing(ctx, p, r, g, b);    break;
          case "diamond": drawDiamond(ctx, p, r, g, b); break;
          case "cube":    drawCube(ctx, p, r, g, b);    break;
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // ── init ───────────────────────────────────────────────────────────────
    resize();

    // Debounced resize
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(resize, 160);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Pause when tab hidden
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []); // only on mount

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "absolute",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        1,
        display:       "block",
      }}
    />
  );
}

/**
 * BrandSync AI — Brand Guideline Generator
 * Phase 1: Foundation primitives.
 *
 * Reusable, motion-rich, AI-native building blocks for every Brand Studio module.
 * Modules planned (built in later phases):
 *   1. AI Brand Guideline Generator    6. AI Collaboration Workspace
 *   2. AI Brand Intelligence Engine    7. AI Export Engine
 *   3. AI Brand Strategy Engine        8. AI Multi-Agent System
 *   4. AI Visual Identity System       9. AI Governance Engine
 *   5. AI Presentation Builder
 */
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Cinematic ambient backdrop: aurora + neural grid + floating particles. */
export function AmbientBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bs-grid opacity-60" />
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bs-aurora" />
      <div
        className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bs-aurora"
        style={{ animationDelay: "-9s" }}
      />
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/30 bs-float"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 7) * 0.6}s`,
            boxShadow: "0 0 12px rgba(124,58,237,0.6)",
          }}
        />
      ))}
    </div>
  );
}

/** Glassmorphic surface — the canonical card for Brand Studio. */
export function Glass({
  className,
  children,
  tone,
  ...rest
}: HTMLMotionProps<"div"> & { tone?: "violet" | "cyan" | "pink" }) {
  const glow =
    tone === "violet" ? "bs-glow-violet" : tone === "cyan" ? "bs-glow-cyan" : tone === "pink" ? "bs-glow-pink" : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className={cn("bs-glass rounded-2xl", glow, className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Animated gradient border container. */
export function NeuralBorder({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("bs-border-anim rounded-2xl", className)}>{children}</div>;
}

/** Gradient display heading. */
export function GradientHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return <Tag className={cn("font-display font-semibold bs-gradient-text", className)}>{children}</Tag>;
}

/** Pulsing AI status dot. */
export function NeuralPulse({
  tone = "violet",
  label,
}: {
  tone?: "violet" | "cyan" | "pink" | "emerald";
  label?: string;
}) {
  const color =
    tone === "cyan"
      ? "bg-[#06B6D4]"
      : tone === "pink"
        ? "bg-[#EC4899]"
        : tone === "emerald"
          ? "bg-emerald-400"
          : "bg-[#7C3AED]";
  return (
    <span className="inline-flex items-center gap-2 text-xs text-white/70">
      <span className="relative inline-flex h-2 w-2">
        <span className={cn("absolute inset-0 rounded-full bs-neural-pulse", color)} />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)} />
      </span>
      {label}
    </span>
  );
}

/** Pill chip for tags / module labels. */
export function Chip({
  children,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  tone?: "violet" | "cyan" | "pink" | "neutral";
  className?: string;
}) {
  const map = {
    violet: "bg-[#7C3AED]/15 text-[#C4B5FD] border-[#7C3AED]/30",
    cyan: "bg-[#06B6D4]/15 text-[#67E8F9] border-[#06B6D4]/30",
    pink: "bg-[#EC4899]/15 text-[#F9A8D4] border-[#EC4899]/30",
    neutral: "bg-white/5 text-white/70 border-white/10",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide font-mono uppercase",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Brand module identifiers — stable IDs used across phases. */
export const BRAND_MODULES = [
  { id: "guideline", label: "Guideline Generator", tone: "violet" as const },
  { id: "intelligence", label: "Brand Intelligence", tone: "cyan" as const },
  { id: "strategy", label: "Strategy Engine", tone: "violet" as const },
  { id: "identity", label: "Visual Identity", tone: "pink" as const },
  { id: "presentation", label: "Presentation Builder", tone: "cyan" as const },
  { id: "collab", label: "Collaboration", tone: "violet" as const },
  { id: "export", label: "Export Engine", tone: "pink" as const },
  { id: "agents", label: "Multi-Agent System", tone: "cyan" as const },
  { id: "governance", label: "Governance", tone: "violet" as const },
] as const;

export type BrandModuleId = (typeof BRAND_MODULES)[number]["id"];

/**
 * BrandSync AI — Phase 2: Brand Source Selection
 *
 * Two cinematic, motion-rich cards: "From Existing Brand" vs "Build New Brand".
 * Magnetic hover physics, AI gradient borders, parallax visuals, keyboard a11y,
 * and GPU-accelerated motion via framer-motion springs.
 */
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Globe, PenSquare, Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip, NeuralPulse } from "./primitives";

export type BrandSource = "existing" | "new";

interface SourceSelectionProps {
  value: BrandSource;
  onChange: (v: BrandSource) => void;
  className?: string;
}

const OPTIONS: Array<{
  id: BrandSource;
  title: string;
  tagline: string;
  desc: string;
  icon: typeof Globe;
  tone: "violet" | "cyan" | "pink";
  accent: string;
  glow: string;
  bullets: string[];
}> = [
  {
    id: "existing",
    title: "From Existing Brand",
    tagline: "Ingest · Analyze · Refine",
    desc: "Point the AI at your live website. We extract colors, typography, voice and visual DNA in seconds.",
    icon: Globe,
    tone: "cyan",
    accent: "from-cyan-400 via-sky-500 to-indigo-500",
    glow: "rgba(6,182,212,0.55)",
    bullets: ["Auto-extract palette", "Crawl typography", "Detect tone of voice"],
  },
  {
    id: "new",
    title: "Build New Brand",
    tagline: "Imagine · Generate · Launch",
    desc: "Start from a blank canvas. Co-create a complete identity with our multi-agent brand AI.",
    icon: PenSquare,
    tone: "violet",
    accent: "from-fuchsia-500 via-violet-500 to-purple-600",
    glow: "rgba(124,58,237,0.55)",
    bullets: ["Multi-agent ideation", "Generative palettes", "Strategy + identity"],
  },
];

export function SourceSelection({ value, onChange, className }: SourceSelectionProps) {
  const onArrow = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const idx = OPTIONS.findIndex((o) => o.id === value);
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (idx + 1) % OPTIONS.length : (idx - 1 + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[next].id);
  };
  return (
    <div
      className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5", className)}
      role="radiogroup"
      aria-label="Choose brand source"
      onKeyDown={onArrow}
    >
      {OPTIONS.map((opt, i) => (
        <SourceCard
          key={opt.id}
          opt={opt}
          selected={value === opt.id}
          onSelect={() => onChange(opt.id)}
          delay={i * 0.08}
        />
      ))}
    </div>
  );
}

function SourceCard({
  opt,
  selected,
  onSelect,
  delay,
}: {
  opt: (typeof OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();
  // Magnetic pointer tracking
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 220, damping: 22, mass: 0.6 });
  const rotX = useTransform(sy, [-50, 50], reduce ? [0, 0] : [8, -8]);
  const rotY = useTransform(sx, [-50, 50], reduce ? [0, 0] : [-10, 10]);
  const tx = useTransform(sx, [-50, 50], reduce ? [0, 0] : [-6, 6]);
  const ty = useTransform(sy, [-50, 50], reduce ? [0, 0] : [-6, 6]);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const Icon = opt.icon;

  return (
    <motion.button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerDown={() => {
        // tactile press
        mx.set(mx.get() * 0.4);
        my.set(my.get() * 0.4);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 180, damping: 22 }}
      whileTap={{ scale: 0.985 }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative isolate text-left rounded-2xl p-[1px] outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        "transition-shadow duration-500 will-change-transform",
        selected ? "shadow-[0_30px_80px_-20px_var(--tw-shadow-color)]" : "",
      )}
    >
      {/* Animated AI gradient border */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-60 transition-opacity duration-500",
          opt.accent,
          selected ? "opacity-100" : "group-hover:opacity-90",
        )}
        style={{
          maskImage: "linear-gradient(#000,#000)",
          padding: 1,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Inner card surface */}
      <motion.div
        style={{ x: tx, y: ty }}
        className="relative h-full rounded-2xl bg-[#080a14]/90 backdrop-blur-xl overflow-hidden"
      >
        {/* Spotlight follow */}
        <Spotlight mx={sx} my={sy} color={opt.glow} />

        {/* Floating preview visual */}
        <PreviewArt tone={opt.tone} icon={Icon} accent={opt.accent} selected={selected} />

        {/* Content */}
        <div className="relative p-5 sm:p-6 z-10">
          <div className="flex items-center justify-between">
            <Chip tone={opt.tone}>
              <Sparkles className="h-3 w-3" /> {opt.tagline}
            </Chip>
            <SelectIndicator selected={selected} />
          </div>

          <h3 className="mt-4 text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            {opt.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60 max-w-[40ch]">
            {opt.desc}
          </p>

          <ul className="mt-4 space-y-1.5">
            {opt.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-[12.5px] text-white/70">
                <span
                  className="inline-block h-1 w-1 rounded-full"
                  style={{ background: opt.glow, boxShadow: `0 0 8px ${opt.glow}` }}
                />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between">
            <NeuralPulse tone={opt.tone} label={selected ? "Active source" : "Tap to select"} />
            <motion.span
              className="inline-flex items-center gap-1 text-xs font-medium text-white/80"
              animate={{ x: selected ? 0 : 0 }}
            >
              Continue
              <motion.span
                animate={{ x: selected ? [0, 4, 0] : 0 }}
                transition={{ repeat: selected ? Infinity : 0, duration: 1.6 }}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </motion.span>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

function SelectIndicator({ selected }: { selected: boolean }) {
  return (
    <motion.span
      initial={false}
      animate={{
        scale: selected ? 1 : 0.85,
        backgroundColor: selected ? "rgba(124,58,237,0.9)" : "rgba(255,255,255,0.05)",
        borderColor: selected ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="flex h-6 w-6 items-center justify-center rounded-full border"
    >
      <motion.span
        initial={false}
        animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
      >
        <Check className="h-3.5 w-3.5 text-white" />
      </motion.span>
    </motion.span>
  );
}

function Spotlight({
  mx,
  my,
  color,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  color: string;
}) {
  const x = useTransform(mx, (v) => `calc(50% + ${v}px)`);
  const y = useTransform(my, (v) => `calc(50% + ${v}px)`);
  return (
    <motion.div
      aria-hidden
      style={{
        background: useTransform([x, y], ([xv, yv]) =>
          `radial-gradient(420px circle at ${xv} ${yv}, ${color}, transparent 55%)`,
        ),
      }}
      className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
    />
  );
}

/** Floating live-preview visual for each card. */
function PreviewArt({
  tone,
  icon: Icon,
  accent,
  selected,
}: {
  tone: "violet" | "cyan" | "pink";
  icon: typeof Globe;
  accent: string;
  selected: boolean;
}) {
  return (
    <div className="relative h-32 sm:h-36 overflow-hidden">
      {/* grid */}
      <div className="absolute inset-0 bs-grid opacity-50" />
      {/* aurora blob */}
      <div
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-[80%] rounded-full blur-3xl opacity-50",
          "bg-gradient-to-br",
          accent,
        )}
      />
      {/* orbital rings */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-44 w-44 rounded-full border border-white/10" />
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-60 w-60 rounded-full border border-white/5" />
      </motion.div>

      {/* central icon */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          scale: selected ? [1, 1.06, 1] : 1,
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-2xl",
            "bg-gradient-to-br shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]",
            accent,
          )}
        >
          <Icon className="h-6 w-6 text-white" />
          <span className="absolute -inset-1 rounded-2xl bg-white/0 ring-1 ring-white/20" />
        </div>
      </motion.div>

      {/* mini preview chips */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/50">
        <span>{tone === "cyan" ? "scrape · v3" : "agents · v3"}</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 bs-neural-pulse" />
          ready
        </span>
      </div>
    </div>
  );
}

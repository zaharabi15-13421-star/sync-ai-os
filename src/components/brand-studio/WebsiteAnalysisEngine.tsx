import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Globe2, Type, Palette, MousePointerClick, MessageCircle, Target, Sparkles,
  Crosshair, Search, Eye, Accessibility, ShieldCheck, Share2, Swords,
  Loader2, Check, AlertTriangle, Zap, RefreshCw, ChevronRight,
} from "lucide-react";
import { analyzeWebsiteDeep, type DeepAnalysis } from "@/lib/website-analysis-engine.functions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STAGES = [
  { key: "crawl",        label: "Crawling website",        icon: Globe2 },
  { key: "metadata",     label: "Extracting metadata",     icon: Search },
  { key: "typography",   label: "Analyzing typography",    icon: Type },
  { key: "palette",      label: "Detecting color palette", icon: Palette },
  { key: "ctas",         label: "Analyzing CTAs",          icon: MousePointerClick },
  { key: "tone",         label: "Reading messaging tone",  icon: MessageCircle },
  { key: "intent",       label: "Detecting audience intent", icon: Target },
  { key: "archetype",    label: "Mapping brand archetype", icon: Sparkles },
  { key: "positioning",  label: "Detecting positioning",   icon: Crosshair },
  { key: "seo",          label: "Auditing SEO",            icon: Search },
  { key: "ux",           label: "Evaluating UX quality",   icon: Eye },
  { key: "a11y",         label: "Scanning accessibility",  icon: Accessibility },
  { key: "trust",        label: "Detecting trust signals", icon: ShieldCheck },
  { key: "social",       label: "Reading social presence", icon: Share2 },
  { key: "competitors",  label: "Comparing competitors",   icon: Swords },
] as const;

const OUTPUT_KEYS: { key: keyof DeepAnalysis["outputs"]; label: string }[] = [
  { key: "mission",              label: "Brand Mission" },
  { key: "vision",               label: "Brand Vision" },
  { key: "brandStory",           label: "Brand Story" },
  { key: "brandVoice",           label: "Brand Voice" },
  { key: "coreValues",           label: "Core Values" },
  { key: "positioningStatement", label: "Positioning Statement" },
  { key: "messagingPillars",     label: "Messaging Pillars" },
  { key: "valueProposition",     label: "Value Proposition" },
  { key: "audienceSummary",      label: "Audience Summary" },
  { key: "taglines",             label: "Taglines" },
];

export type DeepAnalysisAutofill = {
  brandName?: string;
  description?: string;
  colors?: string[];
  taglines?: string[];
};

export function WebsiteAnalysisEngine({
  websiteUrl,
  brandName,
  industry,
  initialAnalysis,
  onAnalysisComplete,
  onApply,
}: {
  websiteUrl: string;
  brandName?: string;
  industry?: string;
  initialAnalysis?: DeepAnalysis | null;
  onAnalysisComplete?: (analysis: DeepAnalysis) => void;
  onApply?: (data: DeepAnalysisAutofill) => void;
}) {
  const analyzeFn = useServerFn(analyzeWebsiteDeep);
  const [stageIdx, setStageIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [revealedOutputs, setRevealedOutputs] = useState(0);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const canRun = useMemo(() => websiteUrl.trim().length > 3, [websiteUrl]);

  useEffect(() => {
    if (!initialAnalysis || running) return;
    setAnalysis(initialAnalysis);
    setStageIdx(STAGES.length - 1);
    setConfidence(initialAnalysis.overallConfidence ?? 95);
    setRevealedOutputs(OUTPUT_KEYS.length);
    setError(null);
  }, [initialAnalysis, running]);

  const stop = () => {
    if (stageTimer.current) { clearInterval(stageTimer.current); stageTimer.current = null; }
  };

  const run = async () => {
    if (!canRun) { toast.error("Add a website URL first"); return; }
    setRunning(true);
    setError(null);
    setAnalysis(null);
    setStageIdx(0);
    setConfidence(8);
    setRevealedOutputs(0);

    stop();
    stageTimer.current = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, STAGES.length - 1));
      setConfidence(c => Math.min(c + 6 + Math.random() * 4, 92));
    }, 700);

    try {
      const res = await analyzeFn({ data: { websiteUrl, brandName, industry } });
      stop();
      setStageIdx(STAGES.length - 1);
      setAnalysis(res.analysis);
      onAnalysisComplete?.(res.analysis);
      setConfidence(res.analysis.overallConfidence ?? 95);
      // Stream-reveal outputs
      for (let i = 0; i < OUTPUT_KEYS.length; i++) {
        await new Promise(r => setTimeout(r, 180 + Math.random() * 80));
        setRevealedOutputs(i + 1);
      }
      toast.success("Website analysis complete");
    } catch (e: any) {
      stop();
      setError(e?.message ?? "Analysis failed");
      toast.error(e?.message ?? "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => () => stop(), []);

  const apply = () => {
    if (!analysis) return;
    onApply?.({
      brandName,
      description: analysis.outputs.valueProposition,
      colors: analysis.colorPalette.map(c => c.hex).slice(0, 6),
      taglines: analysis.outputs.taglines,
    });
    toast.success("Applied to brand inputs");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.05] via-transparent to-cyan-500/[0.06] p-5"
    >
      {/* aurora */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* header */}
      <div className="relative flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-400 grid place-items-center shadow-[0_0_24px_-4px] shadow-fuchsia-400/60">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">AI Website Analysis Engine</div>
            <div className="text-sm font-semibold">15-dimension neural pipeline</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfidencePill value={confidence} loading={running} />
          <button
            onClick={run}
            disabled={running || !canRun}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_24px_-6px] shadow-fuchsia-500/60 hover:brightness-110 disabled:opacity-50"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {analysis ? "Re-analyze" : "Analyze website"}
          </button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: stage stream */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Neural pipeline</div>
          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const done = analysis ? true : i < stageIdx;
              const active = running && i === stageIdx && !analysis;
              const idle = i > stageIdx && !analysis;
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: idle ? 0.35 : 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-[12px]",
                    done && "border-emerald-400/25 bg-emerald-500/[0.04]",
                    active && "border-fuchsia-400/40 bg-fuchsia-500/[0.06]",
                    idle && "border-white/5 bg-white/[0.02]",
                  )}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-md grid place-items-center shrink-0",
                    done ? "bg-emerald-500/20 text-emerald-300"
                      : active ? "bg-fuchsia-500/20 text-fuchsia-300"
                      : "bg-white/5 text-muted-foreground"
                  )}>
                    {active ? <Loader2 className="h-3 w-3 animate-spin" /> :
                     done ? <Check className="h-3 w-3" /> :
                     <Icon className="h-3 w-3" />}
                  </div>
                  <span className="flex-1 truncate">{s.label}</span>
                  {active && (
                    <span className="text-[9px] uppercase tracking-wider text-fuchsia-300">
                      thinking
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: live insights */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live insights</div>

          {!analysis && !running && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-xs text-muted-foreground">
              Click <span className="text-fuchsia-300">Analyze website</span> to run a full 15-dimension AI scan and auto-generate brand mission, vision, story, voice, values, positioning, pillars, value proposition, audience and taglines.
            </div>
          )}

          {running && !analysis && (
            <div className="rounded-lg border border-fuchsia-400/20 bg-black/40 p-4">
              <NeuralPulse />
              <div className="mt-3 text-[11px] text-fuchsia-200">
                {STAGES[Math.max(0, Math.min(stageIdx, STAGES.length - 1))]?.label}…
              </div>
            </div>
          )}

          {analysis && (
            <>
              {/* Score grid */}
              <div className="grid grid-cols-3 gap-2">
                <ScoreTile label="SEO" value={analysis.seo.score} />
                <ScoreTile label="UX" value={analysis.uxQuality.score} />
                <ScoreTile label="A11y" value={analysis.accessibility.score} />
              </div>

              {/* Palette */}
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Detected palette</div>
                <div className="flex gap-1">
                  {analysis.colorPalette.map((c, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div className="h-7 rounded-md" style={{ background: c.hex, boxShadow: `0 0 14px -4px ${c.hex}` }} />
                      <div className="text-[9px] mt-1 text-center font-mono text-muted-foreground group-hover:text-white truncate">{c.hex}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archetype + tone */}
              <div className="grid grid-cols-2 gap-2">
                <Tile title="Archetype" value={analysis.brandArchetype.name} sub={`${analysis.brandArchetype.confidence}% match`} />
                <Tile title="Tone" value={analysis.messagingTone.tone} sub={analysis.messagingTone.descriptors.slice(0, 3).join(" · ")} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auto-generated outputs */}
      {analysis && (
        <div className="relative mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Auto-generated brand outputs</div>
            <button
              onClick={apply}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] hover:border-cyan-400/40 hover:bg-cyan-500/10 transition"
            >
              Apply to inputs <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <AnimatePresence>
              {OUTPUT_KEYS.slice(0, revealedOutputs).map((o, i) => (
                <motion.div
                  key={o.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.label}</div>
                  <OutputBody value={(analysis.outputs as any)[o.key]} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {error && (
        <div className="relative mt-3 flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-2.5 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
        </div>
      )}
    </motion.div>
  );
}

function OutputBody({ value }: { value: any }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <div className="text-xs text-muted-foreground mt-1">—</div>;
    if (typeof value[0] === "string") {
      return (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {value.map((v: string, i: number) => (
            <li key={i} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px]">{v}</li>
          ))}
        </ul>
      );
    }
    return (
      <ul className="mt-1 space-y-1">
        {value.map((v: any, i: number) => (
          <li key={i} className="text-[12px]">
            <span className="font-medium">{v.title}</span>
            <span className="text-muted-foreground"> — {v.description}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <div className="text-xs leading-relaxed mt-1">{String(value)}</div>;
}

function Tile({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  const tone = value >= 80 ? "from-emerald-400 to-cyan-400" : value >= 60 ? "from-amber-400 to-fuchsia-400" : "from-rose-500 to-fuchsia-500";
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
        <div className={cn("h-full bg-gradient-to-r", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ConfidencePill({ value, loading }: { value: number; loading: boolean }) {
  return (
    <div className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
      <div className="relative h-2 w-20 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-fuchsia-200">
        {loading ? "…" : `${Math.round(value)}%`}
      </span>
    </div>
  );
}

function NeuralPulse() {
  return (
    <div className="flex items-center gap-1.5 h-6">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-b from-fuchsia-400 to-cyan-400"
          animate={{ height: ["8%", "100%", "8%"] }}
          transition={{ duration: 1 + (i % 5) * 0.15, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
          style={{ height: "30%" }}
        />
      ))}
    </div>
  );
}

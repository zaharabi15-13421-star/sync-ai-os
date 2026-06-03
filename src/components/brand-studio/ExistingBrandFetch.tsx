import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Globe2, Palette, Type, Image as ImageIcon, Network, Brain,
  Loader2, Check, RefreshCw, Wand2, ChevronRight, Sparkles, AlertTriangle,
  Users, Megaphone, FileDown, Share2, FolderOpen, BookMarked,
} from "lucide-react";
import { fetchExistingBrand, type ExistingBrandSnapshot } from "@/lib/existing-brand.functions";
import { analyzeWebsite } from "@/lib/website-analysis.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StreamStep = {
  key: string;
  label: string;
  icon: any;
  detail: (s: ExistingBrandSnapshot) => string;
  found: (s: ExistingBrandSnapshot) => boolean;
};

const SOCIAL_PLATFORMS = new Set([
  "instagram", "facebook", "linkedin", "tiktok", "x", "twitter", "youtube", "pinterest", "threads",
]);

const STEPS: StreamStep[] = [
  { key: "company", label: "Company profile", icon: Database,
    detail: s => s.company?.name ? `${s.company.name} · ${s.company.industry ?? "—"}` : "No company record",
    found: s => !!s.company },
  { key: "website", label: "Website intelligence", icon: Globe2,
    detail: s => s.websiteAnalysis ? `${new URL(s.websiteAnalysis.url).hostname}` : "No analysis cached",
    found: s => !!s.websiteAnalysis },
  { key: "logo", label: "Logos & visual assets", icon: ImageIcon,
    detail: s => s.signals.hasLogo ? "Logo discovered via Firecrawl branding" : "No logo cached",
    found: s => s.signals.hasLogo },
  { key: "palette", label: "Color palette", icon: Palette,
    detail: s => s.signals.paletteCount ? `${s.signals.paletteCount} colors detected` : "Pending Firecrawl branding",
    found: s => s.signals.paletteCount > 0 },
  { key: "fonts", label: "Typography", icon: Type,
    detail: s => s.signals.fontCount ? `${s.signals.fontCount} font families` : "No fonts detected",
    found: s => s.signals.fontCount > 0 },
  { key: "audience", label: "Audience segments", icon: Users,
    detail: s => s.identity?.target_audience ? s.identity.target_audience.slice(0, 64) : "Vector memory empty · no segments yet",
    found: s => !!s.identity?.target_audience },
  { key: "guidelines", label: "Existing guidelines", icon: BookMarked,
    detail: s => s.identity?.brand_goal ? `Goal: ${s.identity.brand_goal.slice(0, 56)}` : "No prior brandbook on file",
    found: s => !!s.identity?.brand_goal },
  { key: "campaigns", label: "Historical campaigns", icon: Megaphone,
    detail: s => "No campaign history indexed · awaiting AI memory",
    found: () => false },
  { key: "assets", label: "Uploaded assets (S3)", icon: FolderOpen,
    detail: s => "No S3 objects linked to this brand yet",
    found: () => false },
  { key: "social", label: "Social profiles", icon: Share2,
    detail: s => {
      const socials = s.connectedSources.filter(c => SOCIAL_PLATFORMS.has(c.platform.toLowerCase()));
      return socials.length ? socials.map(c => c.platform).join(" · ") : "No social accounts connected";
    },
    found: s => s.connectedSources.some(c => SOCIAL_PLATFORMS.has(c.platform.toLowerCase())) },
  { key: "exports", label: "Previous exports", icon: FileDown,
    detail: () => "No PDF/PPTX exports archived yet",
    found: () => false },
  { key: "sources", label: "Connected data sources", icon: Network,
    detail: s => s.connectedSources.length ? `${s.connectedSources.length} integrations` : "None linked",
    found: s => s.connectedSources.length > 0 },
];

export type AutoFillPayload = {
  brandName?: string;
  industry?: string;
  websiteUrl?: string;
  description?: string;
  region?: string;
  logoDataUrl?: string;
  colors?: string[];
};

export function ExistingBrandFetch({
  active,
  onAutoFill,
}: {
  active: boolean;
  onAutoFill: (payload: AutoFillPayload) => void;
}) {
  const fetchFn = useServerFn(fetchExistingBrand);
  const analyzeFn = useServerFn(analyzeWebsite);
  const [snap, setSnap] = useState<ExistingBrandSnapshot | null>(null);
  const [streamed, setStreamed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filledRef = useRef(false);

  const run = async (silent = false) => {
    setLoading(true);
    setError(null);
    setStreamed(0);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("Sign in to load your brand intelligence.");
        setLoading(false);
        return;
      }
      const data = await fetchFn();
      setSnap(data);
      // Stream-reveal steps
      for (let i = 0; i < STEPS.length; i++) {
        await new Promise(r => setTimeout(r, 280 + Math.random() * 120));
        setStreamed(i + 1);
      }
      if (!silent) toast.success(`Brand intelligence loaded · ${data.signals.confidence}% confidence`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load brand context");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (active && !snap && !loading) run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const autoFillPayload = useMemo<AutoFillPayload | null>(() => {
    if (!snap) return null;
    const p: AutoFillPayload = {};
    if (snap.company?.name) p.brandName = snap.company.name;
    if (snap.company?.industry) p.industry = snap.company.industry;
    if (snap.company?.website_url) p.websiteUrl = snap.company.website_url;
    if (snap.identity?.business_location) p.region = snap.identity.business_location;
    const desc = snap.websiteAnalysis?.summary || snap.websiteAnalysis?.description || snap.identity?.brand_goal;
    if (desc) p.description = desc.slice(0, 500);
    const branding: any = snap.websiteAnalysis?.branding ?? {};
    if (branding?.colors) {
      // Preserve priority: primary, secondary, accent first
      const priority = ["primary", "secondary", "accent", "background", "textPrimary", "textSecondary"];
      const ordered: string[] = [];
      for (const k of priority) {
        const v = branding.colors[k];
        if (typeof v === "string" && /^#/.test(v)) ordered.push(v);
      }
      const rest = Object.entries(branding.colors)
        .filter(([k, v]) => !priority.includes(k) && typeof v === "string" && /^#/.test(v as string))
        .map(([, v]) => v as string);
      const palette = [...ordered, ...rest];
      if (palette.length) p.colors = palette.slice(0, 6);
    }
    const logo = branding?.logo || branding?.images?.logo;
    if (logo && typeof logo === "string" && /^https?:/.test(logo)) p.logoDataUrl = logo;
    return p;
  }, [snap]);

  // Auto-fill once after first stream completion
  useEffect(() => {
    if (active && streamed === STEPS.length && autoFillPayload && !filledRef.current) {
      filledRef.current = true;
      onAutoFill(autoFillPayload);
    }
  }, [active, streamed, autoFillPayload, onAutoFill]);

  const reAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeFn({ data: {} });
      toast.success("Website re-analyzed");
      filledRef.current = false;
      await run(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Re-analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-indigo-500/[0.06] p-5"
    >
      {/* aurora */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* scanning beam while loading */}
      {loading && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: ["0%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 grid place-items-center shadow-[0_0_24px_-4px] shadow-cyan-400/50">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Auto-Fetch · Brand Memory</div>
            <div className="text-sm font-semibold">
              Streaming brand intelligence
              <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                Postgres · Vector · S3 · Web
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfidencePill value={snap?.signals.confidence ?? 0} loading={loading} />
          <button
            onClick={() => { filledRef.current = false; run(); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] hover:border-cyan-400/40 hover:bg-cyan-500/10 transition disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Refetch
          </button>
        </div>
      </div>

      {/* stream list */}
      <div className="relative space-y-1.5">
        {STEPS.map((s, i) => {
          const revealed = i < streamed;
          const inFlight = i === streamed && loading;
          const found = snap ? s.found(snap) : false;
          const Icon = s.icon;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: revealed || inFlight ? 1 : 0.35, x: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
                revealed && found && "border-emerald-400/25 bg-emerald-500/[0.04]",
                revealed && !found && "border-white/5 bg-white/[0.02]",
                inFlight && "border-cyan-400/40 bg-cyan-500/5",
                !revealed && !inFlight && "border-white/5 bg-white/[0.01]",
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-md grid place-items-center shrink-0",
                revealed && found ? "bg-emerald-500/20 text-emerald-300"
                  : inFlight ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-white/5 text-muted-foreground",
              )}>
                {inFlight ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : revealed && found ? <Check className="h-3.5 w-3.5" />
                  : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-tight">{s.label}</div>
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[11px] text-muted-foreground truncate"
                    >
                      {snap ? s.detail(snap) : "—"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {revealed && (
                <span className={cn(
                  "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                  found ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-muted-foreground",
                )}>
                  {found ? "found" : "empty"}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* footer actions */}
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { if (autoFillPayload) { filledRef.current = true; onAutoFill(autoFillPayload); toast.success("Form auto-filled"); } }}
          disabled={!autoFillPayload || loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_0_24px_-6px] shadow-cyan-500/60 hover:brightness-110 disabled:opacity-50"
        >
          <Wand2 className="h-3.5 w-3.5" /> Auto-fill form <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={reAnalyze}
          disabled={analyzing || !snap?.company?.website_url}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 transition disabled:opacity-50"
          title={snap?.company?.website_url ?? "No website on file"}
        >
          {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          AI re-analyze website
        </button>
        {snap?.connectedSources.length ? (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            {snap.connectedSources.slice(0, 4).map(s => (
              <span key={s.platform} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{s.platform}</span>
            ))}
          </div>
        ) : null}
      </div>

      {error && (
        <div className="relative mt-3 flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-2.5 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
        </div>
      )}
    </motion.div>
  );
}

function ConfidencePill({ value, loading }: { value: number; loading: boolean }) {
  return (
    <div className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
      <div className="relative h-2 w-20 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-cyan-200">
        {loading ? "…" : `${value}%`}
      </span>
    </div>
  );
}

// Brand Intelligence — additional tab modules (mock data).
// AI Predictions · Audience DNA · Keyword Intelligence · Behavioral Analytics · Crisis Radar · Revenue Attribution
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  ReferenceArea,
} from "recharts";
import {
  Brain, Sparkles, TrendingUp, AlertTriangle, ShieldAlert, Target, Users, Globe,
  Search, MousePointerClick, Activity, DollarSign, GitBranch, Zap, Clock, ArrowUpRight,
  ArrowDownRight, Bell, CheckCircle2, Eye, Flame, ThumbsUp, ThumbsDown, MapPin,
} from "lucide-react";
import { GlassCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PURPLE = "oklch(0.65 0.22 280)";
const VIOLET = "oklch(0.68 0.2 320)";
const EMERALD = "oklch(0.72 0.18 155)";
const AMBER = "oklch(0.78 0.17 75)";
const ROSE = "oklch(0.68 0.22 25)";

function DataBadge({ kind }: { kind: "ga4" | "ga4-cached" | "market" | "ai" }) {
  const cfg = {
    "ga4": { dot: "bg-emerald-400", label: "GA4 · Live" },
    "ga4-cached": { dot: "bg-sky-400", label: "GA4 · Cached" },
    "market": { dot: "bg-amber-400", label: "Market Intel" },
    "ai": { dot: "bg-purple-400", label: "AI Generated" },
  }[kind];
  return (
    <div className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.dot)} />
      {cfg.label}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// AI PREDICTIONS TAB
// ───────────────────────────────────────────────────────────
export function AIPredictionsTab() {
  const [horizon, setHorizon] = useState<"1m" | "3m" | "6m" | "1y">("3m");
  const months = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 }[horizon];

  const series = useMemo(() => {
    const out: { t: string; actual?: number; pred?: number; lo?: number; hi?: number }[] = [];
    const base = 380_000;
    for (let i = -6; i < 0; i++) {
      const v = base + i * 8000 + Math.sin(i) * 12000;
      out.push({ t: `M${i}`, actual: Math.round(v) });
    }
    for (let i = 0; i <= months; i++) {
      const v = base + 6 * 8000 + i * 14000 + Math.cos(i / 2) * 9000;
      out.push({
        t: `M+${i}`,
        pred: Math.round(v),
        lo: Math.round(v * 0.88),
        hi: Math.round(v * 1.12),
      });
    }
    return out;
  }, [months]);

  const metrics = [
    { label: "Predicted Visits", value: "612K", change: "+24.1%", model: "Ensemble", conf: 87, range: "548K – 689K" },
    { label: "Predicted Unique", value: "418K", change: "+18.4%", model: "LSTM", conf: 84, range: "372K – 462K" },
    { label: "Predicted Bounce", value: "39.2%", change: "-3.8%", model: "Prophet", conf: 91, range: "37.1 – 41.4%" },
    { label: "Predicted Duration", value: "3m 12s", change: "+22s", model: "XGBoost", conf: 82, range: "2m 54s – 3m 28s" },
  ];

  const models = [
    { name: "Prophet", desc: "Time-series trend + seasonality", acc: 89 },
    { name: "LSTM Neural Net", desc: "Sequence pattern detection", acc: 84 },
    { name: "XGBoost", desc: "Feature-importance gradient boosting", acc: 86 },
    { name: "ARIMA", desc: "Statistical baseline", acc: 78 },
    { name: "Ensemble Combiner", desc: "Weighted average + uncertainty", acc: 91 },
  ];

  const opportunities = [
    { title: "Organic Search Expansion", lift: "+18%", desc: "12 high-volume keywords ranked 11-20 — push to page 1 for an estimated +72K monthly sessions." },
    { title: "Mobile Audience Growth", lift: "+24%", desc: "Mobile bounce is 8pts above desktop. PWA + LCP optimization unlocks the largest growing segment." },
    { title: "Content Velocity Increase", lift: "+11%", desc: "Doubling editorial cadence to 8 posts/mo correlates with +11% non-brand traffic in your category." },
  ];

  const risks = [
    { title: "Brand-bid CPC inflation", sev: "High", desc: "Competitor C raised brand bids 38% — protect SoV before Q3." },
    { title: "Algorithm volatility window", sev: "Medium", desc: "Forecast model detects elevated SERP volatility in 14-21 days." },
  ];

  // Scenario simulator state
  const [budget, setBudget] = useState([15000]);
  const [duration, setDuration] = useState("30");
  const [vertical, setVertical] = useState("d2c-skincare");
  const [target, setTarget] = useState("conversions");
  const sim = useMemo(() => {
    const b = budget[0];
    const d = Number(duration);
    const verticalMult = vertical === "d2c-skincare" ? 1.0 : vertical === "saas" ? 0.85 : 1.15;
    const targetMult = target === "revenue" ? 1.2 : target === "conversions" ? 1.0 : 0.78;
    const roas = +(2.1 + Math.log10(b / 1000) * 0.6 * verticalMult * targetMult).toFixed(2);
    const reach = Math.round(b * 24 * verticalMult);
    const ctr = +(1.8 + (d / 90) * 0.9).toFixed(2);
    const conv = Math.round(b * 0.018 * targetMult);
    const grade = roas > 4 ? "A" : roas > 3 ? "B" : roas > 2.2 ? "C" : "D";
    return { roas, reach, ctr, conv, grade };
  }, [budget, duration, vertical, target]);

  return (
    <div className="space-y-5">
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-300" />
              <div className="text-sm font-semibold">Predictive Engine V3</div>
              <Pill tone="purple">87% Confidence</Pill>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Powered by Ensemble ML + GA4 history</div>
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
            {(["1m","3m","6m","1y"] as const).map(h => (
              <button key={h} onClick={() => setHorizon(h)}
                className={cn("px-3 py-1 text-xs rounded-md transition", horizon === h ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" : "text-muted-foreground hover:text-foreground")}>
                {h === "1m" ? "Next Month" : h === "3m" ? "Next 3 Months" : h === "6m" ? "Next 6 Months" : "Next Year"}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
            <div className="text-sm font-semibold">↑ Growing — projected over next {months} month{months > 1 ? "s" : ""}</div>
          </div>
          <DataBadge kind="ai" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ensemble of Prophet + LSTM + XGBoost predicts sustained growth driven by mobile organic acquisition in DE & BD markets.
          Seasonality decomposition shows a positive Q3 lift; risk-adjusted forecast accuracy {months <= 3 ? "92" : months <= 6 ? "87" : "81"}%.
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "87%" }} transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(m => (
          <GlassCard key={m.label}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <Pill tone="purple">{m.model}</Pill>
            </div>
            <div className="mt-1 text-2xl font-semibold">{m.value}</div>
            <div className={cn("text-xs", m.change.startsWith("-") ? "text-emerald-400" : "text-emerald-400")}>{m.change}</div>
            <div className="text-[10px] text-muted-foreground mt-2">Range · {m.range}</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground">Confidence</div>
              <div className="text-[10px] text-purple-300">{m.conf}%</div>
            </div>
            <div className="mt-1 h-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-purple-400" style={{ width: `${m.conf}%` }} /></div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Forecast — Sessions</div>
          <DataBadge kind="ai" />
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="histArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={VIOLET} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeOpacity={0.08} />
              <XAxis dataKey="t" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="hi" stroke="none" fill="url(#predBand)" />
              <Area type="monotone" dataKey="lo" stroke="none" fill="#0a0a0f" />
              <Line type="monotone" dataKey="actual" stroke={PURPLE} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pred" stroke={VIOLET} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-purple-300" />
          <div className="text-sm font-semibold">Model Intelligence Panel</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {models.map(m => (
            <div key={m.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">{m.name}</div>
                <Pill tone="emerald">Active ✓</Pill>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{m.desc}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-[10px] text-muted-foreground">Accuracy</div>
                <div className="text-[10px] text-emerald-300">{m.acc}%</div>
              </div>
              <div className="mt-1 h-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${m.acc}%` }} /></div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {opportunities.map(o => (
          <GlassCard key={o.title} className="relative">
            <Pill tone="emerald">{o.lift}</Pill>
            <div className="mt-2 text-sm font-semibold flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-purple-300" /> {o.title}</div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{o.desc}</p>
            <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-600">View Action Plan</Button>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map(r => (
          <GlassCard key={r.title} className="border-amber-400/20 bg-amber-500/[0.04]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /><div className="text-sm font-semibold">{r.title}</div></div>
              <Pill tone={r.sev === "High" ? "rose" : "indigo"}>{r.sev}</Pill>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{r.desc}</p>
            <Button size="sm" variant="outline" className="mt-3 border-amber-400/30 text-amber-200">Mitigate</Button>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-indigo-300" /><div className="text-sm font-semibold">Scenario Simulator</div></div>
          <Pill tone="purple">Real-time</Pill>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Budget</span><span>${budget[0].toLocaleString()}</span></div>
              <Slider value={budget} onValueChange={setBudget} min={1000} max={100000} step={500} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="7">7 days</SelectItem><SelectItem value="14">14 days</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Vertical</div>
                <Select value={vertical} onValueChange={setVertical}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="d2c-skincare">D2C Skincare</SelectItem><SelectItem value="saas">SaaS</SelectItem><SelectItem value="fashion">Fashion</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Target metric</div>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="bg-white/5 border-white/10 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="traffic">Traffic</SelectItem><SelectItem value="conversions">Conversions</SelectItem><SelectItem value="revenue">Revenue</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Predicted ROAS", value: `${sim.roas}x` },
              { label: "Reach", value: sim.reach.toLocaleString() },
              { label: "CTR Projection", value: `${sim.ctr}%` },
              { label: "Conversions", value: sim.conv.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
                <div className="text-lg font-semibold mt-0.5">{s.value}</div>
              </div>
            ))}
            <div className="col-span-2 rounded-lg border border-purple-400/30 bg-gradient-to-br from-purple-500/15 to-indigo-500/10 p-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Efficiency grade</div>
              <div className="text-3xl font-bold text-purple-200">{sim.grade}</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// AUDIENCE DNA TAB
// ───────────────────────────────────────────────────────────
export function AudienceDNATab() {
  const segments = [
    { name: "High-Intent Researchers", size: 32, ltv: "$284", desc: "Read 4+ product pages, return within 7 days", action: "Trigger comparison guide email" },
    { name: "Skincare Beginners", size: 28, ltv: "$112", desc: "Search educational queries, low cart frequency", action: "Build a starter-routine quiz funnel" },
    { name: "Repeat Buyers", size: 22, ltv: "$612", desc: "3+ orders in 12 months, highest AOV", action: "Activate VIP tier + early access" },
    { name: "Bargain Hunters", size: 18, ltv: "$74", desc: "Convert only on discounts > 20%", action: "Bundle to lift AOV" },
  ];
  const countries = [
    { c: "Germany", pct: 32, t: "+4%" },
    { c: "Bangladesh", pct: 24, t: "+11%" },
    { c: "United Kingdom", pct: 18, t: "+2%" },
    { c: "United States", pct: 14, t: "-1%" },
    { c: "France", pct: 6, t: "+1%" },
    { c: "Netherlands", pct: 3, t: "0%" },
    { c: "Sweden", pct: 2, t: "+1%" },
    { c: "Spain", pct: 1, t: "0%" },
  ];
  const interests = [
    { name: "Beauty & Wellness", v: 92 },
    { name: "Sustainable Living", v: 78 },
    { name: "Fitness", v: 64 },
    { name: "Travel", v: 52 },
    { name: "Food & Cooking", v: 48 },
    { name: "Tech Early-Adopters", v: 38 },
  ];
  const cohort = [
    { week: "W0", a: 100, b: 100, c: 100 },
    { week: "W2", a: 72, b: 81, c: 64 },
    { week: "W4", a: 58, b: 70, c: 49 },
    { week: "W6", a: 49, b: 62, c: 38 },
    { week: "W8", a: 42, b: 56, c: 31 },
    { week: "W10", a: 38, b: 52, c: 27 },
    { week: "W12", a: 35, b: 50, c: 24 },
  ];

  return (
    <div className="space-y-5">
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-purple-300" /><div className="text-sm font-semibold">Psychographic Profile</div></div>
            <DataBadge kind="ai" />
          </div>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="text-lg font-semibold">The Conscious Glow-Getter</div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                25-38 yo digital-native, ingredient-curious, mostly urban DE/BD/UK. Reads reviews before purchase, distrusts overly-corporate brands,
                rewards transparency and storytelling. Buys premium when sustainability claims are evidenced.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div><div className="text-muted-foreground mb-1">Motivators</div>Self-care · Authenticity · Ethics</div>
                <div><div className="text-muted-foreground mb-1">Pain points</div>Greenwashing · Generic claims · Overwhelm</div>
                <div><div className="text-muted-foreground mb-1">Content prefs</div>UGC reels · Founder POV · Ingredient deep-dives</div>
                <div><div className="text-muted-foreground mb-1">Tone</div>Warm · Confident · Lightly playful</div>
              </div>
            </div>
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-[11px] uppercase tracking-widest text-purple-300/80 mb-2">Recommended Messaging</div>
              <p className="text-xs text-foreground/90 leading-relaxed italic">
                "Skin that knows. Backed by lab evidence, made for the modern routine — never the trend cycle."
              </p>
              <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-600">Generate more</Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map(s => (
          <GlassCard key={s.name}>
            <div className="flex items-center justify-between"><div className="text-sm font-semibold">{s.name}</div><Pill tone="purple">{s.size}%</Pill></div>
            <div className="text-[11px] text-muted-foreground mt-2">{s.desc}</div>
            <div className="mt-3 flex items-center justify-between">
              <div><div className="text-[10px] text-muted-foreground">Predicted LTV</div><div className="text-sm font-semibold text-emerald-300">{s.ltv}</div></div>
              <Sparkles className="h-4 w-4 text-purple-300" />
            </div>
            <div className="mt-3 text-[11px] text-indigo-200">→ {s.action}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Globe className="h-4 w-4 text-indigo-300" /><div className="text-sm font-semibold">Geo Intelligence</div></div><DataBadge kind="ga4" /></div>
          <div className="space-y-2">
            {countries.map(c => (
              <div key={c.c}>
                <div className="flex justify-between text-xs"><span><MapPin className="inline h-3 w-3 mr-1 text-muted-foreground" />{c.c}</span><span className="text-foreground/70">{c.pct}% <span className={c.t.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>({c.t})</span></span></div>
                <div className="h-1.5 rounded-full bg-white/5 mt-1 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${c.pct * 3}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" /></div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-purple-300" /><div className="text-sm font-semibold">Interest & Affinity</div></div><DataBadge kind="ga4" /></div>
          <div className="h-60">
            <ResponsiveContainer>
              <RadarChart data={interests}>
                <PolarGrid stroke="#1e1e2e" />
                <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#1e1e2e" tick={false} />
                <Radar dataKey="v" fill={PURPLE} fillOpacity={0.5} stroke={VIOLET} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-emerald-300" /><div className="text-sm font-semibold">Cohort Retention</div></div><Pill tone="emerald">Best: Apr 2026 cohort</Pill></div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={cohort}>
              <CartesianGrid strokeOpacity={0.08} />
              <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} unit="%" />
              <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="a" name="Mar 2026" stroke={PURPLE} strokeWidth={2} />
              <Line type="monotone" dataKey="b" name="Apr 2026" stroke={EMERALD} strokeWidth={2} />
              <Line type="monotone" dataKey="c" name="May 2026" stroke={AMBER} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// KEYWORD INTELLIGENCE TAB
// ───────────────────────────────────────────────────────────
export function KeywordIntelligenceTab() {
  const keywords = [
    { kw: "vitamin c serum", clicks: 12400, imp: 184000, ctr: 6.7, pos: 3, trend: "up", opp: 92, qw: false },
    { kw: "best retinol for beginners", clicks: 8200, imp: 142000, ctr: 5.8, pos: 5, trend: "up", opp: 88, qw: false },
    { kw: "natural sunscreen spf 50", clicks: 6100, imp: 98000, ctr: 6.2, pos: 4, trend: "flat", opp: 81, qw: false },
    { kw: "niacinamide vs salicylic acid", clicks: 4800, imp: 124000, ctr: 3.9, pos: 14, trend: "up", opp: 95, qw: true },
    { kw: "korean skincare routine", clicks: 3900, imp: 89000, ctr: 4.4, pos: 12, trend: "up", opp: 89, qw: true },
    { kw: "hyaluronic acid benefits", clicks: 3200, imp: 76000, ctr: 4.2, pos: 8, trend: "down", opp: 72, qw: false },
    { kw: "acne treatment oily skin", clicks: 2900, imp: 64000, ctr: 4.5, pos: 15, trend: "up", opp: 87, qw: true },
    { kw: "anti aging cream 30s", clicks: 2400, imp: 58000, ctr: 4.1, pos: 18, trend: "flat", opp: 78, qw: true },
  ];

  const opportunityMap = keywords.map(k => ({ x: k.imp / 1000, y: 21 - k.pos, z: k.ctr * 8, name: k.kw }));

  const gaps = [
    { kw: "vegan retinol alternative", diff: 42, vol: "8.2K" },
    { kw: "skin barrier repair routine", diff: 38, vol: "12.1K" },
    { kw: "menopause skincare", diff: 35, vol: "6.4K" },
    { kw: "sensitive skin sunscreen", diff: 51, vol: "14.8K" },
  ];

  const serpFeatures = [
    { f: "Featured Snippets", won: 24, total: 84, color: PURPLE },
    { f: "People Also Ask", won: 71, total: 142, color: VIOLET },
    { f: "Image Pack", won: 38, total: 92, color: EMERALD },
    { f: "Video Carousel", won: 12, total: 48, color: AMBER },
  ];

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Search className="h-4 w-4 text-purple-300" /><div className="text-sm font-semibold">Top Organic Keywords</div></div>
          <DataBadge kind="market" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground border-b border-white/10">
              <tr><th className="text-left py-2">Keyword</th><th className="text-right">Clicks</th><th className="text-right">Impressions</th><th className="text-right">CTR</th><th className="text-right">Pos</th><th className="text-right">Opp Score</th><th></th></tr>
            </thead>
            <tbody>
              {keywords.map(k => (
                <tr key={k.kw} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="py-2 font-medium flex items-center gap-2">{k.kw}{k.qw && <Pill tone="emerald">Quick Win</Pill>}</td>
                  <td className="text-right">{k.clicks.toLocaleString()}</td>
                  <td className="text-right">{k.imp.toLocaleString()}</td>
                  <td className="text-right">{k.ctr}%</td>
                  <td className="text-right"><span className={cn("px-1.5 py-0.5 rounded text-[10px]", k.pos <= 3 ? "bg-amber-500/20 text-amber-200" : k.pos <= 10 ? "bg-emerald-500/20 text-emerald-200" : "bg-orange-500/20 text-orange-200")}>{k.pos}</span></td>
                  <td className="text-right text-purple-300 font-semibold">{k.opp}</td>
                  <td className="text-right">{k.trend === "up" ? <ArrowUpRight className="inline h-3 w-3 text-emerald-400" /> : k.trend === "down" ? <ArrowDownRight className="inline h-3 w-3 text-rose-400" /> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Keyword Opportunity Map</div><DataBadge kind="ai" /></div>
          <div className="h-72 relative">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeOpacity={0.08} />
                <XAxis type="number" dataKey="x" name="Volume (K)" stroke="#64748b" fontSize={10} />
                <YAxis type="number" dataKey="y" name="Rank score" stroke="#64748b" fontSize={10} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} />
                <ReferenceArea x1={50} y1={10} fill={EMERALD} fillOpacity={0.05} />
                <Scatter data={opportunityMap} fill={PURPLE} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="absolute top-2 right-3 text-[10px] text-emerald-300/80">Win Zone</div>
            <div className="absolute bottom-2 left-3 text-[10px] text-muted-foreground">Low Priority</div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Content Gap Analysis</div><Pill tone="purple">AI-found</Pill></div>
          <div className="space-y-2">
            {gaps.map(g => (
              <div key={g.kw} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div>
                  <div className="text-sm font-medium">{g.kw}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Volume {g.vol} · Difficulty {g.diff}</div>
                </div>
                <Button size="sm" variant="outline" className="border-purple-400/30 text-purple-200 text-xs h-7">Generate Brief</Button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">SERP Feature Tracking</div><DataBadge kind="market" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {serpFeatures.map(f => {
            const pct = Math.round((f.won / f.total) * 100);
            return (
              <div key={f.f} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-muted-foreground">{f.f}</div>
                <div className="mt-1 text-lg font-semibold">{pct}% <span className="text-[10px] text-muted-foreground font-normal">win rate</span></div>
                <div className="text-[10px] text-muted-foreground">{f.won} of {f.total}</div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: f.color }} /></div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// BEHAVIORAL ANALYTICS TAB
// ───────────────────────────────────────────────────────────
export function BehavioralAnalyticsTab() {
  const paths = [
    { p: "Home → /collections/serums → /product/vit-c → Checkout", conv: 4.8, good: true },
    { p: "Blog → /guides/retinol-101 → /product/retinol → Checkout", conv: 6.2, good: true },
    { p: "Search → /product/sunscreen → /cart → Checkout", conv: 5.1, good: true },
    { p: "Home → /about → exit", conv: 0.0, good: false },
    { p: "Paid → /landing/spring → exit", conv: 0.6, good: false },
  ];

  // 7×52 heatmap
  const heat = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 52 }, (_, w) => {
      const seed = (d * 13 + w * 7) % 17;
      const base = (Math.sin(w / 4) + 1) * 30 + seed * 2;
      return Math.max(0, Math.min(100, Math.round(base + (d === 2 || d === 4 ? 20 : 0))));
    })
  );

  const quality = [
    { tier: "Premium", v: 18, color: PURPLE },
    { tier: "High", v: 34, color: VIOLET },
    { tier: "Medium", v: 31, color: AMBER },
    { tier: "Low", v: 17, color: ROSE },
  ];

  const scrollDepth = [
    { d: "25%", u: 92 }, { d: "50%", u: 78 }, { d: "75%", u: 54 }, { d: "100%", u: 31 },
  ];

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-purple-300" /><div className="text-sm font-semibold">User Journey Paths</div></div><DataBadge kind="ga4" /></div>
        <div className="space-y-2">
          {paths.map(p => (
            <div key={p.p} className={cn("rounded-lg border p-3 flex items-center justify-between", p.good ? "border-emerald-400/20 bg-emerald-500/[0.04]" : "border-rose-400/20 bg-rose-500/[0.04]")}>
              <div className="text-xs font-mono text-foreground/80">{p.p}</div>
              <div className={cn("text-sm font-semibold", p.good ? "text-emerald-300" : "text-rose-300")}>{p.conv}%</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Flame className="h-4 w-4 text-amber-300" /><div className="text-sm font-semibold">Engagement Heatmap · 52 weeks</div></div><DataBadge kind="ga4-cached" /></div>
        <div className="flex flex-col gap-[3px]">
          {heat.map((row, d) => (
            <div key={d} className="flex gap-[3px]">
              {row.map((v, w) => (
                <div key={w} className="h-3 w-3 rounded-sm" style={{ background: v < 20 ? "#1e1e2e" : v < 40 ? "oklch(0.4 0.1 280)" : v < 60 ? "oklch(0.55 0.18 280)" : v < 80 ? "oklch(0.65 0.22 280)" : "oklch(0.75 0.25 320)" }} title={`Day ${d} W${w}: ${v}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground"><span>Less</span><div className="h-2 w-2 rounded-sm bg-[#1e1e2e]" /><div className="h-2 w-2 rounded-sm" style={{ background: "oklch(0.55 0.18 280)" }} /><div className="h-2 w-2 rounded-sm" style={{ background: "oklch(0.75 0.25 320)" }} /><span>More</span></div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Session Quality</div><DataBadge kind="ai" /></div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={quality} dataKey="v" nameKey="tier" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {quality.map((q) => <Cell key={q.tier} fill={q.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">{quality.map(q => <div key={q.tier} className="flex justify-between text-[11px]"><span><span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ background: q.color }} />{q.tier}</span><span>{q.v}%</span></div>)}</div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Scroll Depth</div><DataBadge kind="ga4" /></div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={scrollDepth} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeOpacity={0.08} />
                <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                <YAxis dataKey="d" type="category" stroke="#64748b" fontSize={10} />
                <Bar dataKey="u" fill={PURPLE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="border-amber-400/20">
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /><div className="text-sm font-semibold">Churn Prediction</div></div><DataBadge kind="ai" /></div>
          <div className="text-3xl font-bold text-amber-300">14.2%</div>
          <div className="text-xs text-muted-foreground mt-1">of current users at risk in next 30 days</div>
          <div className="mt-3 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2"><ThumbsDown className="h-3 w-3 text-rose-400" /> No re-order &gt; 90 days</div>
            <div className="flex items-center gap-2"><ThumbsDown className="h-3 w-3 text-rose-400" /> Email open rate &lt; 5%</div>
            <div className="flex items-center gap-2"><ThumbsDown className="h-3 w-3 text-rose-400" /> Last session bounced</div>
          </div>
          <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-600">Launch Win-back</Button>
        </GlassCard>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// CRISIS RADAR TAB
// ───────────────────────────────────────────────────────────
export function CrisisRadarTab() {
  const alerts = [
    { sev: "Critical", title: "Negative spike: 'irritation reaction'", spike: "+412%", time: "23 min ago", source: "Reddit r/SkincareAddiction", action: "Draft PR response + escalate to QA" },
    { sev: "Warning", title: "Mention surge: 'shipping delay'", spike: "+88%", time: "2h ago", source: "X.com mentions", action: "Audit Q2 logistics SLA" },
    { sev: "Info", title: "Influencer mention detected", spike: "+34%", time: "5h ago", source: "Instagram @glow_diaries (840K)", action: "Engage / amplify" },
  ];

  const sentiment = Array.from({ length: 30 }, (_, i) => ({
    d: `D-${30 - i}`,
    pos: 60 + Math.sin(i / 3) * 12 + (i > 24 ? -8 : 0),
    neu: 28 + Math.cos(i / 4) * 5,
    neg: 12 + (i > 24 ? 18 : Math.sin(i / 5) * 4),
  }));

  const mentions = Array.from({ length: 14 }, (_, i) => ({
    d: `D-${14 - i}`,
    pos: 80 + Math.round(Math.sin(i) * 20),
    neg: 12 + (i > 10 ? 28 : Math.round(Math.cos(i) * 6)),
  }));

  const [watchlist, setWatchlist] = useState(["acme", "acme skincare", "vit-c serum", "irritation"]);
  const [newKw, setNewKw] = useState("");

  return (
    <div className="space-y-5">
      <GlassCard className="border-rose-400/20 bg-rose-500/[0.04]">
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-rose-300 animate-pulse" /><div className="text-sm font-semibold">Active Alerts</div></div><Pill tone="rose">{alerts.filter(a => a.sev === "Critical").length} Critical</Pill></div>
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.title} className={cn("rounded-lg border p-3", a.sev === "Critical" ? "border-rose-400/30 bg-rose-500/[0.06]" : a.sev === "Warning" ? "border-amber-400/30 bg-amber-500/[0.06]" : "border-sky-400/30 bg-sky-500/[0.06]")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><ShieldAlert className={cn("h-3.5 w-3.5", a.sev === "Critical" ? "text-rose-300" : a.sev === "Warning" ? "text-amber-300" : "text-sky-300")} /><div className="text-sm font-semibold">{a.title}</div><Pill tone={a.sev === "Critical" ? "rose" : a.sev === "Warning" ? "purple" : "indigo"}>{a.spike}</Pill></div>
                  <div className="text-[11px] text-muted-foreground mt-1">{a.source} · {a.time}</div>
                  <div className="text-[11px] text-foreground/80 mt-1">→ {a.action}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">Investigate</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2">Dismiss</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Sentiment Trend · 30d</div><DataBadge kind="market" /></div>
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={sentiment}>
                <CartesianGrid strokeOpacity={0.08} />
                <XAxis dataKey="d" stroke="#64748b" fontSize={9} interval={4} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="pos" stackId="1" stroke={EMERALD} fill={EMERALD} fillOpacity={0.5} />
                <Area type="monotone" dataKey="neu" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.3} />
                <Area type="monotone" dataKey="neg" stackId="1" stroke={ROSE} fill={ROSE} fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Mention Volume · 14d</div><DataBadge kind="market" /></div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={mentions}>
                <CartesianGrid strokeOpacity={0.08} />
                <XAxis dataKey="d" stroke="#64748b" fontSize={9} interval={1} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="pos" stackId="m" fill={EMERALD} />
                <Bar dataKey="neg" stackId="m" fill={ROSE} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-indigo-300" /><div className="text-sm font-semibold">Keyword Watchlist</div></div></div>
        <div className="flex flex-wrap gap-2 mb-3">
          {watchlist.map(k => (
            <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs">
              {k}<button onClick={() => setWatchlist(w => w.filter(x => x !== k))} className="text-muted-foreground hover:text-rose-300">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newKw} onChange={(e) => setNewKw(e.target.value)} placeholder="Add keyword to monitor…" className="bg-white/5 border-white/10 h-8 text-xs" />
          <Button size="sm" onClick={() => { if (newKw) { setWatchlist(w => [...w, newKw]); setNewKw(""); } }} className="bg-gradient-to-r from-indigo-500 to-purple-600 h-8">Add</Button>
        </div>
      </GlassCard>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// REVENUE ATTRIBUTION TAB
// ───────────────────────────────────────────────────────────
export function RevenueAttributionTab() {
  const [model, setModel] = useState<"last" | "first" | "linear" | "decay" | "ai">("ai");

  const channelData = useMemo(() => {
    const base = [
      { ch: "Organic Search", last: 142000, first: 98000, linear: 124000, decay: 132000, ai: 158000 },
      { ch: "Paid Search", last: 88000, first: 64000, linear: 78000, decay: 84000, ai: 92000 },
      { ch: "Social", last: 54000, first: 78000, linear: 66000, decay: 58000, ai: 72000 },
      { ch: "Email", last: 38000, first: 22000, linear: 32000, decay: 35000, ai: 42000 },
      { ch: "Direct", last: 124000, first: 48000, linear: 86000, decay: 102000, ai: 78000 },
      { ch: "Referral", last: 18000, first: 24000, linear: 21000, decay: 20000, ai: 26000 },
    ];
    return base.map(b => ({ ch: b.ch, rev: b[model] }));
  }, [model]);

  const total = channelData.reduce((a, b) => a + b.rev, 0);
  const roas = [
    { ch: "Organic", roas: 8.4, bench: 5.1 },
    { ch: "Paid Search", roas: 3.2, bench: 3.0 },
    { ch: "Social", roas: 2.8, bench: 2.4 },
    { ch: "Email", roas: 12.4, bench: 9.0 },
    { ch: "Display", roas: 1.6, bench: 1.8 },
  ];

  const paths = [
    { p: "Organic → Email → Direct", count: 412, val: "$28.4K" },
    { p: "Paid → Social → Direct", count: 318, val: "$19.1K" },
    { p: "Social → Organic → Email", count: 287, val: "$22.6K" },
    { p: "Direct → Email", count: 241, val: "$14.8K" },
    { p: "Referral → Paid → Direct", count: 198, val: "$11.2K" },
  ];

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-300" /><div className="text-sm font-semibold">Attribution Model</div></div>
          <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
            {([
              { k: "last", l: "Last Click" },
              { k: "first", l: "First Click" },
              { k: "linear", l: "Linear" },
              { k: "decay", l: "Time Decay" },
              { k: "ai", l: "Data-Driven AI", rec: true },
            ] as const).map(m => (
              <button key={m.k} onClick={() => setModel(m.k)}
                className={cn("px-3 py-1 text-xs rounded-md transition flex items-center gap-1.5", model === m.k ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" : "text-muted-foreground hover:text-foreground")}>
                {m.l}{"rec" in m && m.rec && <span className="text-[9px] uppercase bg-purple-400/30 px-1 rounded">Rec</span>}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">Channel Revenue Attribution</div><div className="text-xs text-muted-foreground">Total: <span className="text-emerald-300 font-semibold">${total.toLocaleString()}</span></div></div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={channelData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeOpacity={0.08} />
              <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="ch" type="category" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e1e2e", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="rev" fill={PURPLE} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><MousePointerClick className="h-4 w-4 text-purple-300" /><div className="text-sm font-semibold">Top Conversion Paths</div></div><Pill tone="indigo">Avg 3.4 touchpoints</Pill></div>
          <div className="space-y-2">
            {paths.map(p => (
              <div key={p.p} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div>
                  <div className="text-xs font-mono">{p.p}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{p.count} conversions</div>
                </div>
                <div className="text-sm font-semibold text-emerald-300">{p.val}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold">ROAS by Channel</div><Pill tone="purple">vs benchmark</Pill></div>
          <div className="space-y-3">
            {roas.map(r => (
              <div key={r.ch}>
                <div className="flex justify-between text-xs"><span>{r.ch}</span><span className={cn("font-semibold", r.roas > r.bench ? "text-emerald-300" : "text-rose-300")}>{r.roas}x <span className="text-muted-foreground">/ {r.bench}x</span></span></div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5 relative overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, r.roas * 8)}%`, background: r.roas > r.bench ? EMERALD : ROSE }} />
                  <div className="absolute top-0 h-full w-px bg-amber-300" style={{ left: `${Math.min(100, r.bench * 8)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-purple-500/10 border border-purple-400/20 p-3 text-xs">
            <div className="flex items-center gap-2 text-purple-200 font-semibold mb-1"><Sparkles className="h-3 w-3" /> AI Recommendation</div>
            Shift 18% of Display budget into Email — projected +$11.4K/mo at 3.1x current efficiency.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

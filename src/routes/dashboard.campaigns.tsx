import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Sparkles, ChevronRight, Settings2, Bot, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { sparkData, platforms } from "@/lib/mock";

export const Route = createFileRoute("/dashboard/campaigns")({
  component: Campaigns,
  head: () => ({ meta: [{ title: "Campaign Automation — BrandSync AI" }] }),
});

const ADS = [
  { id: 1, name: "Spring Sale · Carousel", platform: "Meta", status: "scaling", roas: 4.8, cpc: 0.42, cpa: 18.40, spend: 4220, trend: "up" },
  { id: 2, name: "TikTok UGC · Creator Pack", platform: "TikTok", status: "winning", roas: 6.2, cpc: 0.31, cpa: 11.20, spend: 6100, trend: "up" },
  { id: 3, name: "LinkedIn · Webinar Promo", platform: "LinkedIn", status: "stable", roas: 3.1, cpc: 4.80, cpa: 62.10, spend: 2840, trend: "up" },
  { id: 4, name: "Google Search · Branded", platform: "Google", status: "stable", roas: 8.4, cpc: 0.94, cpa: 8.10, spend: 1890, trend: "up" },
  { id: 5, name: "Reels · Cold Audience", platform: "Instagram", status: "paused", roas: 1.1, cpc: 0.88, cpa: 48.00, spend: 980, trend: "down" },
  { id: 6, name: "WhatsApp · Cart Recovery", platform: "WhatsApp", status: "winning", roas: 11.2, cpc: 0.08, cpa: 4.20, spend: 720, trend: "up" },
];

function Campaigns() {
  const [autopilot, setAutopilot] = useState(true);
  const [budget, setBudget] = useState([42000]);
  return (
    <div>
      <PageHeader eyebrow="Cross-Channel" title="Campaign Automation Engine"
        subtitle="Deploy, optimize, and orchestrate ads across every platform — with an AI co-pilot that pauses losers and scales winners in real time."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Bot className="h-4 w-4 text-indigo-300" /><span className="text-sm">AI Auto-Pilot</span>
            <Switch checked={autopilot} onCheckedChange={setAutopilot} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Spend (today)" value="$16,750" delta="+12%" accent="indigo" />
        <StatCard label="Blended ROAS" value="5.4×" delta="+0.6×" accent="emerald" />
        <StatCard label="CPA (avg)" value="$22.40" delta="-18%" accent="emerald" />
        <StatCard label="Auto-Optimizations" value="284 today" delta="+44" accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          {/* Stepped builder */}
          <GlassCard>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Campaign Builder · Spring 2026 Launch</div>
              <Pill tone="emerald">Live</Pill>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {["Goal", "Audience", "Creative", "Channels"].map((s, i) => (
                <div key={s} className={`rounded-lg border px-3 py-2 text-xs ${i === 1 ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-200" : "border-white/10 bg-white/5 text-muted-foreground"}`}>
                  <div className="text-[10px] uppercase tracking-widest">Step {i+1}</div>
                  <div className="text-sm text-foreground">{s}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mb-2">Channels</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {platforms.slice(0,8).map((p, i) => (
                <button key={p} className={`rounded-full border px-3 py-1 text-xs ${i < 5 ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-200" : "border-white/10 bg-white/5 text-muted-foreground"}`}>{p}</button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mb-2">Dynamic budget allocation · ${budget[0].toLocaleString()}/mo</div>
            <Slider value={budget} onValueChange={setBudget} min={5000} max={150000} step={500} />
            <div className="mt-4 grid grid-cols-6 gap-2">
              {[
                { p: "TikTok", pct: 32 },{ p: "Meta", pct: 26 },{ p: "Google", pct: 18 },
                { p: "LinkedIn", pct: 12 },{ p: "WhatsApp", pct: 7 },{ p: "YouTube", pct: 5 }
              ].map(a => (
                <div key={a.p} className="text-center">
                  <div className="h-20 bg-white/5 rounded relative overflow-hidden flex items-end">
                    <div className="w-full bg-gradient-to-t from-indigo-500 to-purple-400" style={{ height: `${a.pct * 3}%` }} />
                  </div>
                  <div className="text-[10px] mt-1 text-muted-foreground">{a.p}</div>
                  <div className="text-xs text-foreground">{a.pct}%</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden p-0">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="text-sm font-medium">Live Ad Performance</div>
              <Button size="sm" variant="ghost"><Settings2 className="h-4 w-4 mr-1" /> Columns</Button>
            </div>
            <div className="divide-y divide-white/5">
              {ADS.map((ad) => (
                <div key={ad.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                  <div className="col-span-4">
                    <div className="text-sm font-medium">{ad.name}</div>
                    <div className="text-xs text-muted-foreground">{ad.platform}</div>
                  </div>
                  <div className="col-span-1 text-xs">
                    <Pill tone={ad.status === "winning" ? "emerald" : ad.status === "paused" ? "rose" : ad.status === "scaling" ? "purple" : "neutral"}>{ad.status}</Pill>
                  </div>
                  <div className="col-span-1 text-sm">{ad.roas}×</div>
                  <div className="col-span-1 text-sm">${ad.cpc}</div>
                  <div className="col-span-1 text-sm">${ad.cpa}</div>
                  <div className="col-span-1 text-sm">${ad.spend.toLocaleString()}</div>
                  <div className="col-span-2 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData(12, 50)}><Line type="monotone" dataKey="v" stroke={ad.trend === "up" ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.25 20)"} strokeWidth={2} dot={false} /></LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {ad.status === "paused" ? <Button size="sm" variant="ghost"><Play className="h-3.5 w-3.5" /></Button> : <Button size="sm" variant="ghost"><Pause className="h-3.5 w-3.5" /></Button>}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <motion.div initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
          <GlassCard>
            <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2"><Sparkles className="h-4 w-4" /> AI Recommendations</div>
            {[
              { t: "Shift 15% budget → TikTok", s: "18-24 demo ROAS 6.2× vs 3.1× on LinkedIn", tone: "emerald" },
              { t: "Pause 'Reels · Cold Audience'", s: "ROAS dropped below 1.5× threshold", tone: "rose" },
              { t: "Scale WhatsApp Cart Recovery 3×", s: "Best-performing CPA at $4.20", tone: "emerald" },
              { t: "Refresh creatives on Meta", s: "Frequency hit 4.8 — fatigue detected", tone: "indigo" },
            ].map((r, i) => (
              <button key={i} className="w-full text-left mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:bg-white/5 transition flex items-start gap-2">
                <Pill tone={r.tone as "emerald"}>{r.tone === "rose" ? "alert" : "boost"}</Pill>
                <div className="flex-1">
                  <div className="text-sm">{r.t}</div>
                  <div className="text-xs text-muted-foreground">{r.s}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </GlassCard>

          <GlassCard>
            <div className="text-sm font-medium mb-2 flex items-center gap-2">Channel Health <span className="ml-auto text-xs text-emerald-300 inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +6%</span></div>
            {[["Meta", 86],["TikTok", 94],["Google", 78],["LinkedIn", 62],["WhatsApp", 91]].map(([p, v]) => (
              <div key={p as string} className="mt-2">
                <div className="flex justify-between text-xs"><span>{p}</span><span className="text-muted-foreground">{v}%</span></div>
                <div className="h-1.5 mt-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

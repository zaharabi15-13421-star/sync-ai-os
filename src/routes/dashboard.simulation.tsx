import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Zap, Sparkles } from "lucide-react";
import { PageHeader, GlassCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/simulation")({
  component: Simulation,
  head: () => ({ meta: [{ title: "Simulation Engine — BrandSync AI" }] }),
});

function Simulation() {
  const [budget, setBudget] = useState([40000]);
  const [days, setDays] = useState([14]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | { reach: string; ctr: string; conv: string; grade: string }>(null);

  const run = () => {
    setResult(null);
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      const seed = budget[0];
      setResult({
        reach: `${(seed * 65 / 1000).toFixed(1)}K`.replace(/(\d+)\.(\d+)K/, (_, a, b) => +a > 999 ? `${(+a/1000).toFixed(1)}M` : `${a}.${b}K`),
        ctr: `${(2.4 + Math.random() * 1.6).toFixed(2)}%`,
        conv: `${Math.round(58 + Math.random() * 22)}%`,
        grade: ["A","A-","B+","A"][Math.floor(Math.random()*4)],
      });
    }, 2400);
  };

  return (
    <div>
      <PageHeader eyebrow="Sandbox" title="AI Brand Simulation Engine"
        subtitle="Predict reach, CTR, and ROI before a single dollar leaves your account."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        <GlassCard>
          <div className="text-sm font-medium mb-4">Mission Parameters</div>
          <div className="space-y-5 text-sm">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Budget</span><span className="text-foreground">${budget[0].toLocaleString()}</span></div>
              <Slider value={budget} onValueChange={setBudget} min={5000} max={250000} step={1000} className="mt-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Duration</span><span className="text-foreground">{days[0]} days</span></div>
              <Slider value={days} onValueChange={setDays} min={3} max={60} step={1} className="mt-2" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Target Audience</label>
              <Select defaultValue="d2c">
                <SelectTrigger className="mt-1 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="d2c">D2C Skincare · 18-34 · US/UK</SelectItem>
                  <SelectItem value="re">Real Estate · 25-45 · BD/UAE</SelectItem>
                  <SelectItem value="edu">EdTech parents · 30-50 · IN</SelectItem>
                  <SelectItem value="b2b">B2B SaaS DMs · global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Creative Pack</label>
              <Select defaultValue="ugc">
                <SelectTrigger className="mt-1 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ugc">UGC + Founder Cut</SelectItem>
                  <SelectItem value="hero">Hero Reel + Carousel</SelectItem>
                  <SelectItem value="static">Static Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={run} disabled={running} className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 glow-primary text-base">
              <Zap className="h-4 w-4 mr-2" /> {running ? "Simulating…" : "Run Simulation"}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden min-h-[520px]">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]">
            {[1,2,3,4].map(i => <div key={i} className="absolute inset-0 rounded-full border border-indigo-400/20" style={{ inset: `${i*8}%` }} />)}
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-purple-300"><Atom className="h-4 w-4" /> Command Center</div>
            <div className="text-xs text-muted-foreground">Predictive modeling · 1.4B prior data points</div>

            <AnimatePresence mode="wait">
              {running && (
                <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-12 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="mx-auto h-44 w-44 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 relative">
                    <div className="scanline absolute inset-0 rounded-full animate-pulse" />
                  </motion.div>
                  <div className="mt-6 text-sm text-indigo-300 font-mono">
                    <div>› Modeling 18 channels…</div>
                    <div>› Sampling 412K lookalike profiles…</div>
                    <div>› Cross-validating creative pack…</div>
                    <div className="text-purple-300">› Synthesizing forecast ✨</div>
                  </div>
                </motion.div>
              )}

              {result && !running && (
                <motion.div key="res" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { l: "Estimated Reach", v: result.reach, t: "indigo" },
                    { l: "Expected CTR", v: result.ctr, t: "purple" },
                    { l: "Conversion Probability", v: result.conv, t: "emerald" },
                    { l: "Budget Efficiency", v: result.grade, t: "emerald" },
                  ].map((m) => (
                    <motion.div key={m.l} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
                      <div className="mt-2 text-4xl font-semibold text-gradient">{m.v}</div>
                    </motion.div>
                  ))}
                  <div className="col-span-2 lg:col-span-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-300" />
                    <div className="text-sm">AI verdict: this campaign is forecast to <span className="text-emerald-300 font-semibold">outperform your 90-day average by 38%</span>. Confidence 87%.</div>
                    <Button size="sm" className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600">Deploy to Campaigns</Button>
                  </div>
                </motion.div>
              )}

              {!running && !result && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20 text-center text-muted-foreground">
                  <Pill tone="indigo">awaiting parameters</Pill>
                  <div className="mt-4 text-sm">Configure mission parameters and press <span className="text-foreground">Run Simulation</span>.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

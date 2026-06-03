import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Sparkles, TrendingDown, DollarSign } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Line, ComposedChart } from "recharts";
import { revenueSeries, funnel } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Unified Analytics — BrandSync AI" }] }),
});

const cacLtv = Array.from({ length: 6 }, (_, i) => ({ m: `M${i+1}`, cac: 60 - i*4, ltv: 220 + i*45 }));

function Analytics() {
  const [forecast, setForecast] = useState(true);
  return (
    <div>
      <PageHeader eyebrow="Executive View" title="Unified Analytics & ROI"
        subtitle="Every channel, every dollar, every prediction — one source of truth."
        actions={<Button onClick={() => toast.success("Executive report rendering · PDF + Excel")} className="bg-gradient-to-r from-indigo-500 to-purple-600"><FileText className="h-4 w-4 mr-2" />Generate Exec Report</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (30d)" value="$1.84M" delta="+22.4%" accent="emerald" />
        <StatCard label="Ad Spend" value="$284K" delta="-9.1%" accent="indigo" />
        <StatCard label="Blended ROAS" value="6.48×" delta="+1.2×" accent="emerald" />
        <StatCard label="LTV : CAC" value="6.2 : 1" delta="+0.8" accent="purple" />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="revenue">Revenue Attribution</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="efficiency">Cost Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-5 space-y-5">
          <GlassCard className="h-[380px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Revenue vs Ad Spend</div>
              <div className="flex items-center gap-2 text-xs"><Sparkles className="h-3.5 w-3.5 text-indigo-300" /> AI Forecast <Switch checked={forecast} onCheckedChange={setForecast} /></div>
            </div>
            <ResponsiveContainer width="100%" height="88%">
              <ComposedChart data={revenueSeries}>
                <defs><linearGradient id="rev" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="oklch(0.65 0.22 280)" stopOpacity={0.6}/><stop offset="100%" stopColor="oklch(0.65 0.22 280)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="day" stroke="oklch(0.7 0.02 260)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.22 280)" fill="url(#rev)" strokeWidth={2} />
                <Bar dataKey="spend" fill="oklch(0.78 0.17 75 / 0.6)" />
                {forecast && <Line type="monotone" dataKey="forecast" stroke="oklch(0.6 0.24 295)" strokeDasharray="6 4" strokeWidth={2} dot={false} />}
              </ComposedChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="h-[280px]">
            <div className="text-sm font-medium mb-2">CAC vs LTV (6-month rolling)</div>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={cacLtv}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 260)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.02 260)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="cac" fill="oklch(0.65 0.25 20 / 0.7)" />
                <Bar dataKey="ltv" fill="oklch(0.72 0.18 155 / 0.8)" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </TabsContent>

        <TabsContent value="funnel" className="mt-5">
          <GlassCard>
            <div className="text-sm font-medium mb-4">Conversion Funnel · Last 30d</div>
            <div className="space-y-2">
              {funnel.map((f, i) => {
                const max = funnel[0].value;
                const pct = (f.value / max) * 100;
                const conv = i > 0 ? ((f.value / funnel[i-1].value) * 100).toFixed(1) : null;
                return (
                  <div key={f.stage} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-muted-foreground">{f.stage}</div>
                    <div className="flex-1 h-10 rounded-md bg-white/5 relative overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center px-3 text-sm font-medium" style={{ width: `${pct}%` }}>
                        {f.value.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-20 text-right text-xs text-emerald-300">{conv ? `${conv}%` : "—"}</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="efficiency" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2">
              <div className="text-sm font-medium mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-300" /> Manual vs AI Execution Cost</div>
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground"><tr><th className="text-left py-2">Workflow</th><th className="text-right py-2">Manual / mo</th><th className="text-right py-2">AI / mo</th><th className="text-right py-2">Saved</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {[["Creative production",4800,640,4160],["Campaign optimization",3200,420,2780],["Reporting & decks",1800,180,1620],["Influencer vetting",2200,300,1900],["Lead nurturing",2600,520,2080],["Crisis response",1400,240,1160]].map((r) => (
                    <tr key={r[0] as string}>
                      <td className="py-2.5">{r[0]}</td>
                      <td className="py-2.5 text-right text-rose-300">${(r[1] as number).toLocaleString()}</td>
                      <td className="py-2.5 text-right">${(r[2] as number).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-emerald-300 font-medium">${(r[3] as number).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
            <div className="space-y-4">
              <GlassCard className="text-center bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-400/30 glow-emerald">
                <div className="text-[11px] uppercase tracking-widest text-emerald-300">Money Saved</div>
                <div className="mt-2 text-5xl font-semibold text-emerald-300">$13,700</div>
                <div className="text-sm text-muted-foreground">per month · vs traditional MarTech</div>
                <Pill tone="emerald"><TrendingDown className="h-2.5 w-2.5" /> 68% reduction</Pill>
              </GlassCard>
              <GlassCard>
                <div className="text-sm font-medium mb-1">Hours Reclaimed</div>
                <div className="text-3xl font-semibold">412 hrs/mo</div>
                <div className="text-xs text-muted-foreground">Across 9 workflows</div>
              </GlassCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

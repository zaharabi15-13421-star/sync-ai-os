import { createFileRoute } from "@tanstack/react-router";
import { Search, FileSpreadsheet, FileText, Star, AlertTriangle, TrendingUp } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { influencers } from "@/lib/mock";

export const Route = createFileRoute("/dashboard/influencers")({
  component: Influencers,
  head: () => ({ meta: [{ title: "Influencer OS — BrandSync AI" }] }),
});

function Influencers() {
  return (
    <div>
      <PageHeader eyebrow="Creator Intelligence" title="Influencer & Creator OS"
        subtitle="Vet creators, detect fake followers, and predict campaign ROI before you sign a single deal."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => toast.success("Excel brief exported")}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
            <Button variant="ghost" onClick={() => toast.success("Campaign brief PDF ready")}><FileText className="h-4 w-4 mr-2" />PDF Brief</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Vetted Creators" value="48,210" accent="indigo" />
        <StatCard label="Avg Authenticity" value="87%" delta="+4%" accent="emerald" />
        <StatCard label="Active Campaigns" value="14" accent="purple" />
        <StatCard label="UGC Pieces (mo)" value="382" delta="+22%" accent="emerald" />
      </div>

      <Tabs defaultValue="discover">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="discover">Discovery</TabsTrigger>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="ugc">UGC Library</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-5">
          <GlassCard className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by niche, keyword, audience…" className="pl-9 bg-white/5 border-white/10" />
              </div>
              {["Beauty","Fitness","Food","Gaming","Fashion","EdTech"].map(n => <Pill key={n} tone="indigo">{n}</Pill>)}
              <Pill tone="purple">10K–1M followers</Pill>
              <Pill tone="emerald">Authenticity &gt; 85%</Pill>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((c) => (
              <GlassCard key={c.handle} className="hover:border-indigo-400/40 transition">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-2xl">{c.img}</div>
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.handle} · {c.niche}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-semibold">{c.followers}</div>
                    <div className="text-[10px] text-muted-foreground">followers</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-white/5 p-2">
                    <div className="text-[10px] text-muted-foreground">Authenticity</div>
                    <div className={`text-sm font-semibold ${c.authenticity > 85 ? "text-emerald-300" : "text-amber-300"}`}>{c.authenticity}%</div>
                  </div>
                  <div className="rounded-md bg-white/5 p-2">
                    <div className="text-[10px] text-muted-foreground">Fake %</div>
                    <div className={`text-sm font-semibold ${c.fakePct > 15 ? "text-rose-400" : "text-emerald-300"}`}>{c.fakePct}%</div>
                  </div>
                  <div className="rounded-md bg-white/5 p-2">
                    <div className="text-[10px] text-muted-foreground">Predicted ROI</div>
                    <div className="text-sm font-semibold text-indigo-300">{c.roi}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Pill tone="emerald"><Star className="h-2.5 w-2.5" /> AI Match {c.authenticity}%</Pill>
                  <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600">Brief</Button>
                </div>
                {c.fakePct > 15 && <div className="mt-2 flex items-center gap-1 text-[11px] text-rose-300"><AlertTriangle className="h-3 w-3" /> Elevated bot follower ratio</div>}
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-5">
          <GlassCard className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-white/[0.02]"><tr>{["Creator","Campaign","Posts","Reach","Engagement","ROAS"].map(h => <th key={h} className="text-left px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {influencers.slice(0,5).map(c => (
                  <tr key={c.handle}>
                    <td className="px-4 py-2.5">{c.name}</td>
                    <td className="px-4 py-2.5">Spring 2026 · UGC Pack</td>
                    <td className="px-4 py-2.5">{Math.floor(Math.random()*5)+2}</td>
                    <td className="px-4 py-2.5">{c.followers}</td>
                    <td className="px-4 py-2.5 text-emerald-300">{(Math.random()*5+3).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-emerald-300 font-semibold inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {c.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </TabsContent>

        <TabsContent value="ugc" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-gradient-to-br from-indigo-700/50 via-purple-700/40 to-fuchsia-600/40 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute bottom-2 left-2 text-[10px] text-white/80">@{["mayacreates","tariqfit","luciaeats","aishastyle"][i%4]}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

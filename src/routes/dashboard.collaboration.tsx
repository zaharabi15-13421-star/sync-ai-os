import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { PageHeader, GlassCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/collaboration")({
  component: Collaboration,
  head: () => ({ meta: [{ title: "Collaboration — BrandSync AI" }] }),
});

const TASKS = [
  { stage: "Backlog", items: ["Q1 brand guidelines refresh", "Influencer brief · UGC pack v3"] },
  { stage: "In Progress", items: ["Spring sale carousel · 3 variants", "WhatsApp drip · cart recovery"] },
  { stage: "Review", items: ["TikTok script · founder cut", "Email sequence · onboarding"] },
  { stage: "Approved", items: ["Hero reel · 30s", "Pricing page rewrite"] },
];

const APPROVALS = [
  { name: "spring-carousel-01.png", owner: "Maya · Designer", type: "Creative", status: "pending" },
  { name: "whatsapp-cart-flow.json", owner: "AI Co-pilot", type: "Automation", status: "pending" },
  { name: "founder-cut.mp4", owner: "Tariq · Producer", type: "Video", status: "approved" },
  { name: "Q1-strategy.pdf", owner: "Aisha · CMO", type: "Doc", status: "edits" },
];

function Collaboration() {
  const [statuses, setStatuses] = useState(APPROVALS);
  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Team Collaboration" subtitle="Boards, calendars, asset library, and AI-assigned tasks — one workspace for the whole marketing org." />

      <Tabs defaultValue="boards">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="boards">Campaign Boards</TabsTrigger>
          <TabsTrigger value="calendar">Shared Calendar</TabsTrigger>
          <TabsTrigger value="assets">Asset Library</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="boards" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TASKS.map((col) => (
              <div key={col.stage} className="glass rounded-xl p-3 min-h-[300px]">
                <div className="flex items-center justify-between px-1 mb-2"><div className="text-sm font-medium">{col.stage}</div><Pill tone="neutral">{col.items.length}</Pill></div>
                {col.items.map((t, i) => (
                  <div key={t} className="rounded-lg border border-white/10 bg-[#0d1120]/60 p-3 mb-2">
                    <div className="text-sm">{t}</div>
                    <div className="mt-2 flex items-center gap-2">
                      {i === 0 && <Pill tone="purple"><Sparkles className="h-2.5 w-2.5" /> AI-assigned</Pill>}
                      <div className="ml-auto h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] grid place-items-center">M</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-5">
          <GlassCard>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className="text-center text-muted-foreground py-1">{d}</div>)}
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] h-24 p-2">
                  <div className="text-[10px] text-muted-foreground">{i+1}</div>
                  {i % 4 === 0 && <div className="mt-1 rounded bg-indigo-500/20 border border-indigo-400/30 text-[10px] px-1.5 py-0.5">IG Reel</div>}
                  {i % 5 === 0 && <div className="mt-1 rounded bg-emerald-500/20 border border-emerald-400/30 text-[10px] px-1.5 py-0.5">WA Drip</div>}
                  {i % 7 === 0 && <div className="mt-1 rounded bg-purple-500/20 border border-purple-400/30 text-[10px] px-1.5 py-0.5">TikTok UGC</div>}
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="assets" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-indigo-700/40 via-purple-700/40 to-fuchsia-600/30 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <ImageIcon className="absolute top-2 right-2 h-3.5 w-3.5 text-white/60" />
                <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 truncate">asset_{1000+i}.png</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="mt-5">
          <GlassCard className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-white/[0.02]"><tr>{["Asset","Owner","Type","Status","Action"].map(h => <th key={h} className="text-left px-4 py-2.5">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {statuses.map((a, i) => (
                  <tr key={a.name} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.owner}</td>
                    <td className="px-4 py-3">{a.type}</td>
                    <td className="px-4 py-3">
                      <Pill tone={a.status === "approved" ? "emerald" : a.status === "edits" ? "rose" : "indigo"}>{a.status}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      {a.status !== "approved" ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-emerald-300" onClick={() => { setStatuses(s => s.map((x, j) => j === i ? { ...x, status: "approved" } : x)); toast.success("Approved · pushed to channels"); }}><Check className="h-3.5 w-3.5 mr-1" />Approve</Button>
                          <Button size="sm" variant="ghost" className="text-rose-300" onClick={() => toast("Edit request sent to owner")}>Request edits</Button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

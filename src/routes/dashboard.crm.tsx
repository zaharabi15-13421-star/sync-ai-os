import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, FileSpreadsheet, FileText, Calendar, Sparkles, X, Send, Phone } from "lucide-react";
import { PageHeader, GlassCard, StatCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { leads } from "@/lib/mock";

export const Route = createFileRoute("/dashboard/crm")({
  component: CRM,
  head: () => ({ meta: [{ title: "Lead & CRM — BrandSync AI" }] }),
});

const STAGES = ["New", "Nurturing", "Meeting Set", "Closed"] as const;

function CRM() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <PageHeader eyebrow="Pipeline" title="Lead & CRM Automation"
        subtitle="Unified social inbox, AI lead scoring, and smart follow-ups — every touchpoint in one thread."
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => toast.success("Excel export queued · Pipeline_2026.xlsx")}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
            <Button variant="ghost" onClick={() => toast.success("PDF report generated")}><FileText className="h-4 w-4 mr-2" />PDF</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open Leads" value="1,284" delta="+82 today" accent="indigo" />
        <StatCard label="Pipeline Value" value="$1.84M" delta="+12.6%" accent="emerald" />
        <StatCard label="AI-Suggested Replies" value="312 ready" accent="purple" />
        <StatCard label="Avg Lead Score" value="74 / 100" delta="+3" accent="emerald" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="glass rounded-xl p-3 min-h-[400px]">
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="text-sm font-medium">{stage}</div>
              <Pill tone="neutral">{leads.filter(l => l.stage === stage).length}</Pill>
            </div>
            <div className="space-y-2">
              {leads.filter(l => l.stage === stage).map((lead) => (
                <motion.button
                  key={lead.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setActive(lead.id)}
                  className="w-full text-left rounded-lg border border-white/10 bg-[#0d1120]/60 p-3 hover:border-indigo-400/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{lead.name}</div>
                    <ScoreDot score={lead.score} />
                  </div>
                  <div className="text-xs text-muted-foreground">{lead.company}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Pill tone={lead.channel === "WhatsApp" ? "emerald" : lead.channel === "LinkedIn" ? "indigo" : "purple"}>{lead.channel}</Pill>
                    <span className="text-xs text-emerald-300">${lead.value.toLocaleString()}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active && <UnifiedInbox lead={leads.find(l => l.id === active)!} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ScoreDot({ score }: { score: number }) {
  const tone = score >= 85 ? "emerald" : score >= 70 ? "indigo" : "rose";
  return <Pill tone={tone}><Sparkles className="h-2.5 w-2.5" /> {score}</Pill>;
}

function UnifiedInbox({ lead, onClose }: { lead: typeof leads[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      className="fixed inset-y-0 right-0 w-full max-w-md z-40 bg-[#0a0d16]/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center font-semibold">{lead.name[0]}</div>
          <div>
            <div className="text-sm font-medium">{lead.name}</div>
            <div className="text-xs text-muted-foreground">{lead.company} · {lead.channel}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
      </div>

      <div className="p-4 space-y-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI Lead Score</span>
          <span className="text-emerald-300 font-semibold">{lead.score} / 100</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${lead.score}%` }} /></div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Pill tone="emerald">Pricing visited 3x</Pill><Pill tone="indigo">Demo watched 100%</Pill><Pill tone="purple">Returning</Pill>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        <Bubble side="them">Hey, saw your post on LinkedIn about predictive simulation — does it work for SaaS budgets ~$25K?</Bubble>
        <Bubble side="us">Absolutely — at $25K you'd be in our sweet spot. Want me to run a quick simulation for your category?</Bubble>
        <Bubble side="them">Yes please. We sell to mid-market real-estate brokers in BD + UAE.</Bubble>
        <Bubble side="us" channel="WhatsApp">Done — projected ROAS 4.6×, expected leads 184 / 14d. I'll DM the simulation PDF.</Bubble>

        <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3 mt-4">
          <div className="text-xs text-indigo-300 flex items-center gap-1 mb-2"><Sparkles className="h-3.5 w-3.5" /> AI Sales Assistant suggests</div>
          {[
            "Hi Aarav — based on your simulation results, would Tuesday 4pm work for a 20-min strategy walk-through? I'll bring the segment breakdown.",
            "Aarav — quick one: I noticed you re-watched the demo. Anything specific you'd like me to clarify before pricing?",
            "Following up — I prepared a custom forecast for Nimbus Realty showing $1.2M pipeline lift in Q1. Worth a 15 min review?"
          ].map((t, i) => (
            <button key={i} onClick={() => toast.success("Reply queued via WhatsApp Business")} className="w-full text-left mt-2 rounded-md bg-white/5 hover:bg-white/10 p-2.5 text-xs">
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => toast.success("High-priority calendar invite sent")}><Calendar className="h-4 w-4 mr-1" />Emergency Meeting</Button>
        <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600"><Send className="h-4 w-4 mr-1" />Reply</Button>
        <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
      </div>
    </motion.div>
  );
}

function Bubble({ side, children, channel }: { side: "us" | "them"; children: React.ReactNode; channel?: string }) {
  return (
    <div className={`flex ${side === "us" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${side === "us" ? "rounded-br-sm bg-indigo-500/20 border border-indigo-400/30" : "rounded-bl-sm bg-white/5 border border-white/10"}`}>
        {channel && <div className="text-[10px] text-emerald-300 mb-0.5 flex items-center gap-1"><MessageSquare className="h-2.5 w-2.5" />{channel}</div>}
        {children}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Plus, Building2, Stethoscope, GraduationCap, Briefcase, Store } from "lucide-react";
import { PageHeader, GlassCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing")({
  component: Billing,
  head: () => ({ meta: [{ title: "Billing & Plans — BrandSync AI" }] }),
});

const TIERS = [
  { name: "Starter", price: 99, blurb: "For SMEs", features: ["3 social channels", "5K AI credits", "Basic analytics"] },
  { name: "Growth", price: 599, popular: true, blurb: "Mid-market", features: ["All channels + WhatsApp", "75K AI credits", "Multi-language (BD + USA)", "Campaign Automation", "Predictive simulation"] },
  { name: "Enterprise", price: 4900, blurb: "Agencies & global", features: ["Unlimited", "White-label dashboard", "Multi-brand mgmt", "API + SSO", "Dedicated CSM"] },
];

const PRESETS = [
  { id: "re", icon: Building2, name: "Real Estate", desc: "High-lead workflows · CRM pipeline priority", focus: ["Lead Scoring", "WhatsApp", "Geo-Targeting"] },
  { id: "clinic", icon: Stethoscope, name: "Clinics & Hospitals", desc: "Retention tools + automated follow-ups", focus: ["Recall flows", "Reviews", "Loyalty"] },
  { id: "edu", icon: GraduationCap, name: "EdTech / D2C", desc: "Performance marketing · ROAS-first", focus: ["Creative volume", "TikTok", "Lookalikes"] },
  { id: "agency", icon: Briefcase, name: "Agencies / Franchises", desc: "White-label · multi-brand workspaces", focus: ["White-label", "Multi-brand", "API"] },
  { id: "retail", icon: Store, name: "Retail / Restaurants", desc: "Omnichannel WhatsApp + loyalty", focus: ["WhatsApp", "Repeat customer", "Localized creative"] },
];

const ADDONS = [
  { name: "+ 50K AI Credits", price: 49 },
  { name: "+ 5 Automation Seats", price: 99 },
  { name: "+ API Access Key", price: 149 },
  { name: "+ Dedicated IP", price: 199 },
];

function Billing() {
  const [current, setCurrent] = useState("Growth");
  const [preset, setPreset] = useState("edu");

  return (
    <div>
      <PageHeader eyebrow="Monetization" title="Billing & Plans" subtitle="Manage subscription, usage, add-ons, and industry presets." />

      <GlassCard className="mb-6 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border-indigo-400/30">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-xs text-indigo-300 uppercase tracking-widest">Current Plan</div>
            <div className="text-2xl font-semibold mt-1">{current} · $599/mo</div>
            <div className="text-xs text-muted-foreground">Renews May 24, 2026</div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-xs text-muted-foreground"><span>AI Credits</span><span>48,200 / 75,000</span></div>
            <div className="h-2 mt-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: "64%" }} /></div>
          </div>
          <PowerUpModal />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TIERS.map(t => (
          <motion.div key={t.name} whileHover={{ y: -3 }} className={`rounded-xl p-5 glass relative ${t.popular ? "ring-1 ring-indigo-400/40 glow-primary" : ""} ${current === t.name ? "border-emerald-400/50" : ""}`}>
            {t.popular && <div className="absolute -top-2 left-5 text-[10px] uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-0.5 rounded">Most Popular</div>}
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{t.name}</div>
            <div className="text-3xl font-semibold mt-1">${t.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <div className="text-xs text-muted-foreground mb-4">{t.blurb}</div>
            <ul className="space-y-1.5 text-sm">
              {t.features.map(f => <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 mt-0.5" /> {f}</li>)}
            </ul>
            <Button onClick={() => { setCurrent(t.name); toast.success(`Switched to ${t.name} (test mode)`); }} className={`mt-4 w-full ${t.popular ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-white/5 border border-white/10"}`}>
              {current === t.name ? "Current plan" : "Switch"}
            </Button>
          </motion.div>
        ))}
      </div>

      <GlassCard className="mb-6">
        <div className="text-sm font-medium mb-3">Industry Presets</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PRESETS.map(p => {
            const Icon = p.icon;
            const active = preset === p.id;
            return (
              <button key={p.id} onClick={() => { setPreset(p.id); toast.success(`Dashboard reconfigured for ${p.name}`); }} className={`text-left rounded-lg border p-3 transition ${active ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/5"}`}>
                <Icon className={`h-5 w-5 ${active ? "text-indigo-300" : "text-muted-foreground"}`} />
                <div className="text-sm font-medium mt-2">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
                <div className="mt-2 flex flex-wrap gap-1">{p.focus.map(f => <Pill key={f} tone={active ? "indigo" : "neutral"}>{f}</Pill>)}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-medium mb-3">Invoice History</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr>{["Date","Plan","Amount","Status",""].map(h => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {["Apr 24","Mar 24","Feb 24","Jan 24"].map(d => (
              <tr key={d}><td className="py-2.5">{d}, 2026</td><td>Growth</td><td>$599.00</td><td><Pill tone="emerald">Paid</Pill></td><td className="text-right"><Button variant="ghost" size="sm">PDF</Button></td></tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

function PowerUpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="bg-gradient-to-r from-indigo-500 to-purple-600 ml-auto"><Zap className="h-4 w-4 mr-2" />Usage Power-up</Button></DialogTrigger>
      <DialogContent className="bg-[#0d1120] border-white/10 max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-indigo-400" /> Usage Power-up</DialogTitle></DialogHeader>
        <div className="space-y-2 mt-2">
          {ADDONS.map(a => (
            <div key={a.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <div className="text-sm">{a.name}</div>
              <div className="flex items-center gap-2"><span className="text-sm">${a.price}</span><Button size="sm" onClick={() => toast.success(`${a.name} added · billed pro-rata`)} className="bg-gradient-to-r from-indigo-500 to-purple-600"><Plus className="h-3.5 w-3.5" /></Button></div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, subtitle, actions }: {
  eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-end justify-between gap-4 mb-6"
    >
      <div>
        {eyebrow && <div className="text-[11px] uppercase tracking-widest text-indigo-300/80 mb-1">{eyebrow}</div>}
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function GlassCard({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass rounded-xl p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, delta, accent = "indigo" }: {
  label: string; value: string; delta?: string; accent?: "indigo" | "emerald" | "rose" | "purple";
}) {
  const colors: Record<string, string> = {
    indigo: "from-indigo-500/30 to-indigo-500/5 text-indigo-300",
    emerald: "from-emerald-500/30 to-emerald-500/5 text-emerald-300",
    rose: "from-rose-500/30 to-rose-500/5 text-rose-300",
    purple: "from-purple-500/30 to-purple-500/5 text-purple-300",
  };
  return (
    <div className="glass rounded-xl p-5 relative overflow-hidden">
      <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl bg-gradient-to-br opacity-60", colors[accent])} />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {delta && (
        <div className={cn("mt-1 text-xs", delta.startsWith("-") ? "text-rose-400" : "text-emerald-400")}>
          {delta}
        </div>
      )}
    </div>
  );
}

export function Pill({ children, tone = "indigo" }: { children: ReactNode; tone?: "indigo" | "emerald" | "rose" | "purple" | "neutral" }) {
  const map: Record<string, string> = {
    indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    purple: "bg-purple-500/15 text-purple-300 border-purple-400/30",
    neutral: "bg-white/5 text-foreground/70 border-white/10",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider", map[tone])}>{children}</span>;
}

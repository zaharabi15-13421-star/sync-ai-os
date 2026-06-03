import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, Layout, Shirt, Sparkles, Camera,
  FileText, MessageSquareQuote, Hash, ShoppingBag,
  ScrollText, BookOpen, BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/app/ui";
import { QuotaDisplay } from "@/components/creative/shared";
import {
  ImageLab, PosterStudio, VirtualTryOn, ProductHolography, ProductPhotography,
  BlogPilot, CaptionCraft, HashtagWizard, ProductDescription,
  ThumbnailGenerator, ScriptWriter,
} from "@/components/creative/features";

const FEATURE_IDS = [
  "image-lab", "poster", "try-on", "holography", "product-photo",
  "blog", "caption", "hashtags", "product-desc",
  "thumbnail", "script",
] as const;
type FeatureId = typeof FEATURE_IDS[number];

export const Route = createFileRoute("/dashboard/creative")({
  component: Creative,
  validateSearch: (search: Record<string, unknown>): { tool: FeatureId } => {
    const t = search.tool as string | undefined;
    return { tool: (FEATURE_IDS as readonly string[]).includes(t ?? "") ? (t as FeatureId) : "image-lab" };
  },
  head: () => ({
    meta: [
      { title: "Creative Engine — BrandSync AI" },
      { name: "description", content: "AI-native content production across visuals, copy, and YouTube." },
    ],
  }),
});

const FEATURE_MAP: Record<FeatureId, ComponentType> = {
  "image-lab": ImageLab,
  "poster": PosterStudio,
  "try-on": VirtualTryOn,
  "holography": ProductHolography,
  "product-photo": ProductPhotography,
  "blog": BlogPilot,
  "caption": CaptionCraft,
  "hashtags": HashtagWizard,
  "product-desc": ProductDescription,
  "thumbnail": ThumbnailGenerator,
  "script": ScriptWriter,
};

function Creative() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Child routes (e.g. /dashboard/creative/templates) render through Outlet only.
  if (path !== "/dashboard/creative") {
    return <Outlet />;
  }
  const search = Route.useSearch() as { tool: FeatureId };
  const active = search.tool;

  // Keyboard shortcut: Cmd/Ctrl + Enter triggers a synthetic event (handled inside features in future wiring)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        document.querySelector<HTMLButtonElement>("button[data-generate-cta]")?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Active = FEATURE_MAP[active];

  return (
    <div>
      <PageHeader
        eyebrow="Creative Engine"
        title="AI Creative Studio"
        subtitle="Multi-platform content production — visuals, copy, and YouTube, all on-brand."
        actions={<QuotaDisplay used={13} total={100} />}
      />

      {/* Mini analytics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Generations this week", value: "47", icon: Sparkles },
          { label: "Most used", value: "Image Lab", icon: ImageIcon },
          { label: "Avg quality", value: "8.7 / 10", icon: BarChart3 },
          { label: "Top tone", value: "Premium", icon: BookOpen },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center">
              <s.icon className="h-4 w-4 text-indigo-200" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-sm font-semibold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Active />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

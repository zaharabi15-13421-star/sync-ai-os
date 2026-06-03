import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, LayoutGrid, Megaphone, Image as ImageIcon, Camera, Share2,
  Layout as LayoutIcon, MoreHorizontal, Download, Sparkles, Presentation,
  Video, FileText, PenTool, Sheet, Globe, Mail, Wand2,
} from "lucide-react";
import { PageHeader, Pill } from "@/components/app/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/creative/templates")({
  component: TemplatesShell,
  head: () => ({
    meta: [
      { title: "Templates — Creative Engine — BrandSync AI" },
      { name: "description", content: "Browse, customize, and export professional marketing templates." },
    ],
  }),
});

function TemplatesShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Render editor (or any child route) full-screen via Outlet
  if (path !== "/dashboard/creative/templates") {
    return <Outlet />;
  }
  return <TemplateGallery />;
}

type Category =
  | "product_marketing" | "thumbnail" | "product_photography"
  | "social_media" | "banner" | "other";

type Template = {
  id: string;
  name: string;
  category: Category;
  description: string;
  thumbnail: string;
  downloads: number;
  shortcut?: string;
  createdAt: number;
};

const CATEGORY_META: Record<Category, { label: string; tone: "purple" | "indigo" | "emerald" | "rose" | "neutral"; badgeClass: string; icon: typeof LayoutGrid }> = {
  product_marketing: { label: "Product Marketing", tone: "purple", badgeClass: "bg-purple-500/15 text-purple-300 border-purple-400/30", icon: Megaphone },
  thumbnail: { label: "Thumbnail", tone: "indigo", badgeClass: "bg-blue-500/15 text-blue-300 border-blue-400/30", icon: ImageIcon },
  product_photography: { label: "Product Photography", tone: "emerald", badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30", icon: Camera },
  social_media: { label: "Social Media", tone: "rose", badgeClass: "bg-pink-500/15 text-pink-300 border-pink-400/30", icon: Share2 },
  banner: { label: "Banner", tone: "neutral", badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/30", icon: LayoutIcon },
  other: { label: "Other", tone: "neutral", badgeClass: "bg-white/10 text-white/70 border-white/15", icon: MoreHorizontal },
};

const PILLS: { id: "all" | Category; label: string; icon: typeof LayoutGrid; accent: string }[] = [
  { id: "all", label: "All Templates", icon: LayoutGrid, accent: "text-indigo-300 border-indigo-400/40 bg-indigo-500/15" },
  { id: "product_marketing", label: "Product Marketing", icon: Megaphone, accent: "text-purple-300 border-purple-400/40 bg-purple-500/15" },
  { id: "thumbnail", label: "Thumbnail", icon: ImageIcon, accent: "text-blue-300 border-blue-400/40 bg-blue-500/15" },
  { id: "product_photography", label: "Product Photography", icon: Camera, accent: "text-cyan-300 border-cyan-400/40 bg-cyan-500/15" },
  { id: "social_media", label: "Social Media", icon: Share2, accent: "text-pink-300 border-pink-400/40 bg-pink-500/15" },
  { id: "banner", label: "Banner", icon: LayoutIcon, accent: "text-orange-300 border-orange-400/40 bg-orange-500/15" },
  { id: "other", label: "Other", icon: MoreHorizontal, accent: "text-white/70 border-white/15 bg-white/10" },
];

const SHORTCUTS = [
  { id: "presentation", label: "Presentation", icon: Presentation },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "video", label: "Video", icon: Video },
  { id: "doc", label: "Doc", icon: FileText },
  { id: "whiteboard", label: "Whiteboard", icon: PenTool },
  { id: "sheet", label: "Sheet", icon: Sheet },
  { id: "website", label: "Website", icon: Globe },
  { id: "email", label: "Email", icon: Mail },
  { id: "photo", label: "Photo Editor", icon: ImageIcon },
];

// --- Seed 60 mocked templates for demo (12 base names, repeated to fuel infinite scroll) ---
const BASE_NAMES: { name: string; category: Category; description: string; shortcut?: string }[] = [
  { name: "Smartwatch Product Launch", category: "product_marketing", description: "Hero card for a flagship product reveal.", shortcut: "presentation" },
  { name: "Summer Sale Promo", category: "social_media", description: "Bright vertical promo for IG/TikTok.", shortcut: "social" },
  { name: "YouTube Gaming Thumbnail", category: "thumbnail", description: "High-contrast thumbnail with action focus.", shortcut: "video" },
  { name: "E-commerce Banner", category: "banner", description: "Wide store banner with CTA pocket.", shortcut: "website" },
  { name: "Instagram Product Story", category: "social_media", description: "9:16 product story with overlay.", shortcut: "social" },
  { name: "Tech Startup Social Post", category: "product_marketing", description: "Square post for product announcements.", shortcut: "social" },
  { name: "Beauty Product Showcase", category: "product_photography", description: "Editorial frame for beauty SKUs.", shortcut: "photo" },
  { name: "Restaurant Special Offer", category: "social_media", description: "Menu spotlight with offer pill.", shortcut: "social" },
  { name: "App Launch Announcement", category: "product_marketing", description: "Launch-day layout with feature bullets.", shortcut: "presentation" },
  { name: "Holiday Sale Banner", category: "banner", description: "Seasonal banner for site headers.", shortcut: "email" },
  { name: "Product Photography Frame", category: "product_marketing", description: "Studio frame around a hero shot.", shortcut: "photo" },
  { name: "Motivational Quote Card", category: "other", description: "Typographic quote card for daily posts.", shortcut: "social" },
];

function seedTemplates(): Template[] {
  const out: Template[] = [];
  let now = Date.now();
  for (let r = 0; r < 5; r++) {
    BASE_NAMES.forEach((b, i) => {
      const id = `${r}-${i}`;
      const seed = (r * 12 + i) % 1000;
      out.push({
        id,
        name: r === 0 ? b.name : `${b.name} v${r + 1}`,
        category: b.category,
        description: b.description,
        thumbnail: `https://picsum.photos/seed/bs-${seed}/640/480.webp`,
        downloads: 500 + ((seed * 37) % 4500),
        shortcut: b.shortcut,
        createdAt: now - r * 86400000 - i * 3600000,
      });
    });
  }
  return out;
}

const ALL_TEMPLATES = seedTemplates();

type SortKey = "newest" | "oldest" | "popular" | "downloads" | "trending";

function TemplateGallery() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [shortcut, setShortcut] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 300ms debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    let list = ALL_TEMPLATES.slice();
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (shortcut) list = list.filter((t) => t.shortcut === shortcut);
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          CATEGORY_META[t.category].label.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "newest": list.sort((a, b) => b.createdAt - a.createdAt); break;
      case "oldest": list.sort((a, b) => a.createdAt - b.createdAt); break;
      case "popular":
      case "trending":
      case "downloads": list.sort((a, b) => b.downloads - a.downloads); break;
    }
    return list;
  }, [debouncedQuery, category, sort, shortcut]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(24); }, [debouncedQuery, category, sort, shortcut]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting && visibleCount < filtered.length && !loadingMore) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((v) => Math.min(v + 12, filtered.length));
          setLoadingMore(false);
        }, 400);
      }
    }, { rootMargin: "200px" });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [visibleCount, filtered.length, loadingMore]);

  const visible = filtered.slice(0, visibleCount);

  // Suggestions
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const names = ALL_TEMPLATES
      .filter((t) => t.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({ type: "template" as const, value: t.name }));
    const cats = (Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][])
      .filter(([, m]) => m.label.toLowerCase().includes(q))
      .map(([, m]) => ({ type: "category" as const, value: m.label }));
    return [...names, ...cats].slice(0, 6);
  }, [query]);

  // Analytics strip values (mocked)
  const analytics = [
    { label: "Templates used this week", value: "47" },
    { label: "Most used category", value: "Product Marketing" },
    { label: "Avg export quality", value: "Ultra HD" },
    { label: "Top format", value: "PNG" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Creative Engine"
        title="Templates"
        subtitle="Browse, customize, and export professional marketing templates."
        actions={<Pill tone="emerald">Brand DNA Active</Pill>}
      />

      {/* Analytics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {analytics.map((s) => (
          <div key={s.label} className="glass rounded-xl p-3">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className="text-sm font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Nav bar: search + category + sort */}
      <div className="glass rounded-xl p-2 mb-3 flex flex-col md:flex-row gap-2 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search templates..."
            className="pl-9 bg-white/5 border-white/10"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full glass rounded-lg overflow-hidden border border-white/10">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.type}-${s.value}-${i}`}
                  onMouseDown={() => {
                    if (s.type === "category") {
                      const found = (Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][])
                        .find(([, m]) => m.label === s.value);
                      if (found) setCategory(found[0]);
                      setQuery("");
                    } else {
                      setQuery(s.value);
                    }
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2"
                >
                  <span className="text-muted-foreground uppercase text-[9px] tracking-wider w-16">{s.type}</span>
                  <span>{s.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground hidden md:inline">Category:</label>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([k, m]) => (
                <SelectItem key={k} value={k}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground hidden md:inline">Sort by:</label>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-1 px-1 no-scrollbar">
        {PILLS.map((p) => {
          const Icon = p.icon;
          const active = category === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setCategory(p.id)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
                active ? p.accent : "border-white/10 bg-white/5 text-muted-foreground hover:text-white",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Shortcut icons row */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 no-scrollbar">
        {SHORTCUTS.map((s) => {
          const Icon = s.icon;
          const active = shortcut === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setShortcut(active ? null : s.id)}
              className={cn(
                "shrink-0 flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 w-[88px] text-[11px] transition-all",
                active
                  ? "bg-indigo-500/15 border-indigo-400/40 text-indigo-200"
                  : "bg-white/[0.03] border-white/10 text-muted-foreground hover:text-white hover:bg-white/5",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate w-full text-center">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <EmptyState onClear={() => { setQuery(""); setCategory("all"); setShortcut(null); }} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {visible.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
            {loadingMore && Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={`sk-${i}`} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-12 flex items-center justify-center mt-4 text-xs text-muted-foreground">
            {visibleCount < filtered.length
              ? (loadingMore ? "Loading more…" : "Scroll for more")
              : `Showing all ${filtered.length} templates`}
          </div>
        </>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const meta = CATEGORY_META[template.category];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="group glass rounded-xl overflow-hidden border border-white/5 hover:border-indigo-400/30 hover:shadow-[0_8px_28px_-12px_rgba(99,102,241,0.45)] transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        <img
          src={template.thumbnail}
          alt={template.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-1">{template.name}</h3>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider", meta.badgeClass)}>
          {meta.label}
        </span>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{template.description}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
            <Download className="h-3 w-3" /> {template.downloads.toLocaleString()}
          </span>
        </div>
        <Link
          to="/dashboard/creative/templates/editor/$templateId"
          params={{ templateId: template.id }}
          className="block"
        >
          <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white group-hover:scale-[1.02] transition-transform">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Use Template
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 grid place-items-center mb-3">
        <Wand2 className="h-5 w-5 text-indigo-300" />
      </div>
      <div className="font-semibold">No templates found</div>
      <p className="text-sm text-muted-foreground mt-1">Try a different search or category.</p>
      <Button onClick={onClear} variant="outline" className="mt-4 border-white/15 bg-white/5">Clear Filters</Button>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles, FileText, Presentation, Globe, Loader2, Check, Upload, X, Plus,
  ChevronDown, ArrowRight, Clock, FileCode2, Layers, Share2,
  Cpu, Brain, Target, Layout, FileCheck2, Palette as PaletteIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useBrandGuideline } from "@/hooks/useBrandGuideline";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/brand-guideline")({
  head: () => ({
    meta: [
      { title: "Brand Guideline Generator — BrandSync AI" },
      { name: "description", content: "AI-powered brand guideline generator with live preview and multi-format export." },
    ],
  }),
  component: BrandGuidelinePage,
});

// ===== DATA =====
const INDUSTRY_GROUPS = [
  { label: "Technology", items: ["SaaS / Software", "Fintech", "Healthtech", "E-commerce", "Cybersecurity", "AI / Machine Learning", "Gaming", "Media & Entertainment"] },
  { label: "Services", items: ["Consulting", "Legal", "Finance & Banking", "Healthcare & Wellness", "Education & E-learning", "Real Estate", "Marketing & Advertising", "HR & Recruitment"] },
  { label: "Consumer", items: ["Fashion & Apparel", "Food & Beverage", "Beauty & Cosmetics", "Home & Lifestyle", "Sports & Fitness", "Travel & Hospitality", "Retail", "Automotive"] },
  { label: "Other", items: ["Non-profit / NGO", "Government / Public Sector", "Religious / Community", "Other"] },
];

const REGIONS = ["Global", "North America", "Europe", "Asia-Pacific", "Latin America", "Middle East & Africa", "South Asia", "South-East Asia"];

const BRAND_STAGES_DEFAULT = ["Pre-launch / Idea Stage", "Startup (0–2 years)", "Growth Stage (Scaling)", "Established Brand (5+ years)", "Rebranding / Refresh", "Market Expansion"];

const AUDIENCE_GROUPS_DEFAULT = [
  { label: "Business", items: ["B2B — Enterprise (1000+)", "B2B — Mid-market (50–999)", "B2B — Small Business (<50)", "B2B — Startups & Founders"] },
  { label: "Consumer", items: ["B2C — Gen Z (18–27)", "B2C — Millennials (28–43)", "B2C — Gen X & Boomers (44+)", "B2C — Families & Parents", "B2C — Professionals & Executives"] },
  { label: "Mixed", items: ["B2B2C — Both", "Non-profit Beneficiaries / Communities"] },
];

const COUNTRIES_RAW = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
const COUNTRIES = ["Bangladesh", ...COUNTRIES_RAW.filter(c => c !== "Bangladesh")];

const TONES = [
  { name: "Professional", desc: "Expert, clear, trustworthy. Suits finance, legal, SaaS." },
  { name: "Friendly", desc: "Warm, approachable, conversational. Suits consumer apps." },
  { name: "Bold & Edgy", desc: "Confident, disruptive, daring. Suits D2C, youth brands." },
  { name: "Playful", desc: "Fun, humorous, light-hearted. Suits gaming, food, kids." },
  { name: "Inspirational", desc: "Motivating, aspirational, purpose-led. Suits wellness, NGOs." },
  { name: "Luxury", desc: "Elegant, exclusive, refined. Suits premium and high-end." },
  { name: "Technical", desc: "Precise, data-driven, expert. Suits dev tools, research." },
  { name: "Empathetic", desc: "Caring, human-first, nurturing. Suits health, education." },
];

const COMM_STYLES = [
  { value: "Formal", desc: "uses full sentences, proper grammar" },
  { value: "Semi-formal", desc: "balanced and accessible" },
  { value: "Casual", desc: "short, punchy, everyday language" },
  { value: "Conversational", desc: "talks like a real person" },
  { value: "Academic", desc: "detailed, referenced, thorough" },
];

const ARCHETYPES = [
  { value: "The Hero", desc: "brave, driven, overcoming challenges" },
  { value: "The Sage", desc: "knowledgeable, wise, trusted guide" },
  { value: "The Creator", desc: "innovative, artistic, visionary" },
  { value: "The Caregiver", desc: "nurturing, supportive, generous" },
  { value: "The Explorer", desc: "adventurous, free, pioneering" },
  { value: "The Jester", desc: "playful, fun, lives in the moment" },
  { value: "The Ruler", desc: "authoritative, leading, prestigious" },
  { value: "The Rebel", desc: "challenging norms, disruptive" },
  { value: "The Lover", desc: "passionate, intimate, relationship-led" },
  { value: "The Innocent", desc: "optimistic, simple, wholesome" },
  { value: "The Everyperson", desc: "relatable, humble, grounded" },
  { value: "The Magician", desc: "transformative, visionary, inspiring" },
];

const KEYWORDS_DEFAULT = ["Trustworthy","Innovative","Bold","Warm","Premium","Minimal","Energetic","Sustainable","Transparent","Inclusive","Elegant","Reliable","Playful","Expert","Human"];

const TYPOGRAPHY_OPTIONS = [
  "Sans-serif modern (e.g. Inter, DM Sans)",
  "Geometric sans (e.g. Futura, Avenir)",
  "Classic serif (e.g. Garamond, Georgia)",
  "Display / High-contrast serif",
  "Slab serif (bold, editorial)",
  "Monospace / Tech (e.g. JetBrains Mono)",
  "Mixed — serif heading + sans body",
  "Not sure — let AI decide",
];

const POSITIONING = [
  "Price leader — most affordable option",
  "Quality leader — best-in-class product",
  "Innovation leader — most cutting-edge",
  "Niche specialist — best for a specific segment",
  "Customer experience leader — easiest to use",
  "Values-driven — mission & ethics first",
  "Community-led — built around a tribe",
];

const PALETTES = [
  { name: "Midnight Indigo", colors: ["#0D1117", "#6366F1", "#A78BFA", "#22D3EE"] },
  { name: "Neon Mint", colors: ["#0D1117", "#00C9A7", "#34D399", "#F0FDF4"] },
  { name: "Sunset Blaze", colors: ["#0D1117", "#F97316", "#EC4899", "#A78BFA"] },
  { name: "Charcoal Ember", colors: ["#1C1C1C", "#F97316", "#EAB308", "#FFFFFF"] },
];

const EXPORT_FORMATS = [
  { id: "pdf", name: "PDF", icon: FileText, bg: "#EF4444", badge: "AI-OPTIMIZED", badgeBg: "#7F1D1D", badgeColor: "#FCA5A5", desc: "Print-ready brandbook", time: "~30s" },
  { id: "pptx", name: "PPTX", icon: Presentation, bg: "#F97316", badge: "EDITABLE", badgeBg: "#7C2D12", badgeColor: "#FDBA74", desc: "Editable Keynote deck", time: "~45s" },
  { id: "docx", name: "DOCX", icon: FileCode2, bg: "#3B82F6", badge: "SOON", badgeBg: "#1E3A5F", badgeColor: "#93C5FD", desc: "Word document", time: "~25s" },
  { id: "web", name: "Web Brandbook", icon: Globe, bg: "#00C9A7", badge: "LIVE", badgeBg: "#064E3B", badgeColor: "#6EE7B7", desc: "Interactive site", time: "~60s" },
  { id: "portal", name: "Brand Portal", icon: Layers, bg: "#8B5CF6", badge: "COLLAB", badgeBg: "#3B0764", badgeColor: "#C4B5FD", desc: "Team workspace", time: "~50s" },
  { id: "social", name: "Social Kit", icon: Share2, bg: "#EC4899", badge: "12 SIZES", badgeBg: "#500724", badgeColor: "#F9A8D4", desc: "Platform templates", time: "~35s" },
];

const GEN_STEPS = [
  { icon: Brain, label: "Analyzing Brand DNA" },
  { icon: Target, label: "Detecting Audience" },
  { icon: Cpu, label: "Building Strategy" },
  { icon: PaletteIcon, label: "Creating Visual Identity" },
  { icon: Layout, label: "Generating Slides" },
  { icon: FileCheck2, label: "Finalizing Export" },
];

const TONE_PILLS = ["✦ Enhance", "↺ Rewrite", "⊞ Expand", "▣ Shorten", "✦ Premium", "⊙ Corporate", "✦ Luxury", "⊕ Creative"];

// ===== PRIMITIVES =====
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl p-7", className)} style={{ background: "#161B22", border: "1px solid rgba(255,255,255,0.08)" }}>{children}</div>;
}

function FieldLabel({ children, optional, right }: { children: React.ReactNode; optional?: boolean; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-[13px] font-medium" style={{ color: "#C9D1D9" }}>
        {children}
        {optional && <span style={{ color: "#6E7681" }}> · Optional</span>}
      </label>
      {right}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn("w-full h-[42px] px-3 rounded-lg text-[14px] text-white outline-none transition-all", props.className)}
      style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.1)" }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,201,167,0.3)"; e.currentTarget.style.borderColor = "#00C9A7"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; props.onBlur?.(e); }}
    />
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] mt-1.5" style={{ color: "#F85149" }}>{children}</p>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] mt-1.5" style={{ color: "#6E7681" }}>{children}</p>;
}

// Custom dropdown
function Dropdown({ value, onChange, placeholder, options, groups, addCustomLabel, hasError }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options?: string[];
  groups?: { label: string; items: string[] }[];
  addCustomLabel?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [customs, setCustoms] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setAdding(false); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allOpts = options ? [...options, ...customs] : undefined;
  const allGroups = groups ? (customs.length ? [...groups, { label: "Custom", items: customs }] : groups) : undefined;

  const confirm = () => {
    const v = draft.trim();
    if (v) { setCustoms(c => [...c, v]); onChange(v); setDraft(""); setAdding(false); setOpen(false); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-[42px] px-3 rounded-lg text-[14px] text-left flex items-center justify-between outline-none transition-all"
        style={{ background: "#1C2128", border: `1px solid ${hasError ? "#F85149" : "rgba(255,255,255,0.1)"}`, color: value ? "#FFFFFF" : "#6E7681" }}
      >
        <span className="truncate">{value || placeholder || "Select..."}</span>
        <ChevronDown size={16} style={{ color: "#8B949E" }} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg overflow-hidden max-h-[320px] overflow-y-auto" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {allGroups ? allGroups.map(g => (
            <div key={g.label}>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider" style={{ color: "#6E7681", background: "rgba(0,0,0,0.2)" }}>{g.label}</div>
              {g.items.map(item => (
                <button key={item} type="button" onClick={() => { onChange(item); setOpen(false); }} className="w-full text-left px-3 py-2 text-[14px] text-white hover:bg-white/5 transition-colors" style={{ color: value === item ? "#00C9A7" : "#FFFFFF" }}>{item}</button>
              ))}
            </div>
          )) : allOpts?.map(item => (
            <button key={item} type="button" onClick={() => { onChange(item); setOpen(false); }} className="w-full text-left px-3 py-2 text-[14px] hover:bg-white/5 transition-colors" style={{ color: value === item ? "#00C9A7" : "#FFFFFF" }}>{item}</button>
          ))}
          {addCustomLabel && (
            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {adding ? (
                <div className="flex items-center gap-2 p-2">
                  <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") { setAdding(false); setDraft(""); } }} placeholder="Type then confirm" className="flex-1 h-8 px-2 rounded text-[13px] text-white outline-none" style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button type="button" onClick={confirm} className="h-8 w-8 rounded grid place-items-center" style={{ background: "#00C9A7", color: "#0D1117" }}><Check size={14} /></button>
                  <button type="button" onClick={() => { setAdding(false); setDraft(""); }} className="h-8 w-8 rounded grid place-items-center" style={{ background: "#30363D", color: "#8B949E" }}><X size={14} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setAdding(true)} className="w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-white/5" style={{ color: "#00C9A7" }}><Plus size={14} /> {addCustomLabel}</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Country combobox
function CountryCombobox({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = useMemo(() => COUNTRIES.filter(c => c.toLowerCase().includes(q.toLowerCase()) && !values.includes(c)).slice(0, 50), [q, values]);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(true)} className="w-full min-h-[42px] px-2 py-1.5 rounded-lg flex flex-wrap items-center gap-1.5 cursor-text" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.1)" }}>
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px]" style={{ background: "rgba(0,201,167,0.12)", color: "#00C9A7", border: "1px solid rgba(0,201,167,0.3)" }}>
            {v}<button type="button" onClick={(e) => { e.stopPropagation(); onChange(values.filter(x => x !== v)); }}><X size={12} /></button>
          </span>
        ))}
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} placeholder={values.length ? "" : "Search countries..."} className="flex-1 min-w-[100px] bg-transparent outline-none text-[14px] text-white placeholder:text-[#6E7681]" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg overflow-hidden max-h-[260px] overflow-y-auto" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {filtered.map(c => (
            <button key={c} type="button" onClick={() => { onChange([...values, c]); setQ(""); }} className="w-full text-left px-3 py-2 text-[14px] text-white hover:bg-white/5">
              {c === "Bangladesh" && <span className="text-[10px] mr-2 px-1.5 py-0.5 rounded" style={{ background: "rgba(0,201,167,0.15)", color: "#00C9A7" }}>PINNED</span>}{c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== MAIN =====
function BrandGuidelinePage() {
  // Form state
  const [brandName, setBrandName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [website, setWebsite] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<string>("Midnight Indigo");
  const [customColors, setCustomColors] = useState<string[]>(PALETTES[0].colors);
  const [brandStage, setBrandStage] = useState("");
  const [audience, setAudience] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [tones, setTones] = useState<string[]>([]);
  const [commStyle, setCommStyle] = useState("");
  const [archetype, setArchetype] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [kwDraft, setKwDraft] = useState("");
  const [typography, setTypography] = useState("");
  const [positioning, setPositioning] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [admire, setAdmire] = useState("");
  const [formats, setFormats] = useState<string[]>(["web"]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generation state (UI animation only — real state comes from useBrandGuideline)
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);

  const {
    status, generatedFiles, error: genError, aiContent,
    generate: runHookGenerate, downloadFile, reset: resetHook,
  } = useBrandGuideline();
  const generating = status === "saving" || status === "generating_ai" || status === "generating_files";
  const generated = status === "completed";
  const fileRef = useRef<HTMLInputElement>(null);
  const [toneOpen, setToneOpen] = useState(false);
  const toneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!toneOpen) return;
    const onDown = (e: MouseEvent) => {
      if (toneRef.current && !toneRef.current.contains(e.target as Node)) setToneOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [toneOpen]);

  // Confidence
  const confidence = useMemo(() => {
    let c = 0;
    if (brandName.trim()) c += 10;
    if (industry) c += 10;
    if (description.trim().length >= 20) c += 15;
    if (tones.length > 0) c += 10;
    if (brandStage) c += 10;
    if (audience) c += 10;
    if (keywords.length >= 3) c += 10;
    if (formats.length > 0) c += 10;
    let opt = 0;
    [slogan, website, typography, positioning, competitor, admire, commStyle, archetype].forEach(v => { if (v && v.trim()) opt += 2; });
    c += Math.min(10, opt);
    return Math.min(100, c);
  }, [brandName, industry, description, tones, brandStage, audience, keywords, formats, slogan, website, typography, positioning, competitor, admire, commStyle, archetype]);

  const confSubtext = confidence === 0 ? "Awaiting input — ready to synthesize."
    : confidence <= 40 ? "Awaiting input — ready to synthesize."
    : confidence < 80 ? "Good signal — keep going."
    : confidence < 100 ? "Strong signal — ready to generate."
    : "Fully synthesized — hit Generate.";

  // Animated confidence
  const [animConf, setAnimConf] = useState(0);
  useEffect(() => {
    const start = animConf;
    const end = confidence;
    const t0 = performance.now();
    const dur = 500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setAnimConf(Math.round(start + (end - start) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
     
  }, [confidence]);

  const descCounterColor = description.length >= 500 ? "#F85149" : description.length >= 450 ? "#E3B341" : "#6E7681";

  // Logo upload
  const handleLogoFile = (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Please upload an image (PNG, SVG, JPG)"); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    const r = new FileReader();
    r.onload = () => setLogoDataUrl(r.result as string);
    r.readAsDataURL(f);
  };

  const toggleTone = (name: string) => {
    if (tones.includes(name)) setTones(tones.filter(t => t !== name));
    else if (tones.length >= 2) toast("You can choose up to 2 tones");
    else setTones([...tones, name]);
  };

  const toggleKeyword = (k: string) => {
    if (keywords.includes(k)) setKeywords(keywords.filter(x => x !== k));
    else if (keywords.length >= 10) toast("Max 10 keywords");
    else setKeywords([...keywords, k]);
  };

  const confirmKeyword = () => {
    const v = kwDraft.trim();
    if (v && !customKeywords.includes(v) && !KEYWORDS_DEFAULT.includes(v)) {
      setCustomKeywords([...customKeywords, v]);
      if (keywords.length < 10) setKeywords([...keywords, v]);
    }
    setKwDraft(""); setAddingKeyword(false);
  };

  const togglePalette = (name: string) => {
    const p = PALETTES.find(x => x.name === name);
    if (p) { setSelectedPalette(name); setCustomColors(p.colors); }
  };

  const toggleFormat = (id: string) => {
    setFormats(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  const applyPill = (pill: string) => {
    if (!description.trim()) { toast("Write a description first"); return; }
    const style = pill.replace(/^[^A-Za-z]+/, "").toLowerCase();
    const map: Record<string, (s: string) => string> = {
      enhance: s => s + " — refined for clarity, conviction, and an unmistakable point of view.",
      rewrite: s => s.split(/[.!?]/).filter(Boolean).reverse().map(x => x.trim()).join(". ") + ".",
      expand: s => s + " Our approach blends craft, technology, and human empathy to deliver outcomes customers can feel from the very first interaction.",
      shorten: s => s.split(/\s+/).slice(0, 18).join(" ") + (s.split(/\s+/).length > 18 ? "..." : ""),
      premium: s => "An uncompromising standard of craft. " + s,
      corporate: s => "We deliver enterprise-grade outcomes through disciplined execution. " + s,
      luxury: s => "Designed for those who appreciate the finest details. " + s,
      creative: s => "Where bold ideas meet relentless craft — " + s.toLowerCase(),
    };
    const fn = map[style];
    if (fn) setDescription(fn(description).slice(0, 500));
  };

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!brandName.trim()) e.brandName = "Brand name is required";
    if (!industry) e.industry = "Industry is required";
    if (!region) e.region = "Region is required";
    if (description.trim().length < 20) e.description = "Please provide at least 20 characters";
    setErrors(e);
    if (Object.keys(e).length) {
      setTimeout(() => {
        const k = Object.keys(e)[0];
        document.getElementById(`field-${k}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
    return Object.keys(e).length === 0;
  };

  // Generate sequence
  const runGenerate = async () => {
    if (!validate()) return;

    // Guests are allowed — generation runs without DB persistence and downloads come from in-memory blobs.



    setActiveStep(-1);
    setCompletedSteps([]);
    setTerminalLines([]);
    setTimeLeft(45);

    const lines = [
      "// parsing brand name...",
      "// mapping archetype to voice profile...",
      "// generating color semantics...",
      "// compiling typography rules...",
      "// building usage guidelines...",
      "// export package ready ✓",
    ];

    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);

    const genPromise = runHookGenerate({
      brandName, slogan, industry: industry || "Other", region: region || "Global",
      website, logoDataUrl, shortDescription: description,
      colorPreference: { palette: selectedPalette, colors: customColors },
      brandStage, primaryAudience: audience, countries,
      brandVoiceTone: tones, communicationStyle: commStyle,
      brandPersonalityArchetype: archetype,
      brandKeywords: keywords, typography, brandPositioning: positioning,
      competitorBrand: competitor, brandAdmire: admire,
      selectedFormats: formats,
    });

    for (let i = 0; i < GEN_STEPS.length; i++) {
      setActiveStep(i);
      setTerminalLines(prev => [...prev, lines[i] || ""].slice(-6));
      await new Promise(r => setTimeout(r, 3500));
      setCompletedSteps(prev => [...prev, i]);
    }

    await genPromise;
    clearInterval(timer);
    setActiveStep(-1);
  };

  // Surface hook completion/error state via toasts.
  useEffect(() => {
    if (status === "completed") toast.success("Brand guideline generated");
    if (status === "error" && genError) toast.error(genError, { duration: 10000 });
  }, [status, genError]);

  const handleExport = async (id: string) => {
    if (id === "web" || id === "portal" || id === "social") {
      toast(`${id.toUpperCase()} export coming soon`);
      return;
    }
    const file = generatedFiles.find(f => f.format === id);
    if (file?.error) { toast.error(`${id.toUpperCase()} failed: ${file.error}`); return; }
    if (!file) { toast("File not ready yet"); return; }
    downloadFile(file);
  };

  const canGenerate = !generating;
  const firstColor = customColors[1] || customColors[0] || "#6366F1";
  const initial = (brandName.trim()[0] || "Y").toUpperCase();

  return (
    <div className="min-h-screen -mx-6 -my-8 px-6 py-8" style={{ background: "#0D1117", color: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @keyframes blink { 0%, 50% { opacity: 1 } 51%, 100% { opacity: 0 } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        @keyframes pulseDot { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,201,167,0.6) } 50% { box-shadow: 0 0 12px 4px rgba(0,201,167,0.4) } }
        .skel { background: linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; border-radius: 4px; }
        .no-scroll::-webkit-scrollbar { display: none }
        .gen-btn-active { background: linear-gradient(90deg, #00C9A7, #8B5CF6, #00C9A7); background-size: 200% 100%; animation: shimmer 2s linear infinite; }
      `}</style>

      <div className="max-w-[1500px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "#8B949E" }}>AI BRAND STUDIO</p>
          <h1 className="text-[28px] font-semibold text-white mt-1">Brand Guideline Generator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6 min-w-0">
            {/* STEP 1 */}
            <Card>
              <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "#8B949E" }}>STEP 1 · TELL THE AI WHO YOU ARE</p>
              <h2 className="text-[22px] font-semibold text-white mt-1 mb-6">Brand Input</h2>

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div id="field-brandName">
                  <FieldLabel>Brand Name</FieldLabel>
                  <TextInput value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Acme Corporation" maxLength={120} />
                  {errors.brandName && <ErrorText>{errors.brandName}</ErrorText>}
                </div>
                <div>
                  <FieldLabel optional>Slogan</FieldLabel>
                  <TextInput value={slogan} onChange={e => setSlogan(e.target.value)} placeholder="Move fast. Stay refined." maxLength={160} />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div id="field-industry">
                  <FieldLabel>Industry</FieldLabel>
                  <Dropdown value={industry} onChange={setIndustry} placeholder="Choose industry" groups={INDUSTRY_GROUPS} hasError={!!errors.industry} />
                  {errors.industry && <ErrorText>{errors.industry}</ErrorText>}
                </div>
                <div id="field-region">
                  <FieldLabel>Region</FieldLabel>
                  <Dropdown value={region} onChange={setRegion} placeholder="Choose region" options={REGIONS} hasError={!!errors.region} />
                  {errors.region && <ErrorText>{errors.region}</ErrorText>}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel optional>Website</FieldLabel>
                  <TextInput value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.acmecorp.com" />
                </div>
                <div>
                  <FieldLabel>Logo</FieldLabel>
                  {logoDataUrl ? (
                    <div className="h-[42px] rounded-lg flex items-center justify-between px-3" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex items-center gap-2">
                        <img src={logoDataUrl} alt="Logo" className="h-7 w-7 rounded object-contain" style={{ background: "#0D1117" }} />
                        <span className="text-[13px]" style={{ color: "#C9D1D9" }}>Logo uploaded</span>
                      </div>
                      <button type="button" onClick={() => setLogoDataUrl("")} className="text-white/60 hover:text-white"><X size={16} /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleLogoFile(f); }} className="h-[42px] rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-white/[0.03]" style={{ border: "1px dashed rgba(255,255,255,0.15)", background: "#1C2128" }}>
                      <Upload size={14} style={{ color: "#8B949E" }} />
                      <span className="text-[13px]" style={{ color: "#8B949E" }}>Drop logo or click to upload</span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }} />
                </div>
              </div>

              {/* Short description */}
              <div className="mb-4" id="field-description">
                <FieldLabel right={<span className="text-[12px]" style={{ color: descCounterColor }}>{description.length}/500</span>}>Short description</FieldLabel>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 500))}
                  placeholder="What does your brand do? Who do you serve? What makes you different?"
                  className="w-full min-h-[100px] p-3 rounded-lg text-[14px] text-white outline-none resize-y"
                  style={{ background: "#1C2128", border: `1px solid ${errors.description ? "#F85149" : "rgba(255,255,255,0.1)"}` }}
                />
                {errors.description && <ErrorText>{errors.description}</ErrorText>}
                <div className="flex gap-2 mt-2 overflow-x-auto no-scroll" style={{ scrollbarWidth: "none" }}>
                  {TONE_PILLS.map(p => (
                    <button key={p} type="button" onClick={() => applyPill(p)} className="shrink-0 px-3.5 py-1.5 rounded-full text-[13px] transition-colors" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.12)", color: "#C9D1D9" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#00C9A7"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#C9D1D9"; }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Color preference */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium" style={{ color: "#C9D1D9" }}>Color preference</label>
                  <span className="text-[13px]" style={{ color: "#8B949E" }}>{customColors.length} selected</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {customColors.map((c, i) => (
                    <div key={i} className="relative">
                      <input type="color" value={c} onChange={e => { const next = [...customColors]; next[i] = e.target.value; setCustomColors(next); setSelectedPalette(""); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      <div className="w-9 h-9 rounded-full" style={{ background: c, border: "2px solid rgba(255,255,255,0.1)" }} />
                    </div>
                  ))}
                  {customColors.length < 6 && (
                    <button type="button" onClick={() => setCustomColors([...customColors, "#888888"])} className="w-9 h-9 rounded-full grid place-items-center" style={{ border: "1px dashed rgba(255,255,255,0.2)", color: "#8B949E" }}><Plus size={14} /></button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PALETTES.map(p => {
                    const isSel = selectedPalette === p.name;
                    return (
                      <button key={p.name} type="button" onClick={() => togglePalette(p.name)} className="text-left p-3 rounded-[10px] transition-all" style={{ background: isSel ? "rgba(0,201,167,0.06)" : "#161B22", border: `1px solid ${isSel ? "#00C9A7" : "rgba(255,255,255,0.08)"}` }}>
                        <div className="flex gap-1 mb-2">
                          {p.colors.map((c, i) => <div key={i} className="rounded" style={{ width: 28, height: 20, background: c }} />)}
                        </div>
                        <div className="text-[12px]" style={{ color: isSel ? "#00C9A7" : "#8B949E" }}>{p.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* Row 4 - new fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel>Brand Stage</FieldLabel>
                  <Dropdown value={brandStage} onChange={setBrandStage} placeholder="Select stage" options={BRAND_STAGES_DEFAULT} addCustomLabel="Add custom stage" />
                </div>
                <div>
                  <FieldLabel>Primary Audience</FieldLabel>
                  <Dropdown value={audience} onChange={setAudience} placeholder="Select audience" groups={AUDIENCE_GROUPS_DEFAULT} addCustomLabel="Add custom audience" />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <CountryCombobox values={countries} onChange={setCountries} />
                </div>
                <div>
                  <FieldLabel right={<span className="text-[12px]" style={{ color: "#6E7681" }}>— choose up to 2</span>}>Brand Voice & Tone</FieldLabel>
                  <div ref={toneRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setToneOpen(o => !o)}
                      className="w-full flex items-center gap-1.5 flex-wrap text-left px-3"
                      style={{ minHeight: 42, background: "#1C2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#C9D1D9", fontSize: 14 }}
                    >
                      {tones.length === 0 ? (
                        <span style={{ color: "#6E7681" }}>Select up to 2 tones</span>
                      ) : (
                        tones.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "rgba(0,201,167,0.12)", color: "#00C9A7", fontSize: 12, border: "1px solid rgba(0,201,167,0.3)" }}>
                            {t}
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label={`Remove ${t}`}
                              onClick={(e) => { e.stopPropagation(); setTones(tones.filter(x => x !== t)); }}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setTones(tones.filter(x => x !== t)); } }}
                              className="cursor-pointer opacity-70 hover:opacity-100"
                            >×</span>
                          </span>
                        ))
                      )}
                      <span className="ml-auto" style={{ color: "#6E7681" }}>▾</span>
                    </button>
                    {toneOpen && (
                      <div className="absolute z-20 mt-1 w-full overflow-hidden" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                        {TONES.map(t => {
                          const sel = tones.includes(t.name);
                          return (
                            <div
                              key={t.name}
                              onClick={() => toggleTone(t.name)}
                              className="flex items-center gap-2 cursor-pointer transition-colors"
                              style={{ padding: "10px 14px", fontSize: 14, color: sel ? "#00C9A7" : "#C9D1D9", background: sel ? "rgba(0,201,167,0.06)" : "transparent" }}
                              onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"; }}
                              onMouseLeave={(e) => { if (!sel) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                            >
                              <span style={{ width: 14, color: "#00C9A7" }}>{sel ? "✓" : ""}</span>
                              <span>{t.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 6 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel>Communication Style</FieldLabel>
                  <Dropdown value={commStyle} onChange={setCommStyle} placeholder="How does your brand speak?" options={COMM_STYLES.map(c => `${c.value} — ${c.desc}`)} />
                  <Hint>How your brand writes in emails, ads, and social posts</Hint>
                </div>
                <div>
                  <FieldLabel>Brand Personality Archetype</FieldLabel>
                  <Dropdown value={archetype} onChange={setArchetype} placeholder="Choose archetype" options={ARCHETYPES.map(a => `${a.value} — ${a.desc}`)} />
                  <Hint>Defines the emotional personality your brand projects</Hint>
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[13px] font-medium" style={{ color: "#C9D1D9" }}>Brand Keywords</label>
                  <span className="text-[13px]" style={{ color: "#8B949E" }}>{keywords.length} selected</span>
                </div>
                <Hint>Pick 3–5 adjectives that describe how your brand should feel</Hint>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[...KEYWORDS_DEFAULT, ...customKeywords].map(k => {
                    const sel = keywords.includes(k);
                    return (
                      <button key={k} type="button" onClick={() => toggleKeyword(k)} className="px-3.5 py-1 rounded-full text-[13px] transition-all" style={{ background: sel ? "rgba(0,201,167,0.08)" : "transparent", border: `${sel ? "1.5px" : "1px"} solid ${sel ? "#00C9A7" : "rgba(255,255,255,0.1)"}`, color: sel ? "#00C9A7" : "#8B949E" }}>{k}</button>
                    );
                  })}
                  {addingKeyword ? (
                    <div className="inline-flex items-center gap-1.5">
                      <input autoFocus value={kwDraft} onChange={e => setKwDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") confirmKeyword(); if (e.key === "Escape") { setAddingKeyword(false); setKwDraft(""); } }} placeholder="custom..." className="h-7 px-2 rounded-full text-[12px] text-white outline-none w-28" style={{ background: "#1C2128", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <button type="button" onClick={confirmKeyword} className="h-6 w-6 rounded-full grid place-items-center" style={{ background: "#00C9A7", color: "#0D1117" }}><Check size={12} /></button>
                      <button type="button" onClick={() => { setAddingKeyword(false); setKwDraft(""); }} className="h-6 w-6 rounded-full grid place-items-center" style={{ background: "#30363D", color: "#8B949E" }}><X size={12} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setAddingKeyword(true)} className="px-3 py-1 rounded-full text-[13px] inline-flex items-center gap-1" style={{ border: "1px dashed rgba(255,255,255,0.2)", color: "#8B949E" }}><Plus size={12} /></button>
                  )}
                </div>
              </div>

              {/* Row 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <FieldLabel optional>Typography</FieldLabel>
                  <Dropdown value={typography} onChange={setTypography} placeholder="Select typography style" options={TYPOGRAPHY_OPTIONS} />
                </div>
                <div>
                  <FieldLabel optional>Brand Positioning</FieldLabel>
                  <Dropdown value={positioning} onChange={setPositioning} placeholder="How will you compete?" options={POSITIONING} />
                </div>
              </div>

              {/* Row 8 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel optional>Competitor Brand</FieldLabel>
                  <TextInput value={competitor} onChange={e => setCompetitor(e.target.value)} placeholder="e.g. Notion, Linear, Figma" />
                  <Hint>Helps AI differentiate your brand's visual identity</Hint>
                </div>
                <div>
                  <FieldLabel optional>Brand Admire</FieldLabel>
                  <TextInput value={admire} onChange={e => setAdmire(e.target.value)} placeholder="e.g. Stripe, Airbnb, Apple — and why" />
                  <Hint>Inspires the visual direction and tone of your guidelines</Hint>
                </div>
              </div>
            </Card>

            {/* STEP 2 */}
            <Card>
              <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "#8B949E" }}>STEP 2 · CHOOSE YOUR OUTPUT SURFACES</p>
              <h2 className="text-[22px] font-semibold text-white mt-1 mb-6">Export Format</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXPORT_FORMATS.map(f => {
                  const sel = formats.includes(f.id);
                  const Icon = f.icon;
                  return (
                    <button key={f.id} type="button" onClick={() => toggleFormat(f.id)} className="text-left p-5 rounded-xl transition-all" style={{ background: sel ? "rgba(0,201,167,0.04)" : "#161B22", border: `${sel ? "1.5px" : "1px"} solid ${sel ? "#00C9A7" : "rgba(255,255,255,0.08)"}` }}>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full grid place-items-center shrink-0" style={{ background: f.bg }}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[16px] font-semibold text-white">{f.name}</span>
                            <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded" style={{ background: f.badgeBg, color: f.badgeColor }}>{f.badge}</span>
                          </div>
                          <p className="text-[13px] mt-1" style={{ color: "#8B949E" }}>{f.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[12px]" style={{ color: "#6E7681" }}>
                        <Clock size={12} /> {f.time}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* GENERATE BUTTON */}
            <button
              type="button"
              onClick={runGenerate}
              disabled={!canGenerate}
              className={cn("w-full h-14 rounded-xl flex items-center justify-center gap-3 text-white text-[18px] font-semibold transition-all", generating && "gen-btn-active", !canGenerate && "cursor-not-allowed")}
              style={{
                background: generating ? undefined : "linear-gradient(to right, #00C9A7, #8B5CF6)",
                opacity: canGenerate ? 1 : 0.45,
              }}
              onMouseEnter={e => { if (canGenerate && !generating) { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "scale(1.01)"; } }}
              onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Brand Guideline <ArrowRight size={18} /></>}
            </button>
          </div>

          {/* RIGHT COLUMN — sticky */}
          <div className="space-y-6 min-w-0">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* AI Engine */}
              <Card>
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative" style={{ width: 52, height: 52 }}>
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="#0D1117" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <circle cx="26" cy="26" r="22" fill="none" stroke="#00C9A7" strokeWidth="3" strokeLinecap="round" strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - animConf / 100)} transform="rotate(-90 26 26)" style={{ transition: "stroke-dashoffset 0.4s ease" }} />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="w-2 h-2 rounded-full" style={{ background: "#00C9A7", animation: "pulseDot 1.5s ease-in-out infinite" }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "#8B949E" }}>AI CONFIDENCE</p>
                    <p className="text-[32px] font-bold text-white leading-none mt-1">{animConf}%</p>
                    <p className="text-[13px] mt-1" style={{ color: "#6E7681" }}>{confSubtext}</p>
                  </div>
                </div>

                <div>
                  {GEN_STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const done = completedSteps.includes(i);
                    const active = activeStep === i;
                    return (
                      <div key={i} className="h-10 flex items-center gap-3 px-2 transition-all border-b" style={{
                        borderColor: "rgba(255,255,255,0.04)",
                        background: active ? "rgba(0,201,167,0.04)" : "transparent",
                        borderLeft: active ? "3px solid #00C9A7" : "3px solid transparent",
                      }}>
                        {done ? <Check size={16} style={{ color: "#00C9A7" }} /> : <Icon size={16} style={{ color: active ? "#00C9A7" : "#6E7681" }} className={active ? "animate-pulse" : ""} />}
                        <span className="text-[14px]" style={{ color: done ? "#00C9A7" : active ? "#FFFFFF" : "#6E7681" }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>

                {generating && (
                  <p className="text-[12px] mt-3" style={{ color: "#6E7681" }}>Estimated: ~{timeLeft}s remaining</p>
                )}

                <div className="mt-4 rounded-lg px-4 py-3 font-mono text-[12px]" style={{ background: "rgba(0,0,0,0.35)", color: "#00C9A7", minHeight: 80 }}>
                  {terminalLines.length === 0 ? (
                    <span>// awaiting neural stream_<span style={{ animation: "blink 1s step-end infinite" }}>|</span></span>
                  ) : (
                    <div className="space-y-1">
                      {terminalLines.map((l, i) => (
                        <div key={`${i}-${l}`} style={{ opacity: 0.4 + (0.6 * (i + 1)) / terminalLines.length }}>{l}</div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Live Preview */}
              <Card>
                <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "#00C9A7" }}>INTERACTIVE BRANDBOOK</p>
                <h3 className="text-[18px] font-semibold text-white mt-1 mb-4">Live Preview</h3>

                <div className="rounded-lg p-5" style={{ background: "#FFFFFF" }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full grid place-items-center text-white text-[14px] font-semibold" style={{ background: firstColor }}>{initial}</div>
                      <span className="text-[15px] font-semibold" style={{ color: "#111827" }}>{brandName.trim() || "Your brand"}</span>
                    </div>
                    <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>DRAFT</span>
                  </div>

                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#9CA3AF", letterSpacing: "0.06em" }}>SELECTED PALETTE</p>
                    <div className="flex gap-2">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="rounded-lg" style={{ width: 60, height: 60, background: customColors[i] || "#E5E7EB" }} />
                      ))}
                    </div>
                  </div>

                  {generated && aiContent ? (
                    <div>
                      <h4 className="text-[20px] font-bold" style={{ color: "#111827", fontFamily: typography.includes("serif") ? "Georgia, serif" : "Inter, sans-serif" }}>{brandName}</h4>
                      <p className="text-[13px] mt-2" style={{ color: "#374151" }}>{(aiContent.voice_and_tone as any)?.sample_taglines?.[0] ?? (aiContent.brand_overview as any)?.unique_value_proposition ?? ""}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="skel" style={{ width: "60%", height: 14 }} />
                      <div className="skel" style={{ width: "90%", height: 10 }} />
                      <div className="skel" style={{ width: "75%", height: 10 }} />
                    </div>
                  )}

                  {!generating && !generated && (
                    <p className="text-[12px] text-center mt-4" style={{ color: "#9CA3AF" }}>Fill in your brand and hit Generate to materialize the full brandbook.</p>
                  )}
                </div>

                {generated && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formats.map(id => {
                      const f = EXPORT_FORMATS.find(x => x.id === id);
                      if (!f) return null;
                      const Icon = f.icon;
                      return (
                        <button key={id} type="button" onClick={() => handleExport(id)} className="px-4 py-2 rounded-lg flex items-center gap-2 text-[13px] text-white transition-colors" style={{ background: "#1C2128", border: "1px solid #00C9A7" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,201,167,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#1C2128"; }}>
                          <Icon size={16} style={{ color: "#00C9A7" }} />
                          {f.name} Export
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

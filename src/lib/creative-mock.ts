// Mock generators for Creative Engine (Phase 1 — UI shell)
export async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function mockEnhancePrompt(text: string, action: "Enhance" | "Rewrite" | "Expand" | "Shorten") {
  await delay(700);
  const base = text.trim() || "Describe your idea";
  switch (action) {
    case "Enhance":
      return `${base} — refined for clarity, platform fit, and brand voice. Highlights the core benefit, adds a sharp hook, and ends with a confident call to action.`;
    case "Rewrite":
      return `Reimagined: ${base}. Same intent, fresh angle, sharper rhythm.`;
    case "Expand":
      return `${base}. Expanded with audience context, three concrete benefits, a proof point, and a closing CTA tuned to the selected platform.`;
    case "Shorten":
      return base.split(/[.!?]/)[0].slice(0, 120).trim() + ".";
  }
}

export async function mockSeoKeywords(q: string) {
  await delay(250);
  if (!q.trim()) return [];
  const seeds = ["strategy", "guide", "tips", "trends", "2026", "for startups", "for ecommerce", "checklist", "ai", "automation"];
  return seeds.map((s, i) => ({
    keyword: `${q} ${s}`,
    volume: Math.round(800 + Math.random() * 12000),
    competition: ["Low", "Medium", "High"][i % 3],
  }));
}

export async function mockGenerate(kind: string, _input: unknown) {
  await delay(1400);
  return {
    id: crypto.randomUUID(),
    kind,
    createdAt: new Date().toISOString(),
  };
}

export async function mockCritique() {
  await delay(400);
  return {
    hookStrength: +(7.5 + Math.random() * 2).toFixed(1),
    brandVoiceMatch: Math.round(88 + Math.random() * 10),
    predictedCtr: +(2.4 + Math.random() * 2).toFixed(1),
    benchmark: 2.1,
    readabilityGrade: Math.round(7 + Math.random() * 3),
    seoScore: Math.round(72 + Math.random() * 25),
    optimizationTip: "Tighten the opening line and lead with the strongest benefit for mobile previews.",
  };
}

export const COLOR_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Indigo Pulse", colors: ["#4f46e5", "#7c3aed", "#0ea5e9", "#f8fafc"] },
  { name: "Sunset Blaze", colors: ["#ff6b35", "#f7931e", "#e84393", "#6c5ce7"] },
  { name: "Forest Deep", colors: ["#1a3c2a", "#2d5a3d", "#5a8a5c", "#a0c49d"] },
  { name: "Noir Gold", colors: ["#0d0d0d", "#1a1a1a", "#c9a84c", "#f0d78c"] },
  { name: "Ocean Deep", colors: ["#0c2340", "#1a4a6e", "#2d8a9e", "#5cbdb9"] },
  { name: "Terracotta", colors: ["#c4654a", "#e8a87c", "#87a878", "#4a6741"] },
  { name: "Cherry Blossom", colors: ["#fef0f5", "#f8c8d8", "#e88aab", "#c45c7c"] },
  { name: "Midnight Indigo", colors: ["#0a0a1a", "#141432", "#1e1e5a", "#4f46e5"] },
  { name: "Neon Mint", colors: ["#0d1b2a", "#1b4332", "#2dd4a8", "#73ffb8"] },
  { name: "Paper Ink", colors: ["#f5f3ee", "#e8e4dd", "#2d2d2d", "#0d0d0d"] },
  { name: "Arctic Frost", colors: ["#e8f0f8", "#b8d4e8", "#6ba3c8", "#2e6b8a"] },
  { name: "Autumn Harvest", colors: ["#5c2018", "#9b4423", "#d4842a", "#e8b84a"] },
  { name: "Sky Peach", colors: ["#e0f2fe", "#7dd3fc", "#fecaca", "#f9a8a8"] },
  { name: "Slate Steel", colors: ["#2d3748", "#4a5568", "#718096", "#a0aec0"] },
  { name: "Emerald Prestige", colors: ["#064e3b", "#0d7a5f", "#c9a84c", "#f5f0e0"] },
  { name: "Vapor Chrome", colors: ["#c4b5fd", "#818cf8", "#67e8f9", "#a5f3fc"] },
  { name: "Burnt Sienna", colors: ["#6b3a2a", "#a0522d", "#cd7f32", "#e8c07a"] },
  { name: "Sage Cream", colors: ["#f5f0e8", "#dce5d4", "#a8c0a0", "#7d9b76"] },
  { name: "Brutalist Pop", colors: ["#ffffff", "#0a0a0a", "#ff5722", "#ffeb3b"] },
  { name: "Navy Trust", colors: ["#0f1b3d", "#1e3a5f", "#3b6fa0", "#e8edf3"] },
];

export const PLATFORMS = [
  "Facebook", "Instagram", "LinkedIn", "YouTube", "X (Twitter)", "TikTok",
  "Pinterest", "Snapchat", "Threads", "Behance", "Google Ads", "Display Network",
];

export const TONE_PRESETS = ["Premium", "Corporate", "Luxury", "Creative"];

export const ASPECT_RATIOS = [
  { label: "Auto", value: "auto" },
  { label: "1:1", value: "1:1" },
  { label: "4:5", value: "4:5" },
  { label: "9:16", value: "9:16" },
  { label: "16:9", value: "16:9" },
  { label: "3:4", value: "3:4" },
  { label: "4:3", value: "4:3" },
  { label: "3:2", value: "3:2" },
  { label: "2:3", value: "2:3" },
  { label: "5:4", value: "5:4" },
  { label: "21:9", value: "21:9" },
  { label: "Custom", value: "custom" },
];

export const LANGUAGES = [
  "English", "Bangla", "Hindi", "Arabic", "Spanish", "French", "German",
  "Japanese", "Chinese", "Portuguese", "Russian", "Italian", "Korean", "Turkish",
];

export const BLOG_TOPICS = [
  "Digital Marketing", "Social Media Marketing", "AI & Technology", "Business Growth",
  "Startup & Entrepreneurship", "E-commerce", "Branding & Advertising", "Content Marketing",
  "SEO & Keywords", "Email Marketing", "Influencer Marketing", "Finance & Investment",
  "Education & E-learning", "Health & Wellness", "Fitness & Lifestyle", "Fashion & Beauty",
  "Food & Restaurant", "Travel & Tourism", "Real Estate", "Personal Development",
  "Productivity & Career", "Gaming & Entertainment", "Photography & Design",
  "Software & SaaS", "Web Development", "Mobile Apps", "Cybersecurity",
  "Cryptocurrency & Blockchain", "News & Trends", "Product Reviews", "Case Studies",
  "How-To Guides", "Tutorials", "Event & Festival", "Sustainability & Environment",
  "Parenting & Family", "Pets & Animals", "Automotive", "Sports & Fitness",
  "Local Business Promotion",
];

export const WRITING_STYLES = [
  "Informative", "Professional", "Conversational", "Technical", "Storytelling",
  "Persuasive", "Educational", "Analytical", "Creative", "Friendly", "Formal",
  "Casual", "Motivational", "Authoritative", "SEO-Optimized",
];

export const INDUSTRIES = [
  "Digital Marketing", "E-commerce", "Technology & Software", "Artificial Intelligence",
  "Health & Fitness", "Fashion & Clothing", "Education & EdTech", "Finance & Investment",
  "Real Estate", "Food & Restaurant", "Travel & Tourism", "Beauty & Skincare",
  "Gaming & Esports", "Business & Entrepreneurship", "SaaS & Startups",
];
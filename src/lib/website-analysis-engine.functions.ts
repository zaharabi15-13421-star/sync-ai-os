import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateObject } from "ai";
import { lovableModel } from "@/lib/ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  websiteUrl: z.string().trim().min(3).max(255).regex(/^(https?:\/\/)?[^\s]+$/i, "Invalid URL"),
  brandName: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(80).optional(),
});

const AnalysisSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    language: z.string().optional(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    rationale: z.string(),
  }),
  colorPalette: z.array(
    z.object({ hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/), role: z.string() })
  ).min(3).max(8),
  ctas: z.array(z.object({ label: z.string(), strength: z.number().min(0).max(100), note: z.string() })).min(1).max(6),
  messagingTone: z.object({
    tone: z.string(),
    descriptors: z.array(z.string()).min(3).max(6),
  }),
  audienceIntent: z.string(),
  brandArchetype: z.object({ name: z.string(), confidence: z.number().min(0).max(100), reasoning: z.string() }),
  positioning: z.string(),
  seo: z.object({ score: z.number().min(0).max(100), strengths: z.array(z.string()), gaps: z.array(z.string()) }),
  uxQuality: z.object({ score: z.number().min(0).max(100), notes: z.string() }),
  accessibility: z.object({ score: z.number().min(0).max(100), notes: z.string() }),
  trustSignals: z.array(z.string()).min(0).max(8),
  socialPresence: z.array(z.object({ platform: z.string(), url: z.string().optional() })).min(0).max(8),
  competitors: z.array(z.object({ name: z.string(), differentiator: z.string() })).min(0).max(5),
  // Auto outputs
  outputs: z.object({
    mission: z.string(),
    vision: z.string(),
    brandStory: z.string(),
    brandVoice: z.string(),
    coreValues: z.array(z.string()).min(3).max(7),
    positioningStatement: z.string(),
    messagingPillars: z.array(z.object({ title: z.string(), description: z.string() })).min(3).max(5),
    valueProposition: z.string(),
    audienceSummary: z.string(),
    taglines: z.array(z.string()).min(3).max(6),
  }),
  overallConfidence: z.number().min(0).max(100),
});

export type DeepAnalysis = z.infer<typeof AnalysisSchema>;

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost") || h === "ip6-localhost") return true;
  if (h === "::1" || h === "::" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true;
  }
  return false;
}

function normalizeUrl(input: string) {
  const t = input.trim();
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("Invalid website URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("URL hostname is not allowed");
  }
  return parsed.toString();
}

async function getActiveCompanyId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("company_members")
    .select("company_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.company_id ?? null;
}

export const analyzeWebsiteDeep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

    const url = normalizeUrl(data.websiteUrl);

    // 1) Firecrawl scrape with branding + summary (REST — SDK is Node-only)
    const fcRes = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "links", "summary", "branding"],
        onlyMainContent: true,
      }),
    });
    if (!fcRes.ok) throw new Error(`Firecrawl error ${fcRes.status}: ${await fcRes.text()}`);
    const scrape: any = await fcRes.json();
    const doc = scrape?.data ?? scrape ?? {};
    const metadata = doc.metadata ?? {};
    const branding = doc.branding ?? {};
    const summary: string = doc.summary ?? "";
    const markdown: string = (doc.markdown ?? "").slice(0, 12000);
    const links: string[] = Array.isArray(doc.links) ? doc.links.slice(0, 60) : [];

    // 2) AI deep analysis via Lovable AI Gateway (shared workspace key)
    const model = lovableModel("google/gemini-2.5-flash");

    const prompt = `You are BrandSync AI's website intelligence engine. Analyze the website data below across 15 dimensions and generate a complete strategic brand output.

URL: ${url}
Brand hint: ${data.brandName ?? "(unknown)"}
Industry hint: ${data.industry ?? "(unknown)"}

METADATA:
${JSON.stringify(metadata).slice(0, 1200)}

FIRECRAWL BRANDING:
${JSON.stringify(branding).slice(0, 2000)}

SUMMARY:
${summary.slice(0, 1500)}

CONTENT (markdown, truncated):
${markdown}

LINKS (sample):
${links.slice(0, 40).join("\n")}

Return a JSON object that matches the provided schema exactly. Be specific, evidence-based, and concise. Use real hex colors from BRANDING when present; otherwise infer from descriptions. Generate mission, vision, story, voice, values, positioning, messaging pillars, value proposition, audience summary, and 3-5 fresh tagline options. Set overallConfidence honestly (0-100) based on data richness.`;

    const { object } = await generateObject({
      model,
      schema: AnalysisSchema,
      prompt,
      temperature: 0.6,
    });

    // 3) Persist a snapshot in website_analysis (best-effort)
    try {
      const companyId = await getActiveCompanyId(supabase, userId);
      if (companyId) {
        await supabase.from("website_analysis").insert({
          company_id: companyId,
          url,
          status: "completed",
          title: metadata.title ?? null,
          description: metadata.description ?? null,
          summary: summary || null,
          markdown: markdown || null,
          links: links,
          branding: branding,
          metadata: { ...metadata, deepAnalysis: object },
          analyzed_at: new Date().toISOString(),
        });
      }
    } catch {
      // non-fatal
    }

    return { ok: true, analysis: object, scrapedAt: new Date().toISOString(), url };
  });

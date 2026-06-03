import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getActiveCompanyId(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("company_members")
    .select("company_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No company found for user");
  return data.company_id as string;
}

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost") || h === "ip6-localhost") return true;
  // IPv6 loopback / unspecified / link-local
  if (h === "::1" || h === "::" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  // IPv4 ranges
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true; // multicast/reserved
  }
  return false;
}

function normalizeUrl(input: string): string {
  const t = input.trim();
  if (!t) return t;
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

export const getLatestWebsiteAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getActiveCompanyId(supabase, userId);
    const { data, error } = await supabase
      .from("website_analysis")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { analysis: data ?? null };
  });

const AnalyzeInput = z.object({
  websiteUrl: z.string().trim().min(1).max(255).regex(/^(https?:\/\/)?[^\s]+$/i, "Invalid URL").optional(),
});

export const analyzeWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => AnalyzeInput.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

    const companyId = await getActiveCompanyId(supabase, userId);

    let url = data.websiteUrl ? normalizeUrl(data.websiteUrl) : "";
    if (!url) {
      const { data: company } = await supabase
        .from("companies")
        .select("website_url")
        .eq("id", companyId)
        .maybeSingle();
      url = normalizeUrl(company?.website_url ?? "");
    }
    if (!url) throw new Error("No website URL configured. Set it in Brand DNA first.");

    const started = Date.now();
    let inserted: any = null;
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
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
      if (!res.ok) throw new Error(`Firecrawl error ${res.status}: ${await res.text()}`);
      const result: any = await res.json();
      const doc = result?.data ?? result ?? {};
      const metadata = doc.metadata ?? {};
      const payload = {
        company_id: companyId,
        url,
        status: "completed",
        title: metadata.title ?? null,
        description: metadata.description ?? null,
        summary: doc.summary ?? null,
        markdown: typeof doc.markdown === "string" ? doc.markdown.slice(0, 200000) : null,
        links: Array.isArray(doc.links) ? doc.links.slice(0, 500) : [],
        branding: doc.branding ?? {},
        metadata,
        screenshot_url: typeof doc.screenshot === "string" && doc.screenshot.startsWith("http") ? doc.screenshot : null,
        error: null,
        analyzed_at: new Date().toISOString(),
      };

      const { data: row, error: insErr } = await supabase
        .from("website_analysis")
        .insert(payload)
        .select("*")
        .maybeSingle();
      if (insErr) throw new Error(insErr.message);
      inserted = row;

      await supabase
        .from("connected_sources")
        .upsert({
          company_id: companyId,
          platform: "website",
          status: "connected",
          external_account_label: url,
          last_synced_at: new Date().toISOString(),
          last_error: null,
        }, { onConflict: "company_id,platform" });

      await supabase.from("sync_logs").insert({
        company_id: companyId,
        platform: "website",
        status: "ok",
        message: `Firecrawl scrape complete (${(doc.markdown ?? "").length} chars)`,
        finished_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
      });

      return { ok: true, analysis: inserted };
    } catch (e: any) {
      const message = e?.message ?? "Website analysis failed";
      await supabase.from("website_analysis").insert({
        company_id: companyId,
        url,
        status: "failed",
        error: message,
      });
      await supabase.from("sync_logs").insert({
        company_id: companyId,
        platform: "website",
        status: "error",
        message,
        finished_at: new Date().toISOString(),
        duration_ms: Date.now() - started,
      });
      await supabase.from("api_errors").insert({
        company_id: companyId,
        platform: "website",
        endpoint: "firecrawl.scrape",
        error_message: message,
      });
      throw new Error(message);
    }
  });

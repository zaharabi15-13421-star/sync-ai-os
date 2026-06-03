import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export type ExistingBrandSnapshot = {
  company: {
    id: string;
    name: string;
    industry: string | null;
    website_url: string | null;
    employee_size: string | null;
  } | null;
  identity: {
    target_audience: string | null;
    business_location: string | null;
    brand_goal: string | null;
  } | null;
  websiteAnalysis: {
    url: string;
    title: string | null;
    description: string | null;
    summary: string | null;
    branding: any;
    metadata: any;
    screenshot_url: string | null;
    analyzed_at: string | null;
    status: string;
  } | null;
  connectedSources: Array<{
    platform: string;
    status: string;
    label: string | null;
    last_synced_at: string | null;
  }>;
  signals: {
    hasLogo: boolean;
    paletteCount: number;
    fontCount: number;
    linksCount: number;
    confidence: number;
  };
};

export const fetchExistingBrand = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ExistingBrandSnapshot> => {
    const { supabase, userId } = context as any;
    const companyId = await getActiveCompanyId(supabase, userId);

    const empty: ExistingBrandSnapshot = {
      company: null,
      identity: null,
      websiteAnalysis: null,
      connectedSources: [],
      signals: { hasLogo: false, paletteCount: 0, fontCount: 0, linksCount: 0, confidence: 0 },
    };
    if (!companyId) return empty;

    const [companyRes, identityRes, analysisRes, sourcesRes] = await Promise.all([
      supabase.from("companies").select("id,name,industry,website_url,employee_size").eq("id", companyId).maybeSingle(),
      supabase.from("brand_identity").select("target_audience,business_location,brand_goal").eq("company_id", companyId).maybeSingle(),
      supabase
        .from("website_analysis")
        .select("url,title,description,summary,branding,metadata,screenshot_url,analyzed_at,status,links")
        .eq("company_id", companyId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("connected_sources")
        .select("platform,status,external_account_label,last_synced_at")
        .eq("company_id", companyId)
        .order("updated_at", { ascending: false })
        .limit(20),
    ]);

    const branding = analysisRes.data?.branding ?? {};
    const palette = branding?.colors
      ? Object.values(branding.colors).filter((v: any) => typeof v === "string" && v.startsWith("#"))
      : [];
    const fonts = Array.isArray(branding?.fonts) ? branding.fonts : [];
    const linksCount = Array.isArray(analysisRes.data?.links) ? analysisRes.data.links.length : 0;
    const hasLogo = !!(branding?.logo || branding?.images?.logo);

    let confidence = 10;
    if (companyRes.data?.name) confidence += 10;
    if (companyRes.data?.industry) confidence += 8;
    if (identityRes.data?.target_audience) confidence += 12;
    if (analysisRes.data) confidence += 25;
    if (palette.length >= 3) confidence += 12;
    if (fonts.length >= 1) confidence += 8;
    if (hasLogo) confidence += 8;
    if ((sourcesRes.data?.length ?? 0) > 0) confidence += 7;
    confidence = Math.min(98, confidence);

    return {
      company: companyRes.data
        ? {
            id: companyRes.data.id,
            name: companyRes.data.name,
            industry: companyRes.data.industry ?? null,
            website_url: companyRes.data.website_url ?? null,
            employee_size: companyRes.data.employee_size ?? null,
          }
        : null,
      identity: identityRes.data
        ? {
            target_audience: identityRes.data.target_audience ?? null,
            business_location: identityRes.data.business_location ?? null,
            brand_goal: identityRes.data.brand_goal ?? null,
          }
        : null,
      websiteAnalysis: analysisRes.data
        ? {
            url: analysisRes.data.url,
            title: analysisRes.data.title ?? null,
            description: analysisRes.data.description ?? null,
            summary: analysisRes.data.summary ?? null,
            branding: analysisRes.data.branding ?? {},
            metadata: analysisRes.data.metadata ?? {},
            screenshot_url: analysisRes.data.screenshot_url ?? null,
            analyzed_at: analysisRes.data.analyzed_at ?? null,
            status: analysisRes.data.status,
          }
        : null,
      connectedSources: (sourcesRes.data ?? []).map((s: any) => ({
        platform: s.platform,
        status: s.status,
        label: s.external_account_label ?? null,
        last_synced_at: s.last_synced_at ?? null,
      })),
      signals: {
        hasLogo,
        paletteCount: palette.length,
        fontCount: fonts.length,
        linksCount,
        confidence,
      },
    };
  });

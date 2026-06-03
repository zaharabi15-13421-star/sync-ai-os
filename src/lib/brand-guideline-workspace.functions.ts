import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const WorkspaceFormSchema = z.object({
  brandName: z.string().max(160).default(""),
  slogan: z.string().max(240).default(""),
  industry: z.string().max(120).default(""),
  websiteUrl: z.string().max(500).default(""),
  description: z.string().max(2000).default(""),
  region: z.string().max(120).default("Global"),
  logoDataUrl: z.string().max(1500000).default(""),
});

const SaveWorkspaceSchema = z.object({
  mode: z.enum(["existing", "new"]),
  form: WorkspaceFormSchema,
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(8),
  exportFormat: z.string().max(40).default("pdf"),
  guideline: z.any().nullable().optional(),
  websiteAnalysis: z.any().nullable().optional(),
  phase: z.enum(["idle", "running", "done"]).default("idle"),
  confidence: z.number().int().min(0).max(100).default(0),
});

export type BrandGuidelineWorkspace = z.infer<typeof SaveWorkspaceSchema> & {
  updatedAt: string | null;
};

async function getActiveCompanyId(supabase: any, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("company_members")
    .select("company_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.company_id ?? null;
}

function mapWorkspace(row: any): BrandGuidelineWorkspace {
  return {
    mode: row.mode === "existing" ? "existing" : "new",
    form: WorkspaceFormSchema.parse(row.form ?? {}),
    colors: Array.isArray(row.colors) ? row.colors.filter((c: unknown) => typeof c === "string" && /^#[0-9A-Fa-f]{6}$/.test(c)).slice(0, 8) : [],
    exportFormat: typeof row.export_format === "string" ? row.export_format : "pdf",
    guideline: row.guideline ?? null,
    websiteAnalysis: row.website_analysis ?? null,
    phase: row.phase === "done" ? "done" : "idle",
    confidence: typeof row.confidence === "number" ? Math.max(0, Math.min(100, row.confidence)) : 0,
    updatedAt: row.updated_at ?? null,
  };
}

export const getBrandGuidelineWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getActiveCompanyId(supabase, userId);
    if (!companyId) return { workspace: null };

    const db = supabase as any;
    const { data, error } = await db
      .from("brand_guideline_workspaces")
      .select("mode,form,colors,export_format,guideline,website_analysis,phase,confidence,updated_at")
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { workspace: data ? mapWorkspace(data) : null };
  });

export const saveBrandGuidelineWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveWorkspaceSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const companyId = await getActiveCompanyId(supabase, userId);
    if (!companyId) throw new Error("No company found for user");

    const db = supabase as any;
    const { data: row, error } = await db
      .from("brand_guideline_workspaces")
      .upsert({
        company_id: companyId,
        mode: data.mode,
        form: data.form,
        colors: data.colors,
        export_format: data.exportFormat,
        guideline: data.guideline ?? null,
        website_analysis: data.websiteAnalysis ?? null,
        phase: data.phase === "running" ? "idle" : data.phase,
        confidence: data.confidence,
        updated_by: userId,
      }, { onConflict: "company_id" })
      .select("mode,form,colors,export_format,guideline,website_analysis,phase,confidence,updated_at")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { ok: true, workspace: row ? mapWorkspace(row) : null };
  });
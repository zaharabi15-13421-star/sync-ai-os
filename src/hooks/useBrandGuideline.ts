import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;
import {
  generatePDF,
  generatePPTX,
  generateDOCX,
  type BrandContent,
} from "@/services/fileGenerationService";
import { generateBrandGuideline } from "@/lib/brand-guideline.functions";

export type GenerationStatus =
  | "idle"
  | "saving"
  | "generating_ai"
  | "generating_files"
  | "completed"
  | "error";

export interface GeneratedFile {
  format: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  blob?: Blob;
  error?: string;
}

export interface BrandFormData {
  brandName: string;
  slogan?: string;
  industry: string;
  region: string;
  website?: string;
  logoDataUrl?: string;
  shortDescription: string;
  colorPreference?: unknown;
  brandStage?: string;
  primaryAudience?: string;
  countries?: string[];
  brandVoiceTone?: string[];
  communicationStyle?: string;
  brandPersonalityArchetype?: string;
  brandKeywords?: string[];
  typography?: string;
  brandPositioning?: string;
  competitorBrand?: string;
  brandAdmire?: string;
  selectedFormats: string[];
}

const STEPS = [
  "Analyzing Brand DNA",
  "Detecting Audience",
  "Building Strategy",
  "Creating Visual Identity",
  "Generating Slides",
  "Finalizing Export",
] as const;

const dataUrlToBlob = (dataUrl: string): { blob: Blob; ext: string } | null => {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const mime = m[1];
  const bin = atob(m[2]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const ext = mime.includes("png") ? "png" : mime.includes("svg") ? "svg" : mime.includes("jpeg") ? "jpg" : "bin";
  return { blob: new Blob([arr], { type: mime }), ext };
};

export function useBrandGuideline() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [guidelineId, setGuidelineId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<BrandContent | null>(null);
  const guidelineIdRef = useRef<string | null>(null);

  const generateFn = useServerFn(generateBrandGuideline);

  const generate = async (formData: BrandFormData) => {
    setStatus("saving");
    setError(null);
    setProgress(5);
    setCurrentStep(0);
    setGeneratedFiles([]);
    setAiContent(null);
    guidelineIdRef.current = null;
    setGuidelineId(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;

      // Authed users: persist logo + guideline row. Guests: skip persistence entirely.
      let logoUrl: string | null = null;
      let rowId: string | null = null;

      if (user) {
        if (formData.logoDataUrl) {
          const decoded = dataUrlToBlob(formData.logoDataUrl);
          if (decoded) {
            const path = `${user.id}/logos/${Date.now()}.${decoded.ext}`;
            const { error: upErr } = await supabase.storage
              .from("brand-guidelines")
              .upload(path, decoded.blob, { contentType: decoded.blob.type, upsert: true });
            if (!upErr) {
              const { data: signed } = await supabase.storage
                .from("brand-guidelines")
                .createSignedUrl(path, 60 * 60 * 24 * 30);
              logoUrl = signed?.signedUrl ?? null;
            }
          }
        }

        const { data: row, error: insertErr } = await supabase
          .from("brand_guidelines")
          .insert({
            user_id: user.id,
            brand_name: formData.brandName,
            slogan: formData.slogan || null,
            industry: formData.industry,
            region: formData.region,
            website: formData.website || null,
            logo_url: logoUrl,
            short_description: formData.shortDescription,
            color_preference: (formData.colorPreference as any) ?? null,
            brand_stage: formData.brandStage || null,
            primary_audience: formData.primaryAudience || null,
            countries: formData.countries ?? [],
            brand_voice_tone: formData.brandVoiceTone ?? [],
            communication_style: formData.communicationStyle || null,
            brand_personality_archetype: formData.brandPersonalityArchetype || null,
            brand_keywords: formData.brandKeywords ?? [],
            typography: formData.typography || null,
            brand_positioning: formData.brandPositioning || null,
            competitor_brand: formData.competitorBrand || null,
            brand_admire: formData.brandAdmire || null,
            selected_export_formats: formData.selectedFormats,
            status: "processing",
          })
          .select("id")
          .single();

        if (insertErr || !row) throw new Error(insertErr?.message ?? "Failed to save brand data");
        rowId = row.id;
        guidelineIdRef.current = rowId;
        setGuidelineId(rowId);
      }

      // AI generation through the TanStack server function (works for both authed and guests).
      setStatus("generating_ai");
      setCurrentStep(1);
      setProgress(15);

      const brief = {
        brand_name: formData.brandName,
        slogan: formData.slogan ?? null,
        industry: formData.industry,
        region: formData.region,
        countries: formData.countries ?? [],
        website: formData.website ?? null,
        short_description: formData.shortDescription,
        brand_stage: formData.brandStage ?? null,
        primary_audience: formData.primaryAudience ?? null,
        brand_voice_tone: formData.brandVoiceTone ?? [],
        communication_style: formData.communicationStyle ?? null,
        brand_personality_archetype: formData.brandPersonalityArchetype ?? null,
        brand_keywords: formData.brandKeywords ?? [],
        typography: formData.typography ?? null,
        color_preference: (formData.colorPreference as any) ?? null,
        brand_positioning: formData.brandPositioning ?? null,
        competitor_brand: formData.competitorBrand ?? null,
        brand_admire: formData.brandAdmire ?? null,
      };

      const result = await generateFn({ data: { brief } });
      const content = result.content as BrandContent;
      setAiContent(content);

      if (user && rowId) {
        await supabase
          .from("brand_guidelines")
          .update({ ai_generated_content: content as any })
          .eq("id", rowId);
      }

      setCurrentStep(3);
      setProgress(55);

      // Client-side file generation.
      setStatus("generating_files");
      setCurrentStep(4);
      setProgress(65);

      const inputs = {
        brandName: formData.brandName,
        slogan: formData.slogan,
        industry: formData.industry,
        colorPalette: (content.visual_identity as any)?.color_palette,
      };

      const selected = formData.selectedFormats;
      const docFormats = selected.filter((f) => f === "pdf" || f === "pptx" || f === "docx");
      const totalDoc = Math.max(1, docFormats.length);
      let done = 0;

      const buildFile = async (
        blob: Blob,
        format: string,
        ext: string,
        mime: string,
      ): Promise<GeneratedFile> => {
        const safeName = formData.brandName.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "brand";
        const fileName = `${safeName}-brand-guideline.${ext}`;
        let storagePath = "";
        let fileUrl = "";

        if (user && rowId) {
          storagePath = `${user.id}/guidelines/${rowId}/${fileName}`;
          const { error: upErr } = await supabase.storage
            .from("brand-guidelines")
            .upload(storagePath, blob, { contentType: mime, upsert: true });
          if (!upErr) {
            const { data: signed } = await supabase.storage
              .from("brand-guidelines")
              .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
            fileUrl = signed?.signedUrl ?? "";

            await supabase.from("brand_guideline_files").insert({
              guideline_id: rowId,
              user_id: user.id,
              format,
              file_name: fileName,
              file_url: fileUrl,
              file_size_bytes: blob.size,
              storage_path: storagePath,
              status: "ready",
            });
          }
        }

        done++;
        setProgress(65 + Math.round((done / totalDoc) * 30));
        return { format, fileName, fileUrl, storagePath, blob };
      };

      const files: GeneratedFile[] = [];

      const tryFormat = async (id: string, gen: () => Promise<Blob>, ext: string, mime: string) => {
        try {
          const blob = await gen();
          files.push(await buildFile(blob, id, ext, mime));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Generation failed";
          // eslint-disable-next-line no-console
          console.error(`${id} export failed:`, e);
          files.push({ format: id, fileName: "", fileUrl: "", storagePath: "", error: msg });
          if (user && rowId) {
            await supabase.from("brand_guideline_files").insert({
              guideline_id: rowId,
              user_id: user.id,
              format: id,
              file_name: "",
              file_url: "",
              storage_path: "",
              status: "failed",
              error_message: msg,
            });
          }
        }
      };

      if (selected.includes("pdf"))
        await tryFormat("pdf", () => generatePDF(content, inputs), "pdf", "application/pdf");
      if (selected.includes("pptx"))
        await tryFormat(
          "pptx",
          () => generatePPTX(content, inputs),
          "pptx",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        );
      if (selected.includes("docx"))
        await tryFormat(
          "docx",
          () => generateDOCX(content, inputs),
          "docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );

      setCurrentStep(5);
      setProgress(98);

      if (user && rowId) {
        await supabase
          .from("brand_guidelines")
          .update({ status: "completed" })
          .eq("id", rowId);
      }

      setGeneratedFiles(files);
      setProgress(100);
      setStatus("completed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
      setStatus("error");
      if (guidelineIdRef.current) {
        await supabase
          .from("brand_guidelines")
          .update({ status: "failed", error_message: msg })
          .eq("id", guidelineIdRef.current);
      }
    }
  };

  const downloadFile = (file: GeneratedFile) => {
    if (file.blob) {
      saveAs(file.blob, file.fileName);
    } else if (file.fileUrl) {
      window.open(file.fileUrl, "_blank");
    }
  };

  const downloadAll = () => {
    generatedFiles.forEach((f, i) => setTimeout(() => downloadFile(f), i * 500));
  };

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setCurrentStep(-1);
    setGeneratedFiles([]);
    setGuidelineId(null);
    setError(null);
    setAiContent(null);
    guidelineIdRef.current = null;
  };

  return {
    status,
    progress,
    currentStep,
    steps: STEPS as readonly string[],
    generatedFiles,
    error,
    aiContent,
    guidelineId,
    generate,
    downloadFile,
    downloadAll,
    reset,
  };
}

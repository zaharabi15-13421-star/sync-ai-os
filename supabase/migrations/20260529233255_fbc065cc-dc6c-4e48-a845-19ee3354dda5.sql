-- Brand guidelines table
CREATE TABLE public.brand_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  slogan text,
  industry text NOT NULL,
  region text NOT NULL,
  website text,
  logo_url text,
  short_description text NOT NULL,
  color_preference jsonb,
  brand_stage text,
  primary_audience text,
  countries jsonb,
  brand_voice_tone jsonb,
  communication_style text,
  brand_personality_archetype text,
  brand_keywords jsonb,
  typography text,
  brand_positioning text,
  competitor_brand text,
  brand_admire text,
  selected_export_formats jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  ai_generated_content jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_guidelines TO authenticated;
GRANT ALL ON public.brand_guidelines TO service_role;

ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_guidelines_select_own" ON public.brand_guidelines
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "brand_guidelines_insert_own" ON public.brand_guidelines
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_guidelines_update_own" ON public.brand_guidelines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_guidelines_delete_own" ON public.brand_guidelines
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER brand_guidelines_set_updated_at
  BEFORE UPDATE ON public.brand_guidelines
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Brand guideline files table
CREATE TABLE public.brand_guideline_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id uuid NOT NULL REFERENCES public.brand_guidelines(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format text NOT NULL CHECK (format IN ('pdf','pptx','docx','web','portal','social')),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes bigint,
  storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','generating','ready','failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_guideline_files TO authenticated;
GRANT ALL ON public.brand_guideline_files TO service_role;

ALTER TABLE public.brand_guideline_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_guideline_files_select_own" ON public.brand_guideline_files
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "brand_guideline_files_insert_own" ON public.brand_guideline_files
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_guideline_files_update_own" ON public.brand_guideline_files
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_guideline_files_delete_own" ON public.brand_guideline_files
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-guidelines', 'brand-guidelines', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "brand_guidelines_storage_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-guidelines' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "brand_guidelines_storage_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'brand-guidelines' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "brand_guidelines_storage_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'brand-guidelines' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "brand_guidelines_storage_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brand-guidelines' AND auth.uid()::text = (storage.foldername(name))[1]);
ALTER TABLE public.google_connections
  ADD COLUMN IF NOT EXISTS connection_source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS website_url text;

-- Constrain to a known set of sources.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'google_connections_source_check'
  ) THEN
    ALTER TABLE public.google_connections
      ADD CONSTRAINT google_connections_source_check
      CHECK (connection_source IN ('brand_dna', 'brand_intelligence', 'manual'));
  END IF;
END $$;
-- GA4 / Brand Intelligence backend tables

-- 1) google_connections: one per company; stores OAuth tokens (refresh token encrypted at the app layer).
CREATE TABLE public.google_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL UNIQUE,
  google_user_email text,
  google_user_id text,
  scopes text[] NOT NULL DEFAULT '{}',
  access_token text,
  access_token_expires_at timestamptz,
  refresh_token_ciphertext text,
  refresh_token_iv text,
  status text NOT NULL DEFAULT 'connected',
  last_error text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_connections TO authenticated;
GRANT ALL ON public.google_connections TO service_role;
ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY gc_select ON public.google_connections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = google_connections.company_id AND m.user_id = auth.uid()));
CREATE POLICY gc_modify ON public.google_connections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM companies c WHERE c.id = google_connections.company_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM companies c WHERE c.id = google_connections.company_id AND c.owner_id = auth.uid()));
CREATE TRIGGER tg_google_connections_uat BEFORE UPDATE ON public.google_connections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2) ga4_properties: discovered properties per company
CREATE TABLE public.ga4_properties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  property_id text NOT NULL,
  account_id text,
  display_name text,
  default_uri text,
  currency_code text,
  time_zone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, property_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ga4_properties TO authenticated;
GRANT ALL ON public.ga4_properties TO service_role;
ALTER TABLE public.ga4_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY gp_select ON public.ga4_properties FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = ga4_properties.company_id AND m.user_id = auth.uid()));
CREATE POLICY gp_modify ON public.ga4_properties FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM companies c WHERE c.id = ga4_properties.company_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM companies c WHERE c.id = ga4_properties.company_id AND c.owner_id = auth.uid()));

-- 3) ga4_property_mappings: which property is active per company (1:1)
CREATE TABLE public.ga4_property_mappings (
  company_id uuid NOT NULL PRIMARY KEY,
  property_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ga4_property_mappings TO authenticated;
GRANT ALL ON public.ga4_property_mappings TO service_role;
ALTER TABLE public.ga4_property_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY gpm_select ON public.ga4_property_mappings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = ga4_property_mappings.company_id AND m.user_id = auth.uid()));
CREATE POLICY gpm_modify ON public.ga4_property_mappings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM companies c WHERE c.id = ga4_property_mappings.company_id AND c.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM companies c WHERE c.id = ga4_property_mappings.company_id AND c.owner_id = auth.uid()));
CREATE TRIGGER tg_ga4_property_mappings_uat BEFORE UPDATE ON public.ga4_property_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) analytics_snapshots: rolled-up KPIs for a period
CREATE TABLE public.analytics_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  property_id text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  granularity text NOT NULL DEFAULT 'daily',
  totals jsonb NOT NULL DEFAULT '{}',
  traffic_sources jsonb NOT NULL DEFAULT '[]',
  channels jsonb NOT NULL DEFAULT '[]',
  countries jsonb NOT NULL DEFAULT '[]',
  devices jsonb NOT NULL DEFAULT '[]',
  age jsonb NOT NULL DEFAULT '[]',
  gender jsonb NOT NULL DEFAULT '[]',
  top_pages jsonb NOT NULL DEFAULT '[]',
  keywords jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, property_id, period_start, period_end, granularity)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_snapshots TO authenticated;
GRANT ALL ON public.analytics_snapshots TO service_role;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY as_select ON public.analytics_snapshots FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = analytics_snapshots.company_id AND m.user_id = auth.uid()));
CREATE POLICY as_modify ON public.analytics_snapshots FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = analytics_snapshots.company_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = analytics_snapshots.company_id AND m.user_id = auth.uid()));

-- 5) analytics_history: daily rows for trend/forecast
CREATE TABLE public.analytics_history (
  company_id uuid NOT NULL,
  property_id text NOT NULL,
  date date NOT NULL,
  sessions integer NOT NULL DEFAULT 0,
  users integer NOT NULL DEFAULT 0,
  new_users integer NOT NULL DEFAULT 0,
  returning_users integer NOT NULL DEFAULT 0,
  bounce_rate numeric(6,3) NOT NULL DEFAULT 0,
  avg_session_duration numeric(8,2) NOT NULL DEFAULT 0,
  pages_per_session numeric(6,2) NOT NULL DEFAULT 0,
  engagement_rate numeric(6,3) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, property_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_history TO authenticated;
GRANT ALL ON public.analytics_history TO service_role;
ALTER TABLE public.analytics_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY ah_select ON public.analytics_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = analytics_history.company_id AND m.user_id = auth.uid()));
CREATE POLICY ah_modify ON public.analytics_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = analytics_history.company_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = analytics_history.company_id AND m.user_id = auth.uid()));

-- 6) audience_insights: denormalized audience breakdowns
CREATE TABLE public.audience_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  property_id text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, property_id, period_start, period_end)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audience_insights TO authenticated;
GRANT ALL ON public.audience_insights TO service_role;
ALTER TABLE public.audience_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_select ON public.audience_insights FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = audience_insights.company_id AND m.user_id = auth.uid()));
CREATE POLICY ai_modify ON public.audience_insights FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = audience_insights.company_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = audience_insights.company_id AND m.user_id = auth.uid()));

-- 7) predictions: forecast outputs
CREATE TABLE public.predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  property_id text NOT NULL,
  metric text NOT NULL,
  horizon_days integer NOT NULL,
  model text NOT NULL,
  mape numeric(8,4),
  rmse numeric(12,4),
  series jsonb NOT NULL DEFAULT '[]',
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, property_id, metric, horizon_days)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictions TO authenticated;
GRANT ALL ON public.predictions TO service_role;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY pr_select ON public.predictions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = predictions.company_id AND m.user_id = auth.uid()));
CREATE POLICY pr_modify ON public.predictions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = predictions.company_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = predictions.company_id AND m.user_id = auth.uid()));

-- 8) recommendations: AI-generated insights
CREATE TABLE public.recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  property_id text,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  confidence numeric(4,3) DEFAULT 0.7,
  metadata jsonb NOT NULL DEFAULT '{}',
  generated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rc_select ON public.recommendations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = recommendations.company_id AND m.user_id = auth.uid()));
CREATE POLICY rc_modify ON public.recommendations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = recommendations.company_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = recommendations.company_id AND m.user_id = auth.uid()));

CREATE INDEX idx_analytics_history_company_date ON public.analytics_history (company_id, date DESC);
CREATE INDEX idx_recommendations_company_kind ON public.recommendations (company_id, kind, generated_at DESC);
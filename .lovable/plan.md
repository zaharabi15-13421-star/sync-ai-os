# Brand Intelligence — GA4 Backend Integration

Frontend stays untouched (TrafficAnalyzer, dashboard.intelligence, GA4Banner). Only data sources, hooks, and a single "Connect Google Analytics" CTA inside the existing GA4Banner are wired up.

## 1. Secrets
Request from user via `add_secret`:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`

Authorized redirect URI to register in Google Cloud Console:
`https://project--a47732b6-32a1-48e9-a06f-f105ebf763d6.lovable.app/api/public/ga/oauth/callback`

## 2. Database (one migration)

Tables (all RLS-scoped to company members via `company_id`):
- `google_connections` — per-company OAuth tokens (encrypted-at-rest column for refresh token), scopes, status, expires_at
- `ga4_properties` — discovered GA4 properties (property_id, display_name, default_uri, account_id, currency, time_zone)
- `ga4_property_mappings` — maps `company_id` → chosen `property_id` (1 active per company)
- `analytics_snapshots` — most-recent rollup (sessions, users, new users, returning, bounce_rate, avg_session_duration, pages_per_session, traffic_source split, country split, device split, age/gender split) keyed by `(company_id, period_start, period_end, granularity)`
- `analytics_history` — daily rows for trend/forecasting (date, sessions, users, new_users, bounce_rate, avg_session_duration, engagement_rate)
- `audience_insights` — denormalized age/gender/device/geo arrays per period
- `predictions` — forecast outputs (horizon, model, MAPE, point + lower + upper bands per future date)
- `recommendations` — RAG output (kind: growth|seo|content|audience|conversion|risk|summary, body, confidence)

Standard GRANTs to `authenticated` + `service_role`. RLS uses `company_members` membership.

## 3. Server functions (`src/lib/ga.functions.ts`, `src/lib/ga.server.ts`)

- `getGoogleAuthUrl({state})` → returns Google OAuth consent URL with scope `analytics.readonly`
- `getConnectionStatus()` → returns connection + selected property + last sync
- `listGa4Properties()` → calls Analytics Admin API, refreshes token if needed, upserts into `ga4_properties`
- `selectGa4Property({propertyId})` → writes `ga4_property_mappings`
- `syncGa4Snapshot({periodDays})` → calls GA4 Data API `runReport` for sessions/users/etc., writes `analytics_snapshots` + appends daily rows to `analytics_history`, recomputes `audience_insights`
- `getAnalyticsForRange({start, end})` → reads snapshot+history (used by TrafficAnalyzer)
- `runForecast({horizonDays})` → Holt-Winters (additive, weekly seasonality) on `analytics_history` for sessions/users/bounce, writes `predictions` with MAPE + 80/95% confidence bands
- `getRecommendations({refresh})` → Lovable AI Gateway (Gemini) over snapshot+history+predictions → writes `recommendations`

`ga.server.ts` holds: token refresh, encrypted token helpers (AES-GCM via Web Crypto using a derived key from `SUPABASE_SERVICE_ROLE_KEY`), GA4 API client, Holt-Winters forecaster, RAG prompt builders.

## 4. OAuth callback route
`src/routes/api/public/ga/oauth/callback.ts` — exchanges `code` → tokens, stores in `google_connections` (looked up by `state` containing signed company_id), redirects user back to `/dashboard/intelligence?ga4=connected`.

## 5. Hourly sync
`src/routes/api/public/hooks/ga4-sync.ts` POST handler that iterates connected companies and re-runs `syncGa4Snapshot` + `runForecast`. Scheduled via pg_cron hourly (insert tool, anon-key auth header).

## 6. Frontend wiring (no design changes)
- `src/hooks/useGa4.ts` — wraps server fns with `useQuery`
- `TrafficAnalyzer.tsx`: replace mock generators (`buildMonthlySeries`, `trafficSplit`, `topCountries`, demographics, predictive) with real data when `useGa4()` returns connected + synced; otherwise keep current deterministic mock so the UI never goes blank. Same component shape, same charts, same styles.
- `GA4Banner` (already in the file) gets a real "Connect with Google" button that calls `getGoogleAuthUrl` then `window.location.href = url`. After connect, banner shows "Select property" dropdown (uses existing styled `Select`).

## 7. What I'm NOT building (out of scope / not runnable on Cloudflare Workers)
- Python ML libraries (Prophet/XGBoost/LightGBM/LSTM) — replaced with Holt-Winters JS (per your choice). Model "selection" is single-best, with MAPE displayed.
- Competitor intelligence RAG sources — no data feed exists in the project.
- Backend rate limiting — per platform directive.
- SAML/RBAC beyond Supabase RLS — overkill for a single-tenant brand workspace.
- Vector embeddings store — recommendations use direct LLM call over the structured snapshot, which is cheaper and equally accurate at this data volume.

## Technical notes
- Token encryption: AES-256-GCM with a key derived (HKDF-SHA256) from `SUPABASE_SERVICE_ROLE_KEY`. IV stored alongside ciphertext.
- All GA4 calls go through `createServerFn` + `requireSupabaseAuth`. The cron route uses `supabaseAdmin` after verifying the `apikey` header.
- Forecast confidence: residual stdev × {1.28, 1.96} for 80/95% bands.
- Recommendations use `google/gemini-2.5-flash` for cost; structured JSON output.

After approval I'll: (a) request the two Google secrets, (b) run the migration, (c) write the code in one pass.
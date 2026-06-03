# BrandSync AI — Code Deep Dive & Spec-vs-Reality Gap Analysis

*Grounded in the actual `brand-synth-ai` codebase (the design doc describes the plan; this describes what's truly built). Prepared for The Infinity AI BuildFest 2026.*

---

## TL;DR — The Honest Status

Your project is **far more real than a typical hackathon prototype.** It is not a mock-data front end pretending to have a backend. It has:

- A **real backend** (Supabase: Postgres + Auth + Row-Level Security).
- **Real AI** — live LLM calls (Google Gemini via the Lovable AI Gateway) that produce structured, schema-validated output, plus real AI **image generation**.
- A **real web-scraping pipeline** (Firecrawl) that analyzes any website.
- **Real document export** (PDF via jsPDF, PPT via pptxgenjs) — not faked toast notifications.

But it's **uneven by design** (smart for a hackathon): the team poured real engineering into 3–4 flagship modules and left the other 6–7 as polished mock-data showcases. Knowing exactly which is which is your superpower as the engineer presenting this.

---

## 1. The Actual Tech Stack (what's really in `package.json`)

This differs meaningfully from the design doc's stated plan (the doc said React+Vite / Next.js / Shadcn). Here's the truth:

| Layer | Design doc said | **Actually built with** |
|---|---|---|
| Framework | React (Vite) / Next.js | **TanStack Start** (full-stack React 19 framework, file-based routing + server functions) |
| Routing | — | **TanStack Router** (`src/routes/`, auto-generated `routeTree.gen.ts`) |
| Styling | Tailwind CSS | **Tailwind CSS v4** (latest) |
| UI | Shadcn/UI | **Shadcn/UI** ✅ (full set in `src/components/ui/`) + Radix primitives |
| Animation | Framer Motion | **Framer Motion v12** ✅ |
| Charts | Recharts | **Recharts** ✅ |
| Icons | Lucide | **Lucide React** ✅ |
| **Backend** | (not specified) | **Supabase** (Postgres, Auth, RLS) |
| **AI** | ChatGPT API / Gamma API | **Lovable AI Gateway → Google Gemini** (`gemini-3-flash-preview` for text, `gemini-2.5-flash-image` for images) via the Vercel AI SDK |
| **Web scraping** | (not specified) | **Firecrawl API** |
| **Data fetching** | — | **TanStack React Query** |
| **Validation** | — | **Zod** (schema validation everywhere) |
| **PDF export** | ChatGPT API | **jsPDF** (client-side, real) |
| **PPT export** | Gamma AI API | **pptxgenjs** (client-side, real) — *note: Gamma was NOT used; they built it natively* |
| **Forms** | — | React Hook Form + Zod resolvers |
| Deployment | — | **Cloudflare** (`wrangler.jsonc`, `@cloudflare/vite-plugin`) |
| Built on | — | **Lovable** (AI app builder; project ID `df2f8926-...`) |

**Engineer's talking point:** "We're on TanStack Start with a real Supabase backend and Cloudflare deployment — server functions, row-level security, and live LLM calls, not a static mock." That sentence alone separates you from 90% of hackathon teams.

---

## 2. The Database (this is real — 8 migrations, all with RLS)

Supabase Postgres with these tables, all protected by Row-Level Security tied to company membership:

- **`profiles`** — user profile, theme preference. Auto-created on signup.
- **`companies`** — brand/company record (name, industry, employee_size, website_url, `demo_mode` flag).
- **`company_members`** — multi-user per company with roles (owner, etc.). This is the foundation for team collaboration.
- **`brand_identity`** — Step 1 of the Brand DNA wizard (location, goal, target audience).
- **`connected_sources`** — OAuth-style connection records for website, Google Analytics, Search Console, Facebook, Instagram, TikTok, LinkedIn, YouTube, Google Business, Twitter. Tracks status (`not_connected`, `connecting`, `connected`, `syncing`, `permission_expired`, `api_error`).
- **`sync_logs`** — logs of data syncs per platform.
- **`api_errors`** — captured API errors per company.
- **`website_analysis`** — stored Firecrawl results (title, description, summary, markdown, branding JSON, screenshot).
- **`brand_guideline_workspaces`** — persisted brand-guideline state (the bug-fix table; see §5).

**Security maturity worth noting:** Migrations show they went back and *hardened* RLS — tightened `api_errors` to require a company_id, locked down `SECURITY DEFINER` functions, added owner-only delete policies. There's an auth trigger (`handle_new_user`) that auto-provisions a profile + company + ownership on signup. This is real production hygiene.

---

## 3. The AI Layer (genuinely real, not mocked)

There are **three** distinct real AI integrations:

### (a) "Mr. Zarvis" — the AI strategist chatbot  (`src/routes/api/chat.ts`)
- A streaming chat endpoint using the Vercel AI SDK's `streamText`.
- Model: **Google Gemini** via the Lovable gateway.
- Has a detailed ~1,500-word system prompt defining a persona ("Mr. Zarvis," a senior CMO/creative director) that knows all 11 modules and canonical user journeys.
- **Has a real `generateImage` tool** — it can generate marketing visuals/mockups/infographics on the fly (Gemini image model), returned as base64. This is a genuine agentic tool-use loop (`stepCountIs(50)`).
- Lives in the UI as `ZarvisChat.tsx`.

### (b) Brand Guideline Generator  (`src/lib/brand-guideline.functions.ts`)
- A real server function that calls Gemini to produce a **fully structured brand guideline** validated against a strict Zod schema: tagline, brand story, mission, vision, **current position (honest assessment)**, **recommended direction**, personality, voice (tone + do's/don'ts), audience segments, color palette (with hex + usage), typography, logo usage, visual style, messaging pillars, and concrete improvements.
- This directly fulfills the design-doc requirement: *"describe the current position and suggest what the actual guideline should be."* ✅
- Exports to **real PDF and PPT** files (`brand-guideline-export.ts`, 244 lines, using jsPDF + pptxgenjs).

### (c) Website Analysis Engine  (`src/lib/website-analysis-engine.functions.ts`)
- Real **Firecrawl** API call that scrapes any URL, extracts branding + a summary + markdown, then feeds it to Gemini for analysis.
- Powers the SimilarWeb-style traffic analyzer concept and the "Search Your Brand / existing brand fetch" features.

**Engineer's talking point:** "The intelligence isn't smoke and mirrors — brand guidelines are generated by an LLM against a validated schema, websites are really scraped via Firecrawl, and the assistant can generate images live."

---

## 4. Module-by-Module: Spec vs. Reality

Legend: ✅ Real (backend/AI wired) · 🟡 Built UI on mock data · ⚪ Light/placeholder

| # | Module | Route | Status | Notes |
|---|---|---|---|---|
| 1 | **Brand Intelligence** | `/dashboard/intelligence` | ✅🟡 | **569 lines.** Biggest "real" intelligence surface. Brand Voice Studio, audit, positioning. Mixes real brand data with some mock series. |
| 1b | **Brand DNA Setup Wizard** | `/dashboard/brand-dna-setup` | ✅ | **420 lines.** Multi-step wizard, writes to `brand_identity` table, uses React Query. Real persistence. |
| 1c | **Brand Guideline Generator** | `/dashboard/brand-guideline` | ✅ | **990 lines** — the second-largest file. Real LLM generation + real PDF/PPT export + DB persistence. A flagship. |
| 1d | **Website / Traffic Analysis** | `/dashboard/website-analysis` | ✅ | Real Firecrawl + React Query. The SimilarWeb-style analyzer. |
| 2 | **Creative Engine** | `/dashboard/creative` | 🟡 | **114 lines** + `creative-mock.ts`. UI showcase; content is mock. (Zarvis chat can generate real images, though.) |
| 3 | **Campaign Automation** | `/dashboard/campaigns` | 🟡 | **154 lines**, imports `@/lib/mock`. Visual mock of the auto-pilot/optimization dashboard. |
| 4 | **Audience Intelligence** | `/dashboard/audience` | 🟡 | **146 lines.** Segments/personas UI; no live data wiring detected. |
| 5 | **Lead & CRM** | `/dashboard/crm` | 🟡 | **149 lines**, mock data. Kanban pipeline + scoring UI. |
| 6 | **Influencer OS** | `/dashboard/influencers` | 🟡 | **126 lines**, mock data. Profile cards, fake-follower %, ROI. |
| 7 | **Reputation & Listening** | `/dashboard/reputation` | ✅🟡 | **1,550 lines — the single largest file by far.** This is where the most recent, heaviest work went (matches the doc's "Brand & Listening" redesign). Multi-channel, mention feed, crisis radar, date filters. Data is largely mock but the interaction architecture is deep. |
| 8 | **Unified Analytics** | `/dashboard/analytics` | 🟡 | **137 lines**, mock series. Charts, funnel, forecast toggle. |
| 9 | **Collaboration** | `/dashboard/collaboration` | 🟡/⚪ | **119 lines.** Boards/calendar/assets UI. Backed conceptually by `company_members` but light. |
| 10 | **Simulation Engine** | `/dashboard/simulation` | 🟡 | **141 lines.** The "Marketing GPS" command-center UI with animated predicted metrics (computed client-side, not a real model). |
| 11 | **Billing & Plans** | `/dashboard/billing` | 🟡 | **126 lines.** Pricing tiers UI; Stripe not wired (UI-ready). |
| — | **Landing page** | `/` | ✅ | **367 lines.** Real, with the demo registration flow. |
| — | **Auth / Register Demo** | `RegisterDemoModal.tsx` + `use-auth.tsx` | ✅ | Real Supabase auth; Google login + create-account form per the doc spec. |
| — | **Dark/Light theme** | `ThemeProvider` + `ThemeToggle` | ✅ | Real, persisted to `profiles.theme`. |

**The pattern:** Real depth in **Brand Intelligence + Guideline + Website Analysis + Reputation** (the "brand brain"); polished mock showcases everywhere else. This is a *sensible* hackathon strategy — demo the hard AI stuff for real, storyboard the rest.

---

## 5. The Known Issue (from the Claude conversation you linked)

I couldn't open the share link, but the project's own `.lovable/plan.md` documents the exact issue discussed, and the fix is **already in the codebase**:

**The bug:** On `/dashboard/brand-guideline`, the generated "Phase 4" workspace state lived only in React memory, so a **page refresh wiped it** ("refresh goes back to the previous version").

**The fix (implemented):**
- A `brand_guideline_workspaces` DB table was added (migration `20260524183705`) storing mode, form values, colors, generated guideline JSON, website-analysis output, phase, and confidence — one row per company, with full RLS.
- Server functions `brand-guideline-workspace.functions.ts` (102 lines) provide `get`/`save` so the page **hydrates from the DB on refresh** and auto-saves after generation/edits.

**The second, unresolved item:** GitHub auto-sync from Lovable wasn't pushing commits. That's a **Lovable platform integration issue, not a code bug** — the fix is to reconnect/re-authorize the GitHub integration in Lovable's UI (Plus menu → GitHub → reconnect), not something editable in the repo. Project ID for support: `df2f8926-ca56-4cb0-8b79-fbe406f356e4`.

**So: the data-loss bug should be fixed. Verify it by generating a guideline, refreshing, and confirming it persists.** If the GitHub sync still misbehaves, that's the platform, and the uploaded zip here is your reliable source of truth meanwhile.

---

## 6. Gaps Between the Design Doc's Promises and the Code

Things the doc/prompts describe that are **not (yet) really wired**, so you don't over-claim to judges:

- **ChatGPT API & Gamma API** — the doc specified these; the team actually used **Gemini (via Lovable)** and built PDF/PPT export **natively** (jsPDF/pptxgenjs). Functionally equivalent or better, but say "Gemini," not "ChatGPT/Gamma."
- **Real ad deployment** (Meta/Google/TikTok publishing) — UI only; no live ad-platform API calls. `connected_sources` models the connections but OAuth isn't completed.
- **Real campaign optimization / AI auto-pilot** — simulated in the UI.
- **Real audience/churn/lookalike predictions** — presented as confidence rings on mock data; no ML model behind them.
- **Real social listening data** in Reputation — the interaction model is built; the mention data is mock.
- **Stripe billing** — pricing UI is ready; checkout not wired.
- **Simulation Engine forecasts** — computed client-side for show, not a trained predictive model.

None of this is a problem for a hackathon — it's the *right* scope. Just present mock modules as "designed and storyboarded; next on the roadmap to wire up," and demo the real ones live.

---

## 7. Recommendations Before June 12

**Lead your demo with what's real:**
1. **Brand DNA wizard → Brand Guideline generation → PDF/PPT download.** This is your knockout: type a brand in, watch the LLM produce a full structured guideline with current-position + recommended-direction, then download a real PDF *and* PPT. Few teams will have anything this concrete.
2. **Website Analysis** — paste any real URL, show live Firecrawl scraping + AI analysis. Tangible "it works on real data."
3. **Mr. Zarvis chat generating a marketing image live** — the agentic image tool is a great "wow."
4. **The Reputation module's interactive mention feed** — show the depth of the redesign (interactive risk/impact/rising filters, channel indicators, date filters).

**Tighten before judging:**
- **Verify the brand-guideline refresh-persistence fix** end-to-end (generate → refresh → still there).
- **Resolve or document the GitHub sync issue** so your repo is current; if it won't sync, present from a known-good branch and have this zip as backup.
- **Seed believable mock data** consistently across the showcase modules (consistent brand name, currency in BDT/USD, local context) so the "unified OS" story feels coherent.
- **Add a `.env.example`** and **make sure real secrets are NOT in the repo.** (Your uploaded zip contained a `.env` — rotate those keys if it's ever shared more widely. I did not read or use it.)
- **Have a 60-second "what's real vs. roadmap" slide** ready — judges respect honesty about scope, and the real parts here are strong enough to stand on.

**Local-relevance angle ("Build Locally, Lead Globally"):** Emphasize Bangladesh/USA localization, the WhatsApp/Facebook-first connection model in `connected_sources`, and SME-friendly simplicity (the Reputation redesign was explicitly "make it usable for an SME owner").

---

## 8. Security / Housekeeping Note

⚠️ **Your uploaded zip included a `.env` file** (and the full `.git` history). I deleted the `.env` on my side without reading it and did not use any of its contents. For your own safety: keep `.env` in `.gitignore` (it appears to be), and if those API keys — Lovable, Firecrawl, Supabase — have been shared anywhere, rotate them. When sharing the project, zip only `src/`, `supabase/`, and config files, excluding `.env`, `.git`, and `node_modules`.

---

*This analysis is based entirely on the uploaded source code plus the design document. The "real vs. mock" calls come from reading imports, server functions, migrations, and line counts — if you point me at a specific module, I can go deeper (e.g., trace the full data flow of the Brand Guideline generator, or audit the Reputation module's 1,550 lines for the redesign checklist).*

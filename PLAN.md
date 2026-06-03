# PLAN.md — BrandSync AI (Revised)
> **Strategy:** Keep the Lovable frontend exactly as-is. Fix performance. Wire only Supabase (auth) + Neon (data) as the backend. No Lovable gateway removal for now — focus on speed and real data.

---

## What we found (audit results)

### Why the frontend is slow — 6 confirmed causes

| # | Problem | Location | Impact |
|---|---|---|---|
| 1 | **ZarvisChat always mounted** in root, initialises `useChat` on every page load | `__root.tsx` | Fires `/api/chat` connection on every route including landing page |
| 2 | **No lazy loading anywhere** — zero `React.lazy` / `Suspense` | All routes | Every module JS loaded upfront even if never visited |
| 3 | **`defaultPreloadStaleTime: 0`** — re-fetches on every nav link hover | `router.tsx` | Unnecessary network calls constantly |
| 4 | **`new QueryClient()` with no config** — no stale time, no cache | `router.tsx` | Data re-fetched on every component mount |
| 5 | **Sidebar Framer Motion AnimatePresence** on every route change | `Sidebar.tsx` | Animation cost on every navigation |
| 6 | **1,550-line + 990-line routes loaded eagerly** | Route files | Massive JS parse time on first load |

### Current service usage

| Service | Currently | Plan |
|---|---|---|
| Supabase | Auth + ALL DB reads/writes | Keep for auth only |
| Neon | Nothing | All database reads/writes |
| Lovable AI Gateway | Brand guideline, website analysis, Zarvis | Keep as-is (don't break working features) |

---

## The Strategy

```
KEEP:   All frontend UI — untouched
KEEP:   Lovable AI gateway — it works, don't touch it
KEEP:   Supabase — for auth (Google OAuth, sessions) only
ADD:    Neon — as the database (migrate schema + data layer)
FIX:    6 performance issues first
BUILD:  Real AI calls one module at a time starting with Creative Engine
```

---

# PHASE 1 — PERFORMANCE FIXES
> Pure frontend changes. No backend. Visible improvement immediately.
> Run `npm run dev` and test after every task.

## Task 1.1 — Fix QueryClient config

**File:** `src/router.tsx`

```
CLAUDE CODE PROMPT:
"In src/router.tsx, update the QueryClient instantiation:

new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // data fresh for 5 minutes
      gcTime: 1000 * 60 * 10,         // keep in cache for 10 minutes
      retry: 1,                        // only retry once on error
      refetchOnWindowFocus: false,     // no refetch on tab focus
    },
  },
})

Also change defaultPreloadStaleTime in createRouter from 0 to
1000 * 30 so hovering nav links does not fire network requests."
```
**Test:** DevTools Network tab → navigate between modules → far fewer requests.

---

## Task 1.2 — Lazy load all dashboard routes

**Files:** All `src/routes/dashboard.*.tsx` except `dashboard.tsx`

```
CLAUDE CODE PROMPT:
"In every file in src/routes/dashboard.*.tsx EXCEPT dashboard.tsx,
add a pendingComponent to the Route definition:

import { ModuleSkeleton } from '@/components/app/ModuleSkeleton';

In each route's createFileRoute({}) options add:
  pendingComponent: ModuleSkeleton,

First create src/components/app/ModuleSkeleton.tsx:
A dark skeleton loading screen matching the app aesthetic:
- animate-pulse divs
- 2 stat cards (bg-white/5, h-24, rounded-xl)
- 1 large chart area (bg-white/5, h-64, rounded-xl)  
- 3 smaller cards in a grid
- Full width, px-6 py-8 padding matching dashboard main

Apply pendingComponent to all 14 dashboard route files."
```
**Test:** Navigate to Reputation → skeleton flashes instead of blank screen.

---

## Task 1.3 — Move ZarvisChat into dashboard only

**Files:** `src/routes/__root.tsx`, `src/routes/dashboard.tsx`

```
CLAUDE CODE PROMPT:
"Move <ZarvisChat /> from src/routes/__root.tsx RootComponent
to src/routes/dashboard.tsx DashboardLayout — place it after
the <main> element and before the dashboard Toaster.
Remove ZarvisChat import from __root.tsx entirely.
This means Zarvis only initialises inside the dashboard,
not on the landing page or any public route."
```
**Test:** Landing page → Network tab → no /api/chat request fires.

---

## Task 1.4 — Memoize Sidebar

**File:** `src/components/app/Sidebar.tsx`

```
CLAUDE CODE PROMPT:
"In src/components/app/Sidebar.tsx:
1. Wrap the entire exported Sidebar function component with React.memo()
2. The sidebar reads useRouterState to highlight the active route —
   extract only the pathname from it:
   const pathname = useRouterState({ select: s => s.location.pathname })
   This prevents re-renders when non-pathname router state changes.
3. Add will-change-transform className to the collapsible sidebar
   motion.div to hint GPU compositing."
```

---

## Task 1.5 — Fix auth loading flash

**File:** `src/hooks/use-auth.tsx`

```
CLAUDE CODE PROMPT:
"In src/hooks/use-auth.tsx, fix the blank flash on page load:

1. Change the useState initialisation to check for an existing
   Supabase session in localStorage synchronously:
   
   const [session, setSession] = useState<Session | null>(() => {
     try {
       const key = Object.keys(localStorage).find(k => k.includes('auth-token'));
       if (!key) return null;
       const raw = localStorage.getItem(key);
       if (!raw) return null;
       const parsed = JSON.parse(raw);
       return parsed?.session ?? null;
     } catch { return null; }
   });
   const [loading, setLoading] = useState(false);

2. Keep the useEffect getSession() call to refresh/verify the token
   in the background but don't block rendering on it."
```
**Test:** Hard refresh dashboard → no blank flash before content appears.

---

# PHASE 2 — NEON DATABASE

## Task 2.1 — Neon client module

```
CLAUDE CODE PROMPT:
"Install @neondatabase/serverless.
Create src/lib/neon-db.ts:
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
export { sql };
export const healthCheck = () => sql'SELECT 1 as ok';"
```

## Task 2.2 — Migrate schema to Neon

```
CLAUDE CODE PROMPT:
"Read all 8 SQL files in supabase/migrations/ in chronological order.
Combine into src/db/schema.sql for Neon:
- Remove auth.uid() from any RLS (we enforce tenancy in app code)
- Remove Supabase-specific extensions
- Keep all 9 tables, indexes, foreign keys exactly
- Add at top: CREATE EXTENSION IF NOT EXISTS vector;
- Add at bottom:
  
  CREATE TABLE IF NOT EXISTS brand_embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    content text NOT NULL,
    content_type text NOT NULL,
    embedding vector(768),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX ON brand_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

  CREATE TABLE IF NOT EXISTS creative_generations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    feature text NOT NULL,
    input jsonb DEFAULT '{}',
    output jsonb,
    image_url text,
    model_used text,
    created_at timestamptz DEFAULT now()
  );

Output the full SQL file."
```
**TEST (manual):** Run in Neon SQL Editor → all tables created.

## Task 2.3 — Auth bridge

```
CLAUDE CODE PROMPT:
"Install jose.
Create src/lib/auth-context.ts:
export async function getAuthContext(request: Request) {
  // 1. Get token from Authorization header or cookie
  // 2. Verify with jose using SUPABASE_JWT_SECRET
  // 3. Extract userId from sub claim
  // 4. Query Neon: SELECT company_id FROM company_members 
  //    WHERE user_id = $userId LIMIT 1
  // 5. Return { userId, companyId }
  // 6. Throw 401 Response if missing/invalid
}
Use the sql client from neon-db.ts for the DB query."
```

## Task 2.4 — Migrate all 6 server functions to Neon

```
CLAUDE CODE PROMPT:
"Update these files to use Neon sql instead of supabase for DB:
- src/lib/brand-guideline.functions.ts
- src/lib/brand-guideline-workspace.functions.ts
- src/lib/connections.functions.ts
- src/lib/existing-brand.functions.ts
- src/lib/website-analysis.functions.ts
- src/lib/website-analysis-engine.functions.ts

For each: import { sql } from '@/lib/neon-db', add getAuthContext call,
replace supabase.from().select/insert/update with parameterized sql 
template literals. Keep all return shapes identical."
```
**TEST:** Brand DNA Setup → submit → row appears in Neon dashboard.

---

# PHASE 3 — CREATIVE ENGINE (first fully dynamic module)

## Task 3.1 — Creative server functions

```
CLAUDE CODE PROMPT:
"Create src/lib/creative.functions.ts with createServerFn for:
enhancePrompt, generateCaption, generateHashtags, generateScript,
generateBlog, generateProductDescription, generateImage, critiqueContent.
Use existing src/lib/ai-gateway.ts — do not change the gateway.
Save to creative_generations table in Neon.
Validate with Zod. Strip code fences before JSON.parse.
[See full function signatures in original PLAN.md Phase 2, Task 2.3]"
```

## Task 3.2 — Wire Creative Engine UI

```
CLAUDE CODE PROMPT:
"In src/components/creative/features.tsx and shared.tsx:
Replace mockGenerate with real server function calls.
Wire all 11 features to their real functions.
Keep all UI exactly the same — only swap the data source.
Add loading states and error toasts.
Render real output: markdown for blog/product, <img> for images."
```
**TEST:** Caption Craft → Generate → real AI output appears.

---

# PHASE 4 — ALL REMAINING MODULES
*(Detailed prompts provided when Phase 3 is complete)*

- Task 4.1 — Campaign Automation
- Task 4.2 — Audience Intelligence
- Task 4.3 — CRM & Leads
- Task 4.4 — Analytics
- Task 4.5 — Reputation & Listening
- Task 4.6 — Influencer OS
- Task 4.7 — Brand Simulation
- Task 4.8 — Collaboration

---

# PHASE 5 — RAG + GraphRAG
- Task 5.1 — pgvector embeddings
- Task 5.2 — RAG-powered AI calls
- Task 5.3 — Apache AGE audience graph
- Task 5.4 — Digital Twin with GraphRAG

---

# PHASE 6 — COMPETITION POLISH
- Task 6.1 — Bangla/English toggle
- Task 6.2 — Explainability panels
- Task 6.3 — Ethics page
- Task 6.4 — Demo seed (no hardcoded data)
- Task 6.5 — Deploy to Cloudflare
- Task 6.6 — Demo script

---

## Claude Code session starter (paste every session)

```
You are building BrandSync AI. Read PLAN.md.

Strategy:
- Keep ALL frontend UI exactly as-is (no redesigning)
- Keep Lovable AI gateway working (do not remove it)
- Keep Supabase for auth only
- Neon Postgres is the database
- Fix performance, then wire real data one module at a time

Today: [paste specific task]

Rules:
1. Tell me what to test after each task
2. Wait for confirmation before next task
3. Never change UI design
4. Log every change in UPDATE.md
```

---

## Status tracker

| Phase | Status |
|---|---|
| Phase 1: Performance fixes (6 tasks) | ⬜ Not started |
| Phase 2: Neon database (4 tasks) | ⬜ Not started |
| Phase 3: Creative Engine (2 tasks) | ⬜ Not started |
| Phase 4: All modules (8 tasks) | ⬜ Not started |
| Phase 5: RAG + GraphRAG (4 tasks) | ⬜ Not started |
| Phase 6: Competition polish (6 tasks) | ⬜ Not started |

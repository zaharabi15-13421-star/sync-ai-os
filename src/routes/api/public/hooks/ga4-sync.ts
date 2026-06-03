// Hourly GA4 sync cron endpoint. Authenticated with the Supabase anon key (apikey header).
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runSyncForCompany } from "@/lib/ga.functions";

export const Route = createFileRoute("/api/public/hooks/ga4-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authenticate the cron caller with a dedicated server-only secret.
        // Do NOT use the Supabase publishable/anon key — that value is bundled
        // into the client and visible to any site visitor.
        const expected = process.env.CRON_WEBHOOK_SECRET;
        if (!expected) {
          return new Response("Server misconfigured: CRON_WEBHOOK_SECRET not set", { status: 500 });
        }
        const key = request.headers.get("apikey") ?? request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
        if (!key || key !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { data: connections, error } = await supabaseAdmin
          .from("google_connections")
          .select("company_id")
          .eq("status", "connected");
        if (error) return Response.json({ error: error.message }, { status: 500 });

        const results: any[] = [];
        for (const c of connections ?? []) {
          try {
            const r = await runSyncForCompany(c.company_id, 90);
            results.push({ company_id: c.company_id, ok: true, days: r.days });
          } catch (e: any) {
            results.push({ company_id: c.company_id, ok: false, error: e?.message });
            await supabaseAdmin.from("google_connections")
              .update({ status: "error", last_error: e?.message ?? String(e) })
              .eq("company_id", c.company_id);
          }
        }
        return Response.json({ processed: results.length, results });
      },
    },
  },
});

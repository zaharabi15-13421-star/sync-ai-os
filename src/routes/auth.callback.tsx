import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const POST_AUTH_REDIRECT_KEY = "brandsync_post_auth_redirect";
const DASHBOARD_PATH = "/dashboard/intelligence";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  useEffect(() => {
    const finishSignIn = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search.replace(/^\?/, ""));
      const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
      const redirectPath = localStorage.getItem(POST_AUTH_REDIRECT_KEY) ?? DASHBOARD_PATH;

      try {
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) throw new Error("No session returned from Google sign-in.");
        }
        localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
        window.location.replace(redirectPath);
      } catch (error) {
        console.error("[auth callback] sign-in completion failed", error);
        localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
        window.location.replace("/");
      }
    };

    void finishSignIn();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Completing sign-in…
      </div>
    </main>
  );
}

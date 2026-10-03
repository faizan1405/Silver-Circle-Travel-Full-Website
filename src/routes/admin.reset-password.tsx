import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/admin/AuthCard";
import { adminHead, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => adminHead("Reset password"),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<"waiting" | "ready" | "invalid">("waiting");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) setReady("ready");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady("ready");
    });
    const timer = window.setTimeout(() => setReady((s) => (s === "waiting" ? "invalid" : s)), 6000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { error: e } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (e) {
      setError(e.message || "Unable to update password.");
      return;
    }
    toast.success("Password updated successfully.");
    navigate({ to: "/admin/dashboard", replace: true });
  };

  return (
    <AuthCard title="Set a new password">
      {ready === "waiting" ? <p className="text-muted-foreground">Verifying your reset link…</p> : null}
      {ready === "invalid" ? (
        <div className="space-y-5">
          <p className="text-muted-foreground">This reset link is invalid or has expired. Please request a new one.</p>
          <Link to="/admin/forgot-password" className={`${btnPrimary} w-full !py-3`}>Request a new link</Link>
        </div>
      ) : null}
      {ready === "ready" ? (
        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className={labelCls}>New password</span>
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Confirm new password</span>
            <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          </label>
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full !py-3`}>
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      ) : null}
    </AuthCard>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/admin/AuthCard";
import { adminHead, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/login")({
  head: () => adminHead("Sign in"),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: exists } = await supabase.rpc("admin_exists");
      if (!cancelled && exists === false) setNeedsSetup(true);
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (!cancelled && isAdmin) navigate({ to: "/admin/dashboard", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setError("");
    setBusy(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setBusy(false);
      setError("Incorrect email or password.");
      return;
    }
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (roleError || !isAdmin) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("This account does not have admin access.");
      return;
    }
    toast.success("Welcome back.");
    navigate({ to: "/admin/dashboard", replace: true });
  };

  return (
    <AuthCard title="Sign in" subtitle="Manage enquiries, destinations and site settings.">
      {needsSetup ? (
        <div className="mb-6 rounded-xl bg-gold/20 p-4 text-sm text-navy-deep">
          No admin account exists yet.{" "}
          <Link to="/admin/setup" className="font-semibold underline underline-offset-4">Create the admin account</Link>
        </div>
      ) : null}
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className={labelCls}>Email</span>
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Password</span>
          <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
        </label>
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full !py-3`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/admin/forgot-password" className="font-semibold text-navy hover:underline">Forgot password?</Link>
          <Link to="/" className="text-muted-foreground hover:text-navy">Back to website</Link>
        </div>
      </form>
    </AuthCard>
  );
}

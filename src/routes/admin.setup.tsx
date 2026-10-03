import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createFirstAdmin } from "@/lib/admin-setup.functions";
import { AuthCard } from "@/components/admin/AuthCard";
import { adminHead, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/setup")({
  head: () => adminHead("Create admin account"),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const create = useServerFn(createFirstAdmin);
  const [state, setState] = useState<"checking" | "open" | "closed">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data, error: e }) => {
      setState(e ? "open" : data ? "closed" : "open");
    });
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const result = await create({ data: { email, password } });
      if (!result.ok) {
        setError(result.error);
        if (result.error.includes("already exists")) setState("closed");
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        toast.success("Admin account created. Please sign in.");
        navigate({ to: "/admin/login" });
        return;
      }
      toast.success("Admin account created.");
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (e) {
      console.error(e);
      setError("Unable to create the admin account. Please check the details and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "checking") {
    return <AuthCard title="Create admin account"><p className="text-muted-foreground">Checking…</p></AuthCard>;
  }

  if (state === "closed") {
    return (
      <AuthCard title="Admin already set up" subtitle="There is only one admin account for this website.">
        <Link to="/admin/login" className={`${btnPrimary} w-full !py-3`}>Go to sign in</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create admin account" subtitle="This one-time step creates the single admin account. It closes as soon as the account exists.">
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className={labelCls}>Admin email</span>
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Password</span>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Confirm password</span>
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
        </label>
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full !py-3`}>
          {busy ? "Creating…" : "Create admin account"}
        </button>
      </form>
    </AuthCard>
  );
}

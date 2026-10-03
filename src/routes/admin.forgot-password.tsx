import { FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/admin/AuthCard";
import { adminHead, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => adminHead("Forgot password"),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setBusy(true);
    setError("");
    const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setBusy(false);
    if (e) {
      console.error(e);
      setError("Unable to send the reset email. Please try again in a moment.");
      return;
    }
    setSent(true);
  };

  return (
    <AuthCard title="Forgot password" subtitle="We will email you a secure link to set a new password.">
      {sent ? (
        <div className="space-y-5">
          <p className="rounded-xl bg-sage/15 p-4 text-navy-deep">If that email belongs to the admin account, a reset link is on its way.</p>
          <Link to="/admin/login" className={`${btnPrimary} w-full !py-3`}>Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className={labelCls}>Admin email</span>
            <input name="email" type="email" required autoComplete="email" className={inputCls} />
          </label>
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full !py-3`}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <Link to="/admin/login" className="block text-center text-sm font-semibold text-navy hover:underline">Back to sign in</Link>
        </form>
      )}
    </AuthCard>
  );
}

import { FormEvent, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FieldError, Panel, adminHead, btnOutline, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/profile")({
  head: () => adminHead("Admin Profile"),
  component: ProfilePage,
});

function ProfilePage() {
  const { adminEmail } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    const e: typeof errors = {};
    if (!current) e.current = "Enter your current password.";
    if (next.length < 8) e.next = "New password must be at least 8 characters.";
    else if (next === current) e.next = "New password must be different from the current one.";
    if (confirm !== next) e.confirm = "Passwords do not match.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: adminEmail, password: current });
    if (verifyError) {
      setSaving(false);
      setErrors({ current: "Current password is incorrect." });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Unable to change password.");
      return;
    }
    form.reset();
    toast.success("Password changed successfully.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["admin"] });
    toast.success("You have been logged out.");
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Admin email</p>
          <p className="mt-1 truncate text-lg font-semibold text-navy-deep">{adminEmail}</p>
        </div>
        <button type="button" onClick={logout} className={btnOutline}><LogOut className="h-4 w-4" /> Logout</button>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <h2 className="text-2xl">Change password</h2>
        <form onSubmit={submit} noValidate className="mt-5 space-y-5">
          <label className="block">
            <span className={labelCls}>Current password</span>
            <input name="current" type="password" autoComplete="current-password" className={inputCls} />
            <FieldError message={errors.current} />
          </label>
          <label className="block">
            <span className={labelCls}>New password</span>
            <input name="next" type="password" autoComplete="new-password" className={inputCls} />
            <FieldError message={errors.next} />
          </label>
          <label className="block">
            <span className={labelCls}>Confirm new password</span>
            <input name="confirm" type="password" autoComplete="new-password" className={inputCls} />
            <FieldError message={errors.confirm} />
          </label>
          <button type="submit" disabled={saving} className={`${btnPrimary} !py-3`}>{saving ? "Saving…" : "Change password"}</button>
        </form>
      </Panel>
    </div>
  );
}

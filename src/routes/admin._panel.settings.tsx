import { FormEvent, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminSettingsQuery, refreshAfterChange } from "@/lib/admin-queries";
import type { SiteSettings } from "@/lib/site";
import { ErrorState, FieldError, Panel, TableSkeleton, adminHead, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/settings")({
  head: () => adminHead("Site Settings"),
  component: SettingsPage,
});

type Editable = Omit<SiteSettings, "id" | "updated_at">;
type Key = keyof Editable;

const GROUPS: { title: string; fields: { key: Key; label: string; placeholder?: string; type?: string; multiline?: boolean; url?: boolean }[] }[] = [
  {
    title: "Branding",
    fields: [
      { key: "logo_url", label: "Logo URL", placeholder: "https://…/logo.png", url: true },
      { key: "favicon_url", label: "Favicon URL", placeholder: "https://…/favicon.png", url: true },
      { key: "copyright_text", label: "Footer copyright text", placeholder: "© Silver Circle Travel. All rights reserved." },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone number", placeholder: "+91 99997 18183", type: "tel" },
      { key: "email", label: "Email address", placeholder: "care@silvercircletravel.com", type: "email" },
      { key: "whatsapp", label: "WhatsApp number or link", placeholder: "919999718183 or https://wa.me/919999718183" },
      { key: "address", label: "Business address", multiline: true },
    ],
  },
  {
    title: "Social media",
    fields: [
      { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…", url: true },
      { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/…", url: true },
      { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/…", url: true },
      { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…", url: true },
      { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/…", url: true },
    ],
  },
];

function validUrl(value: string) {
  if (!value || value.startsWith("/")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function SettingsPage() {
  const { data, isLoading, isError, refetch } = useQuery(adminSettingsQuery);
  if (isLoading) return <TableSkeleton rows={8} />;
  if (isError || !data) return <ErrorState message="Unable to load settings. Please try again." onRetry={() => refetch()} />;
  return <SettingsForm key={data.updated_at} initial={data} />;
}

function SettingsForm({ initial }: { initial: SiteSettings }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Editable>(() => {
    const { id: _id, updated_at: _u, ...rest } = initial;
    return rest;
  });
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v).trim()])) as Editable;
    const e: Partial<Record<Key, string>> = {};
    for (const group of GROUPS) for (const f of group.fields) {
      if (f.url && !validUrl(trimmed[f.key])) e[f.key] = "Please enter a valid URL starting with https://";
    }
    if (trimmed.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed.email)) e.email = "Please enter a valid email address.";
    if (trimmed.whatsapp && !/^https?:\/\//i.test(trimmed.whatsapp) && trimmed.whatsapp.replace(/\D/g, "").length < 8) e.whatsapp = "Enter a WhatsApp number with country code, or a wa.me link.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("site_settings").update(trimmed).eq("id", 1);
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("Unable to save settings.");
      return;
    }
    refreshAfterChange(queryClient);
    toast.success("Settings updated successfully.");
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-4xl space-y-6">
      {GROUPS.map((group) => (
        <Panel key={group.title} className="p-5 sm:p-6">
          <h2 className="text-2xl">{group.title}</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {group.fields.map((f) => (
              <label key={f.key} className={`block ${f.multiline ? "md:col-span-2" : ""}`}>
                <span className={labelCls}>{f.label}</span>
                {f.multiline ? (
                  <textarea value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} rows={3} className={`${inputCls} resize-y`} />
                ) : (
                  <input type={f.type ?? "text"} value={values[f.key]} placeholder={f.placeholder} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} className={inputCls} />
                )}
                <FieldError message={errors[f.key]} />
                {(f.key === "logo_url" || f.key === "favicon_url") && values[f.key] && validUrl(values[f.key]) ? (
                  <img src={values[f.key]} alt="" className="mt-3 h-14 w-auto rounded-lg border border-border bg-white object-contain p-1" />
                ) : null}
              </label>
            ))}
          </div>
        </Panel>
      ))}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={`${btnPrimary} !px-8 !py-3`}>{saving ? "Saving…" : "Save Changes"}</button>
      </div>
    </form>
  );
}

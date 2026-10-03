import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { ExternalLink, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DESTINATION_CATEGORIES, formatINR, type Destination } from "@/lib/destinations";
import { adminDestinationsQuery, refreshAfterChange } from "@/lib/admin-queries";
import { EmptyState, ErrorState, Panel, StatusBadge, TableSkeleton, adminHead, btnOutline, btnPrimary, iconBtn, inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/destinations/")({
  validateSearch: z.object({
    status: z.enum(["active", "inactive"]).optional(),
    featured: z.enum(["yes", "no"]).optional(),
    category: z.string().optional(),
  }),
  head: () => adminHead("Destinations"),
  component: DestinationsAdmin,
});

const selectCls = `${inputCls} !py-2.5`;

function DestinationsAdmin() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/destinations/" });
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery(adminDestinationsQuery);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Destination | null>(null);

  const setSearch = (patch: Partial<typeof search>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const categories = useMemo(() => Array.from(new Set([...DESTINATION_CATEGORIES, ...(data ?? []).map((d) => d.category)])), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (d) =>
        (!q || [d.title, d.country, d.location].some((v) => v.toLowerCase().includes(q))) &&
        (!search.category || d.category === search.category) &&
        (!search.status || d.is_active === (search.status === "active")) &&
        (!search.featured || d.is_featured === (search.featured === "yes")),
    );
  }, [data, query, search.category, search.status, search.featured]);

  const hasFilters = Boolean(query || search.category || search.status || search.featured);

  const toggle = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<Destination, "is_active" | "is_featured">> }) => {
      const { error } = await supabase.from("destinations").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: adminDestinationsQuery.queryKey });
      const previous = queryClient.getQueryData(adminDestinationsQuery.queryKey);
      queryClient.setQueryData(adminDestinationsQuery.queryKey, (old) => old?.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(adminDestinationsQuery.queryKey, ctx.previous);
      toast.error("Unable to update destination.");
    },
    onSuccess: (_d, { patch }) => {
      if (patch.is_active !== undefined) toast.success(patch.is_active ? "Destination activated." : "Destination deactivated.");
      if (patch.is_featured !== undefined) toast.success(patch.is_featured ? "Marked as featured." : "Removed from featured.");
    },
    onSettled: () => refreshAfterChange(queryClient),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Destination deleted successfully.");
      setToDelete(null);
      refreshAfterChange(queryClient);
    },
    onError: () => toast.error("Unable to delete destination."),
  });

  const price = (d: Destination) => (
    <>
      <span className="text-navy-deep">{formatINR(d.original_price)}</span>
    </>
  );

  const actions = (d: Destination) => (
    <div className="flex items-center justify-end gap-1">
      {d.is_active ? (
        <a href={`/destinations/${d.slug}`} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label={`View ${d.title} on website`}><ExternalLink className="h-4 w-4" /></a>
      ) : null}
      <Link to="/admin/destinations/$id/edit" params={{ id: d.id }} className={iconBtn} aria-label={`Edit ${d.title}`}><Pencil className="h-4 w-4" /></Link>
      <button type="button" className={`${iconBtn} hover:!text-destructive`} aria-label={`Delete ${d.title}`} onClick={() => setToDelete(d)}><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">Manage the journeys shown on your website.</p>
        <Link to="/admin/destinations/new" className={btnPrimary}><Plus className="h-4 w-4" /> Add Destination</Link>
      </div>

      <Panel className="p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto] xl:items-center">
          <label className="relative block md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search destinations</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, country, location" className={`${selectCls} pl-10`} />
          </label>
          <select aria-label="Filter by category" value={search.category ?? ""} onChange={(e) => setSearch({ category: e.target.value || undefined })} className={selectCls}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Filter by status" value={search.status ?? ""} onChange={(e) => setSearch({ status: (e.target.value || undefined) as "active" | "inactive" | undefined })} className={selectCls}>
            <option value="">Active & inactive</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select aria-label="Filter by featured" value={search.featured ?? ""} onChange={(e) => setSearch({ featured: (e.target.value || undefined) as "yes" | "no" | undefined })} className={selectCls}>
            <option value="">Featured & not featured</option>
            <option value="yes">Featured</option>
            <option value="no">Not featured</option>
          </select>
          <button type="button" disabled={!hasFilters} onClick={() => { setQuery(""); setSearch({ category: undefined, status: undefined, featured: undefined }); }} className={btnOutline}>
            <X className="h-4 w-4" /> Clear Filters
          </button>
        </div>
      </Panel>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState message="Unable to load destinations. Please try again." onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No destinations yet">
          <Link to="/admin/destinations/new" className={`${btnPrimary} mt-2`}><Plus className="h-4 w-4" /> Add your first destination</Link>
        </EmptyState>
      ) : !filtered.length ? (
        <EmptyState title="No matching destinations">Try a different search or clear the filters.</EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} of {data.length} destinations</p>
          <Panel className="hidden overflow-hidden xl:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Image", "Title", "Country", "Category", "Duration", "Price", "Discounted", "Featured", "Status", ""].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-3 py-3"><img src={d.image_url} alt="" loading="lazy" decoding="async" className="h-12 w-16 rounded-lg object-cover" /></td>
                    <td className="px-3 py-3"><span className="font-semibold text-navy-deep">{d.title}</span><span className="block text-xs text-muted-foreground">/{d.slug}</span></td>
                    <td className="px-3 py-3 text-muted-foreground">{d.country || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{d.category}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{d.duration || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3">{price(d)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{d.discounted_price != null ? formatINR(d.discounted_price) : "—"}</td>
                    <td className="px-3 py-3">
                      <button type="button" aria-label={d.is_featured ? `Remove ${d.title} from featured` : `Mark ${d.title} as featured`} aria-pressed={d.is_featured} onClick={() => toggle.mutate({ id: d.id, patch: { is_featured: !d.is_featured } })} className={iconBtn}>
                        <Star className={`h-4 w-4 ${d.is_featured ? "fill-gold text-gold" : ""}`} />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={d.is_active} aria-label={d.is_active ? `Deactivate ${d.title}` : `Activate ${d.title}`} onCheckedChange={(v) => toggle.mutate({ id: d.id, patch: { is_active: v } })} />
                        <StatusBadge status={d.is_active ? "Active" : "Inactive"} />
                      </div>
                    </td>
                    <td className="px-3 py-3">{actions(d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <div className="grid gap-3 md:grid-cols-2 xl:hidden">
            {filtered.map((d) => (
              <Panel key={d.id} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  <img src={d.image_url} alt="" loading="lazy" decoding="async" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold text-navy-deep">{d.title}</p>
                      <StatusBadge status={d.is_active ? "Active" : "Inactive"} />
                    </div>
                    <p className="text-sm text-muted-foreground">{[d.category, d.country, d.duration].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 text-sm">
                      {formatINR(d.original_price)}
                      {d.discounted_price != null ? <span className="ml-2 text-muted-foreground">→ {formatINR(d.discounted_price)}</span> : null}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Switch checked={d.is_active} aria-label={d.is_active ? `Deactivate ${d.title}` : `Activate ${d.title}`} onCheckedChange={(v) => toggle.mutate({ id: d.id, patch: { is_active: v } })} />
                    <button type="button" aria-label={d.is_featured ? `Remove ${d.title} from featured` : `Mark ${d.title} as featured`} aria-pressed={d.is_featured} onClick={() => toggle.mutate({ id: d.id, patch: { is_featured: !d.is_featured } })} className={iconBtn}>
                      <Star className={`h-4 w-4 ${d.is_featured ? "fill-gold text-gold" : ""}`} />
                    </button>
                  </div>
                  {actions(d)}
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this destination?"
        busy={remove.isPending}
        onOpenChange={(open) => { if (!open) setToDelete(null); }}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}

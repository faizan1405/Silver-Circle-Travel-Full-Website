import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Download, Eye, Search, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ENQUIRY_STATUSES, adminEnquiriesQuery, refreshAfterChange, type Enquiry, type EnquiryStatus } from "@/lib/admin-queries";
import {
  EmptyState, ErrorState, Panel, StatusBadge, TableSkeleton, adminHead, btnOutline, btnPrimary, formatDate, formatTravelDate, iconBtn, inputCls,
} from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/enquiries")({
  validateSearch: z.object({
    status: z.enum(ENQUIRY_STATUSES).optional(),
    destination: z.string().optional(),
    view: z.string().optional(),
  }),
  head: () => adminHead("Enquiries"),
  component: EnquiriesPage,
});

const selectCls = `${inputCls} !py-2.5`;

function csvCell(value: string | number) {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(rows: Enquiry[]) {
  const header = ["Name", "Phone", "Email", "Destination", "Travel Date", "Number of Travellers", "Message", "Status", "Submitted Date"];
  const lines = rows.map((e) =>
    [e.name, e.phone, e.email, e.preferred_destination, e.travel_date, e.number_of_travellers, e.message, e.status, new Date(e.created_at).toLocaleString("en-IN")]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob(["\uFEFF" + [header.join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function EnquiriesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/enquiries" });
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery(adminEnquiriesQuery);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Enquiry | null>(null);

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const destinations = useMemo(
    () => Array.from(new Set((data ?? []).map((e) => e.preferred_destination).filter(Boolean))).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (e) =>
        (!search.status || e.status === search.status) &&
        (!search.destination || e.preferred_destination === search.destination) &&
        (!q || [e.name, e.email, e.phone, e.preferred_destination].some((v) => v.toLowerCase().includes(q))),
    );
  }, [data, query, search.status, search.destination]);

  const viewing = search.view ? (data ?? []).find((e) => e.id === search.view) : undefined;
  const hasFilters = Boolean(query || search.status || search.destination);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) => {
      const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminEnquiriesQuery.queryKey });
      const previous = queryClient.getQueryData(adminEnquiriesQuery.queryKey);
      queryClient.setQueryData(adminEnquiriesQuery.queryKey, (old) => old?.map((e) => (e.id === id ? { ...e, status } : e)));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(adminEnquiriesQuery.queryKey, ctx.previous);
      toast.error("Unable to update the enquiry status.");
    },
    onSuccess: (_d, v) => toast.success(`Status changed to ${v.status}.`),
    onSettled: () => refreshAfterChange(queryClient),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      toast.success("Enquiry deleted successfully.");
      setToDelete(null);
      if (search.view === id) setSearch({ view: undefined });
      refreshAfterChange(queryClient);
    },
    onError: () => toast.error("Unable to delete the enquiry."),
  });

  const statusSelect = (e: Enquiry) => (
    <select
      aria-label={`Status for ${e.name}`}
      value={e.status}
      onChange={(ev) => updateStatus.mutate({ id: e.id, status: ev.target.value as EnquiryStatus })}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-navy-deep outline-none focus:border-navy"
    >
      {ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );

  return (
    <div className="space-y-6">
      <Panel className="p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto_auto] md:items-center">
          <label className="relative block">
            <span className="sr-only">Search enquiries</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone, destination" className={`${selectCls} pl-10`} />
          </label>
          <select aria-label="Filter by status" value={search.status ?? ""} onChange={(e) => setSearch({ status: (e.target.value || undefined) as EnquiryStatus | undefined })} className={selectCls}>
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select aria-label="Filter by destination" value={search.destination ?? ""} onChange={(e) => setSearch({ destination: e.target.value || undefined })} className={selectCls}>
            <option value="">All destinations</option>
            {destinations.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button type="button" disabled={!hasFilters} onClick={() => { setQuery(""); setSearch({ status: undefined, destination: undefined }); }} className={btnOutline}>
            <X className="h-4 w-4" /> Clear Filters
          </button>
          <button type="button" disabled={!filtered.length} onClick={() => exportCsv(filtered)} className={btnPrimary}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </Panel>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState message="Unable to load enquiries. Please try again." onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No enquiries yet">Enquiries submitted through the website will appear here.</EmptyState>
      ) : !filtered.length ? (
        <EmptyState title="No matching enquiries">Try a different search or clear the filters.</EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} of {data.length} enquiries</p>
          {/* Desktop table */}
          <Panel className="hidden overflow-hidden xl:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Name", "Phone", "Email", "Destination", "Travel Date", "Travellers", "Status", "Submitted", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-4 py-3 font-semibold text-navy-deep">{e.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.phone}</td>
                    <td className="max-w-[12rem] truncate px-4 py-3 text-muted-foreground">{e.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.preferred_destination || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatTravelDate(e.travel_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.number_of_travellers || "—"}</td>
                    <td className="px-4 py-3">{statusSelect(e)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(e.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" className={iconBtn} aria-label={`View ${e.name}`} onClick={() => setSearch({ view: e.id })}><Eye className="h-4 w-4" /></button>
                        <button type="button" className={`${iconBtn} hover:!text-destructive`} aria-label={`Delete ${e.name}`} onClick={() => setToDelete(e)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          {/* Mobile / tablet cards */}
          <div className="grid gap-3 md:grid-cols-2 xl:hidden">
            {filtered.map((e) => (
              <Panel key={e.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-deep">{e.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{e.email}</p>
                    <p className="text-sm text-muted-foreground">{e.phone}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-muted-foreground">Destination</dt><dd className="text-navy-deep">{e.preferred_destination || "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Travel date</dt><dd className="text-navy-deep">{formatTravelDate(e.travel_date)}</dd></div>
                  <div><dt className="text-muted-foreground">Travellers</dt><dd className="text-navy-deep">{e.number_of_travellers || "—"}</dd></div>
                  <div><dt className="text-muted-foreground">Submitted</dt><dd className="text-navy-deep">{formatDate(e.created_at)}</dd></div>
                </dl>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                  {statusSelect(e)}
                  <div className="flex gap-1">
                    <button type="button" className={iconBtn} aria-label={`View ${e.name}`} onClick={() => setSearch({ view: e.id })}><Eye className="h-4 w-4" /></button>
                    <button type="button" className={`${iconBtn} hover:!text-destructive`} aria-label={`Delete ${e.name}`} onClick={() => setToDelete(e)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => { if (!open) setSearch({ view: undefined }); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          {viewing ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl text-navy-deep">{viewing.name}</DialogTitle>
              </DialogHeader>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["Phone", viewing.phone],
                  ["Email", viewing.email],
                  ["Preferred destination", viewing.preferred_destination || "—"],
                  ["Travel dates", formatTravelDate(viewing.travel_date)],
                  ["Number of travellers", viewing.number_of_travellers || "—"],
                  ["Submitted", formatDate(viewing.created_at, true)],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{k}</dt><dd className="mt-1 break-words text-base text-navy-deep">{v}</dd></div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Message</dt>
                  <dd className="mt-1 whitespace-pre-line break-words rounded-xl bg-secondary/60 p-3 text-base text-navy-deep">{viewing.message || "—"}</dd>
                </div>
              </dl>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Status</span>{statusSelect(viewing)}</div>
                <button type="button" className={`${btnOutline} hover:!border-destructive hover:!text-destructive`} onClick={() => setToDelete(viewing)}><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this enquiry?"
        busy={remove.isPending}
        onOpenChange={(open) => { if (!open) setToDelete(null); }}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}

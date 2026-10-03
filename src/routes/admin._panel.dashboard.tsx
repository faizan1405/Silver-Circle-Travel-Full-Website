import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleCheck, CircleOff, Inbox, MailPlus, MapPinned } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { adminStatsQuery, recentEnquiriesQuery } from "@/lib/admin-queries";
import { EmptyState, ErrorState, Panel, StatusBadge, TableSkeleton, adminHead, formatDate, formatTravelDate } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/dashboard")({
  head: () => adminHead("Dashboard"),
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery(adminStatsQuery);
  const recent = useQuery(recentEnquiriesQuery);

  const cards = [
    { label: "Total Enquiries", value: stats.data?.totalEnquiries, icon: Inbox, link: { to: "/admin/enquiries" as const, search: {} } },
    { label: "New Enquiries", value: stats.data?.newEnquiries, icon: MailPlus, link: { to: "/admin/enquiries" as const, search: { status: "New" as const } } },
    { label: "Total Destinations", value: stats.data?.totalDestinations, icon: MapPinned, link: { to: "/admin/destinations" as const, search: {} } },
    { label: "Active Destinations", value: stats.data?.activeDestinations, icon: CircleCheck, link: { to: "/admin/destinations" as const, search: { status: "active" as const } } },
    { label: "Inactive Destinations", value: stats.data?.inactiveDestinations, icon: CircleOff, link: { to: "/admin/destinations" as const, search: { status: "inactive" as const } } },
  ];

  return (
    <div className="space-y-8">
      {stats.isError ? (
        <ErrorState message="Unable to load dashboard figures. Please try again." onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.link.to}
              search={card.link.search}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-navy"><card.icon className="h-5 w-5" /></span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </div>
              <p className="mt-5 text-sm font-semibold text-muted-foreground">{card.label}</p>
              {stats.isLoading ? <Skeleton className="mt-2 h-9 w-16" /> : <p className="mt-1 font-display text-4xl text-navy-deep">{card.value ?? 0}</p>}
            </Link>
          ))}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-3xl">Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:underline">
            View All Enquiries <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recent.isLoading ? (
          <TableSkeleton rows={4} />
        ) : recent.isError ? (
          <ErrorState message="Unable to load enquiries. Please try again." onRetry={() => recent.refetch()} />
        ) : !recent.data?.length ? (
          <EmptyState title="No enquiries yet">Enquiries submitted on the website will appear here.</EmptyState>
        ) : (
          <Panel className="divide-y divide-border overflow-hidden">
            {recent.data.map((e) => (
              <Link key={e.id} to="/admin/enquiries" search={{ view: e.id }} className="grid gap-2 px-5 py-4 transition-colors hover:bg-secondary/50 md:grid-cols-[1.4fr_1.2fr_1fr_0.7fr_0.9fr_1fr] md:items-center">
                <span className="font-semibold text-navy-deep">{e.name}</span>
                <span className="text-muted-foreground">{e.preferred_destination || "Not sure yet"}</span>
                <span className="text-sm text-muted-foreground">{formatTravelDate(e.travel_date)}</span>
                <span className="text-sm text-muted-foreground">{e.number_of_travellers || "—"} travellers</span>
                <span><StatusBadge status={e.status} /></span>
                <span className="text-sm text-muted-foreground md:text-right">{formatDate(e.created_at)}</span>
              </Link>
            ))}
          </Panel>
        )}
      </section>
    </div>
  );
}

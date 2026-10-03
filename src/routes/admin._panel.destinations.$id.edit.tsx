import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DestinationForm } from "@/components/admin/DestinationForm";
import { adminDestinationQuery } from "@/lib/admin-queries";
import { EmptyState, ErrorState, TableSkeleton, adminHead, btnPrimary } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/destinations/$id/edit")({
  head: () => adminHead("Edit Destination"),
  component: EditDestination,
});

function EditDestination() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery(adminDestinationQuery(id));
  if (isLoading) return <TableSkeleton rows={6} />;
  if (isError) return <ErrorState message="Unable to load this destination. Please try again." onRetry={() => refetch()} />;
  if (!data) {
    return (
      <EmptyState title="Destination not found">
        <p>It may have been deleted.</p>
        <Link to="/admin/destinations" className={`${btnPrimary} mt-5`}>Back to destinations</Link>
      </EmptyState>
    );
  }
  return <DestinationForm key={data.id + data.updated_at} initial={data} />;
}

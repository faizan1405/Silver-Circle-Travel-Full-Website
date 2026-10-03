import { createFileRoute } from "@tanstack/react-router";
import { DestinationForm } from "@/components/admin/DestinationForm";
import { adminHead } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/_panel/destinations/new")({
  head: () => adminHead("Add Destination"),
  component: () => <DestinationForm />,
});

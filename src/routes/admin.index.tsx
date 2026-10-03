import { createFileRoute, redirect } from "@tanstack/react-router";
import { adminHead } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/")({
  head: () => adminHead("Admin"),
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});

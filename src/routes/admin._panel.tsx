import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Inbox, LayoutDashboard, LogOut, MapPinned, Menu, Settings, UserRound } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_panel")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login" });
    }
    return { adminEmail: data.user.email ?? "" };
  },
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-ivory text-muted-foreground">Loading admin…</div>
  ),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/destinations", label: "Destinations", icon: MapPinned },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
] as const;

const TITLES: [string, string][] = [
  ["/admin/destinations/new", "Add Destination"],
  ["/admin/destinations/", "Edit Destination"],
  ["/admin/destinations", "Destinations"],
  ["/admin/enquiries", "Enquiries"],
  ["/admin/settings", "Site Settings"],
  ["/admin/profile", "Admin Profile"],
  ["/admin/dashboard", "Dashboard"],
];

function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return async () => {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["admin"] });
    toast.success("You have been logged out.");
    navigate({ to: "/admin/login", replace: true });
  };
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const logout = useLogout();
  const linkCls =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-semibold text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white data-[status=active]:bg-white data-[status=active]:text-navy-deep data-[status=active]:shadow-soft";
  return (
    <div className="flex h-full flex-col bg-navy-deep px-4 py-6">
      <Link to="/admin/dashboard" onClick={onNavigate} className="mb-8 flex items-center gap-3 px-2">
        <span className="rounded-2xl bg-white p-2"><img src={logo.url} alt="" width={44} height={44} className="h-11 w-11 object-contain" /></span>
        <span className="leading-tight">
          <span className="block font-display text-xl text-white">Silver Circle</span>
          <span className="block text-xs uppercase tracking-[0.2em] text-gold">Admin</span>
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <Link key={item.to} to={item.to} onClick={onNavigate} className={linkCls}>
            <item.icon className="h-5 w-5 shrink-0" /> {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 flex flex-col gap-1 border-t border-white/10 pt-4">
        <a href="/" target="_blank" rel="noopener noreferrer" className={linkCls}>
          <ExternalLink className="h-5 w-5 shrink-0" /> View website
        </a>
        <Link to="/admin/profile" onClick={onNavigate} className={linkCls}>
          <UserRound className="h-5 w-5 shrink-0" /> Admin Profile
        </Link>
        <button type="button" onClick={logout} className={cn(linkCls, "text-left")}>
          <LogOut className="h-5 w-5 shrink-0" /> Logout
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { adminEmail } = Route.useRouteContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Admin";

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/admin/login", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ivory">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-ivory/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10 lg:py-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-navy-deep lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-2xl sm:text-3xl">{title}</h1>
            <Link to="/admin/profile" className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-navy-deep transition-colors hover:bg-secondary sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-semibold uppercase text-primary-foreground">{adminEmail.slice(0, 1) || "A"}</span>
              <span className="max-w-[12rem] truncate">{adminEmail}</span>
            </Link>
            <button type="button" onClick={logout} aria-label="Logout" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-navy-deep">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

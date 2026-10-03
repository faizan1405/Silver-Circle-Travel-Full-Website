import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Enquiry = Database["public"]["Tables"]["enquiries"]["Row"];
export const ENQUIRY_STATUSES = ["New", "Contacted", "Converted", "Closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

async function count(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count: c, error } = await query;
  if (error) throw error;
  return c ?? 0;
}

export const adminStatsQuery = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: async () => {
    const [totalEnquiries, newEnquiries, totalDestinations, activeDestinations, inactiveDestinations] = await Promise.all([
      count(supabase.from("enquiries").select("id", { count: "exact", head: true })),
      count(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "New")),
      count(supabase.from("destinations").select("id", { count: "exact", head: true })),
      count(supabase.from("destinations").select("id", { count: "exact", head: true }).eq("is_active", true)),
      count(supabase.from("destinations").select("id", { count: "exact", head: true }).eq("is_active", false)),
    ]);
    return { totalEnquiries, newEnquiries, totalDestinations, activeDestinations, inactiveDestinations };
  },
});

export const recentEnquiriesQuery = queryOptions({
  queryKey: ["admin", "enquiries", "recent"],
  queryFn: async () => {
    const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(5);
    if (error) throw error;
    return data;
  },
});

export const adminEnquiriesQuery = queryOptions({
  queryKey: ["admin", "enquiries", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const adminDestinationsQuery = queryOptions({
  queryKey: ["admin", "destinations", "all"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },
});

export const adminDestinationQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "destinations", "one", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("destinations").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const adminSettingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
});

/** Refresh admin data and the public site's cached data after a change. */
export function refreshAfterChange(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["admin"] });
  void queryClient.invalidateQueries({ queryKey: ["public"] });
}

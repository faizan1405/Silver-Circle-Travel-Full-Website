import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicSupabase } from "./supabase-public.server";
import { resolveDestinationImage, type Destination } from "./destinations";
import { FALLBACK_SETTINGS, type SiteSettings } from "./site";

export const listActiveDestinations = createServerFn({ method: "GET" }).handler(
  async (): Promise<Destination[]> => {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("listActiveDestinations", error);
      throw new Error("Unable to load destinations. Please try again.");
    }
    return (data ?? []).map((d) => ({
      ...d,
      image_url: resolveDestinationImage(d.slug, d.image_url),
    }));
  },
);

export const getDestinationBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }): Promise<Destination | null> => {
    const supabase = createPublicSupabase();
    const { data: row, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("getDestinationBySlug", error);
      throw new Error("Unable to load this destination. Please try again.");
    }
    if (!row) return null;
    return {
      ...row,
      image_url: resolveDestinationImage(row.slug, row.image_url),
    };
  });

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async (): Promise<SiteSettings> => {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) {
      if (error) console.error("getSiteSettings", error);
      return FALLBACK_SETTINGS;
    }
    return {
      ...data,
      logo_url: !data.logo_url || data.logo_url.startsWith("/__l5e/") ? "/logo.png" : data.logo_url,
      favicon_url: !data.favicon_url || data.favicon_url.startsWith("/__l5e/") ? "/favicon.png" : data.favicon_url,
    };
  } catch (e) {
    console.error("getSiteSettings", e);
    return FALLBACK_SETTINGS;
  }
});

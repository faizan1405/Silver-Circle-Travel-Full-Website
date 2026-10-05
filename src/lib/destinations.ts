import type { Database } from "@/integrations/supabase/types";

export type Destination = Database["public"]["Tables"]["destinations"]["Row"];
export type DestinationInsert = Database["public"]["Tables"]["destinations"]["Insert"];

export const DESTINATION_CATEGORIES = ["Europe", "Asia", "Middle East", "Africa", "Americas", "Other"] as const;

export const TRAVEL_STYLES = [
  "Scenic & Nature",
  "Culture & Heritage",
  "Relaxed Leisure",
  "City & Comfort",
] as const;

/** Indian currency formatting, e.g. ₹3,50,000 */
export function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** The price a traveller actually pays (discounted when set). */
export function effectivePrice(d: Pick<Destination, "original_price" | "discounted_price">) {
  return d.discounted_price != null && d.discounted_price < d.original_price ? d.discounted_price : d.original_price;
}

export function discountPercent(d: Pick<Destination, "original_price" | "discounted_price">) {
  if (d.discounted_price == null || d.original_price <= 0 || d.discounted_price >= d.original_price) return 0;
  return Math.round(((d.original_price - d.discounted_price) / d.original_price) * 100);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const DESTINATION_ASSET_IMAGES: Record<string, string> = {
  switzerland: "/destinations/switzerland.jpg",
  "france-switzerland": "/destinations/france-switzerland.jpg",
  italy: "/destinations/italy.jpg",
  "united-kingdom": "/destinations/united-kingdom.jpg",
  japan: "/destinations/japan.jpg",
  singapore: "/destinations/singapore.jpg",
  bali: "/destinations/bali.jpg",
  thailand: "/destinations/thailand.jpg",
  dubai: "/destinations/dubai.jpg",
  turkey: "/destinations/turkey.jpg",
};

export function resolveDestinationImage(slug: string, currentUrl?: string | null): string {
  if (currentUrl && !currentUrl.startsWith("/__l5e/")) {
    return currentUrl;
  }
  return DESTINATION_ASSET_IMAGES[slug] ?? `/destinations/${slug}.jpg`;
}

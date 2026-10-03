import type { Database } from "@/integrations/supabase/types";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

/** Brand constants. Contact details live in site settings (managed in the admin panel). */
export const SITE = {
  name: "Silver Circle Travel",
  tagline: "Travel Freely. We Take Care of the Rest.",
};

/** Used only if settings cannot be loaded from the backend. */
export const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  logo_url: "",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
  twitter: "",
  copyright_text: "",
  favicon_url: "",
  updated_at: new Date(0).toISOString(),
};

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappUrl(message: string, whatsapp: string) {
  const trimmed = whatsapp.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const sep = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${sep}text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/${digitsOnly(trimmed)}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_ENQUIRY =
  "Hello Silver Circle Travel, I would like to know more about your curated journeys for travellers 60+.";

export function openWhatsApp(message: string, whatsapp: string) {
  if (typeof window !== "undefined") {
    window.open(whatsappUrl(message, whatsapp), "_blank", "noopener,noreferrer");
  }
}

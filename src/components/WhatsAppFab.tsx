import { DEFAULT_ENQUIRY, whatsappUrl } from "@/lib/site";
import { useSiteSettings } from "@/lib/public-queries";

export function WhatsAppFab() {
  const settings = useSiteSettings();
  if (!settings.whatsapp) return null;
  return (
    <a
      href={whatsappUrl(DEFAULT_ENQUIRY, settings.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Silver Circle Travel on WhatsApp"
      className="hover-glow fixed bottom-6 right-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-base font-semibold text-white shadow-lift hover:bg-[#1ebe5b] sm:bottom-8 sm:right-8"
      style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.38s-1.04 1.01-1.04 2.470 1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}

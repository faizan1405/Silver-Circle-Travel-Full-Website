import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import { DEFAULT_ENQUIRY, whatsappUrl } from "@/lib/site";
import { useSiteSettings } from "@/lib/public-queries";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();
  const logoUrl = settings.logo_url || logo.url;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-all duration-700"
      style={{
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        backgroundColor: scrolled ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.28)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        boxShadow: scrolled ? "0 10px 34px -26px rgba(16,28,60,0.6)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.7)" : "1px solid transparent",
      }}
    >
      <nav className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:px-8">
        <Link to="/" className="group flex min-w-0 items-center" aria-label="Silver Circle Travel — home">
          <img
            src={logoUrl}
            alt="Silver Circle Travel"
            width={200}
            height={200}
            className="h-14 w-auto shrink-0 object-contain transition-transform duration-700 group-hover:scale-110 lg:h-20"
            style={{
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
              filter: "drop-shadow(0 4px 14px rgba(16,28,60,0.18))",
            }}
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative py-1 text-[1.05rem] font-semibold text-navy-deep transition-colors duration-500 hover:text-navy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 hover:after:scale-x-100 data-[status=active]:after:scale-x-100"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={whatsappUrl(DEFAULT_ENQUIRY, settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-primary !px-7 !py-3"
          >
            Enquire Now
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-navy/20 bg-white/70 text-navy-deep lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      <div
        className="overflow-hidden bg-white/95 transition-[max-height,opacity] duration-700 lg:hidden"
        style={{
          maxHeight: open ? 420 : 0,
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex flex-col gap-1 px-5 pb-6 pt-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-4 text-lg font-semibold text-navy-deep transition-colors hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={whatsappUrl(DEFAULT_ENQUIRY, settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-base btn-primary mt-2 w-full"
          >
            Enquire Now
          </a>
        </div>
      </div>
    </header>
  );
}

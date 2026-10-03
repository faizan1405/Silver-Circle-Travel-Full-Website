import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { SITE, whatsappUrl, DEFAULT_ENQUIRY, telHref } from "@/lib/site";
import { useSiteSettings } from "@/lib/public-queries";

export function Footer() {
  const settings = useSiteSettings();
  const socials = [
    { label: "Instagram", href: settings.instagram },
    { label: "Facebook", href: settings.facebook },
    { label: "LinkedIn", href: settings.linkedin },
    { label: "YouTube", href: settings.youtube },
    { label: "X / Twitter", href: settings.twitter },
  ].filter((s) => s.href);
  const copyright = settings.copyright_text || `© ${SITE.name}. All rights reserved.`;

  return (
    <footer className="bg-navy-deep text-white/85">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="hover-glow inline-flex rounded-3xl bg-white/95 p-4">
            <img src={settings.logo_url || logo.url} alt="Silver Circle Travel" width={200} height={200} loading="lazy" className="h-24 w-auto object-contain" />
          </div>
          <p className="mt-6 max-w-md font-display text-2xl text-white">{SITE.tagline}</p>
          <p className="mt-3 max-w-md text-white/70">
            Curated international journeys designed around the comfort, pace and peace of mind of
            travellers 60+ and their families.
          </p>
          {socials.length ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-all duration-500 hover:border-gold hover:text-gold">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h3 className="text-xl text-white">Explore</h3>
          <ul className="mt-4 space-y-3">
            {[
              { to: "/", label: "Home" },
              { to: "/destinations", label: "Destinations" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact Us" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-block text-white/75 transition-all duration-500 hover:translate-x-1 hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl text-white">Reach Us</h3>
          <ul className="mt-4 space-y-3 text-white/75">
            {settings.phone ? (
              <li>
                <a href={telHref(settings.phone)} className="inline-block transition-all duration-500 hover:translate-x-1 hover:text-gold">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-block transition-all duration-500 hover:translate-x-1 hover:text-gold">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.whatsapp ? (
              <li>
                <a
                  href={whatsappUrl(DEFAULT_ENQUIRY, settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-all duration-500 hover:translate-x-1 hover:text-gold"
                >
                  WhatsApp us
                </a>
              </li>
            ) : null}
            {settings.address ? <li className="pt-2 leading-relaxed">{settings.address}</li> : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>{copyright}</p>
          <p>Gurugram, India</p>
        </div>
      </div>
    </footer>
  );
}

import { ArrowUpRight, Check, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { type Destination, effectivePrice, formatINR, resolveDestinationImage } from "@/lib/destinations";
import { Reveal } from "./Reveal";

function PriceLine({ destination }: { destination: Destination }) {
  const price = effectivePrice(destination);
  const hasDiscount = price < destination.original_price;
  return (
    <p className="mt-1 text-xl font-semibold text-navy-deep">
      {formatINR(price)}
      <span className="text-sm font-normal text-muted-foreground"> / person</span>
      {hasDiscount ? (
        <span className="ml-2 text-sm font-normal text-muted-foreground line-through">{formatINR(destination.original_price)}</span>
      ) : null}
    </p>
  );
}

export function DestinationCard({ destination, index = 0 }: { destination: Destination; index?: number }) {
  const imgSrc = resolveDestinationImage(destination.slug, destination.image_url);
  return (
    <Reveal variant={index % 2 ? "right" : "left"} delay={(index % 3) * 80} className="group overflow-hidden rounded-[2rem] bg-card shadow-soft card-tilt interactive-card">
      <Link to="/destinations/$slug" params={{ slug: destination.slug }} className="block" aria-label={`View ${destination.title}`}>
        <div className="relative aspect-[1.2] overflow-hidden">
          <img
            src={imgSrc}
            alt={`${destination.title} travel experience`}
            loading={index > 2 ? "lazy" : "eager"}
            decoding="async"
            className="img-zoom h-full w-full object-cover"
            onError={(e) => {
              const fallback = `/destinations/${destination.slug}.jpg`;
              if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                e.currentTarget.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/75 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">{destination.category}</p>
              <h3 className="mt-1 text-3xl text-white">{destination.title}</h3>
            </div>
            {destination.duration ? <span className="rounded-full bg-white/15 px-3 py-2 text-sm backdrop-blur-md">{destination.duration}</span> : null}
          </div>
        </div>
      </Link>
      <div className="p-6">
        <p className="min-h-[4.5rem] text-muted-foreground line-clamp-3">{destination.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Starting from</p>
            <PriceLine destination={destination} />
          </div>
          <Link to="/destinations/$slug" params={{ slug: destination.slug }} className="hover-glow inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-navy-deep hover:bg-gold hover:text-navy-deep" aria-label={`Explore ${destination.title}`}>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export function PackageCard({ destination, index = 0 }: { destination: Destination; index?: number }) {
  const imgSrc = resolveDestinationImage(destination.slug, destination.image_url);
  return (
    <Reveal variant="scale" delay={index * 90} className="group interactive-card overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
      <Link to="/destinations/$slug" params={{ slug: destination.slug }} className="relative block aspect-[1.45] overflow-hidden">
        <img
          src={imgSrc}
          alt={`${destination.title} curated journey`}
          loading="lazy"
          decoding="async"
          className="img-zoom h-full w-full object-cover"
          onError={(e) => {
            const fallback = `/destinations/${destination.slug}.jpg`;
            if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
              e.currentTarget.src = fallback;
            }
          }}
        />
        {destination.duration ? <div className="hover-glow absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-navy-deep">{destination.duration}</div> : null}
      </Link>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Signature journey</p><h3 className="mt-1 text-3xl">{destination.title}</h3></div>
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-gold" />
        </div>
        <p className="mt-4 text-muted-foreground">{destination.highlights.length ? destination.highlights.slice(0, 2).join(" · ") : destination.location}</p>
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-sage" /> 4/5-star stays</span>
          <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-sage" /> Gentle pacing</span>
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sage" /> 24x7 support</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sage" /> Guided touring</span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Starting from</p><PriceLine destination={destination} /></div>
          <Link to="/contact" search={{ destination: destination.title }} className="btn-base btn-primary !px-5 !py-3 text-sm">Enquire</Link>
        </div>
      </div>
    </Reveal>
  );
}

export function FourFeaturedDestinations({ destinations }: { destinations: Destination[] }) {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{destinations.slice(0, 4).map((d, i) => <DestinationCard key={d.id} destination={d} index={i} />)}</div>;
}

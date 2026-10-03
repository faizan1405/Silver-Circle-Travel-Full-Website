import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, Sparkles } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";
import { discountPercent, effectivePrice, formatINR } from "@/lib/destinations";
import { destinationBySlugQuery, useSiteSettings } from "@/lib/public-queries";
import { whatsappUrl } from "@/lib/site";

export const Route = createFileRoute("/destinations/$slug")({
  loader: async ({ context, params }) => {
    const destination = await context.queryClient.ensureQueryData(destinationBySlugQuery(params.slug));
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.destination) {
      return { meta: [{ title: "Destination not found | Silver Circle Travel" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.destination;
    const title = `${d.title} | Silver Circle Travel`;
    const description = d.description.slice(0, 155);
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (/^https:\/\//i.test(d.image_url)) {
      meta.push({ property: "og:image", content: d.image_url }, { name: "twitter:image", content: d.image_url });
    }
    return { meta };
  },
  notFoundComponent: DestinationNotFound,
  errorComponent: DetailError,
  component: DestinationDetail,
});

function DetailError() {
  return (
    <SiteChrome>
      <div className="px-5 pb-24 pt-44 text-center">
        <h1 className="text-4xl">Unable to load this destination.</h1>
        <p className="mt-3 text-muted-foreground">Please try again.</p>
      </div>
    </SiteChrome>
  );
}

function DestinationNotFound() {
  return (
    <SiteChrome>
      <section className="bg-ivory px-5 pb-24 pt-44 text-center lg:px-8">
        <h1 className="text-5xl">This journey is not available.</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">It may have been retired or renamed. Our other journeys are waiting for you.</p>
        <div className="mt-8"><Link to="/destinations" className="btn-base btn-primary">See all destinations</Link></div>
      </section>
    </SiteChrome>
  );
}

function DestinationDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(destinationBySlugQuery(slug));
  const settings = useSiteSettings();
  if (!data) return <DestinationNotFound />;
  const d = data;
  const price = effectivePrice(d);
  const discount = discountPercent(d);

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <img src={d.image_url} alt={`${d.title} travel experience`} className="absolute inset-0 h-full w-full object-cover opacity-55" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/20" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-44 lg:px-8 lg:pb-28">
          <Reveal>
            <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/75 hover:text-gold">
              <ArrowLeft className="h-4 w-4" /> All destinations
            </Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-gold">{d.category}{d.country ? ` · ${d.country}` : ""}</p>
            <h1 className="mt-4 max-w-4xl text-5xl text-white sm:text-7xl">{d.title}</h1>
            <div className="mt-6 flex flex-wrap gap-3 text-white/85">
              {d.location ? <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md"><MapPin className="h-4 w-4" /> {d.location}</span> : null}
              {d.duration ? <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md"><Clock3 className="h-4 w-4" /> {d.duration}</span> : null}
              {d.is_featured ? <span className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-semibold text-navy-deep"><Sparkles className="h-4 w-4" /> Featured journey</span> : null}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_0.9fr]">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy">About this journey</p>
            <div className="mt-4 space-y-4 whitespace-pre-line text-xl leading-relaxed text-muted-foreground">{d.description}</div>

            {d.highlights.length ? (
              <div className="mt-12">
                <h2 className="text-4xl">Highlights</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {d.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-soft"><Sparkles className="mt-1 h-5 w-5 shrink-0 text-gold" /><span className="text-navy-deep">{h}</span></li>
                  ))}
                </ul>
              </div>
            ) : null}

            {d.inclusions.length ? (
              <div className="mt-12">
                <h2 className="text-4xl">What is included</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {d.inclusions.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-lg text-muted-foreground"><Check className="h-5 w-5 shrink-0 text-sage" /> {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>

          <Reveal variant="right">
            <div className="glass-panel sticky top-28 rounded-[2rem] p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Starting from</p>
              <p className="mt-2 font-display text-5xl text-navy-deep">{formatINR(price)}</p>
              <p className="mt-1 text-muted-foreground">per person</p>
              {discount > 0 ? (
                <p className="mt-3 text-lg">
                  <span className="text-muted-foreground line-through">{formatINR(d.original_price)}</span>
                  <span className="ml-3 rounded-full bg-gold/25 px-3 py-1 text-sm font-semibold text-navy-deep">Save {discount}%</span>
                </p>
              ) : null}
              <dl className="mt-6 space-y-3 border-t border-border pt-6 text-lg">
                {d.duration ? <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Duration</dt><dd className="font-semibold text-navy-deep">{d.duration}</dd></div> : null}
                {d.country ? <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Country</dt><dd className="text-right font-semibold text-navy-deep">{d.country}</dd></div> : null}
                {d.best_time ? <div className="flex justify-between gap-4"><dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Best time</dt><dd className="text-right font-semibold text-navy-deep">{d.best_time}</dd></div> : null}
              </dl>
              <div className="mt-8 grid gap-3">
                <Magnetic className="w-full">
                  <Link to="/contact" search={{ destination: d.title }} className="btn-base btn-primary w-full">Enquire about {d.title}</Link>
                </Magnetic>
                {settings.whatsapp ? (
                  <a href={whatsappUrl(`Hello Silver Circle Travel, I would like to enquire about the ${d.title} journey.`, settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-base btn-outline w-full">
                    Chat on WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteChrome>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { SiteChrome } from "@/components/SiteChrome";
import { DestinationCard } from "@/components/TravelCards";
import { TRAVEL_STYLES } from "@/lib/destinations";
import { activeDestinationsQuery } from "@/lib/public-queries";
import { Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";

export const Route = createFileRoute("/destinations/")({
  validateSearch: z.object({ destination: z.string().optional(), style: z.string().optional(), dates: z.string().optional(), travellers: z.string().optional() }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activeDestinationsQuery),
  head: () => ({ meta: [
    { title: "Destinations | Silver Circle Travel" },
    { name: "description", content: "Explore comfortable, carefully paced international journeys for travellers 60+ from India." },
    { property: "og:title", content: "Destinations | Silver Circle Travel" },
    { property: "og:description", content: "Explore the world at your pace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  errorComponent: DestinationsError,
  component: DestinationsPage,
});

function DestinationsPage() {
  const search = Route.useSearch();
  const { data: destinations } = useSuspenseQuery(activeDestinationsQuery);
  const [query, setQuery] = useState(search.destination ?? "");
  const [style, setStyle] = useState(search.style ?? "");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) =>
      (!q || d.title.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)) &&
      (!style || d.travel_styles.includes(style)),
    );
  }, [destinations, query, style]);
  return <SiteChrome>
    <section className="bg-navy-deep px-5 pb-20 pt-44 text-white lg:px-8 lg:pb-28"><div className="mx-auto max-w-7xl"><Reveal><p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">Go gently, go far</p><h1 className="mt-4 max-w-4xl text-5xl text-white sm:text-7xl">Places that feel like a story worth telling.</h1><p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/75">Choose a country, a feeling or a season. Every itinerary is built around comfort, companionship and time to take it all in.</p></Reveal></div></section>
    <section className="bg-ivory px-5 py-16 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="glass-panel rounded-[2rem] p-5 sm:p-7"><div className="grid gap-4 md:grid-cols-[1fr_0.6fr_auto] md:items-end"><label className="block"><span className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Search destinations</span><span className="relative block"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try Japan or Switzerland" className="field-glow w-full rounded-2xl border border-border bg-card px-5 py-4 pl-12 text-lg text-navy-deep outline-none focus:border-navy" /></span></label><label className="block"><span className="mb-2 block text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Travel style</span><select value={style} onChange={(e) => setStyle(e.target.value)} className="field-glow w-full rounded-2xl border border-border bg-card px-5 py-4 text-lg text-navy-deep outline-none focus:border-navy"><option value="">All styles</option>{TRAVEL_STYLES.map((item) => <option key={item}>{item}</option>)}</select></label><Magnetic><button type="button" onClick={() => { setQuery(""); setStyle(""); }} className="btn-base btn-outline"><SlidersHorizontal className="h-5 w-5" /> Clear</button></Magnetic></div></div><div className="mt-14 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy">Our collection</p><h2 className="mt-2 text-4xl">{filtered.length} {filtered.length === 1 ? "journey" : "journeys"} to consider</h2></div><p className="hidden text-right text-muted-foreground sm:block">All prices are starting estimates<br />and can be tailored to your dates.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((d, i) => <DestinationCard destination={d} index={i} key={d.id} />)}</div>{filtered.length === 0 ? <div className="py-20 text-center"><h3 className="text-3xl">No journey found yet.</h3><p className="mt-3 text-muted-foreground">Try another destination or style and we will keep looking with you.</p></div> : null}</div></section>
  </SiteChrome>;
}

function DestinationsError() {
  return <SiteChrome><div className="px-5 pb-24 pt-44 text-center"><h1 className="text-4xl">Unable to load destinations.</h1><p className="mt-3 text-muted-foreground">Please try again.</p></div></SiteChrome>;
}

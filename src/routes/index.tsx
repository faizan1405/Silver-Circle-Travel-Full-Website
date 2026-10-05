import { Link } from "@tanstack/react-router";
import { HeartHandshake, Headphones, MessageCircleMore, ShieldCheck, Utensils, ArrowRight, PlaneTakeoff, Hotel, Compass, UsersRound } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollVideoHero } from "@/components/ScrollVideoHero";
import { SearchPanel } from "@/components/SearchPanel";
import { SiteChrome } from "@/components/SiteChrome";
import { SectionIntro } from "@/components/SectionIntro";
import { FourFeaturedDestinations, PackageCard } from "@/components/TravelCards";
import { Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";
import slowTravel from "@/assets/solo-travel.png";
import { DEFAULT_ENQUIRY, whatsappUrl } from "@/lib/site";
import { useSuspenseQuery } from "@tanstack/react-query";
import { activeDestinationsQuery, useSiteSettings } from "@/lib/public-queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(activeDestinationsQuery),
  head: () => ({ meta: [
    { title: "Silver Circle Travel | Curated Journeys for 60+" },
    { name: "description", content: "Premium international journeys with comfort, companionship and family reassurance for travellers 60+." },
    { property: "og:title", content: "Silver Circle Travel | Curated Journeys for 60+" },
    { property: "og:description", content: "Travel freely. We take care of the rest." },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "/hero-poster.jpg" },
    { name: "twitter:image", content: "/hero-poster.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});

const careItems = [
  [HeartHandshake, "Dedicated Tour Manager", "A familiar, capable companion from the airport welcome to the journey home."],
  [MessageCircleMore, "FamilyConnect", "Daily updates keep children and family members close, reassured and in the loop."],
  [Utensils, "DietaryCare", "Meals and preferences are understood in advance, with familiar choices never far away."],
  [ShieldCheck, "Emergency Support", "A responsive team and clear local support are available around the clock."],
  [Headphones, "Medication Assistance", "Thoughtful reminders and practical coordination help every day feel effortless."],
] as const;

const services = [[PlaneTakeoff, "Seamless flights", "Well-timed connections and airport assistance where it matters."], [Hotel, "Comfortable stays", "Hand-picked 4 and 5-star hotels with fewer changes."], [Compass, "Considered touring", "Guided days that leave space for lunch, rest and wonder."], [UsersRound, "Small groups", "A warm pace, familiar faces and no feeling of being rushed."]] as const;

const testimonials = [
  ["The pace was the real luxury. We saw Switzerland beautifully and never once felt hurried.", "Meena & Ramesh Iyer", "Mumbai · Switzerland, 2025"],
  ["Our daughter received the daily updates, but we felt completely independent. That balance was wonderful.", "Anita Bhatia", "New Delhi · Japan, 2025"],
  ["Every small detail had been thought through — from the Indian meals to the gentle train journeys.", "Suresh Menon", "Bengaluru · France & Switzerland, 2024"],
];

function HomePage() {
  const settings = useSiteSettings();
  const { data: destinations } = useSuspenseQuery(activeDestinationsQuery);
  const featured = destinations.filter((d) => d.is_featured);
  return <SiteChrome loading>
    <ScrollVideoHero />
    <SearchPanel />

    <section id="featured-destinations" className="bg-ivory px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl"><SectionIntro eyebrow="Where will you go?" title="The world, at your pace." copy="From Alpine railways to temple gardens, every journey is shaped around comfort, curiosity and the people you love." /><div className="mt-12"><FourFeaturedDestinations destinations={featured} /></div><div className="mt-10 text-center"><Magnetic><Link to="/destinations" className="btn-base btn-outline">Explore all destinations <ArrowRight className="h-5 w-5" /></Link></Magnetic></div></div>
    </section>

    <section className="bg-secondary/55 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="The Silver Circle promise" title="Care is the journey." copy="International travel feels different when someone is thinking two steps ahead. Our care is quietly present in every detail." /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">{careItems.map(([Icon, title, copy], i) => <Reveal key={title} variant="up" delay={i * 70} className={`interactive-card min-h-72 rounded-[1.75rem] bg-card p-6 shadow-soft lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""}`}><Icon className="hover-glow h-9 w-9 text-navy" /><h3 className="mt-7 text-2xl">{title}</h3><p className="mt-3 text-muted-foreground">{copy}</p></Reveal>)}</div><p className="mx-auto mt-10 max-w-3xl text-center text-lg text-muted-foreground">From the first conversation to the journey home, one caring team stays close — so you can travel confidently and your family can feel reassured.</p></div></section>

    <section className="bg-ivory px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="Everything, thoughtfully arranged" title="The details that let you simply enjoy." /><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{services.map(([Icon, title, copy], i) => <Reveal key={title} variant="up" delay={i * 90} className="interactive-card group rounded-2xl border-t-2 border-gold p-5 pt-7 hover:bg-card"><Icon className="hover-glow h-8 w-8 text-navy" /><h3 className="mt-5 text-2xl">{title}</h3><p className="mt-3 text-muted-foreground">{copy}</p></Reveal>)}</div></div></section>

    <section className="relative overflow-hidden bg-navy-deep px-5 py-20 text-white lg:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]"><Reveal variant="left" className="media-frame group relative overflow-hidden rounded-[2.5rem]"><img src={slowTravel} alt="A calm, scenic slow travel moment" loading="lazy" className="img-zoom h-[28rem] w-full object-cover" /><div className="absolute inset-0 bg-navy-deep/20" /></Reveal><div><SectionIntro light eyebrow="Slow travel" title="More time to notice the view." copy="Fewer hotel changes. Shorter transfers. Relaxed mornings. We design the space between the highlights, because that is where travel begins to feel like yours." /><div className="mt-8 grid grid-cols-2 gap-4 text-white/80 sm:grid-cols-3">{["Comfort-first itineraries", "Small, welcoming groups", "Room to rest and wander"].map((item) => <div key={item} className="border-l border-gold/70 pl-4 text-lg">{item}</div>)}</div></div></div></section>

    <section className="bg-ivory px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]"><div><SectionIntro eyebrow="A little closer to home" title="FamilyConnect keeps everyone close." copy="While you are discovering a new city, your family can receive a simple daily note — where you went, what you enjoyed and what tomorrow holds." /><Magnetic className="mt-8"><Link to="/about" className="btn-base btn-primary">See how we care <ArrowRight className="h-5 w-5" /></Link></Magnetic></div><Reveal variant="right" className="mx-auto w-full max-w-md"><div className="overflow-hidden rounded-[2.5rem] border-[10px] border-navy-deep bg-navy-deep"><div className="overflow-hidden rounded-[1.75rem] bg-chat-surface"><div className="bg-navy-deep px-6 py-5 text-primary-foreground"><p className="text-sm text-primary-foreground/60">Silver Circle Travel</p><p className="font-semibold">FamilyConnect</p></div><div className="space-y-5 p-6"><div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-chat-sent p-4 text-sm text-chat-foreground">Good morning! We are off to see the gardens in Kyoto today. Everyone is well and enjoying the sunshine. <span className="mt-1 block text-right text-[10px] text-muted-foreground">9:12 AM ✓✓</span></div><div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-card p-4 text-sm text-chat-foreground shadow-soft">Wonderful to hear. Have a beautiful day ❤️</div><div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-chat-sent p-4 text-sm text-chat-foreground">Our tour manager says we have a relaxed afternoon after lunch.</div></div></div></div></Reveal></div></div></section>

    <section className="bg-secondary/55 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="Journeys worth taking slowly" title="A beautiful beginning is waiting." /><div className="mt-12 grid gap-6 lg:grid-cols-3">{featured.slice(0, 3).map((d, i) => <PackageCard key={d.slug} destination={d} index={i} />)}</div></div></section>

    <section className="overflow-hidden bg-ivory py-20 lg:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-8"><SectionIntro eyebrow="Kind words from the road" title="The memories that stay." /></div><div className="marquee-wrap mt-12 overflow-hidden"><div className="marquee-track flex w-max gap-5 px-5">{[...testimonials, ...testimonials].map(([quote, name, detail], i) => <article key={`${name}-${i}`} className="interactive-card card-tilt w-[min(82vw,25rem)] rounded-[2rem] border border-border bg-card p-7 shadow-soft"><div className="text-gold">★★★★★</div><p className="mt-5 font-display text-2xl leading-snug text-navy-deep">“{quote}”</p><p className="mt-7 font-semibold text-navy-deep">{name}</p><p className="text-muted-foreground">{detail}</p></article>)}</div></div></section>

    <section className="bg-gold px-5 py-20 lg:px-8 lg:py-24"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left"><div><p className="text-sm font-semibold uppercase tracking-[0.26em] text-navy-deep/65">Your next chapter</p><h2 className="mt-3 max-w-2xl text-4xl sm:text-5xl">Let us make the world feel wonderfully close.</h2><p className="mt-4 max-w-xl text-lg text-navy-deep/75">Share a destination, a date or simply a wish. We will take care of the rest.</p></div><Magnetic className="shrink-0"><a href={whatsappUrl(DEFAULT_ENQUIRY, settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-base btn-primary">Enquire Now <ArrowRight className="h-5 w-5" /></a></Magnetic></div></section>
  </SiteChrome>;
}
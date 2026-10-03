import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Shield, UsersRound, type LucideIcon } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { SiteChrome } from "@/components/SiteChrome";
import { Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";
import { SectionIntro } from "@/components/SectionIntro";

const principles: Array<[LucideIcon, string, string]> = [
  [Heart, "Warm companionship", "A welcoming group and a dedicated tour manager make new places feel familiar."],
  [Shield, "Quiet confidence", "From visa assistance to emergency support, the practical details are handled with care."],
  [UsersRound, "Family reassurance", "Our FamilyConnect updates help loved ones feel close, even from another time zone."],
];

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Us | Silver Circle Travel" },
    { name: "description", content: "Meet the people and principles behind Silver Circle Travel, making international travel easier for 60+ travellers." },
    { property: "og:title", content: "About Us | Silver Circle Travel" },
    { property: "og:description", content: "Thoughtful travel, beautifully looked after." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  return <SiteChrome>
    <section className="relative min-h-[78vh] overflow-hidden bg-navy-deep"><img src={aboutHero} alt="A couple enjoying a peaceful travel view" className="absolute inset-0 h-full w-full object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/65 to-transparent" /><div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-5 pb-20 pt-44 lg:px-8 lg:pb-28"><Reveal><p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">About Silver Circle</p><h1 className="mt-4 max-w-3xl text-5xl text-white sm:text-7xl">Travel is better when you feel looked after.</h1><p className="mt-6 max-w-xl text-xl leading-relaxed text-white/80">We make international travel easier, safer and more comfortable for travellers 60+ — and more reassuring for the families who love them.</p></Reveal></div></section>
    <section className="bg-ivory px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]"><SectionIntro eyebrow="Why we began" title="A little more care changes everything." /><Reveal variant="right" className="space-y-6 text-lg leading-relaxed text-muted-foreground"><p>Silver Circle Travel was born from a simple truth: seeing the world should not become harder just because the people you love are not travelling beside you.</p><p>We design and host premium international journeys for mature travellers, couples and NRI families who want the freedom of discovery with the comfort of knowing someone capable is always close by.</p><p>That means shorter transfers, familiar support, thoughtful meals, comfortable hotels and a human being who knows your name. Not a checklist. A considered way to travel.</p></Reveal></div></section>
    <section className="bg-secondary/55 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="What we stand for" title="The circle around every journey." /><div className="mt-12 grid gap-6 md:grid-cols-3">{principles.map(([Icon, title, copy], i) => <Reveal key={title} delay={i * 100} className="rounded-[2rem] bg-card p-8 shadow-soft"><Icon className="h-9 w-9 text-navy" /><h2 className="mt-8 text-3xl">{title}</h2><p className="mt-4 text-lg text-muted-foreground">{copy}</p></Reveal>)}</div></div></section>
    <section className="bg-ivory px-5 py-20 text-center lg:px-8 lg:py-28"><Reveal className="mx-auto max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.28em] text-navy">Ready when you are</p><h2 className="mt-4 text-5xl">Your next chapter can start anywhere.</h2><p className="mt-5 text-lg text-muted-foreground">Tell us where you have always wanted to go. We will help you get there beautifully.</p><Magnetic className="mt-8"><Link to="/contact" className="btn-base btn-gold">Talk to our travel team <ArrowRight className="h-5 w-5" /></Link></Magnetic></Reveal></section>
  </SiteChrome>;
}
import { FormEvent, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { activeDestinationsQuery, useSiteSettings } from "@/lib/public-queries";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";
import { telHref, whatsappUrl } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  validateSearch: z.object({ destination: z.string().optional() }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activeDestinationsQuery),
  head: () => ({ meta: [
    { title: "Contact Us | Silver Circle Travel" },
    { name: "description", content: "Plan a comfortable international journey with Silver Circle Travel. Speak with our Gurugram travel team." },
    { property: "og:title", content: "Contact Us | Silver Circle Travel" },
    { property: "og:description", content: "Start planning a journey that feels like yours." },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "/logo.png" },
    { name: "twitter:image", content: "/logo.png" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ContactPage,
});

const field = "field-glow mt-2 w-full rounded-2xl border border-border bg-card px-5 py-4 text-lg text-navy-deep outline-none focus:border-navy";

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const settings = useSiteSettings();
  const { data: destinations } = useSuspenseQuery(activeDestinationsQuery);
  const { destination: preselected } = Route.useSearch();
  const defaultDestination = destinations.find((d) => d.title.toLowerCase() === preselected?.toLowerCase())?.title ?? (preselected || "Not sure yet");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const enquiry = {
      name: get("name").slice(0, 120),
      phone: get("phone").slice(0, 30),
      email: get("email").slice(0, 255),
      preferred_destination: get("destination").slice(0, 150),
      travel_date: get("dates").slice(0, 40),
      number_of_travellers: get("travellers").slice(0, 10),
      message: get("message").slice(0, 2000),
    };
    const message = ["Hello Silver Circle Travel, I would like to plan a journey.", `Name: ${enquiry.name}`, `Phone: ${enquiry.phone}`, `Email: ${enquiry.email}`, `Preferred destination: ${enquiry.preferred_destination}`, `Travel dates: ${enquiry.travel_date}`, `Travellers: ${enquiry.number_of_travellers}`, `Message: ${enquiry.message}`].join("\n");
    setSending(true);
    const saving = supabase.from("enquiries").insert(enquiry);
    if (settings.whatsapp) window.open(whatsappUrl(message, settings.whatsapp), "_blank", "noopener,noreferrer");
    const { error } = await saving;
    setSending(false);
    if (error) {
      console.error(error);
      toast.error("We could not save your enquiry. Please check your details and try again.");
      return;
    }
    setSent(true);
    form.reset();
    toast.success("Thank you — your enquiry has been received.");
  };
  return <SiteChrome>
    <section className="bg-navy-deep px-5 pb-20 pt-44 text-white lg:px-8 lg:pb-28"><div className="mx-auto max-w-7xl"><Reveal><p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">Start a conversation</p><h1 className="mt-4 max-w-4xl text-5xl text-white sm:text-7xl">Tell us where you would love to go.</h1><p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/75">A few details help us shape a journey around your comfort. Or call us — a real person will be happy to listen.</p></Reveal></div></section>
    <section className="bg-ivory px-5 py-16 lg:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr]"><Reveal className="rounded-[2rem] bg-card p-6 shadow-soft sm:p-10"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy">Journey enquiry</p><h2 className="mt-2 text-4xl">Let’s plan the details.</h2></div><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-1"><span className="font-semibold text-navy-deep">Name</span><input required name="name" className={field} placeholder="Your full name" /></label><label><span className="font-semibold text-navy-deep">Phone</span><input required name="phone" type="tel" className={field} placeholder="+91" /></label><label><span className="font-semibold text-navy-deep">Email</span><input required name="email" type="email" className={field} placeholder="you@example.com" /></label><label><span className="font-semibold text-navy-deep">Preferred destination</span><select name="destination" className={field} defaultValue={defaultDestination} key={defaultDestination}><option>Not sure yet</option>{destinations.map((d) => <option key={d.id}>{d.title}</option>)}{preselected && !destinations.some((d) => d.title.toLowerCase() === preselected.toLowerCase()) ? <option>{preselected}</option> : null}</select></label><label><span className="font-semibold text-navy-deep">Travel dates</span><input name="dates" type="month" className={field} /></label><label><span className="font-semibold text-navy-deep">Number of travellers</span><select name="travellers" className={field}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}{n === 6 ? "+" : ""}</option>)}</select></label><label className="sm:col-span-2"><span className="font-semibold text-navy-deep">Message</span><textarea name="message" rows={4} className={field} placeholder="Tell us what would make this journey comfortable for you." /></label><div className="sm:col-span-2"><Magnetic className="w-full sm:w-auto"><button type="submit" disabled={sending} className="btn-base btn-primary w-full sm:w-auto disabled:opacity-70">{sending ? "Sending…" : sent ? "Enquiry sent — send another" : "Send enquiry"} <Send className="h-5 w-5" /></button></Magnetic><p className="mt-3 text-sm text-muted-foreground">Your enquiry reaches our team directly and also opens a WhatsApp conversation with us.</p></div></form></Reveal><Reveal variant="right" className="lg:pl-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy">Come say hello</p><h2 className="mt-3 text-4xl">We are here to help.</h2><div className="mt-9 space-y-7"><a href={telHref(settings.phone)} className="hover-glow flex gap-4 rounded-2xl p-2 text-lg hover:bg-secondary/60"><Phone className="mt-1 h-6 w-6 shrink-0 text-gold" /><span><strong className="block text-navy-deep">Call us</strong>{settings.phone}</span></a><a href={`mailto:${settings.email}`} className="hover-glow flex gap-4 rounded-2xl p-2 text-lg hover:bg-secondary/60"><Mail className="mt-1 h-6 w-6 shrink-0 text-gold" /><span><strong className="block text-navy-deep">Email</strong>{settings.email}</span></a><a href={whatsappUrl("Hello Silver Circle Travel, I would like to speak with your travel team.", settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover-glow flex gap-4 rounded-2xl p-2 text-lg hover:bg-secondary/60"><Send className="mt-1 h-6 w-6 shrink-0 text-gold" /><span><strong className="block text-navy-deep">WhatsApp</strong>Message our travel team</span></a><div className="hover-glow flex gap-4 rounded-2xl p-2 text-lg hover:bg-secondary/60"><MapPin className="mt-1 h-6 w-6 shrink-0 text-gold" /><span><strong className="block text-navy-deep">Gurugram office</strong>{settings.address}</span></div></div><div className="mt-12 rounded-[1.75rem] bg-secondary p-6"><p className="font-display text-2xl text-navy-deep">“The best journeys begin with a good conversation.”</p><p className="mt-3 text-muted-foreground">Tell us what comfortable travel looks like for you.</p></div></Reveal></div></section>
  </SiteChrome>;
}
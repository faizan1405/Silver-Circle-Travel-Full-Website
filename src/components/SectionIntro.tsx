import { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionIntro({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: ReactNode; light?: boolean }) {
  return (
    <Reveal className="max-w-3xl">
      <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${light ? "text-gold" : "text-navy"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-4xl sm:text-5xl lg:text-6xl ${light ? "text-white" : ""}`}>{title}</h2>
      {copy ? <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${light ? "text-white/75" : "text-muted-foreground"}`}>{copy}</p> : null}
    </Reveal>
  );
}
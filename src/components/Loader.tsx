import { useEffect, useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import { SITE } from "@/lib/site";

export function Loader() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setHidden(true), 2600);
    const t2 = window.setTimeout(() => setGone(true), 3600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ivory transition-opacity duration-1000"
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Large aircraft approaching head-on, flying straight towards the viewer */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="absolute h-[2px] w-[46vw] max-w-3xl origin-center hairline"
          style={{ animation: "trail-sweep 1.9s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
        <svg
          viewBox="0 0 512 512"
          className="h-[46vmin] w-[46vmin] text-navy"
          fill="currentColor"
          style={{
            animation: "plane-approach 2s cubic-bezier(0.45,0,0.25,1) forwards",
            filter: "drop-shadow(0 22px 40px rgba(16,28,60,0.28))",
          }}
        >
          {/* Front-on aircraft silhouette: fuselage, wings, engines, tailplane */}
          <ellipse cx="256" cy="250" rx="34" ry="62" />
          <path d="M256 236c8 0 14 5 15 12l6 44c1 8-8 15-21 15s-22-7-21-15l6-44c1-7 7-12 15-12z" />
          <path d="M256 268c4 0 7 2 8 6l4 20-24 0 4-20c1-4 4-6 8-6z" opacity="0.4" />
          {/* Wings */}
          <path d="M252 262h8l186 34c8 1 12 6 12 12s-5 10-13 10l-185-14v-42z" />
          <path d="M260 262h-8L66 296c-8 1-12 6-12 12s5 10 13 10l185-14v-42z" />
          {/* Engines */}
          <rect x="330" y="288" width="58" height="34" rx="17" />
          <rect x="124" y="288" width="58" height="34" rx="17" />
          {/* Vertical stabiliser */}
          <path d="M250 150h12l6 76h-24z" />
          {/* Tailplane */}
          <path d="M256 196h6l74 12c5 1 7 3 7 6s-3 5-8 5l-79-6z" />
          <path d="M256 196h-6l-74 12c-5 1-7 3-7 6s3 5 8 5l79-6z" />
        </svg>
      </div>

      <img
        src={logo.url}
        alt=""
        width={384}
        height={384}
        className="relative h-60 w-60 object-contain sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96"
        style={{
          animation: "logo-in 1.1s cubic-bezier(0.22,1,0.36,1) 1.15s both",
          filter: "drop-shadow(0 10px 34px rgba(16,28,60,0.22))",
        }}
      />
      <p
        className="relative mt-3 font-display text-2xl tracking-[0.18em] text-navy-deep uppercase sm:text-3xl"
        style={{ animation: "rise-in 0.9s cubic-bezier(0.22,1,0.36,1) 1.7s both" }}
      >
        {SITE.name}
      </p>
      <p
        className="relative mt-2 text-base text-muted-foreground italic sm:text-lg"
        style={{ animation: "rise-in 0.9s cubic-bezier(0.22,1,0.36,1) 2s both" }}
      >
        {SITE.tagline}
      </p>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { Magnetic } from "./Magnetic";

const DESKTOP_SRC = "/videos/hero-pc.mp4";
const MOBILE_SRC = "/videos/hero-mobile.mp4";
const DESKTOP_POSTER = "/images/hero-pc-poster.webp";
const MOBILE_POSTER = "/images/hero-mobile-poster.webp";
const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

const revealStyle = (progress: number, start: number, span = 0.12) => {
  const amount = Math.min(Math.max((progress - start) / span, 0), 1);
  return {
    opacity: `${amount}`,
    transform: `translate3d(0, ${(1 - amount) * 28}px, 0)`,
  };
};

export function ScrollVideoHero() {
  const wrapRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const copy = copyRef.current;
    const video = videoRef.current;
    if (!wrap || !copy || !video) return;

    let activeSrc = "";
    let duration = 0;
    let targetTime = 0;
    let frame = 0;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(copy.querySelectorAll<HTMLElement>("[data-hero-line]"));

    // Keep the video permanently paused; page scroll drives currentTime.
    const keepPaused = () => {
      if (!video.paused) {
        video.pause();
      }
    };
    video.addEventListener("play", keepPaused);
    keepPaused();

    const scrollProgress = () => {
      const total = Math.max(wrap.offsetHeight - window.innerHeight, 1);
      return Math.min(Math.max(-wrap.getBoundingClientRect().top / total, 0), 1);
    };

    const applyProgressToVideo = (progress: number) => {
      if (!reduceMotion && duration > 0) {
        const safeDuration = Math.max(0, duration - 0.05);
        targetTime = progress * safeDuration;
      }
    };

    const measureDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        duration = video.duration;
        const progress = scrollProgress();
        const safeDuration = Math.max(0, duration - 0.05);
        targetTime = progress * safeDuration;
        video.currentTime = targetTime;
      }
    };
    video.addEventListener("loadedmetadata", measureDuration);

    const syncSource = () => {
      const isMobile = window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
      const targetSrc = isMobile ? MOBILE_SRC : DESKTOP_SRC;
      const targetPoster = isMobile ? MOBILE_POSTER : DESKTOP_POSTER;

      if (activeSrc === targetSrc) return;

      activeSrc = targetSrc;
      duration = 0;

      video.poster = targetPoster;
      video.src = targetSrc;
      video.preload = "auto";
      video.load();

      // If metadata is already cached, measure immediately
      if (video.readyState >= 1) {
        measureDuration();
      }
    };

    const update = () => {
      frame = 0;
      const progress = scrollProgress();

      items.forEach((item) => {
        const start = Number(item.dataset["heroLine"] ?? 0);
        Object.assign(item.style, revealStyle(progress, start));
      });

      const fade = progress < 0.82 ? 1 : Math.max(0, 1 - (progress - 0.82) / 0.16);
      copy.style.opacity = `${fade}`;

      applyProgressToVideo(progress);
    };

    // Continuous rAF loop keeps the video clock tightly synchronized with scroll.
    // Settles immediately when scroll stops (< 50ms) so stop strictly means stop.
    let rafId = 0;
    const tick = () => {
      if (duration > 0) {
        const diff = targetTime - video.currentTime;
        const absDiff = Math.abs(diff);
        if (absDiff > 0.008) {
          // Responsive ease that settles in 2-3 frames without sluggish lag
          const ease = absDiff > 0.25 ? 0.7 : 0.55;
          const next = video.currentTime + diff * ease;
          video.currentTime = Math.min(
            Math.max(next, 0),
            Math.max(duration - 0.05, 0),
          );
        } else if (absDiff > 0) {
          // Snap directly to targetTime so video settles completely when scrolling stops
          video.currentTime = Math.min(
            Math.max(targetTime, 0),
            Math.max(duration - 0.05, 0),
          );
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const onMediaChange = () => {
      syncSource();
      requestUpdate();
    };

    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    mql.addEventListener("change", onMediaChange);

    // Initial sync and calculate state
    syncSource();
    update();
    rafId = window.requestAnimationFrame(tick);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mql.removeEventListener("change", onMediaChange);
      video.removeEventListener("play", keepPaused);
      video.removeEventListener("loadedmetadata", measureDuration);
    };
  }, []);

  return (
    <section ref={wrapRef} className="relative h-[320vh]" aria-label="Silver Circle Travel introduction">
      <div className="sticky top-0 h-screen min-h-[38rem] w-full overflow-hidden bg-navy-deep">
        <video
          ref={videoRef}
          poster={DESKTOP_POSTER}
          muted
          playsInline
          webkit-playsinline="true"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          preload="none"
          className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="hero-video-shade absolute inset-0" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 pb-20 pt-28 lg:px-8 lg:pb-24 lg:pt-36">
          <div ref={copyRef} className="w-full max-w-3xl text-left will-change-[opacity]">
            <p data-hero-line="0" className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-silver-light opacity-0 sm:text-base">
              Silver Circle Travel
            </p>
            <h1 className="font-display text-5xl text-primary-foreground sm:text-7xl lg:text-8xl">
              <span data-hero-line="0.08" className="block opacity-0">Travel Freely.</span>
              <span data-hero-line="0.2" className="mt-2 block text-silver-light opacity-0">We Take Care of the Rest.</span>
            </h1>
            <p data-hero-line="0.34" className="mt-7 max-w-xl text-lg text-primary-foreground/85 opacity-0 sm:text-2xl">
              Curated international journeys for travellers 60+
            </p>
            <div data-hero-line="0.48" className="mt-9 flex flex-col items-start gap-4 opacity-0 sm:flex-row">
              <Magnetic><a href="#travel-search" className="btn-base btn-silver">Plan My Journey</a></Magnetic>
              <Magnetic><a href="#featured-destinations" className="btn-base btn-hero-outline">View Destinations</a></Magnetic>
            </div>
            <p data-hero-line="0.6" className="mt-10 text-sm uppercase tracking-[0.22em] text-primary-foreground/65 opacity-0">
              Scroll to discover
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

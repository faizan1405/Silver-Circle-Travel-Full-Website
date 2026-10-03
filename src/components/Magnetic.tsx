import { useCallback, useRef, type ReactNode } from "react";

/**
 * Wraps any element (link, button, card action) with a subtle magnetic pull.
 * Disabled automatically on touch devices and for reduced-motion users.
 */
export function Magnetic({
  children,
  strength = 0.2,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.12s linear";
      el.style.transform = `translate3d(${x * strength}px, ${y * strength * 1.1}px, 0)`;
    },
    [strength],
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
    el.style.transform = "translate3d(0,0,0)";
  }, []);

  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`magnetic ${className}`}>
      {children}
    </span>
  );
}

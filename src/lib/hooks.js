import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Adds 'in' once the element enters the viewport (Vanilla .reveal).
   Each reveal gets a small stagger delay based on its order *within its own
   section*, so a section's pieces cascade in rather than all snapping together
   — the uniform, simultaneous fade-up is the templated/AI tell we're avoiding. */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Assign per-section stagger once up front.
    el.querySelectorAll('section, .tl-sec, .contact').forEach((sec) => {
      const items = sec.querySelectorAll('.reveal');
      items.forEach((n, i) => n.style.setProperty('--rd', `${Math.min(i * 65, 260)}ms`));
    });
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    el.querySelectorAll('.reveal').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* Animated counter for the stat grid. */
export function useCountUp(end) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (prefersReducedMotion()) {
            el.textContent = end;
            return;
          }
          const t0 = performance.now();
          const dur = 950;
          (function tick(t) {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        }),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end]);
  return ref;
}

/*
 * Seamless rAF marquee, ported exactly from the v6 prototype (see handoff §3):
 * two identical content copies inside the track, measured pixel width of the
 * first copy, translated together in a continuous loop. Width is re-measured
 * after web fonts load, on resize, and defensively right after mount (the
 * prototype's bug was measuring while display:none — mounting on route entry
 * plus the <10px guard below covers the same case).
 */
export function useMarquee() {
  const trackRef = useRef(null);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let w = 0;
    let x = 0;
    let last = performance.now();
    let raf;
    const measure = () => {
      const first = track.firstElementChild;
      w = first ? first.getBoundingClientRect().width : 0;
    };
    measure();
    const t = setTimeout(measure, 80);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    addEventListener('resize', measure);
    const loop = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (w < 10) measure();
      if (w > 0 && !prefersReducedMotion()) {
        x = (x + dt * 0.04) % w;
        track.style.transform = `translate3d(${-x}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      removeEventListener('resize', measure);
    };
  }, []);
  return trackRef;
}

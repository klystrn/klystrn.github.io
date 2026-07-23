import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Adds 'in' once the element enters the viewport (Paper .reveal).
   Each reveal gets a small stagger delay based on its order within its own
   section, plus an entrance that varies by content role — headings rise a
   little further, running prose just fades, and tiles/grids settle in with a
   faint scale. A single uniform 10px fade-up on every element is the templated
   tell; differentiating by role reads as deliberate motion design instead. */
const revealMotion = (el) => {
  const c = el.classList;
  if (c.contains('sec')) return { ry: '22px', rs: '1' };                 // section headline
  if (c.contains('sec-sub') || c.contains('about-copy')) return { ry: '0px', rs: '1' }; // prose: fade only
  if (c.contains('stats') || c.contains('pj') || c.contains('pj-minis')
      || c.contains('xp-card') || c.contains('ts-car')) return { ry: '6px', rs: '.985' }; // tiles settle
  return { ry: '12px', rs: '1' };                                        // default
};

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Assign per-section stagger + a role-based entrance once up front.
    el.querySelectorAll('section, .tl-sec, .contact').forEach((sec) => {
      const items = sec.querySelectorAll('.reveal');
      items.forEach((n, i) => {
        n.style.setProperty('--rd', `${Math.min(i * 65, 260)}ms`);
        const m = revealMotion(n);
        n.style.setProperty('--ry', m.ry);
        n.style.setProperty('--rs', m.rs);
      });
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
 * Seamless rAF marquee: two identical content copies inside the track,
 * translated together in a continuous loop and reset by exactly the measured
 * pixel width of one copy so the seam never shows. Width is re-measured after
 * web fonts load, on resize, and defensively right after mount (measuring while
 * display:none returns 0 — mounting on route entry plus the <10px guard below
 * covers that case).
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

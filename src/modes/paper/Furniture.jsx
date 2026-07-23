import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import allTestimonials from '../../data/testimonials.json';
import { prefersReducedMotion } from '../../lib/hooks';

const testimonials = allTestimonials.filter((t) => t.quote);

/* Hero positioning line: vertical carousel over the intro sentences.
   The three lines are different lengths, so a single fixed font-size makes the
   short one underfill and the long one wrap to an extra row. Instead, fit each
   line to the column: measure its actual rendered rows (each row is its own
   element with width:max-content, so its box is its true text width) and scale
   the line's font-size so the widest row exactly spans the column. Every
   headline then fills the same width, whichever is showing. */
export function RotatingHero({ lines }) {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(null);
  const rotRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || lines.length < 2) return undefined;
    const iv = setInterval(() => {
      setIdx((i) => {
        setPrev(i);
        return (i + 1) % lines.length;
      });
    }, 4800);
    return () => clearInterval(iv);
  }, [lines.length]);

  useLayoutEffect(() => {
    const h1 = rotRef.current;
    if (!h1) return undefined;
    const CAP = 132; // ceiling so a very short line can't blow up
    const fit = () => {
      const cw = h1.clientWidth;
      if (!cw) return;
      h1.querySelectorAll('.hero-line').forEach((el) => {
        const cur = parseFloat(getComputedStyle(el).fontSize) || 100;
        let maxRow = 0;
        el.querySelectorAll('.hero-row').forEach((r) => {
          maxRow = Math.max(maxRow, r.getBoundingClientRect().width);
        });
        if (maxRow > 0) el.style.fontSize = `${Math.min((cur * cw) / maxRow, CAP)}px`;
      });
    };
    fit();
    addEventListener('resize', fit);
    // Web fonts change glyph widths, so refit once they're ready.
    if (document.fonts?.ready) document.fonts.ready.then(fit);
    return () => removeEventListener('resize', fit);
  }, [lines]);

  return (
    <h1 className="hero-rot" ref={rotRef}>
      {lines.map((l, k) => (
        <span key={k} className={`hero-line ${k === idx ? 'on' : k === prev ? 'out' : ''}`}>
          {l.split(/<br\s*\/?>/i).map((row, ri) => (
            <span key={ri} className="hero-row" dangerouslySetInnerHTML={{ __html: row }} />
          ))}
        </span>
      ))}
    </h1>
  );
}

/* Thin red line at the very top of the viewport, fills with scroll. */
export function ProgressBar() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - innerHeight;
      el.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);
  return <div className="mv-progress" ref={ref} aria-hidden="true" />;
}

/* [id, number, name] — the numbers double as the section eyebrows ("01 · About")
   that used to sit above each heading, now surfaced only on the rail. */
const RAIL = [
  ['home', '', 'Start here'],
  ['about', '01', 'About'],
  ['journey', '02', 'Journey'],
  ['experience', '03', 'Experience'],
  ['projects', '04', 'Projects'],
  ['skills', '05', 'Skills'],
  ['certs', '', 'Awards & honours'],
  ['testimonials', '06', 'Testimonials'],
  ['contact', '', 'Contact'],
];

/* Editorial dot-rail: highlights the current section, click to jump. The active
   section's eyebrow label flashes in for a few seconds each time you scroll into
   a new section, and shows on hover — a quiet "you are here" without the label
   living permanently above every heading. */
export function SectionRail() {
  const [active, setActive] = useState('home');
  const [flash, setFlash] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const onScroll = () => {
      let cur = RAIL[0][0];
      for (const [id] of RAIL) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  // Flash the active label on every section change (but not the initial mount).
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 2600);
    return () => clearTimeout(t);
  }, [active]);

  const cur = RAIL.find((r) => r[0] === active) || RAIL[0];

  return (
    <nav className={`mv-rail ${flash ? 'flashing' : ''}`} aria-label="Sections">
      {RAIL.map(([id, num, name]) => (
        <button
          key={id}
          className={`${active === id ? 'on' : ''} ${active === id && flash ? 'flash' : ''}`}
          aria-label={num ? `${num} · ${name}` : name}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="lbl">{num && <b>{num}</b>}{num ? ' · ' : ''}{name}</span>
        </button>
      ))}
      {/* Mobile-only single label: one fixed pill whose text updates, so fast
          scrolling never shows per-dot labels sliding past each other. */}
      <div className="mv-rail-cur" aria-hidden="true">
        {cur[1] && <b>{cur[1]}</b>}{cur[1] ? ' · ' : ''}{cur[2]}
      </div>
    </nav>
  );
}

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* One card visible at a time; auto-rotates, pauses on hover, arrows + dots to navigate. */
export function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = testimonials.length;
  const next = () => setIdx((i) => (i + 1) % n);
  const prev = () => setIdx((i) => (i - 1 + n) % n);

  useEffect(() => {
    if (prefersReducedMotion() || paused) return undefined;
    const iv = setInterval(next, 5000);
    return () => clearInterval(iv);
    // Manual nav (idx change) restarts the countdown from a full 5s.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, n, idx]);

  return (
    <div
      className="ts-car reveal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button className="ts-nav prev" aria-label="Previous testimonial" onClick={prev}>
        <ChevronLeft />
      </button>
      <div className="ts-window">
        <div className="ts-track" style={{ '--k': idx }}>
          {testimonials.map((t) => (
            <div className="ts-slide" key={t.slug}>
              <div className="ts">
                <q>{t.quote}</q>
                <div className="by">
                  {t.name}
                  <span>{t.title}</span>
                </div>
                {t.url && (
                  <a className="ts-full" href={t.url} target="_blank" rel="noopener noreferrer">
                    Read in full ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="ts-nav next" aria-label="Next testimonial" onClick={next}>
        <ChevronRight />
      </button>
      <div className="ts-dots">
        {testimonials.map((t, i) => (
          <button
            key={t.slug}
            className={idx === i ? 'on' : ''}
            aria-label={`Testimonial ${i + 1}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  );
}

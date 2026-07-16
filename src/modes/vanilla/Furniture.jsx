import { useEffect, useRef, useState } from 'react';
import testimonials from '../../data/testimonials.json';
import { prefersReducedMotion } from '../../lib/hooks';

const PENDING_QUOTE = '[Quote pending, content doc §10]';

/* Hero positioning line: vertical carousel over the three §1 sentences. */
export function RotatingHero({ lines }) {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(null);
  useEffect(() => {
    if (prefersReducedMotion() || lines.length < 2) return undefined;
    const iv = setInterval(() => {
      setIdx((i) => {
        setPrev(i);
        return (i + 1) % lines.length;
      });
    }, 3800);
    return () => clearInterval(iv);
  }, [lines.length]);
  return (
    <h1 className="hero-rot">
      {lines.map((l, k) => (
        <span
          key={k}
          className={`hero-line ${k === idx ? 'on' : k === prev ? 'out' : ''}`}
          dangerouslySetInnerHTML={{ __html: l }}
        />
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

const RAIL = [
  ['home', 'Top'],
  ['about', 'About'],
  ['journey', 'Journey'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['certs', 'Awards'],
  ['testimonials', 'Words'],
  ['contact', 'Contact'],
];

/* Editorial dot-rail: highlights the current section, click to jump. */
export function SectionRail() {
  const [active, setActive] = useState('home');
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
  return (
    <nav className="mv-rail" aria-label="Sections">
      {RAIL.map(([id, label]) => (
        <button
          key={id}
          className={active === id ? 'on' : ''}
          aria-label={label}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="lbl">{label}</span>
        </button>
      ))}
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
                <q>{t.quote || PENDING_QUOTE}</q>
                <div className="by">
                  {t.name}
                  <span>{t.title}</span>
                </div>
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

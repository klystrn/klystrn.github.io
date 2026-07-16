import { useEffect, useRef, useState } from 'react';
import testimonials from '../../data/testimonials.json';
import { prefersReducedMotion } from '../../lib/hooks';

const PENDING_QUOTE = '[Quote pending, content doc §10]';

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

/* Auto-rotating testimonials carousel; pauses on hover, dots to jump. */
export function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = testimonials.length;
  // One card per slide on mobile, two visible per view on desktop (50% slides).
  useEffect(() => {
    if (prefersReducedMotion() || paused) return;
    const iv = setInterval(() => setIdx((i) => (i + 1) % n), 5000);
    return () => clearInterval(iv);
  }, [paused, n]);
  return (
    <div
      className="ts-car reveal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ts-track" style={{ '--k': idx }}>
        {[...testimonials, ...testimonials.slice(0, 2)].map((t, i) => (
          <div className="ts-slide" key={`${t.slug}-${i}`}>
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

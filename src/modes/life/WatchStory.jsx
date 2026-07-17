import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import life from '../../data/life.json';
import { prefersReducedMotion } from '../../lib/hooks';

const W = life.watchStory;

export default function WatchStory() {
  const [now, setNow] = useState(() => new Date());
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  // Mechanical seconds: step the whole clock once a second so the second hand
  // "ticks" rather than sweeps.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Advance the dial narrative on a regular multiple of ticks.
  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx((i) => (i + 1) % W.entries.length);
    }, W.tickMs);
    return () => clearInterval(t);
  }, []);

  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr = now.getHours() % 12;
  const secAng = sec * 6;
  const minAng = min * 6 + sec * 0.1;
  const hrAng = hr * 30 + min * 0.5;
  const entry = W.entries[idx];

  return (
    <motion.div
      className="ws"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link className="life-back ws-back" to="/life">← the table</Link>

      <div className="ws-inner">
        <div className="ws-brand">
          <div className="ws-eyebrow">THE COLLECTION</div>
          <h1>{W.brand}</h1>
          <p>{W.sub}</p>
        </div>

        <div className="ws-watch-wrap">
          <svg className="ws-watch" viewBox="0 0 320 320" role="img" aria-label={`Watch dial showing ${entry.year}: ${entry.line1}`}>
            {/* lugs + case */}
            <rect x="146" y="8" width="28" height="34" rx="6" fill="#5a3d28" />
            <rect x="146" y="278" width="28" height="34" rx="6" fill="#5a3d28" />
            <circle cx="160" cy="160" r="126" fill="#c9a86a" />
            <circle cx="160" cy="160" r="126" fill="none" stroke="#8a6c3e" strokeWidth="5" />
            <circle cx="160" cy="160" r="112" fill="#f6f3ea" />
            <circle cx="160" cy="160" r="112" fill="none" stroke="#ddd0b2" strokeWidth="3" />
            {/* crown */}
            <rect x="284" y="150" width="16" height="20" rx="3" fill="#b08d57" />

            {/* minute ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
              const outer = 104;
              const inner = i % 5 === 0 ? 92 : 98;
              return (
                <line
                  key={i}
                  x1={160 + Math.cos(a) * outer}
                  y1={160 + Math.sin(a) * outer}
                  x2={160 + Math.cos(a) * inner}
                  y2={160 + Math.sin(a) * inner}
                  stroke="#2a2622"
                  strokeWidth={i % 5 === 0 ? 3 : 1.2}
                  opacity={i % 5 === 0 ? 0.9 : 0.5}
                />
              );
            })}

            {/* narrative window on the dial */}
            <AnimatePresence mode="wait">
              <motion.g
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <text x="160" y="120" textAnchor="middle" className="ws-year">{entry.year}</text>
                <text x="160" y="146" textAnchor="middle" className="ws-line1">{entry.line1}</text>
              </motion.g>
            </AnimatePresence>

            {/* hands */}
            <g style={{ transform: `rotate(${hrAng}deg)`, transformOrigin: '160px 160px' }}>
              <line x1="160" y1="160" x2="160" y2="98" stroke="#1c1a17" strokeWidth="6" strokeLinecap="round" />
            </g>
            <g style={{ transform: `rotate(${minAng}deg)`, transformOrigin: '160px 160px' }}>
              <line x1="160" y1="160" x2="160" y2="74" stroke="#1c1a17" strokeWidth="4" strokeLinecap="round" />
            </g>
            <g style={{ transform: `rotate(${secAng}deg)`, transformOrigin: '160px 160px', transition: 'transform .12s cubic-bezier(.4,2.3,.5,1)' }}>
              <line x1="160" y1="178" x2="160" y2="66" stroke="#d92b35" strokeWidth="2" strokeLinecap="round" />
              <circle cx="160" cy="160" r="5.5" fill="#d92b35" />
            </g>
            <circle cx="160" cy="160" r="3" fill="#1c1a17" />
          </svg>
        </div>

        <div className="ws-story">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              className="ws-caption"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {entry.line2}
            </motion.p>
          </AnimatePresence>

          <div className="ws-dots">
            {W.entries.map((e, i) => (
              <button
                key={i}
                className={`ws-dot ${i === idx ? 'on' : ''}`}
                aria-label={`Jump to ${e.year}`}
                onClick={() => setIdx(i)}
              >
                <span>{e.year}</span>
              </button>
            ))}
          </div>

          <button className="ws-pause" onClick={() => setPaused((p) => !p)}>
            {paused ? '▶ resume' : '⏸ pause'} auto-advance
          </button>
        </div>
      </div>
    </motion.div>
  );
}

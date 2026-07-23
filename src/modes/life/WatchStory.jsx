import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import life from '../../data/life.json';
import { prefersReducedMotion } from '../../lib/hooks';

const W = life.watchStory;

/* Dial geometry, all in the 340×360 viewBox. Centre of the watch head. */
const CX = 170;
const CY = 168;
// polar: degrees measured clockwise from 12 o'clock → [x, y]
const pol = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
};

/* Tachymètre scale — authentic crowding: numbers bunch near the top-right and
   thin out toward the bottom. Placed upright for legibility at small sizes. */
const TACHY = [
  [0, '60'], [24, '500'], [40, '400'], [54, '350'], [67, '300'], [80, '250'],
  [93, '225'], [107, '200'], [123, '180'], [141, '170'], [159, '160'],
  [177, '150'], [199, '140'], [221, '130'], [241, '120'], [262, '110'],
  [285, '100'], [306, '90'], [325, '80'], [343, '70'],
];

/* Applied baton hour markers. 3/6/9 are skipped — the sub-dials sit there. */
const HOURS = [1, 2, 4, 5, 7, 8, 10, 11];

/* Sub-dials: centre + numerals (angle from top, label). */
const SUB = {
  seconds: { c: [118, 168], nums: [[0, '60'], [120, '20'], [240, '40']] }, // 9 o'clock, small running seconds
  minutes: { c: [222, 168], nums: [[0, '30'], [120, '10'], [240, '20']] }, // 3 o'clock, 30-min recorder
  hours:   { c: [170, 220], nums: [[0, '12'], [90, '3'], [180, '6'], [270, '9']] }, // 6 o'clock, 12-hr recorder
};

/* Small graduation ticks around a sub-dial. */
function SubTicks({ c, r }) {
  return Array.from({ length: 60 }).map((_, i) => {
    const [x1, y1] = [c[0] + Math.sin((i * 6 * Math.PI) / 180) * r, c[1] - Math.cos((i * 6 * Math.PI) / 180) * r];
    const ri = i % 5 === 0 ? r - 3.5 : r - 1.8;
    const [x2, y2] = [c[0] + Math.sin((i * 6 * Math.PI) / 180) * ri, c[1] - Math.cos((i * 6 * Math.PI) / 180) * ri];
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8f8c85" strokeWidth={i % 5 === 0 ? 0.8 : 0.4} />;
  });
}

function SubDial({ def, angle, tick }) {
  const [cx, cy] = def.c;
  const r = 25;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#subwhite)" stroke="#0a0a0a" strokeWidth="1.4" />
      {[r - 6, r - 12].map((rr) => (
        <circle key={rr} cx={cx} cy={cy} r={rr} fill="none" stroke="#d8d5cd" strokeWidth="0.5" />
      ))}
      <SubTicks c={def.c} r={r - 2.5} />
      {def.nums.map(([d, n]) => {
        const [nx, ny] = [cx + Math.sin((d * Math.PI) / 180) * (r - 9.5), cy - Math.cos((d * Math.PI) / 180) * (r - 9.5)];
        return <text key={n} x={nx} y={ny + 2.6} textAnchor="middle" className="ws-sub-num">{n}</text>;
      })}
      {/* sub-dial hand */}
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: tick ? 'transform .12s cubic-bezier(.4,2.3,.5,1)' : undefined }}>
        <line x1={cx} y1={cy + 4} x2={cx} y2={cy - (r - 5)} stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r="1.6" fill="#1a1a1a" />
    </g>
  );
}

export default function WatchStory() {
  const [now, setNow] = useState(() => new Date());
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  // Mechanical seconds: step the whole movement once a second so the running
  // seconds sub-dial "ticks" rather than sweeps.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Advance the generational narrative on a regular multiple of ticks.
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
          <h1>{W.brand}</h1>
          <p>{W.sub}</p>
        </div>

        <div className="ws-watch-wrap">
          <svg className="ws-watch" viewBox="0 0 340 360" role="img" aria-label="Omega Speedmaster Professional chronograph, black dial with three silver sub-dials">
            <defs>
              <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f2f4f6" />
                <stop offset="0.28" stopColor="#c3c8cd" />
                <stop offset="0.5" stopColor="#e9ecef" />
                <stop offset="0.72" stopColor="#9aa0a6" />
                <stop offset="1" stopColor="#d4d8dc" />
              </linearGradient>
              <radialGradient id="dialblk" cx="0.42" cy="0.36" r="0.75">
                <stop offset="0" stopColor="#26272b" />
                <stop offset="0.55" stopColor="#131417" />
                <stop offset="1" stopColor="#020203" />
              </radialGradient>
              <radialGradient id="subwhite" cx="0.4" cy="0.34" r="0.8">
                <stop offset="0" stopColor="#fcfbf7" />
                <stop offset="0.7" stopColor="#eceae3" />
                <stop offset="1" stopColor="#cfccc2" />
              </radialGradient>
              <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#3a3f49" stopOpacity="0.55" />
                <stop offset="1" stopColor="#3a3f49" stopOpacity="0" />
              </radialGradient>
            </defs>

            <ellipse cx={CX} cy={CY} rx="150" ry="152" fill="url(#glow)" />

            {/* bracelet — steel links running off the top and bottom edges */}
            <g stroke="#6d7278" strokeWidth="0.8">
              {[-6, 12, 30].map((y) => (
                <rect key={`t${y}`} x="139" y={y} width="62" height="15" rx="4" fill="url(#steel)" />
              ))}
              {[300, 318, 336].map((y) => (
                <rect key={`b${y}`} x="139" y={y} width="62" height="15" rx="4" fill="url(#steel)" />
              ))}
            </g>
            {/* twisted lugs */}
            <g fill="url(#steel)" stroke="#70757b" strokeWidth="0.8">
              <path d="M108 70 L128 44 L150 52 L136 84 Z" />
              <path d="M232 70 L212 44 L190 52 L204 84 Z" />
              <path d="M108 266 L128 292 L150 284 L136 252 Z" />
              <path d="M232 266 L212 292 L190 284 L204 252 Z" />
            </g>

            {/* crown + chronograph pushers (3 o'clock side) */}
            <g fill="url(#steel)" stroke="#70757b" strokeWidth="0.8">
              <rect x="288" y="140" width="18" height="18" rx="3" transform="rotate(45 297 149)" />
              <rect x="286" y="120" width="12" height="12" rx="2" />
              <rect x="286" y="166" width="12" height="12" rx="2" />
              <rect x="284" y="156" width="14" height="26" rx="4" />
            </g>

            {/* case */}
            <circle cx={CX} cy={CY} r="120" fill="url(#steel)" />
            <circle cx={CX} cy={CY} r="120" fill="none" stroke="#7c8188" strokeWidth="1.5" />
            {/* black tachymètre bezel */}
            <circle cx={CX} cy={CY} r="112" fill="#0c0d0f" />
            <circle cx={CX} cy={CY} r="90" fill="#0c0d0f" stroke="#3a3c40" strokeWidth="0.8" />

            {/* bezel graduation ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const [x1, y1] = pol(110, i * 6);
              const [x2, y2] = pol(i % 5 === 0 ? 102 : 105, i * 6);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cfd0cb" strokeWidth={i % 5 === 0 ? 1 : 0.5} opacity="0.75" />;
            })}

            {/* TACHYMÈTRE wordmark along the top arc */}
            <defs>
              <path id="tachyArc" d="M 62 168 A 108 108 0 0 1 278 168" fill="none" />
            </defs>
            <text className="ws-tachy-word">
              <textPath href="#tachyArc" startOffset="50%" textAnchor="middle">TACHYMÈTRE</textPath>
            </text>
            {/* tachymètre numbers */}
            {TACHY.map(([d, n]) => {
              const [x, y] = pol(98, d);
              return <text key={d} x={x} y={y + 2} textAnchor="middle" className="ws-tachy-num">{n}</text>;
            })}

            {/* dial */}
            <circle cx={CX} cy={CY} r="88" fill="url(#dialblk)" />

            {/* minute / seconds chapter ring */}
            {Array.from({ length: 60 }).map((_, i) => {
              const [x1, y1] = pol(86, i * 6);
              const [x2, y2] = pol(i % 5 === 0 ? 80 : 83, i * 6);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cdd0cb" strokeWidth={i % 5 === 0 ? 1.1 : 0.45} opacity={i % 5 === 0 ? 0.9 : 0.5} />;
            })}

            {/* applied baton hour markers with lume */}
            {HOURS.map((h) => {
              const deg = h * 30;
              const [x, y] = pol(64, deg);
              return (
                <g key={h} transform={`rotate(${deg} ${x} ${y})`}>
                  <rect x={x - 3} y={y - 8} width="6" height="16" rx="1.4" fill="#e6e2d2" stroke="#a9a596" strokeWidth="0.6" />
                </g>
              );
            })}
            {/* 12 o'clock double marker */}
            {[-5, 5].map((dx) => {
              const [x, y] = pol(64, 0);
              return <rect key={dx} x={x + dx - 2.4} y={y - 9} width="4.8" height="18" rx="1.3" fill="#e6e2d2" stroke="#a9a596" strokeWidth="0.6" />;
            })}

            {/* sub-dials (panda: silver on black). 9=running secs ticks, 3 & 6 rest at top */}
            <SubDial def={SUB.seconds} angle={secAng} tick />
            <SubDial def={SUB.minutes} angle={0} />
            <SubDial def={SUB.hours} angle={0} />

            {/* brand text, stacked in the upper half between 12 and centre */}
            <text x={CX} y="110" textAnchor="middle" className="ws-omega-sym">Ω</text>
            <text x={CX} y="124" textAnchor="middle" className="ws-omega-word">OMEGA</text>
            <text x={CX} y="141" textAnchor="middle" className="ws-speed">Speedmaster</text>
            <text x={CX} y="151" textAnchor="middle" className="ws-prof">PROFESSIONAL</text>

            {/* hands */}
            <g style={{ transform: `rotate(${hrAng}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
              <polygon points={`${CX - 4},${CY} ${CX + 4},${CY} ${CX + 2.4},${CY - 46} ${CX - 2.4},${CY - 46}`} fill="#f4f2ea" stroke="#111" strokeWidth="0.5" />
            </g>
            <g style={{ transform: `rotate(${minAng}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
              <polygon points={`${CX - 3},${CY} ${CX + 3},${CY} ${CX + 1.8},${CY - 72} ${CX - 1.8},${CY - 72}`} fill="#f4f2ea" stroke="#111" strokeWidth="0.5" />
            </g>
            {/* central chronograph seconds — rests at 12 (chrono disengaged) */}
            <g>
              <line x1={CX} y1={CY + 20} x2={CX} y2={CY - 92} stroke="#eceae2" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx={CX} cy={CY - 74} r="2.6" fill="none" stroke="#eceae2" strokeWidth="1.2" />
            </g>
            <circle cx={CX} cy={CY} r="4.5" fill="#f4f2ea" stroke="#111" strokeWidth="0.6" />
          </svg>
        </div>

        <div className="ws-story">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="ws-year-big">{entry.year}</div>
              <div className="ws-line1">{entry.line1}</div>
              <p className="ws-caption">{entry.line2}</p>
            </motion.div>
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

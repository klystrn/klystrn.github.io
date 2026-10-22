import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/hooks';

const W = 720;
const H = 230;
const VOL = 44; // activity-bar strip under the price area
const PAD = 14;

/* 12-point curve chart with milestone markers at specific curve indices.
   Rising segments draw green and falling ones red, like a real tape; the
   strip underneath is each step's move size ("volume"), amber where a
   milestone landed. The curve is an illustrative arc of the project, not a
   measured series, and the chart says so. */
export default function Chart({ project }) {
  const c = project.curve;
  const max = Math.max(...c);
  const min = Math.min(...c);
  const px = (i) => PAD + (i / (c.length - 1)) * (W - 2 * PAD);
  const py = (v) => H - PAD - ((v - min) / (max - min)) * (H - 2 * PAD - 20);
  const pts = c.map((v, i) => `${px(i)},${py(v)}`);
  const area = `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${px(c.length - 1)},${H} L ${px(0)},${H} Z`;
  const moves = c.map((v, i) => (i ? v - c[i - 1] : 0));
  const maxMove = Math.max(...moves.map(Math.abs)) || 1;
  const mileIdx = new Set((project.miles || []).map(([i]) => i));
  const barW = ((W - 2 * PAD) / c.length) * 0.55;

  const revealRef = useRef(null);
  const [tip, setTip] = useState(null);

  // Draw-in: one clip rect sweeps left→right over every segment at once.
  useEffect(() => {
    const r = revealRef.current;
    if (!r || prefersReducedMotion()) return;
    r.animate([{ width: '0px' }, { width: `${W}px` }], { duration: 900, easing: 'ease-out', fill: 'forwards' });
  }, [project.sym]);

  const clipId = `reveal-${project.sym}`;

  return (
    <>
      <div className="chart-box">
        <span className="chart-badge">ILLUSTRATIVE</span>
        <svg viewBox={`0 0 ${W} ${H + VOL}`} preserveAspectRatio="none" role="img" aria-label={`${project.title} progression chart (illustrative)`} onMouseLeave={() => setTip(null)}>
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2fd17a" stopOpacity=".22" />
              <stop offset="1" stopColor="#2fd17a" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect ref={revealRef} key={project.sym} x="0" y="0" width={W} height={H + VOL} />
            </clipPath>
          </defs>
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1="0" y1={(H / 5) * i} x2={W} y2={(H / 5) * i} stroke="#141b2a" />
          ))}
          <g clipPath={`url(#${clipId})`}>
            <path d={area} fill="url(#ag)" />
            {c.slice(1).map((v, i) => (
              <line
                key={i}
                className={`seg ${v < c[i] ? 'd' : 'u'}`}
                x1={px(i)} y1={py(c[i])} x2={px(i + 1)} y2={py(v)}
              />
            ))}
            <line x1="0" y1={H + 4} x2={W} y2={H + 4} stroke="#141b2a" />
            {moves.map((m, i) => {
              const h = (Math.abs(m) / maxMove) * (VOL - 10);
              return (
                <rect
                  key={i}
                  className={`vol ${mileIdx.has(i) ? 'm' : m < 0 ? 'd' : 'u'}`}
                  x={px(i) - barW / 2}
                  y={H + VOL - h}
                  width={barW}
                  height={Math.max(h, 1)}
                />
              );
            })}
          </g>
          {(project.miles || []).map(([idx, label]) => (
            <circle
              key={idx}
              className="mstone"
              tabIndex={0}
              role="img"
              aria-label={label}
              cx={px(idx)}
              cy={py(c[idx])}
              r="5"
              fill="#f5b942"
              onMouseMove={(e) => setTip({ label, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTip(null)}
              onFocus={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setTip({ label, x: r.left + r.width / 2, y: r.top });
              }}
              onBlur={() => setTip(null)}
            />
          ))}
        </svg>
        {tip && (
          <div className="chart-tip" style={{ display: 'block', left: tip.x + 14, top: tip.y - 14 }}>
            {tip.label}
          </div>
        )}
      </div>
      <div className="axis-note">
        <span>{project.from}</span>
        <span>illustrative arc · milestones are real · bars = size of each step</span>
        <span>{project.to}</span>
      </div>
    </>
  );
}

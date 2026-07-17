import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/hooks';

const W = 720;
const H = 230;
const PAD = 14;

/* 12-point curve chart with milestone markers at specific curve indices. */
export default function Chart({ project }) {
  const c = project.curve;
  const max = Math.max(...c);
  const min = Math.min(...c);
  const px = (i) => PAD + (i / (c.length - 1)) * (W - 2 * PAD);
  const py = (v) => H - PAD - ((v - min) / (max - min)) * (H - 2 * PAD - 20);
  const pts = c.map((v, i) => `${px(i)},${py(v)}`);
  const area = `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${px(c.length - 1)},${H} L ${px(0)},${H} Z`;

  const lineRef = useRef(null);
  const [tip, setTip] = useState(null);

  useEffect(() => {
    const pl = lineRef.current;
    if (!pl || prefersReducedMotion()) return;
    const len = pl.getTotalLength();
    pl.style.strokeDasharray = len;
    pl.style.strokeDashoffset = len;
    pl.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
      duration: 900,
      easing: 'ease-out',
      fill: 'forwards',
    });
  }, [project.sym]);

  return (
    <>
      <div className="chart-box">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${project.title} progression chart`} onMouseLeave={() => setTip(null)}>
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2fd17a" stopOpacity=".22" />
              <stop offset="1" stopColor="#2fd17a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1="0" y1={(H / 5) * i} x2={W} y2={(H / 5) * i} stroke="#141b2a" />
          ))}
          <path d={area} fill="url(#ag)" />
          <polyline
            ref={lineRef}
            key={project.sym}
            points={pts.join(' ')}
            fill="none"
            stroke="#2fd17a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {(project.miles || []).map(([idx, label]) => (
            <circle
              key={idx}
              className="mstone"
              cx={px(idx)}
              cy={py(c[idx])}
              r="5"
              fill="#f5b942"
              onMouseMove={(e) => setTip({ label, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTip(null)}
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
        <span>project arc · milestones marked</span>
        <span>{project.to}</span>
      </div>
    </>
  );
}

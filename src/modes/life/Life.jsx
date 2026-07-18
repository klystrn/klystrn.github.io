import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import life from '../../data/life.json';
import { prefersReducedMotion } from '../../lib/hooks';

/*
 * Life mode: the photorealistic room render IS the scene. The image sits in a
 * fixed-aspect stage; interactive hotspots are percent-positioned so they track
 * the same objects at every viewport size. Hovering shows the story, clicking
 * zooms into the object (CSS transform-origin at the hotspot) and routes.
 * No WebGL — this replaced the three.js room, which was heavy on low-end GPUs.
 */
const IMG = '/life/room.jpg';

/* Hotspot positions as % of the render (measured against the actual image,
   1280×960, via a percent-grid overlay). Watch + namecard are intentionally
   omitted for now — the render has no literal props for them, so they'll be
   added once the scene carries matching objects. */
const SPOTS = [
  { id: 'trophy',   x: 19, y: 24, route: null,                theme: '#241a12' },
  { id: 'cards',    x: 19, y: 43, route: '/life/cards',       theme: '#7d1620' },
  { id: 'camera',   x: 19, y: 58, route: '/life/photography', theme: '#171a1f' },
  { id: 'work',     x: 40, y: 47, route: '/',                 theme: '#141821' },
];

/* TV screen quad — the four corners of the panel as % of the render, measured
   off room.jpg. The screen faces south-west: the left edge is tall/near and the
   right edge is short/far, top sloping down-to-the-right — a true perspective
   trapezium, not a parallelogram. The clock is mapped onto this quad with a
   projective (matrix3d) transform so it sits flush inside the screen. Order:
   top-left, top-right, bottom-right, bottom-left. */
const TV_CORNERS = [
  [70.6, 40.2],
  [86.0, 44.2],
  [86.2, 53.7],
  [70.5, 51.4],
];

/* 3×3 helpers to build the rectangle→quad homography for CSS matrix3d. */
const adj = (m) => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
];
const mul3 = (a, b) => {
  const c = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) c[3 * i + j] += a[3 * i + k] * b[3 * k + j];
  return c;
};
const mulV = (m, v) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];
const basis = (p) => {
  const m = [p[0], p[2], p[4], p[1], p[3], p[5], 1, 1, 1];
  const v = mulV(adj(m), [p[6], p[7], 1]);
  return mul3(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};
// H maps the source quad `s` onto the destination quad `d` (each flat: x0,y0…x3,y3).
const homography = (s, d) => mul3(basis(d), adj(basis(s)));

/* Given the stage's pixel size, map the clock's bounding-box rectangle onto the
   TV quad and return {left,top,width,height} (% of stage) + the matrix3d string
   (transform-origin 0 0). Recomputed on resize so it locks at every size. */
function tvTransform(W, H) {
  const px = TV_CORNERS.map(([x, y]) => [(x / 100) * W, (y / 100) * H]);
  const xs = px.map((p) => p[0]);
  const ys = px.map((p) => p[1]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const w = Math.max(...xs) - minX, h = Math.max(...ys) - minY;
  const dst = px.flatMap(([x, y]) => [x - minX, y - minY]);
  const src = [0, 0, w, 0, w, h, 0, h];
  const m = homography(src, dst);
  const k = m[8] || 1;
  const n = m.map((v) => v / k);
  return {
    left: (minX / W) * 100,
    top: (minY / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100,
    transform: `matrix3d(${n[0]},${n[3]},0,${n[6]}, ${n[1]},${n[4]},0,${n[7]}, 0,0,1,0, ${n[2]},${n[5]},0,${n[8]})`,
  };
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    hhmm: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    date: `${days[now.getDay()]}, ${now.getDate()} ${mons[now.getMonth()]}`,
  };
}

function AwardsTip({ d }) {
  const t = life.trophies;
  const col = (title, list) => (
    <div className="room-awards-col">
      <div className="room-awards-h">{title}</div>
      {list.map((a, i) => (
        <div className="room-awards-row" key={i}><span className="yr">{a.year}</span><span>{a.name}</span></div>
      ))}
    </div>
  );
  return (
    <>
      <div className="room-tip-title">{d.hoverTitle}</div>
      <div className="room-awards">{col('Taekwondo', t.taekwondo)}{col('Diving', t.diving)}</div>
    </>
  );
}

function BlurbTip({ d }) {
  return (
    <>
      <div className="room-tip-title">{d.hoverTitle}</div>
      <p>{d.blurb}</p>
      <div className="room-tip-foot">
        <span className="room-tip-tag">{d.tag}</span>
        {d.cta && <span className="room-tip-cta">{d.cta} →</span>}
      </div>
    </>
  );
}

function Fallback() {
  return (
    <div className="room-fallback">
      <div className="life-eyebrow">{life.intro.eyebrow}</div>
      <h1>{life.intro.title}</h1>
      <p>{life.intro.sub}</p>
      <div className="room-fallback-links">
        {['camera', 'cards'].map((id) => (
          <Link key={id} to={SPOTS.find((s) => s.id === id)?.route || '/'} className="room-fallback-link">
            <b>{life.objects[id].label}</b>
            <span>{life.objects[id].cta} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Life() {
  const navigate = useNavigate();
  const [hot, setHot] = useState(null);       // hovered/focused spot id
  const [zoom, setZoom] = useState(null);     // spot being zoomed into
  const [missing, setMissing] = useState(false);
  const clock = useClock();
  const stageRef = useRef(null);
  const [tv, setTv] = useState(null);         // {left,top,width,height,transform}

  // Map the clock onto the TV quad; recompute whenever the stage resizes.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const apply = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setTv(tvTransform(r.width, r.height));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pick = useCallback(
    (spot) => {
      if (!spot.route) return;
      if (prefersReducedMotion()) { navigate(spot.route); return; }
      setHot(null);
      setZoom(spot);
    },
    [navigate]
  );

  useEffect(() => {
    if (!zoom) return undefined;
    const t = setTimeout(() => navigate(zoom.route), 780);
    return () => clearTimeout(t);
  }, [zoom, navigate]);

  if (missing) return <div className="room-scene"><Fallback /></div>;

  const hotSpot = SPOTS.find((s) => s.id === hot);

  return (
    <div className="room-scene">
      <header className={`room-head ${zoom ? 'gone' : ''}`}>
        <div className="life-eyebrow">{life.intro.eyebrow}</div>
        <h1>{life.intro.title}</h1>
        <p>{life.intro.sub}</p>
      </header>

      <div className="room-stage-wrap">
        <div
          ref={stageRef}
          className={`room-stage ${zoom ? 'zooming' : ''}`}
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        >
          <img
            className="room-img"
            src={IMG}
            alt="Isometric render of Reginald's room: a shelf of trophies, plushies and cameras, a trading desk with curved monitors, a TV console, and a leather sofa."
            onError={() => setMissing(true)}
            draggable={false}
          />

          {/* soft spotlight on the hovered object, dimming the rest */}
          <div
            className={`room-dim ${hotSpot && !zoom ? 'on' : ''}`}
            style={hotSpot ? { '--sx': `${hotSpot.x}%`, '--sy': `${hotSpot.y}%` } : undefined}
            aria-hidden="true"
          />

          {/* live clock mapped onto the TV screen quad (perspective trapezium) */}
          {tv && (
            <div
              className="room-tv"
              style={{
                left: `${tv.left}%`, top: `${tv.top}%`,
                width: `${tv.width}%`, height: `${tv.height}%`,
                transform: tv.transform, transformOrigin: '0 0',
              }}
              aria-hidden="true"
            >
              <div className="room-tv-time">{clock.hhmm}</div>
              <div className="room-tv-date">{clock.date}</div>
            </div>
          )}

          {/* hotspots */}
          {SPOTS.map((s) => (
            <button
              key={s.id}
              className={`room-spot ${hot === s.id ? 'on' : ''} ${s.route ? '' : 'info'}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              aria-label={`${life.objects[s.id].label}${s.route ? ` — ${life.objects[s.id].cta}` : ''}`}
              onMouseEnter={() => setHot(s.id)}
              onMouseLeave={() => setHot((h) => (h === s.id ? null : h))}
              onFocus={() => setHot(s.id)}
              onBlur={() => setHot((h) => (h === s.id ? null : h))}
              onClick={() => pick(s)}
            >
              <span className="room-spot-dot" />
            </button>
          ))}

          {/* tooltip near the hovered spot */}
          {hotSpot && !zoom && (
            <div
              className={`room-tip ${hotSpot.x > 62 ? 'flip' : ''}`}
              style={{ left: `${hotSpot.x}%`, top: `${hotSpot.y}%` }}
            >
              {hotSpot.id === 'trophy'
                ? <AwardsTip d={life.objects.trophy} />
                : <BlurbTip d={life.objects[hotSpot.id]} />}
            </div>
          )}
        </div>
      </div>

      {/* wash to the object's theme colour while zooming in */}
      <div
        className="room-zoom-overlay"
        style={{ background: zoom ? zoom.theme : 'transparent', opacity: zoom ? 1 : 0 }}
      />

      <div className={`room-hint ${zoom ? 'gone' : ''}`}>Hover an object · click to step inside</div>
    </div>
  );
}

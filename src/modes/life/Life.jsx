import { useEffect, useState, useCallback } from 'react';
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
const IMG = '/life/room.png';

/* Hotspot positions as % of the render (measured against the actual image,
   1280×1090, via a percent-grid overlay). The render was expanded downward to
   reveal the full marble floor, so y-values are shorter than the earlier 960px
   crop. Watch + namecard are intentionally omitted for now — the render has no
   literal props for them, so they'll be added once the scene carries matching
   objects. */
const SPOTS = [
  { id: 'trophy',   x: 19, y: 21, route: null,                theme: '#241a12' },
  { id: 'cards',    x: 19, y: 38, route: '/life/cards',       theme: '#7d1620' },
  { id: 'camera',   x: 19, y: 51, route: '/life/photography', theme: '#171a1f' },
  { id: 'work',     x: 40, y: 41, route: '/',                 theme: '#141821' },
];

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

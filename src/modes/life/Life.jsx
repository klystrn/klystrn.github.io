import '../../styles/life.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { life } from '../../lib/lifeData';
import { prefersReducedMotion, noHover } from '../../lib/hooks';

/*
 * Life mode: the photorealistic room render IS the scene. The image sits in a
 * fixed-aspect stage; interactive hotspots are percent-positioned so they track
 * the same objects at every viewport size. Hovering shows the story, clicking
 * zooms into the object (CSS transform-origin at the hotspot) and routes.
 * No WebGL — this replaced the three.js room, which was heavy on low-end GPUs.
 * (A rebuild as a live, customisable scene is tracked in KNOWN-GAPS.md.)
 */
const IMG_W = 1280;
const IMG_H = 1090;
const WIDTHS = [640, 960, 1280];
const srcSet = (ext) => WIDTHS.map((w) => `/life/room-${w}.${ext} ${w}w`).join(', ');
// The stage is height-bound on most screens (the render is nearly square), so
// its rendered width tracks ~85% of the viewport height, capped by the width.
const SIZES = '(max-aspect-ratio: 1/1) 96vw, 85vh';

/* Hotspot positions as % of the render (measured against the actual image,
   1280×1090, via a percent-grid overlay). The Omega Speedmaster sits on the
   TV console's top shelf; the trading screens are the curved monitors on
   the desk, and route to the Finance lens. */
const SPOTS = [
  { id: 'trophy',   x: 19, y: 21, route: null,                theme: '#241a12' },
  { id: 'cards',    x: 19, y: 38, route: '/life/cards',       theme: '#7d1620' },
  { id: 'camera',   x: 19, y: 51, route: '/life/photography', theme: '#171a1f', wip: 'photography' },
  { id: 'monitors', x: 43, y: 31, route: '/finance',          theme: '#07090d' },
  { id: 'work',     x: 40, y: 43, route: '/',                 theme: '#141821' },
  { id: 'watch',    x: 79, y: 50, route: '/life/watch',       theme: '#0c0d10', wip: 'watch' },
];
const isWip = (s) => s.wip && life.wip?.[s.wip];

/* Time-of-day tint over the render: follows the visitor's clock by default,
   or pinned to day / night with the lamp button. */
const TINTS = ['auto', 'day', 'night'];
function clockTint() {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}
const TINT_KEY = 'life-tint';

/* Trophy cabinet tooltip, styled as an engraved brass plaque. */
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
    <div className="room-plaque">
      <div className="room-tip-title">{d.hoverTitle}</div>
      <div className="room-awards">{col('Taekwondo', t.taekwondo)}{col('Diving', t.diving)}</div>
      {d.trait && <p className="room-tip-trait">{d.trait}</p>}
    </div>
  );
}

function BlurbTip({ d, wip, touch }) {
  return (
    <>
      <div className="room-tip-title">{d.hoverTitle}</div>
      <p>{d.blurb}</p>
      {d.trait && <p className="room-tip-trait">{d.trait}</p>}
      <div className="room-tip-foot">
        <span className={`room-tip-tag ${wip ? 'wip' : ''}`}>{wip ? life.wip.tag : d.tag}</span>
        {d.cta && <span className="room-tip-cta">{touch ? 'tap again' : d.cta} →</span>}
      </div>
    </>
  );
}

function Fallback() {
  return (
    <div className="room-fallback">
      <h1>{life.intro.title}</h1>
      <p>{life.intro.sub}</p>
      <div className="room-fallback-links">
        {SPOTS.filter((s) => s.route).map((s) => (
          <Link key={s.id} to={s.route} className="room-fallback-link">
            <b>{life.objects[s.id].label}</b>
            <span>{isWip(s) ? life.wip.tag : life.objects[s.id].cta} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Life() {
  const navigate = useNavigate();
  const [hot, setHot] = useState(null);       // hovered/focused spot id (mouse/keyboard)
  const [pinned, setPinned] = useState(null); // tap-selected spot id (touch)
  const [zoom, setZoom] = useState(null);     // spot being zoomed into
  const [missing, setMissing] = useState(false);
  const [labels, setLabels] = useState(true); // first-load object labels
  const [tint, setTint] = useState(() => {
    try { return TINTS.includes(localStorage.getItem(TINT_KEY)) ? localStorage.getItem(TINT_KEY) : 'auto'; } catch { return 'auto'; }
  });
  const spotRefs = useRef([]);                // hotspot buttons, for number-key jump
  // Touch has no hover, so a tap previews (shows the story) and a second tap
  // on the same object steps inside. Kept as a separate `pinned` state rather
  // than reusing `hot`: tapping a button also fires a native focus event,
  // which would race the click's toggle against onFocus's own setHot.

  const pick = useCallback(
    (spot) => {
      if (!spot.route) return;
      if (prefersReducedMotion()) { navigate(spot.route); return; }
      setHot(null);
      setPinned(null);
      setZoom(spot);
    },
    [navigate]
  );

  // The zoom navigates when it finishes; Escape (or the browser's back
  // button, which fires popstate) during the zoom cancels it.
  useEffect(() => {
    if (!zoom) return undefined;
    const t = setTimeout(() => navigate(zoom.route), 780);
    const cancel = () => { clearTimeout(t); setZoom(null); };
    const onKey = (e) => { if (e.key === 'Escape') cancel(); };
    addEventListener('keydown', onKey);
    addEventListener('popstate', cancel);
    return () => {
      clearTimeout(t);
      removeEventListener('keydown', onKey);
      removeEventListener('popstate', cancel);
    };
  }, [zoom, navigate]);

  // Labels show beside each object on arrival, then fade once the visitor
  // has had a look (or as soon as they interact). Touch keeps them on.
  useEffect(() => {
    if (noHover()) return undefined;
    const t = setTimeout(() => setLabels(false), 4500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (hot && !noHover()) setLabels(false); }, [hot]);

  // Number keys 1–N jump straight to the matching object: focus its hotspot
  // (which surfaces the tooltip via onFocus), so keyboard users get the same
  // reach as a mouse without hunting through the tab order.
  useEffect(() => {
    const onKey = (e) => {
      if (zoom || e.metaKey || e.ctrlKey || e.altKey) return;
      const i = e.key.charCodeAt(0) - 49; // '1' -> 0
      if (i >= 0 && i < SPOTS.length && e.key >= '1' && e.key <= '9') {
        spotRefs.current[i]?.focus();
        e.preventDefault();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [zoom]);

  const cycleTint = () => {
    const next = TINTS[(TINTS.indexOf(tint) + 1) % TINTS.length];
    setTint(next);
    try { localStorage.setItem(TINT_KEY, next); } catch { /* storage unavailable */ }
  };
  const tone = tint === 'auto' ? clockTint() : tint;

  if (missing) return <div className="room-scene"><Fallback /></div>;

  const touchOnly = noHover();
  const hotSpot = SPOTS.find((s) => s.id === (touchOnly ? pinned : hot));

  return (
    <div className="room-scene">
      <header className={`room-head ${zoom ? 'gone' : ''}`}>
        <h1>{life.intro.title}</h1>
        <p>{life.intro.sub}</p>
      </header>

      <div className="room-stage-wrap">
        <div
          className={`room-stage ${zoom ? 'zooming' : ''} ${labels ? 'labels' : ''}`}
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        >
          <picture>
            <source type="image/webp" srcSet={srcSet('webp')} sizes={SIZES} />
            <img
              className="room-img"
              src="/life/room-1280.jpg"
              srcSet={srcSet('jpg')}
              sizes={SIZES}
              width={IMG_W}
              height={IMG_H}
              fetchPriority="high"
              decoding="async"
              alt="Isometric render of Reginald's room: a shelf of trophies, plushies and cameras, a trading desk with curved monitors, a TV console, and a leather sofa."
              onError={() => setMissing(true)}
              draggable={false}
            />
          </picture>

          {/* time-of-day tint */}
          <div className={`room-tint ${tone}`} aria-hidden="true" />

          {/* soft spotlight on the hovered object, dimming the rest */}
          <div
            className={`room-dim ${hotSpot && !zoom ? 'on' : ''}`}
            style={hotSpot ? { '--sx': `${hotSpot.x}%`, '--sy': `${hotSpot.y}%` } : undefined}
            aria-hidden="true"
          />

          {/* hotspots */}
          {SPOTS.map((s, i) => {
            const o = life.objects[s.id];
            const on = (touchOnly ? pinned : hot) === s.id;
            return (
              <button
                key={s.id}
                ref={(el) => { spotRefs.current[i] = el; }}
                className={`room-spot ${on ? 'on' : ''} ${s.route ? '' : 'info'} ${isWip(s) ? 'wip' : ''}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                aria-label={`${i + 1}: ${o.label}${s.route ? ` — ${isWip(s) ? life.wip.tag : o.cta}` : ''}`}
                onMouseEnter={() => setHot(s.id)}
                onMouseLeave={() => setHot((h) => (h === s.id ? null : h))}
                onFocus={() => setHot(s.id)}
                onBlur={() => setHot((h) => (h === s.id ? null : h))}
                onClick={() => {
                  if (touchOnly) {
                    // First tap previews; a second tap on the same object enters.
                    if (pinned === s.id && s.route) pick(s);
                    else setPinned((p) => (p === s.id ? null : s.id));
                    return;
                  }
                  pick(s);
                }}
              >
                <span className="room-spot-dot" />
                <span className="room-spot-label" aria-hidden="true">{o.label}</span>
              </button>
            );
          })}

          {/* tooltip near the hovered spot */}
          {hotSpot && !zoom && (
            <div
              className={`room-tip ${hotSpot.x > 62 ? 'flip' : ''} ${hotSpot.y < 30 ? 'below' : ''} ${hotSpot.id === 'trophy' ? 'room-tip-wide plaque' : ''}`}
              style={{ left: `${hotSpot.x}%`, top: `${hotSpot.y}%` }}
            >
              {hotSpot.id === 'trophy'
                ? <AwardsTip d={life.objects.trophy} />
                : <BlurbTip d={life.objects[hotSpot.id]} wip={isWip(hotSpot)} touch={touchOnly} />}
            </div>
          )}
        </div>
      </div>

      {/* wash to the object's theme colour while zooming in */}
      <div
        className="room-zoom-overlay"
        style={{ background: zoom ? zoom.theme : 'transparent', opacity: zoom ? 1 : 0 }}
      />

      <div className={`room-caption ${zoom ? 'gone' : ''}`}>
        <span>{life.caption}</span>
        <button type="button" className="room-lamp" onClick={cycleTint} aria-label={`Lighting: ${tint}. Change lighting`}>
          {tint === 'night' ? '☾' : tint === 'day' ? '☀' : '◐'} {tint === 'auto' ? `auto · ${tone}` : tint}
        </button>
      </div>
      <div className={`room-hint ${zoom ? 'zooming' : ''}`}>
        {zoom
          ? 'esc to stay in the room'
          : touchOnly
            ? 'Tap an object to see its story · tap again to step inside.'
            : `Hover an object · click to step inside · press 1–${SPOTS.length} to jump`}
      </div>
    </div>
  );
}

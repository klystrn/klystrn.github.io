import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { life } from '../../lib/lifeData';
import { CardsArt } from './objects';
import { prefersReducedMotion } from '../../lib/hooks';

const C = life.cards;
const RINGS = [...C.rings].sort((a, b) => a.r - b.r); // ascending radius

/* Board sits in the upper-middle, card launches from the lower-middle. */
const BOARD = { x: 0.5, y: 0.34 }; // fractions of the arena
const HOME = { x: 0.5, y: 0.84 };

const MAX_PULL = 170;
// Diminishing returns past MAX_PULL, so an over-eager drag can't fling the
// card off-screen — reads as a physical "full draw" limit, not a hard stop.
function softClamp(v, max) {
  const abs = Math.abs(v);
  if (abs <= max) return v;
  const over = abs - max;
  return Math.sign(v) * (max + over / (1 + over / max));
}

// How far back (ms) the release-velocity window looks. Short on purpose: a
// throw should read the final flick, not the whole careful-aim-then-release
// gesture, or a slow drag capped by a fast flick would score as slow.
const VELOCITY_WINDOW_MS = 90;

// Curveball: swirl the card around its resting point before releasing (the
// same "spin the ball" gesture Pokémon GO rewards), rather than just dragging
// straight to the target. Needs a deliberate ~110°+ sweep to trigger, so
// ordinary slightly-wobbly aiming never false-positives — signed accumulation
// means a wobble that cancels itself out (back-and-forth jitter) never adds up
// to a real curve the way a consistent one-direction swirl does.
const CURVE_THRESHOLD_RAD = (110 * Math.PI) / 180;
const CURVE_FULL_STRENGTH_RAD = (190 * Math.PI) / 180;

// Shortest signed angle from a to b, in radians, wrapped to (-PI, PI] — plain
// subtraction breaks across the ±180° seam a full swirl inevitably crosses.
function angleDelta(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// Keyboard aim: arrow keys nudge the card in fixed steps (there's no pointer
// to drag), and a throw needs a stand-in for release speed since there's no
// gesture to read one from — pick the middle of the pointer-driven range.
const KB_STEP = 16;
const KB_SPEED = 0.42;

const BEST_KEY = 'cg-best';
const loadBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export default function CardGame() {
  const arenaRef = useRef(null);
  const drag = useRef(null); // { startX, startY, lastAngle }
  const samples = useRef([]); // recent {x,y,t} pointer samples, for release velocity
  const curl = useRef(0); // signed radians swept around the start point this drag — curveball intent

  const [left, setLeft] = useState(C.cardsPerRound);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [newBest, setNewBest] = useState(false);
  const [phase, setPhase] = useState('aim'); // aim | flying | over
  const [pos, setPos] = useState(null); // live card offset while dragging {dx,dy}
  const [aim, setAim] = useState(null); // predicted landing {x,y,ring} in px
  const [flight, setFlight] = useState(null); // { to:{x,y}, scale }
  const [marks, setMarks] = useState([]); // landed hits {x,y,pts,id}
  const [pop, setPop] = useState(null); // last-throw score popup
  const [burst, setBurst] = useState(null); // impact ring at the landing point
  const [shake, setShake] = useState(false); // brief arena punch on a scoring hit
  const [dim, setDim] = useState(null); // measured arena {w,h} — drives layout
  const [status, setStatus] = useState(''); // last-throw result, announced to screen readers
  const roundScore = useRef(0); // this round's running total, read synchronously at round-end
  const bestRef = useRef(best); // mirrors `best` for synchronous read/write in the resolve callback

  // Measure the arena so board/card positions are pixel-accurate (and stay so
  // on resize). Render-time getBoundingClientRect is null on first paint.
  useEffect(() => {
    const el = arenaRef.current;
    if (!el) return;
    const measure = () => setDim({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rect = () => arenaRef.current.getBoundingClientRect();

  const predict = useCallback((dx, dy) => {
    const r = rect();
    const boardX = r.width * BOARD.x;
    const boardY = r.height * BOARD.y;
    const homeY = r.height * HOME.y;
    const idealUp = homeY - boardY;
    const up = -dy;
    const landX = boardX + dx * 0.95;
    const landY = boardY + (idealUp - up);
    return { x: landX, y: landY, boardX, boardY };
  }, []);

  // Which ring a predicted landing point falls in, if any — shared by the
  // live aim preview (so you see what a throw is worth before you commit)
  // and the actual scoring on release.
  const ringFor = (p) => {
    const dist = Math.hypot(p.x - p.boardX, p.y - p.boardY);
    return RINGS.find((rg) => dist <= rg.r) || null;
  };

  const onDown = (e) => {
    if (phase !== 'aim') return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, lastAngle: null };
    samples.current = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    curl.current = 0;
    setPos({ dx: 0, dy: 0 });
  };

  const onMove = (e) => {
    if (!drag.current) return;
    const now = performance.now();
    samples.current.push({ x: e.clientX, y: e.clientY, t: now });
    const cutoff = now - VELOCITY_WINDOW_MS;
    while (samples.current.length > 2 && samples.current[0].t < cutoff) samples.current.shift();

    const rawDx = e.clientX - drag.current.startX;
    const rawDy = e.clientY - drag.current.startY;
    // Track how far the pointer has swirled around its own start point (not
    // just its last position), over the whole drag — a deliberate curveball
    // wind-up happens throughout the aim, not just in the final flick.
    if (Math.hypot(rawDx, rawDy) > 12) {
      const ang = Math.atan2(rawDy, rawDx);
      if (drag.current.lastAngle != null) curl.current += angleDelta(drag.current.lastAngle, ang);
      drag.current.lastAngle = ang;
    }

    const dx = softClamp(rawDx, MAX_PULL);
    const dy = softClamp(rawDy, MAX_PULL);
    setPos({ dx, dy });
    aimAt(dx, dy);
  };

  // Shared by pointer drag and keyboard nudging: shows the predicted landing
  // point plus what it's currently worth, live, instead of only revealing
  // the score after the card lands.
  const aimAt = (dx, dy) => {
    if (-dy <= 20) {
      setAim(null);
      return;
    }
    const p = predict(dx, dy);
    setAim({ ...p, ring: ringFor(p) });
  };

  const onUp = (e) => {
    if (!drag.current) return;
    const rawDy = e.clientY - drag.current.startY;
    const dx = softClamp(e.clientX - drag.current.startX, MAX_PULL);
    const dy = softClamp(rawDy, MAX_PULL);
    drag.current = null;

    // Not a real upward flick — reset the card, no throw spent.
    if (-rawDy < 40) {
      setPos(null);
      setAim(null);
      return;
    }

    // Release velocity from only the last ~90ms of movement (not the whole
    // press-to-release gesture) — a real flick right at the end reads as
    // fast even after a slow, careful aim, and a gentle push stays a lob.
    // Score is still purely a function of where you aimed — speed is feel only.
    const first = samples.current[0];
    const last = samples.current[samples.current.length - 1];
    const dt = Math.max(last.t - first.t, 16);
    const speed = Math.hypot(last.x - first.x, last.y - first.y) / dt; // px/ms

    throwCard(dx, dy, speed, curl.current);
  };

  // Keyboard equivalent of drag-and-release: arrow keys nudge the aim (same
  // softClamp, same live aim preview via aimAt), Enter/Space throws at
  // whatever's currently aimed, Escape cancels. No gesture to read a release
  // speed from, so a throw uses a fixed KB_SPEED stand-in, and no swirl
  // gesture exists either, so keyboard throws never curve.
  const onCardKeyDown = (e) => {
    if (phase !== 'aim') return;
    const { key } = e;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      const cur = pos || { dx: 0, dy: 0 };
      const dx = softClamp(cur.dx + (key === 'ArrowLeft' ? -KB_STEP : key === 'ArrowRight' ? KB_STEP : 0), MAX_PULL);
      const dy = softClamp(cur.dy + (key === 'ArrowUp' ? -KB_STEP : key === 'ArrowDown' ? KB_STEP : 0), MAX_PULL);
      setPos({ dx, dy });
      aimAt(dx, dy);
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      if (pos && -pos.dy > 20) throwCard(pos.dx, pos.dy, KB_SPEED, 0);
    } else if (key === 'Escape') {
      setPos(null);
      setAim(null);
    }
  };

  const throwCard = (dx, dy, speed, sweep) => {
    const p = predict(dx, dy);
    const ring = ringFor(p);
    const pts = ring ? ring.points : 0;
    const reduced = prefersReducedMotion();

    // Curveball: a deliberate swirl (not just a diagonal drag) around the
    // start point, measured over the whole gesture — unlike release speed,
    // a curve wind-up is naturally slow and sustained, so it needs the full
    // drag's accumulated sweep rather than the short velocity window.
    const isCurve = Math.abs(sweep) >= CURVE_THRESHOLD_RAD;
    const curveMag = isCurve
      ? Math.min((Math.abs(sweep) - CURVE_THRESHOLD_RAD) / (CURVE_FULL_STRENGTH_RAD - CURVE_THRESHOLD_RAD), 1)
      : 0;
    const curveSign = sweep < 0 ? -1 : 1;
    const curveBonus = isCurve && pts > 0 ? C.curveBonus || 0 : 0;

    const travel = Math.hypot(p.x - homePx.x, p.y - homePx.y);
    const duration = reduced ? 0.001 : Math.min(Math.max(0.5 - speed * 0.16, 0.16), 0.5);
    const spin = (220 + Math.min(speed * 260, 520) * (dx < 0 ? -1 : 1)) * (isCurve ? 1.5 : 1);
    const lift = Math.min(Math.max(travel * 0.16 + speed * 10, 22), 90);
    // A curveball's bow is driven by the swirl direction/strength, not the
    // drag's raw horizontal offset — otherwise a straight-up flick with a
    // swirl mixed in wouldn't visibly curve.
    const straightCurve = Math.max(Math.min(dx * 0.14, 45), -45);
    const curveOffset = isCurve ? curveSign * (44 + curveMag * 70) : straightCurve;
    const mid = { x: (homePx.x + p.x) / 2 + curveOffset, y: (homePx.y + p.y) / 2 - lift };
    // A harder flick pops the card bigger on release — more visible "snap".
    const popScale = 1.08 + Math.min(speed * 0.12, 0.34);

    setPos(null);
    setAim(null);
    setPhase('flying');
    setFlight({ to: { x: p.x, y: p.y }, mid, scale: 0.45, duration, spin, pop: popScale });

    // Resolve after the flight animation.
    window.setTimeout(() => {
      const id = Date.now();
      const total = pts + curveBonus;
      roundScore.current += total;
      if (pts > 0) setMarks((m) => [...m.slice(-6), { x: p.x, y: p.y, pts: total, id }]);
      setScore(roundScore.current);
      setPop({ pts: total, id, miss: pts === 0, curve: curveBonus > 0 });
      setBurst({ x: p.x, y: p.y, id, big: ring === RINGS[0], curve: curveBonus > 0 });
      setStatus(pts === 0 ? 'Miss.' : `${ring.label}, ${total} points${curveBonus > 0 ? ', curveball bonus' : ''}.`);
      setFlight(null);
      if (!reduced && pts > 0) {
        setShake(true);
        window.setTimeout(() => setShake(false), 220);
      }
      const remaining = left - 1;
      setLeft(remaining);
      setPhase(remaining > 0 ? 'aim' : 'over');
      if (remaining <= 0) {
        if (roundScore.current > bestRef.current) {
          bestRef.current = roundScore.current;
          setBest(roundScore.current);
          setNewBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(roundScore.current));
          } catch {
            // Storage unavailable (private mode, quota) — best just won't persist.
          }
        } else {
          setNewBest(false);
        }
      }
      window.setTimeout(() => setPop((cur) => (cur && cur.id === id ? null : cur)), 900);
      window.setTimeout(() => setBurst((cur) => (cur && cur.id === id ? null : cur)), 500);
    }, duration * 1000);
  };

  const reset = () => {
    setLeft(C.cardsPerRound);
    roundScore.current = 0;
    setScore(0);
    setMarks([]);
    setPop(null);
    setNewBest(false);
    setPhase('aim');
  };

  const boardPx = dim ? { x: dim.w * BOARD.x, y: dim.h * BOARD.y } : { x: 0, y: 0 };
  const homePx = dim ? { x: dim.w * HOME.x, y: dim.h * HOME.y } : { x: 0, y: 0 };

  return (
    <div className="cg">
      <Link className="life-back cg-back" to="/life">← the table</Link>

      <div className="cg-hud">
        <div className="cg-brand">
          <h1>{C.title}</h1>
        </div>
        <div className="cg-score">
          <div className="cg-score-n">{score}</div>
          <div className="cg-score-l">POINTS</div>
        </div>
        <div className="cg-best">
          <div className="cg-best-n">{best}</div>
          <div className="cg-best-l">BEST</div>
        </div>
        <div className="sr-only" aria-live="polite">{status}</div>
        <div className="cg-cards-left">
          {Array.from({ length: C.cardsPerRound }).map((_, i) => (
            <span key={i} className={`cg-pip ${i < left ? 'live' : ''}`} />
          ))}
          <span className="cg-cards-num">{left} left</span>
        </div>
      </div>

      <div
        className={`cg-arena ${shake ? 'punch' : ''}`}
        ref={arenaRef}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ touchAction: 'none' }}
      >
        {/* target board */}
        <div className="cg-board" style={{ left: boardPx.x, top: boardPx.y }}>
          <svg viewBox="-130 -130 260 260" width={RINGS[RINGS.length - 1].r * 2} height={RINGS[RINGS.length - 1].r * 2}>
            {[...RINGS].reverse().map((rg, i) => (
              <circle
                key={rg.r}
                r={rg.r}
                fill={i % 2 === 0 ? '#1b1e24' : '#242830'}
                stroke={aim?.ring === rg ? '#ffd23f' : '#3a4150'}
                strokeWidth={aim?.ring === rg ? 3 : 1.5}
              />
            ))}
            <circle
              r={RINGS[0].r}
              fill="#d92b35"
              stroke={aim?.ring === RINGS[0] ? '#ffd23f' : 'none'}
              strokeWidth={aim?.ring === RINGS[0] ? 3 : 0}
            />
            <circle r={RINGS[0].r * 0.4} fill="#fff2f2" />
            {RINGS.map((rg) => (
              <text key={rg.r} x="0" y={-rg.r + 13} textAnchor="middle" className="cg-ring-pts">{rg.points}</text>
            ))}
          </svg>
        </div>

        {/* landed marks */}
        {marks.map((m) => (
          <div key={m.id} className="cg-mark" style={{ left: m.x, top: m.y }} />
        ))}

        {/* aim guide — reticle colour and the live point value both reflect
            what the throw is currently worth, so scoring feedback starts
            during the aim instead of only after the card lands. */}
        {aim && dim && (
          <svg className="cg-guide" width={dim.w} height={dim.h}>
            <line
              x1={homePx.x + (pos?.dx || 0)}
              y1={homePx.y + (pos?.dy || 0)}
              x2={aim.x}
              y2={aim.y}
              stroke={aim.ring ? 'rgba(255,210,63,.6)' : 'rgba(217,43,53,.5)'}
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            <circle cx={aim.x} cy={aim.y} r="8" fill="none" stroke={aim.ring ? '#ffd23f' : '#d92b35'} strokeWidth="2" />
            <text x={aim.x} y={aim.y - 18} textAnchor="middle" className={`cg-aim-preview ${aim.ring ? '' : 'miss'}`}>
              {aim.ring ? `+${aim.ring.points}` : 'miss'}
            </text>
          </svg>
        )}

        {/* flying card — arcs through a lifted midpoint (real toss, not a
            straight slide), with a quick windup pop and a small undershoot-then-
            settle bounce on arrival so it reads as a snappy, weighted throw. */}
        <AnimatePresence>
          {flight && (
            <motion.div
              className="cg-card flying"
              initial={{ x: homePx.x, y: homePx.y, scale: 1, rotate: 0 }}
              animate={{
                x: [homePx.x, flight.mid.x, flight.to.x],
                y: [homePx.y, flight.mid.y, flight.to.y],
                scale: [1, flight.pop, flight.scale * 0.86, flight.scale],
                rotate: flight.spin,
              }}
              transition={{
                x: { duration: flight.duration, ease: [0.3, 0.1, 0.7, 1] },
                y: { duration: flight.duration, ease: [0.3, 0.1, 0.7, 1] },
                scale: { duration: flight.duration, times: [0, 0.16, 0.82, 1], ease: 'easeOut' },
                rotate: { duration: flight.duration, ease: 'easeIn' },
              }}
            >
              <CardsArt className="cg-card-art" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* impact burst — a quick expanding ring where the card lands */}
        <AnimatePresence>
          {burst && (
            <motion.div
              key={burst.id}
              className={`cg-burst ${burst.big ? 'big' : ''} ${burst.curve ? 'curve' : ''}`}
              style={{ left: burst.x, top: burst.y }}
              initial={{ opacity: 0.9, scale: 0.3 }}
              animate={{ opacity: 0, scale: burst.big ? 2.4 : 1.7 }}
              transition={{ duration: 0.46, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* draggable card at home — also keyboard-operable: focus it, use
            the arrow keys to aim, Enter/Space to throw. */}
        {phase === 'aim' && (
          <div
            className={`cg-card live ${pos ? 'dragging' : ''}`}
            onPointerDown={onDown}
            onKeyDown={onCardKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Card, ${left} left to throw. Drag, or use the arrow keys to aim and Enter to throw.`}
            style={{
              left: homePx.x,
              top: homePx.y,
              transform: `translate(-50%,-50%) translate(${pos?.dx || 0}px, ${pos?.dy || 0}px) rotate(${(pos?.dx || 0) * 0.06}deg)`,
            }}
          >
            <CardsArt className="cg-card-art" />
          </div>
        )}

        {/* score popup */}
        <AnimatePresence>
          {pop && (
            <motion.div
              className={`cg-pop ${pop.miss ? 'miss' : ''} ${pop.curve ? 'curve' : ''}`}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              style={{ left: boardPx.x, top: boardPx.y }}
            >
              {pop.miss ? 'miss' : `+${pop.pts}`}
              {pop.curve && <span className="cg-pop-curve">CURVEBALL</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* game over */}
        <AnimatePresence>
          {phase === 'over' && (
            <motion.div className="cg-over" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="cg-over-box" initial={{ scale: 0.9, y: 14 }} animate={{ scale: 1, y: 0 }}>
                <div className="cg-over-eyebrow">{newBest ? 'NEW BEST' : 'ROUND COMPLETE'}</div>
                <div className="cg-over-score">{score}</div>
                <div className="cg-over-l">points from {C.cardsPerRound} cards{!newBest && best > 0 ? ` · best ${best}` : ''}</div>
                <button className="cg-over-btn" onClick={reset}>Throw again</button>
                <Link className="cg-over-back" to="/life">back to the table</Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'aim' && left === C.cardsPerRound && marks.length === 0 && !flight && (
          <div className="cg-hint">{C.intro}</div>
        )}
      </div>
    </div>
  );
}

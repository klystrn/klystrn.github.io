import { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import life from '../../data/life.json';
import { CardsArt } from './objects';
import { prefersReducedMotion } from '../../lib/hooks';

const C = life.cards;
const RINGS = [...C.rings].sort((a, b) => a.r - b.r); // ascending radius

/* Board sits in the upper-middle, card launches from the lower-middle. */
const BOARD = { x: 0.5, y: 0.34 }; // fractions of the arena
const HOME = { x: 0.5, y: 0.84 };

export default function CardGame() {
  const arenaRef = useRef(null);
  const drag = useRef(null); // { startX, startY }

  const [left, setLeft] = useState(C.cardsPerRound);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('aim'); // aim | flying | over
  const [pos, setPos] = useState(null); // live card offset while dragging {dx,dy}
  const [aim, setAim] = useState(null); // predicted landing {x,y} in px
  const [flight, setFlight] = useState(null); // { to:{x,y}, scale }
  const [marks, setMarks] = useState([]); // landed hits {x,y,pts,id}
  const [pop, setPop] = useState(null); // last-throw score popup
  const [burst, setBurst] = useState(null); // impact ring at the landing point
  const [shake, setShake] = useState(false); // brief arena punch on a scoring hit
  const [dim, setDim] = useState(null); // measured arena {w,h} — drives layout

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

  const onDown = (e) => {
    if (phase !== 'aim') return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, startT: performance.now() };
    setPos({ dx: 0, dy: 0 });
  };

  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setPos({ dx, dy });
    if (-dy > 20) setAim(predict(dx, dy));
    else setAim(null);
  };

  const onUp = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    const elapsed = Math.max(performance.now() - drag.current.startT, 60);
    drag.current = null;

    // Not a real upward flick — reset the card, no throw spent.
    if (-dy < 40) {
      setPos(null);
      setAim(null);
      return;
    }

    const p = predict(dx, dy);
    const dist = Math.hypot(p.x - p.boardX, p.y - p.boardY);
    const ring = RINGS.find((rg) => dist <= rg.r);
    const pts = ring ? ring.points : 0;
    const reduced = prefersReducedMotion();

    // Flick speed (px/ms of the pull) drives how snappy the throw reads: a
    // fast short flick gets a quick, hard-spinning throw; a slow drag lobs.
    // Score is still purely a function of where you aimed — speed is feel only.
    const pull = Math.hypot(dx, dy);
    const speed = pull / elapsed;
    const travel = Math.hypot(p.x - homePx.x, p.y - homePx.y);
    const duration = reduced ? 0.001 : Math.min(Math.max(0.42 - speed * 0.12, 0.2), 0.42);
    const spin = 300 + Math.min(speed * 260, 420) * (dx < 0 ? -1 : 1);
    const lift = Math.min(Math.max(travel * 0.16, 22), 70);
    const curve = Math.max(Math.min(dx * 0.14, 45), -45);
    const mid = { x: (homePx.x + p.x) / 2 + curve, y: (homePx.y + p.y) / 2 - lift };

    setPos(null);
    setAim(null);
    setPhase('flying');
    setFlight({ to: { x: p.x, y: p.y }, mid, scale: 0.45, duration, spin });

    // Resolve after the flight animation.
    window.setTimeout(() => {
      const id = Date.now();
      if (pts > 0) setMarks((m) => [...m.slice(-6), { x: p.x, y: p.y, pts, id }]);
      setScore((s) => s + pts);
      setPop({ pts, id, miss: pts === 0 });
      setBurst({ x: p.x, y: p.y, id, big: ring === RINGS[0] });
      setFlight(null);
      if (!reduced && pts > 0) {
        setShake(true);
        window.setTimeout(() => setShake(false), 220);
      }
      const remaining = left - 1;
      setLeft(remaining);
      setPhase(remaining > 0 ? 'aim' : 'over');
      window.setTimeout(() => setPop((cur) => (cur && cur.id === id ? null : cur)), 900);
      window.setTimeout(() => setBurst((cur) => (cur && cur.id === id ? null : cur)), 500);
    }, duration * 1000);
  };

  const reset = () => {
    setLeft(C.cardsPerRound);
    setScore(0);
    setMarks([]);
    setPop(null);
    setPhase('aim');
  };

  const boardPx = dim ? { x: dim.w * BOARD.x, y: dim.h * BOARD.y } : { x: 0, y: 0 };
  const homePx = dim ? { x: dim.w * HOME.x, y: dim.h * HOME.y } : { x: 0, y: 0 };

  return (
    <div className="cg">
      <Link className="life-back cg-back" to="/life">← the table</Link>

      <div className="cg-hud">
        <div className="cg-brand">
          <div className="cg-eyebrow">{C.title.toUpperCase()}</div>
          <h1>{C.title}</h1>
        </div>
        <div className="cg-score">
          <div className="cg-score-n">{score}</div>
          <div className="cg-score-l">POINTS</div>
        </div>
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
                stroke="#3a4150"
                strokeWidth="1.5"
              />
            ))}
            <circle r={RINGS[0].r} fill="#d92b35" />
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

        {/* aim guide */}
        {aim && dim && (
          <svg className="cg-guide" width={dim.w} height={dim.h}>
            <line
              x1={homePx.x + (pos?.dx || 0)}
              y1={homePx.y + (pos?.dy || 0)}
              x2={aim.x}
              y2={aim.y}
              stroke="rgba(217,43,53,.5)"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            <circle cx={aim.x} cy={aim.y} r="8" fill="none" stroke="#d92b35" strokeWidth="2" />
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
                scale: [1, 1.14, flight.scale * 0.86, flight.scale],
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
              className={`cg-burst ${burst.big ? 'big' : ''}`}
              style={{ left: burst.x, top: burst.y }}
              initial={{ opacity: 0.9, scale: 0.3 }}
              animate={{ opacity: 0, scale: burst.big ? 2.4 : 1.7 }}
              transition={{ duration: 0.46, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* draggable card at home */}
        {phase === 'aim' && (
          <div
            className="cg-card live"
            onPointerDown={onDown}
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
              className={`cg-pop ${pop.miss ? 'miss' : ''}`}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              style={{ left: boardPx.x, top: boardPx.y }}
            >
              {pop.miss ? 'miss' : `+${pop.pts}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* game over */}
        <AnimatePresence>
          {phase === 'over' && (
            <motion.div className="cg-over" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="cg-over-box" initial={{ scale: 0.9, y: 14 }} animate={{ scale: 1, y: 0 }}>
                <div className="cg-over-eyebrow">ROUND COMPLETE</div>
                <div className="cg-over-score">{score}</div>
                <div className="cg-over-l">points from {C.cardsPerRound} cards</div>
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

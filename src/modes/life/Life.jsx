import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import life from '../../data/life.json';
import { prefersReducedMotion } from '../../lib/hooks';
import { OBJECTS } from './objects';

const ROUTE = {
  photography: '/life/photography',
  watch: '/life/watch',
  cards: '/life/cards',
  professional: '/',
};

/* Horizontal anchoring for the hover popover so edge objects don't overflow. */
function align(leftPct) {
  const n = parseFloat(leftPct);
  if (n < 26) return 'left';
  if (n > 68) return 'right';
  return 'center';
}

function Popover({ obj }) {
  const data = life.objects[obj.id];
  const a = align(obj.pos.left);
  return (
    <motion.div
      className={`life-pop life-pop-${a}`}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {obj.id === 'camera' && (
        <div className="life-pop-photo">
          <img src={data.photo} alt="Reginald with a camera" loading="lazy" onError={(e) => { e.target.parentElement.classList.add('noimg'); }} />
          <span className="life-pop-photo-fb">📷</span>
        </div>
      )}
      <div className="life-pop-body">
        <div className="life-pop-title">{data.hoverTitle}</div>
        <p>{data.blurb}</p>
        <div className="life-pop-foot">
          <span className="life-pop-tag">{data.tag}</span>
          <span className="life-pop-cta">{data.cta} →</span>
        </div>
      </div>
      <span className="life-pop-arrow" />
    </motion.div>
  );
}

export default function Life() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const pick = useCallback(
    (obj) => {
      const to = ROUTE[life.objects[obj.id].route] || '/';
      if (prefersReducedMotion()) {
        navigate(to);
        return;
      }
      setHovered(null);
      setSelected(obj);
    },
    [navigate]
  );

  const go = () => {
    if (!selected) return;
    navigate(ROUTE[life.objects[selected.id].route] || '/');
  };

  return (
    <div className="life-scene">
      <div className="life-room" aria-hidden="true" />
      <header className="life-head">
        <div className="life-eyebrow">{life.intro.eyebrow}</div>
        <h1>{life.intro.title}</h1>
        <p>{life.intro.sub}</p>
      </header>

      <div className="life-table">
        <div className="life-surface" aria-hidden="true" />
        {OBJECTS.map((obj) => {
          const Art = obj.art;
          const isHot = hovered === obj.id;
          return (
            <div
              key={obj.id}
              className="life-obj-slot"
              style={{ left: obj.pos.left, top: obj.pos.top, width: obj.pos.w }}
            >
              <AnimatePresence>{isHot && !selected && <Popover obj={obj} />}</AnimatePresence>
              <motion.button
                className="life-obj"
                aria-label={`${life.objects[obj.id].label} — ${life.objects[obj.id].cta}`}
                onHoverStart={() => setHovered(obj.id)}
                onHoverEnd={() => setHovered((h) => (h === obj.id ? null : h))}
                onFocus={() => setHovered(obj.id)}
                onBlur={() => setHovered((h) => (h === obj.id ? null : h))}
                onClick={() => pick(obj)}
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: 1,
                  y: isHot ? [0, 0] : [0, -9, 0],
                  rotate: obj.pos.rot,
                  scale: isHot ? 1.07 : 1,
                }}
                transition={{
                  opacity: { duration: 0.5, delay: obj.pos.delay * 0.2 },
                  y: isHot
                    ? { duration: 0.3 }
                    : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: obj.pos.delay },
                  scale: { duration: 0.25 },
                  rotate: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.96 }}
              >
                <Art className="life-art" />
                <span className="life-obj-shadow" />
                <span className="life-obj-label">{life.objects[obj.id].label}</span>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Click-to-zoom: wash to the object's theme and dive through it, then route. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="life-zoom"
            style={{ background: selected.theme }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="life-zoom-art"
              initial={{ scale: 0.3, opacity: 0.7 }}
              animate={{ scale: 7, opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.7, 0, 0.84, 0], delay: 0.1 }}
              onAnimationComplete={go}
            >
              {(() => {
                const Art = selected.art;
                return <Art className="life-art" />;
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

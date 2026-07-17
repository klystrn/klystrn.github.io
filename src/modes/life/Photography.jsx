import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import life from '../../data/life.json';

const P = life.photography;

/* Deterministic gradient stand-in for an event cover / photo cell, keyed off
   the tile hue + an index so the grid looks varied until real images drop in. */
function tileBg(hue, i = 0) {
  const h = (hue + i * 24) % 360;
  return `linear-gradient(150deg, hsl(${h} 42% 32%), hsl(${(h + 30) % 360} 38% 18%))`;
}

function Lightbox({ tile, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <motion.div
      className="ig-lb"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="ig-lb-box"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <button className="ig-lb-x" aria-label="Close" onClick={onClose}>✕</button>
        <div className="ig-lb-head">
          <h3>{tile.title}</h3>
          <span>{tile.count} photos</span>
        </div>
        <div className="ig-lb-grid">
          {Array.from({ length: Math.min(tile.count, 12) }).map((_, i) => (
            <div key={i} className="ig-lb-cell" style={{ background: tileBg(tile.hue, i + 1) }} />
          ))}
        </div>
        <p className="ig-lb-note">A selection from this set. Full galleries coming as I digitise the archive.</p>
      </motion.div>
    </motion.div>
  );
}

export default function Photography() {
  const [open, setOpen] = useState(null);

  return (
    <motion.div
      className="ig"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link className="life-back" to="/life">← the table</Link>

      <header className="ig-head">
        <div className="ig-avatar">
          <img src={P.avatar} alt="" onError={(e) => { e.target.parentElement.classList.add('noimg'); }} />
          <span className="ig-avatar-fb">R</span>
        </div>
        <div className="ig-meta">
          <div className="ig-top">
            <h1 className="ig-handle">{P.handle}</h1>
            <span className="ig-badge">Photography</span>
          </div>
          <div className="ig-stats">
            <span><b>{P.stats.posts}</b> sets</span>
            <span><b>{P.stats.gear}</b></span>
            <span>shooting since <b>{P.stats.since}</b></span>
          </div>
          <div className="ig-name">{P.name}</div>
          <p className="ig-bio">{P.bio}</p>
        </div>
      </header>

      <div className="ig-tabline"><span className="on">▦ SETS</span></div>

      <div className="ig-grid">
        {P.tiles.map((t) => (
          <button
            key={t.id}
            className="ig-tile"
            style={t.cover ? undefined : { background: tileBg(t.hue) }}
            onClick={() => setOpen(t)}
          >
            {t.cover && <img src={t.cover} alt={t.title} loading="lazy" />}
            <span className="ig-tile-count">▦ {t.count}</span>
            <span className="ig-tile-title">{t.title}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>{open && <Lightbox tile={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </motion.div>
  );
}

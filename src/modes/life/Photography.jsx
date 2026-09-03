import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { life } from '../../lib/lifeData';

const P = life.photography;

/* Deterministic gradient stand-in for an event cover / photo cell, keyed off
   the tile hue + an index so the grid looks varied until real images drop in. */
function tileBg(hue, i = 0) {
  const h = (hue + i * 24) % 360;
  return `linear-gradient(150deg, hsl(${h} 42% 32%), hsl(${(h + 30) % 360} 38% 18%))`;
}

/* A real photo that 404s (a path typo, a file that hasn't landed yet) falls
   back to the same gradient swatch the placeholder cells use, cell by cell,
   rather than showing a broken-image icon or losing the grid's shape. */
function PhotoCell({ src, hue, i, title }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <div className="ig-lb-cell" style={{ background: tileBg(hue, i + 1) }} />;
  return (
    <div className="ig-lb-cell">
      <img src={src} alt={`${title} — photo ${i + 1}`} loading="lazy" onError={() => setBroken(true)} />
    </div>
  );
}

function Lightbox({ tile, onClose }) {
  const closeRef = useRef(null);
  const lastFocused = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    lastFocused.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      removeEventListener('keydown', onKey);
      lastFocused.current?.focus?.();
    };
  }, [onClose]);

  // Real photos, once added to a tile's `photos` array, replace the gradient
  // placeholders automatically — no other flag to flip. Until then this set
  // still shows the placeholder grid + a note that the real thing is coming.
  const photos = tile.photos || [];
  const hasPhotos = photos.length > 0;
  const count = hasPhotos ? photos.length : tile.count;

  return (
    <motion.div
      className="ig-lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${tile.title} — photo set`}
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
        <button className="ig-lb-x" aria-label="Close" ref={closeRef} onClick={onClose}>✕</button>
        <div className="ig-lb-head">
          <h3>{tile.title}</h3>
          <span>{count} photos</span>
        </div>
        <div className="ig-lb-grid">
          {hasPhotos
            ? photos.map((src, i) => <PhotoCell key={src} src={src} hue={tile.hue} i={i} title={tile.title} />)
            : Array.from({ length: Math.min(tile.count, 12) }).map((_, i) => (
                <div key={i} className="ig-lb-cell" style={{ background: tileBg(tile.hue, i + 1) }} />
              ))}
        </div>
        {!hasPhotos && (
          <p className="ig-lb-note">A selection from this set. Full galleries coming as I digitise the archive.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* Grid tile: an explicit `cover` wins, otherwise the set's first real photo
   stands in for it once one exists — one place to add real photos (`photos`)
   rather than keeping a separate `cover` in sync by hand. Falls back to the
   gradient swatch if that image 404s, same as a lightbox cell would. */
function Tile({ t, onOpen }) {
  const [broken, setBroken] = useState(false);
  const src = t.cover || t.photos?.[0] || '';
  const count = t.photos?.length || t.count;
  const showImg = src && !broken;
  return (
    <button
      className="ig-tile"
      style={showImg ? undefined : { background: tileBg(t.hue) }}
      onClick={() => onOpen(t)}
    >
      {showImg && <img src={src} alt={t.title} loading="lazy" onError={() => setBroken(true)} />}
      <span className="ig-tile-count">▦ {count}</span>
      <span className="ig-tile-title">{t.title}</span>
    </button>
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
          <Tile key={t.id} t={t} onOpen={setOpen} />
        ))}
      </div>

      <AnimatePresence>{open && <Lightbox tile={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </motion.div>
  );
}

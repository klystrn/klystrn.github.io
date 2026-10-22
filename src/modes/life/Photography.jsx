import '../../styles/life.css';
import { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Motion, LifeBack, WipGate } from './shared';
import { life } from '../../lib/lifeData';

const P = life.photography;

/* Deterministic gradient stand-in for an event cover / photo cell, keyed off
   the tile hue + an index so the grid looks varied until real images drop in. */
function tileBg(hue, i = 0) {
  const h = (hue + i * 24) % 360;
  return `linear-gradient(150deg, hsl(${h} 42% 32%), hsl(${(h + 30) % 360} 38% 18%))`;
}

/* A tile's `photos` entries are either a plain path or
   { src, caption, exif } — the viewer shows the caption and EXIF line. */
const asPhoto = (p) => (typeof p === 'string' ? { src: p } : p);
// Placeholder cells get varied aspect ratios so the masonry reads as one.
const RATIOS = ['3 / 4', '1 / 1', '4 / 3', '2 / 3', '3 / 2'];

/* A real photo that 404s (a path typo, a file that hasn't landed yet) falls
   back to the same gradient swatch the placeholder cells use, cell by cell,
   rather than showing a broken-image icon or losing the grid's shape. */
function PhotoCell({ photo, hue, i, title, onOpen }) {
  const [broken, setBroken] = useState(false);
  if (!photo?.src || broken) {
    return <div className="ig-lb-cell" style={{ background: tileBg(hue, i + 1), aspectRatio: RATIOS[i % RATIOS.length] }} />;
  }
  return (
    <button type="button" className="ig-lb-cell" onClick={() => onOpen(i)} aria-label={`Open photo ${i + 1}${photo.caption ? `: ${photo.caption}` : ''}`}>
      <img src={photo.src} alt={photo.caption || `${title} — photo ${i + 1}`} loading="lazy" onError={() => setBroken(true)} />
    </button>
  );
}

/* Single-photo viewer inside a set: ←/→ keys, on-screen arrows, and a
   horizontal swipe on touch; caption + EXIF underneath. */
function Viewer({ photos, i, setI, title }) {
  const start = useRef(null);
  const n = photos.length;
  const go = (d) => setI((k) => (k + d + n) % n);
  const p = photos[i];
  return (
    <div
      className="ig-view"
      onPointerDown={(e) => { start.current = e.clientX; }}
      onPointerUp={(e) => {
        if (start.current == null) return;
        const dx = e.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <img src={p.src} alt={p.caption || `${title} — photo ${i + 1}`} draggable={false} />
      {n > 1 && (
        <>
          <button type="button" className="ig-view-nav prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
          <button type="button" className="ig-view-nav next" onClick={() => go(1)} aria-label="Next photo">›</button>
        </>
      )}
      <div className="ig-view-cap">
        <span>{p.caption || title}</span>
        {p.exif && <span className="ig-view-exif">{p.exif}</span>}
        <span className="ig-view-n">{i + 1} / {n}</span>
      </div>
    </div>
  );
}

function Lightbox({ tile, onClose }) {
  const closeRef = useRef(null);
  const lastFocused = useRef(null);
  const [view, setView] = useState(null); // index of the open photo, or null for the grid
  const photos = (tile.photos || []).map(asPhoto);
  useEffect(() => {
    lastFocused.current = document.activeElement;
    closeRef.current?.focus();
    return () => lastFocused.current?.focus?.();
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { if (view != null) setView(null); else onClose(); return; }
      if (view == null || photos.length < 2) return;
      if (e.key === 'ArrowRight') setView((k) => (k + 1) % photos.length);
      if (e.key === 'ArrowLeft') setView((k) => (k - 1 + photos.length) % photos.length);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose, view, photos.length]);

  // Real photos, once added to a tile's `photos` array, replace the gradient
  // placeholders automatically — no other flag to flip. Until then this set
  // still shows the placeholder grid + a note that the real thing is coming.
  const hasPhotos = photos.length > 0;
  const count = hasPhotos ? photos.length : tile.count;

  return (
    <m.div
      className="ig-lb"
      role="dialog"
      aria-modal="true"
      aria-label={`${tile.title} — photo set`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <m.div
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
          {view != null && <button type="button" className="ig-lb-grid-btn" onClick={() => setView(null)}>▦ all</button>}
        </div>
        {view != null ? (
          <Viewer photos={photos} i={view} setI={setView} title={tile.title} />
        ) : (
          <div className="ig-lb-grid">
            {hasPhotos
              ? photos.map((ph, i) => <PhotoCell key={ph.src} photo={ph} hue={tile.hue} i={i} title={tile.title} onOpen={setView} />)
              : Array.from({ length: Math.min(tile.count, 12) }).map((_, i) => (
                  <PhotoCell key={i} hue={tile.hue} i={i} title={tile.title} />
                ))}
          </div>
        )}
        {!hasPhotos && (
          <p className="ig-lb-note">A selection from this set. Full galleries coming as I digitise the archive.</p>
        )}
      </m.div>
    </m.div>
  );
}

/* Grid tile: an explicit `cover` wins, otherwise the set's first real photo
   stands in for it once one exists — one place to add real photos (`photos`)
   rather than keeping a separate `cover` in sync by hand. Falls back to the
   gradient swatch if that image 404s, same as a lightbox cell would. */
function Tile({ t, onOpen }) {
  const [broken, setBroken] = useState(false);
  const src = t.cover || asPhoto(t.photos?.[0] || '').src || '';
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

function PhotographyPage() {
  const [open, setOpen] = useState(null);

  return (
    <m.div
      className="ig"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <LifeBack />

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
            <span><b>{P.tiles.length}</b> sets</span>
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
    </m.div>
  );
}

export default function Photography() {
  return <WipGate page="photography"><Motion><PhotographyPage /></Motion></WipGate>;
}

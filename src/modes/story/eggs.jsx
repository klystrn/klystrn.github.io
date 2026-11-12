import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { duckySVG } from './sketch.js';
import { trackEvent } from '../../lib/analytics';

/*
 * Easter eggs, all code overlays (nothing here needs a generated image):
 *  - Ducky: hidden once per chapter, grey and camouflaged; clicking turns it
 *    yellow. Finding every Ducky shows a big Ducky saying "I like Ducks!".
 *  - Watches: the first and last time each watch appears, hovering or tapping
 *    it adds a shadowy shimmer and a comment card.
 */

const KEY = 'story-ducky-v1';
const read = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); } };
const write = (s) => { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* private mode: progress lasts this visit */ } };

const DuckyCtx = createContext(null);

export function DuckyProvider({ total, children }) {
  const [found, setFound] = useState(read);
  const [toast, setToast] = useState('');
  const [party, setParty] = useState(false);
  const find = useCallback((id) => {
    setFound((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      write(next);
      trackEvent('ducky_found', { id, count: next.size });
      setToast(next.size >= total ? '' : `Ducky ${next.size} of ${total} found`);
      if (next.size >= total) setParty(true);
      return next;
    });
  }, [total]);
  useEffect(() => { if (!toast) return undefined; const t = setTimeout(() => setToast(''), 2400); return () => clearTimeout(t); }, [toast]);
  const value = useMemo(() => ({ found, find }), [found, find]);
  return (
    <DuckyCtx.Provider value={value}>
      {children}
      {toast && <p className="st-ducktoast" role="status">{toast}</p>}
      {party && (
        <div className="st-duckparty" role="dialog" aria-modal="true" aria-label="All Duckies found" onClick={() => setParty(false)}>
          <div className="st-duckbig" dangerouslySetInnerHTML={{ __html: duckySVG(true) }} />
          <p className="st-duckbubble">I like Ducks!</p>
          <button type="button" className="st-back" onClick={() => setParty(false)}>Close</button>
        </div>
      )}
    </DuckyCtx.Provider>
  );
}

export function Ducky({ id, x, y, h, show = 1 }) {
  const ctx = useContext(DuckyCtx);
  const isFound = ctx?.found.has(id);
  // x,y = bottom-centre of the visible part (percent of the frame); h = Ducky's full height.
  return (
    <button
      type="button"
      className={`st-ducky ${isFound ? 'found' : ''}`}
      style={{ '--x': `${x}%`, '--bottom': `${100 - y}%`, '--h': `${h}%`, '--show': show }}
      aria-label={isFound ? 'Ducky (found)' : 'Something small is hiding here'}
      onClick={() => ctx?.find(id)}
    >
      <span className="st-duckclip"><span className="st-duckart" dangerouslySetInnerHTML={{ __html: duckySVG(isFound) }} /></span>
    </button>
  );
}

export function WatchSpot({ watch, x, y, sighting }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={`st-watch ${open ? 'open' : ''}`} style={{ '--x': `${x}%`, '--y': `${y}%` }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="st-watchbtn" aria-expanded={open} aria-label={`${watch.name} — ${sighting === 'first' ? 'first seen' : 'last seen'}`}
        onClick={() => { setOpen((o) => !o); trackEvent('watch_open', { watch: watch.id }); }}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
        <span className="st-watchglint" aria-hidden="true" />
      </button>
      {open && (
        <span className="st-watchcard" role="tooltip">
          <b>{watch.name}</b>
          {watch.era && <em>{watch.era}</em>}
          <span>{sighting === 'last' && watch.last ? watch.last : watch.comment}</span>
        </span>
      )}
    </span>
  );
}

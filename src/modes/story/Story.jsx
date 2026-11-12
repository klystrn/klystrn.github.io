import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import '@fontsource-variable/archivo/wdth.css';
import './story.css';
import payload from '../../story/storyboards.json';
import compiled from '../../story/story.json';
import media from '../../story/media.json';
import identity from '../../data/identity.json';
import { renderFrame, fitFrame, zoneOf } from './sketch.js';
import { DuckyProvider, Ducky, WatchSpot } from './eggs.jsx';
import { trackEvent } from '../../lib/analytics';

/*
 * Story mode — the storyboard edition, live at reginaldtan.com.
 * Everything is driven by docs/STORY-SCRIPT.md and docs/story/storyboards/
 * (compiled by scripts/story/build.py):
 *   - each panel's picture is a pencil sketch drawn in code from the
 *     storyboard, standing in for the generated art (the only external piece);
 *   - every caption, balloon, button, frame, easter egg and all scrolling is
 *     code in this folder.
 * Desktop: captions sit on the art at their storyboard positions and may
 * straddle the frame edge. Phone: the same art and overlays, re-placed —
 * speech and thoughts inside the frame, narration and facts on its border,
 * buttons and skills below — and nothing is ever cropped.
 */

const GROUPS = payload.groups;
const CHAPTERS = GROUPS.filter((g) => g.kind === 'chapter').sort((a, b) => Number(a.order) - Number(b.order));
const ARCS = Object.fromEntries(GROUPS.filter((g) => g.kind === 'arc').map((g) => [g.id, g]));
const LETTERS = Object.fromEntries((compiled.arcs || []).filter((a) => a.letter).map((a) => [a.id, a.letter]));
const WATCHES = Object.fromEntries((payload.watches || []).map((w) => [w.id, w]));
const PANEL_CHAPTER = {};
for (const c of CHAPTERS) for (const s of c.scenes) for (const p of s.panels) PANEL_CHAPTER[p.id] = c.id;

const isOpen = (line) => line && line.st !== 'edit' && !line.x.includes('[EDIT');
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const NUM = /^-?\d+(\.\d+)?$/;
const nums = (tok) => tok.slice(1).filter((t) => NUM.test(t)).map(Number);
const PHONE = '(max-width: 760px)';

/* First and last sighting of each watch along the main story, in reading order. */
const WATCH_SPOTS = (() => {
  const seen = {};
  const visit = (node, frames) => frames.forEach((fr, fi) => fr.els.forEach((tok) => {
    if (tok[0] !== 'watch') return;
    const id = tok.find((t, i) => i > 0 && !NUM.test(t));
    if (!WATCHES[id]) return;
    (seen[id] ||= []).push(`${node.id}|${fi}|${nums(tok).join(',')}`);
  }));
  for (const c of CHAPTERS) for (const s of c.scenes) for (const p of s.panels) {
    visit(p, p.board?.variants?.[0]?.frames || []);
    for (const it of p.items || []) visit(it, it.board?.variants?.[0]?.frames || []);
  }
  const out = {};
  for (const [id, list] of Object.entries(seen)) { out[list[0]] = { id, sighting: 'first' }; if (list.length > 1) out[list[list.length - 1]] = { id, sighting: 'last' }; }
  return out;
})();
const DUCKY_TOTAL = CHAPTERS.reduce((n, c) => n + (c.scenes.some((s) => s.panels.some((p) =>
  [p, ...(p.items || [])].some((x) => (x.board?.variants?.[0]?.frames || []).some((f) => f.els.some((t) => t[0] === 'ducky'))))) ? 1 : 0), 0);

function useIsPhone() {
  const get = () => typeof matchMedia === 'function' && matchMedia(PHONE).matches;
  const [phone, setPhone] = useState(get);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const mq = matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return phone;
}

/* ---- sketch plate (placeholder for generated art) ---------------------- */
function Sketch({ frame, panel, id, layer = 'story', cover = false, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const svg = renderFrame(frame, panel, id, layer);
    if (cover) svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    ref.current.replaceChildren(svg);
    fitFrame(svg);
  }, [frame, panel, id, layer, cover]);
  return <div className={`st-sketch${cover ? ' cover' : ''}`} ref={ref} role="img" aria-label={label || 'Storyboard sketch'} />;
}

function useReveal() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reduceMotion() || typeof IntersectionObserver !== 'function') { setSeen(true); return undefined; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -12% 0px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

/* ---- overlays ----------------------------------------------------------- */
function portalFor(panel, n) {
  if (panel.arc) return panel.arc;
  const list = Array.isArray(panel.portal) ? panel.portal : panel.portal ? [panel.portal] : [];
  return list[n - 1] || list[0];
}

function PortalLink({ slug, children, from }) {
  const arc = ARCS[slug];
  if (!arc || arc.status === 'hold') return <span className="st-cap PORTAL off">{children}</span>;
  return (
    <Link className="st-cap PORTAL" to={`/story/arc/${slug}`} state={{ from }} onClick={() => trackEvent('portal_open', { arc: slug })}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}

function Modal({ label, items }) {
  const ref = useRef(null);
  return (
    <>
      <button type="button" className="st-cap MODAL" aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        {label} <span aria-hidden="true">▸</span>
      </button>
      <dialog className="st-dialog" ref={ref} aria-label={label} onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}>
        <h3>{label}</h3>
        <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
        <form method="dialog"><button className="st-back">Close</button></form>
      </dialog>
    </>
  );
}

/* Hand-inked panel border, drawn in code around every picture. */
function InkFrame({ seed }) {
  const d = useMemo(() => {
    let x = 0; for (const c of String(seed)) x = (x * 31 + c.charCodeAt(0)) % 2147483647;
    const r = () => ((x = (x * 16807 + 11) % 2147483647) / 2147483647 - 0.5);
    const pass = (j) => {
      const p = [[0, 0], [100, 0], [100, 100], [0, 100]].map(([px, py]) => [px + r() * j, py + r() * j]);
      const mid = (a, b) => [(a[0] + b[0]) / 2 + r() * j, (a[1] + b[1]) / 2 + r() * j];
      let out = `M${p[0][0]} ${p[0][1]}`;
      for (let i = 0; i < 4; i++) { const a = p[i], b = p[(i + 1) % 4], m = mid(a, b); out += ` Q${m[0]} ${m[1]} ${b[0]} ${b[1]}`; }
      return `${out} Z`;
    };
    return [pass(0.5), pass(0.9)];
  }, [seed]);
  return (
    <svg className="st-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={d[0]} className="a" vectorEffect="non-scaling-stroke" />
      <path d={d[1]} className="b" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function CaptionBody({ type, line, panel, n }) {
  if (type === 'PORTAL') return <PortalLink slug={line.s || portalFor(panel, n)} from={panel.id}>{line.x}</PortalLink>;
  if (type === 'MODAL') return <Modal label={line.s || 'Open list'} items={line.x.split(' · ').map((v) => v.trim()).filter(Boolean)} />;
  if (type === 'SKL') return <ul className="st-cap SKL" aria-label="Skills">{line.x.split(',').map((s) => <li key={s}>{s.trim()}</li>)}</ul>;
  return (
    <p className={`st-cap ${type}`}>
      {line.s && <b className="st-who">{line.s}</b>}
      {line.x}
    </p>
  );
}

function linesOf(panel, type) { return (panel.copy || []).filter((l) => l.t === type); }

/* Watches and Ducky placed on a picture (both are code overlays). */
function Eggs({ frame, owner, fi, chapter }) {
  const out = [];
  frame.els.forEach((tok, i) => {
    const n = nums(tok);
    if (tok[0] === 'watch') {
      const spot = WATCH_SPOTS[`${owner.id}|${fi}|${n.join(',')}`];
      if (spot) out.push(<WatchSpot key={`w${i}`} watch={WATCHES[spot.id]} sighting={spot.sighting} x={n[0]} y={n[1]} />);
    } else if (tok[0] === 'ducky' && chapter) {
      const show = Number((tok.find((t) => t.startsWith('show=')) || 'show=1').slice(5));
      out.push(<Ducky key={`d${i}`} id={chapter} x={n[0]} y={n[1]} h={n[2]} show={show} />);
    }
  });
  return out;
}

/* Keep phone captions that sit inside a frame inside it, without overlapping. */
function useFitInside(ref, active) {
  useLayoutEffect(() => {
    if (!active || !ref.current) return undefined;
    const fit = () => {
      const fig = ref.current; if (!fig) return;
      const W = fig.clientWidth, H = fig.querySelector('.st-sketch')?.clientHeight || fig.clientHeight;
      let floor = 4;
      const boxes = [...fig.querySelectorAll('.st-capbox.in')].sort((a, b) => a.offsetTop - b.offsetTop);
      for (const b of boxes) {
        b.style.transform = '';
        const left = Math.min(Math.max(b.offsetLeft, 4), Math.max(4, W - b.offsetWidth - 4));
        const top = Math.max(b.offsetTop, floor, 4);
        b.style.transform = `translate(${left - b.offsetLeft}px, ${top - b.offsetTop}px)`;
        floor = top + b.offsetHeight + 4;
      }
      void H;
    };
    fit();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    ro?.observe(ref.current);
    return () => ro?.disconnect();
  });
}

function Frame({ frame, panel, id, fi, visual, phone, chapter }) {
  const [aw, ah] = frame.aspect.split(':').map(Number);
  const ref = useRef(null);
  const placed = [];
  for (const tok of frame.els) {
    if (tok[0] !== 'cap') continue;
    const [x, y, w, n = 1] = nums(tok);
    const line = linesOf(panel, tok[1])[n - 1];
    if (!isOpen(line)) continue;
    placed.push({ type: tok[1], x, y, w, n, line, key: `${tok[1]}-${n}` });
  }
  useFitInside(ref, phone);
  const box = (c, i, cls = '', style = {}) => (
    <div key={c.key} className={`st-capbox ${cls}`} style={{ '--i': i, ...style }}>
      <CaptionBody type={c.type} line={c.line} panel={panel} n={c.n} />
    </div>
  );
  if (!phone) {
    return (
      <figure className="st-frame" style={{ '--ar': `${aw} / ${ah}`, flex: `${aw / ah} 1 0` }}>
        <Sketch frame={frame} panel={panel} id={id} label={visual} />
        <InkFrame seed={id} />
        <div className="st-caps">
          {placed.map((c, i) => box(c, i, [c.x <= 6 && 'edge-l', c.x + c.w >= 94 && 'edge-r', c.y <= 8 && 'edge-t'].filter(Boolean).join(' '),
            { '--x': `${c.x}%`, '--y': `${c.y}%`, '--w': `${c.w}%` }))}
          <Eggs frame={frame} owner={panel} fi={fi} chapter={chapter} />
        </div>
        {frame.label && <figcaption className="st-framelabel">{frame.label}</figcaption>}
      </figure>
    );
  }
  const inside = placed.filter((c) => zoneOf(c.type) === 'in');
  const edge = placed.filter((c) => zoneOf(c.type) === 'edge');
  const outside = placed.filter((c) => zoneOf(c.type) === 'out');
  const top = edge.filter((c) => c.y < 50), bottom = edge.filter((c) => c.y >= 50);
  return (
    <figure className="st-frame phone" style={{ '--ar': `${aw} / ${ah}` }}>
      {top.length > 0 && <div className="st-edge top">{top.map((c, i) => box(c, i))}</div>}
      <div className="st-plate" ref={ref}>
        <Sketch frame={frame} panel={panel} id={id} label={visual} />
        <InkFrame seed={id} />
        <div className="st-caps">
          {inside.map((c, i) => box(c, i, 'in', { '--x': `${Math.min(c.x, 96 - Math.max(c.w, 58))}%`, '--y': `${c.y}%`, '--w': `${Math.max(c.w, 58)}%` }))}
          <Eggs frame={frame} owner={panel} fi={fi} chapter={chapter} />
        </div>
      </div>
      {bottom.length > 0 && <div className="st-edge bottom">{bottom.map((c, i) => box(c, i))}</div>}
      {outside.length > 0 && <div className="st-out">{outside.map((c, i) => box(c, i))}</div>}
      {frame.label && <figcaption className="st-framelabel">{frame.label}</figcaption>}
    </figure>
  );
}

function Leftovers({ panel, frames }) {
  const used = new Set(frames.flatMap((f) => f.els.filter((t) => t[0] === 'cap').map((t) => { const n = nums(t); return `${t[1]}-${n[3] || 1}`; })));
  const out = [];
  const count = {};
  for (const l of panel.copy || []) {
    if (['VISUAL', 'ALT', 'NOTE'].includes(l.t)) continue;
    count[l.t] = (count[l.t] || 0) + 1;
    if (used.has(`${l.t}-${count[l.t]}`) || !isOpen(l)) continue;
    out.push(<CaptionBody key={`${l.t}-${count[l.t]}`} type={l.t} line={l} panel={panel} n={count[l.t]} />);
  }
  return out.length ? <div className="st-extras">{out}</div> : null;
}

/* ---- panels ------------------------------------------------------------------ */
function Panel({ panel, chapter }) {
  if (panel.type === 'PANEL_SELECTION' && panel.items?.some((i) => i.board)) return <Selection panel={panel} chapter={chapter} />;
  if (panel.type === 'PANEL_PHOTO') return <PhotoPanel panel={panel} />;
  if (panel.type === 'PANEL_GALLERY') return <Gallery panel={panel} />;
  return <PlainPanel panel={panel} chapter={chapter} />;
}

function PlainPanel({ panel, chapter }) {
  const [ref, seen] = useReveal();
  const phone = useIsPhone();
  const visual = linesOf(panel, 'VISUAL').map((l) => l.x).join(' ');
  const frames = panel.board?.variants?.[0]?.frames || [];
  return (
    <article id={panel.id} ref={ref} className={`st-panel ${panel.type || ''} ${seen ? 'in' : ''} n${frames.length}`}>
      {frames.length ? (
        <div className="st-frames">
          {frames.map((f, i) => <Frame key={i} fi={i} frame={f} panel={panel} id={`${panel.id}-0-${i}`} visual={visual} phone={phone} chapter={chapter} />)}
        </div>
      ) : (
        <p className="st-pending">This part of the story is still being written.</p>
      )}
      <Leftovers panel={panel} frames={frames} />
    </article>
  );
}

function Selection({ panel, chapter }) {
  const [ref, seen] = useReveal();
  const items = panel.items.filter((i) => i.board && isOpen(linesOf(i, 'SUB')[0] || { st: 'draft', x: '' }));
  const [open, setOpen] = useState(null);
  return (
    <article id={panel.id} ref={ref} className={`st-panel st-select ${seen ? 'in' : ''}`} style={{ '--n': items.length }}>
      <div className={`st-cards c${items.length}`} onMouseLeave={() => setOpen(null)}>
        {items.map((it, i) => {
          const frames = it.board.variants[0].frames;
          const crop = frames[0];
          const fullIdx = frames[1] ? 1 : 0;
          const full = frames[fullIdx];
          const [aw, ah] = full.aspect.split(':').map(Number);
          const on = open === it.id;
          const visual = linesOf(it, 'VISUAL').map((l) => l.x).join(' ');
          const sub = linesOf(it, 'SUB').find(isOpen);
          const nar = linesOf(it, 'NAR').find(isOpen);
          const portal = linesOf(it, 'PORTAL').find(isOpen);
          return (
            <section key={it.id} className={`st-card ${on ? 'on' : ''}`} style={{ '--i': i, '--far': `${aw} / ${ah}` }} onMouseEnter={() => setOpen(it.id)}>
              <button className="st-cardbtn" aria-expanded={on} aria-controls={`card-${it.id}`} onClick={() => setOpen(it.id)} onFocus={() => setOpen(it.id)}
                onKeyDown={(e) => { if (e.key === 'Escape') setOpen(null); }}>
                <span className="st-cardart crop"><Sketch frame={crop} panel={it} id={`${it.id}-crop`} cover label={visual} /></span>
                <span className="st-cardart full"><Sketch frame={full} panel={it} id={`${it.id}-full`} label={visual} /></span>
                <span className="st-cardtitle">{it.title}</span>
              </button>
              {on && (
                <span className="st-cardeggs" style={{ '--ar': `${aw} / ${ah}` }}>
                  <Eggs frame={full} owner={it} fi={fullIdx} chapter={chapter} />
                </span>
              )}
              <div className="st-carddetail" id={`card-${it.id}`}>
                {sub && <p className="st-cap SUB">{sub.x}</p>}
                {nar && <p className="st-cap NAR">{nar.x}</p>}
                {Array.isArray(it.skills) && it.skills.length > 0 && (
                  <ul className="st-cap SKL" aria-label="Skills">{it.skills.map((k) => <li key={k}>{k}</li>)}</ul>
                )}
                {portal && it.arc && <PortalLink slug={it.arc} from={panel.id}>{portal.x}</PortalLink>}
              </div>
            </section>
          );
        })}
      </div>
      <Leftovers panel={panel} frames={[]} />
    </article>
  );
}

/* Photo Scene: your photo, converted to the comic style. Clicking ripples
   between the comic version and the original photo. */
function PhotoPanel({ panel }) {
  const photo = media.photos?.[panel.photo];
  const [showOriginal, setShowOriginal] = useState(false);
  const [ripple, setRipple] = useState(null);
  const visual = linesOf(panel, 'VISUAL').map((l) => l.x).join(' ') || 'Photo';
  if (!photo) return <article id={panel.id} className="st-panel"><p className="st-pending">A photo scene goes here once its photo is added.</p><Leftovers panel={panel} frames={[]} /></article>;
  const flip = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ? e.clientX - r.left : r.width / 2, y = e.clientY ? e.clientY - r.top : r.height / 2;
    if (reduceMotion()) { setShowOriginal((v) => !v); return; }
    setRipple({ x, y, to: !showOriginal, key: Date.now() });
    trackEvent('photo_ripple', { panel: panel.id });
  };
  const comicSrc = photo.comic?.src || photo.original.src;
  return (
    <article id={panel.id} className="st-panel st-photo">
      <figure className="st-frame" style={{ '--ar': `${photo.original.w} / ${photo.original.h}` }}>
        <button type="button" className="st-photobtn" onClick={flip}
          aria-label={showOriginal ? 'Showing the original photo — show the comic version' : 'Showing the comic version — show the original photo'}>
          <img className={`st-photoimg ${photo.comic ? '' : 'standin'}`} src={showOriginal ? photo.original.src : comicSrc} alt={visual}
            width={photo.original.w} height={photo.original.h} loading="lazy" />
          {ripple && (
            <img key={ripple.key} className={`st-photoimg st-ripple ${!ripple.to && !photo.comic ? 'standin' : ''}`} src={ripple.to ? photo.original.src : comicSrc} alt=""
              style={{ '--rx': `${ripple.x}px`, '--ry': `${ripple.y}px` }}
              onAnimationEnd={() => { setShowOriginal(ripple.to); setRipple(null); }} />
          )}
          <span className="st-phototag">{showOriginal ? 'Original photo' : 'Tap to see the original'}</span>
        </button>
        <InkFrame seed={panel.id} />
      </figure>
      <Leftovers panel={panel} frames={[]} />
    </article>
  );
}

/* Gallery: your own photos, unedited, with captions. */
function Gallery({ panel }) {
  const photos = media.gallery?.[panel.gallery] || [];
  const dlg = useRef(null);
  const [cur, setCur] = useState(null);
  return (
    <article id={panel.id} className="st-panel st-gallery">
      <Leftovers panel={panel} frames={[]} />
      {photos.length === 0 ? <p className="st-pending">Photos are on their way.</p> : (
        <ul className="st-grid">
          {photos.map((ph) => (
            <li key={ph.id}>
              <button type="button" onClick={() => { setCur(ph); dlg.current?.showModal(); }}>
                <img src={ph.src} alt={ph.caption || 'Photo'} width={ph.w} height={ph.h} loading="lazy" />
              </button>
              {ph.caption && <p>{ph.caption}</p>}
            </li>
          ))}
        </ul>
      )}
      <dialog ref={dlg} className="st-lightbox" onClick={(e) => { if (e.target === dlg.current) dlg.current.close(); }}>
        {cur && <figure><img src={cur.src} alt={cur.caption || 'Photo'} /><figcaption>{cur.caption}</figcaption></figure>}
        <form method="dialog"><button className="st-back">Close</button></form>
      </dialog>
    </article>
  );
}

/* ---- hero -------------------------------------------------------------------- */
function Hero({ chapter }) {
  const panel = chapter.scenes[0].panels[0];
  const variants = panel.board?.variants || [];
  const desk = variants[0]?.frames[0];
  const phoneFrame = (variants.find((v) => /mobile/i.test(v.label)) || variants[0])?.frames[0];
  const ref = useRef(null);
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      setDocked(scrollY > Math.min(140, innerHeight * 0.15));
      const el = ref.current;
      if (!el || reduceMotion()) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--p', Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1).toFixed(4));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  const [first, ...rest] = chapter.title.split(' ');
  return (
    <header className="st-hero" id={`ch-${chapter.id}`} ref={ref} data-chapter={chapter.id}>
      <nav className={`st-nav ${docked ? 'docked' : ''}`} aria-label="Portfolio modes">
        <Link to="/paper"><span>CV</span></Link>
        <Link to="/tech"><span>Tech</span></Link>
        <Link to="/finance"><span>Finance</span></Link>
        <Link to="/life"><span>Life</span></Link>
      </nav>
      <div className="st-heropin">
        <div className="st-herofig desk">{desk && <Sketch frame={desk} panel={panel} id="hero-d" layer="art" cover label="Red silhouette of Reginald Tan, arms folded" />}</div>
        <div className="st-herofig phone">{phoneFrame && <Sketch frame={phoneFrame} panel={panel} id="hero-m" layer="art" cover label="Red silhouette of Reginald Tan, arms folded" />}</div>
        <h1 className="st-name">
          <span className="st-latin"><span>{first}</span> <span>{rest.join(' ')}</span></span>
          <span className="st-cjk" lang="zh-Hans">陈彦杰</span>
        </h1>
        <p className="st-cue">Scroll to begin</p>
      </div>
    </header>
  );
}

/* ---- chapter, rail, arc, footer ----------------------------------------------------- */
function Chapter({ chapter, index }) {
  const meta = [chapter.years, chapter.category].filter((v) => v && v !== 'none');
  return (
    <section className="st-chapter" data-chapter={chapter.id} aria-labelledby={`h-${chapter.id}`}>
      {chapter.scenes[0]?.panels[0]?.type === 'TITLE_HERO' ? <Hero chapter={chapter} /> : (
        <header className="st-title" id={`ch-${chapter.id}`}>
          <span className="st-no">Chapter {String(index + 1).padStart(2, '0')}</span>
          <h2 id={`h-${chapter.id}`}>{chapter.title}</h2>
          {meta.length > 0 && <p>{meta.join(' · ')}</p>}
        </header>
      )}
      {chapter.scenes.flatMap((s) => s.panels)
        .filter((p) => p.type !== 'TITLE_HERO')
        .map((p) => <Panel key={p.id} panel={p} chapter={chapter.id} />)}
    </section>
  );
}

function Rail({ active }) {
  return (
    <nav className="st-rail" aria-label="Chapters">
      {CHAPTERS.map((c, i) => (
        <Link key={c.id} to={`/story/chapter/${c.id}`} className={active === c.id ? 'on' : ''} aria-current={active === c.id ? 'true' : undefined}>
          <span className="st-raillbl"><b>{String(i + 1).padStart(2, '0')}</b> {c.title}</span>
        </Link>
      ))}
    </nav>
  );
}

function Arc({ slug }) {
  const arc = ARCS[slug];
  const location = useLocation();
  useEffect(() => { scrollTo(0, 0); }, [slug]);
  if (!arc) return <div className="st-arc"><header className="st-title"><h2>Side story not found</h2><p><Link to="/">Back to the story</Link></p></header></div>;
  const parent = arc.parent;
  const back = `/story/chapter/${PANEL_CHAPTER[parent] || 'opening'}#${parent}`;
  const letter = LETTERS[slug];
  const BackLink = () => <Link className="st-back" to={back} state={{ from: location.pathname }}>← Return to the story</Link>;
  return (
    <div className="st-arc">
      <header className="st-title arc">
        <span className="st-no">Side story</span>
        <h2>{arc.title}</h2>
        <BackLink />
      </header>
      {arc.scenes.flatMap((s) => s.panels).map((p) => <Panel key={p.id} panel={p} />)}
      {letter && (
        <section className="st-letter" aria-label={`Letter from ${letter.name}`}>
          <div className="st-paper">
            <p className="st-lettermeta"><b>{letter.name}</b><br />{letter.title}</p>
            {letter.text
              ? letter.text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)
              : <p className="st-pending">The full letter appears here once the transcription is approved.</p>}
          </div>
        </section>
      )}
      <footer className="st-arcfoot"><BackLink /></footer>
    </div>
  );
}

function EndFooter() {
  const c = identity.contact;
  const [copied, setCopied] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(c.email); setCopied('Copied'); trackEvent('contact_click', { via: 'story_copy_email' }); }
    catch { setCopied('Select and copy the address'); }
    setTimeout(() => setCopied(''), 2200);
  };
  return (
    <footer className="st-end">
      <p className="st-endtitle">Thank you for reading.</p>
      <div className="st-contact">
        <span className="st-email"><span>{c.email}</span>
          <button type="button" onClick={copy}>{copied || 'Copy email'}</button>
        </span>
        <a href={c.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={c.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a className="cv" href={c.cvUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('resume_download', { via: 'story' })}>CV (PDF)</a>
      </div>
      <p className="st-try">Try the same career as a terminal and as a room you can explore:
        {' '}<Link to="/tech">Tech mode</Link> · <Link to="/life">Life mode</Link>
        <span className="st-tryalt"> · or the classic <Link to="/paper">Paper portfolio</Link></span>
      </p>
    </footer>
  );
}

export default function Story() {
  const { chapter, arc } = useParams();
  const location = useLocation();
  const [active, setActive] = useState(CHAPTERS[0].id);

  useEffect(() => {
    if (arc) return undefined;
    const target = location.hash ? decodeURIComponent(location.hash.slice(1)) : chapter ? `ch-${chapter}` : null;
    if (!target) return undefined;
    const t = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'auto', block: location.hash ? 'center' : 'start' });
    }, 80);
    return () => clearTimeout(t);
  }, [chapter, arc, location.hash, location.key]);

  useEffect(() => {
    if (arc || typeof IntersectionObserver !== 'function') return undefined;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { setActive(e.target.dataset.chapter); trackEvent('chapter_enter', { chapter: e.target.dataset.chapter }); }
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.st-chapter').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [arc]);

  const body = useMemo(() => CHAPTERS.map((c, i) => <Chapter key={c.id} chapter={c} index={i} />), []);

  // Old Paper deep links (/?project=… and /?xp=…) now live under /paper.
  const qs = new URLSearchParams(location.search);
  if (location.pathname === '/' && (qs.has('project') || qs.has('xp'))) return <Navigate to={`/paper${location.search}`} replace />;

  return (
    <DuckyProvider total={DUCKY_TOTAL}>
      <div className="story">
        {arc ? <Arc slug={arc} /> : (
          <>
            {body}
            <EndFooter />
            <Rail active={active} />
          </>
        )}
        <p className="st-preview" role="note">Storyboard edition · sketches stand in for the final art</p>
      </div>
    </DuckyProvider>
  );
}

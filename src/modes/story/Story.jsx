import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import '@fontsource-variable/archivo/wdth.css';
import './story.css';
import payload from '../../story/storyboards.json';
import compiled from '../../story/story.json';
import media from '../../story/media.json';
import identity from '../../data/identity.json';
import { renderFrame, fitFrame, zoneOf, duckySVG } from './sketch.js';
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

const tidy = (s) => String(s || '').replace(/\s+·\s+/g, ', ').replace(/\s*—\s*/g, ', ');
const isOpen = (line) => line && line.st !== 'edit' && !line.x.includes('[EDIT');
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const NUM = /^-?\d+(\.\d+)?$/;
const nums = (tok) => tok.slice(1).filter((t) => NUM.test(t)).map(Number);
const PHONE = '(max-width: 760px)';
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const RETURN_KEY = 'story-return-v1';

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

/*
 * Scroll-linked motion, reversible: every frame/card slides in from the left
 * as you scroll down and slides back out to the left as you scroll up (--e,
 * 0 → 1); art and captions drift at different speeds for parallax (--par).
 * Captions fade in once a panel is mostly on screen and out again when you
 * scroll back above it (class .in, with hysteresis so it doesn't flicker).
 */
function useScrollFx(dep) {
  useLayoutEffect(() => {
    const panels = () => document.querySelectorAll('.story .st-panel');
    if (reduceMotion()) { panels().forEach((p) => p.classList.add('in')); return undefined; }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = innerHeight;
      for (const p of panels()) {
        const r = p.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) { if (r.top > vh) p.classList.remove('in'); continue; }
        const e = clamp((vh - r.top) / (vh * 0.5));
        if (e > 0.5) p.classList.add('in'); else if (e < 0.2) p.classList.remove('in');
        p.style.setProperty('--par', clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1).toFixed(3));
        const lock = p.querySelector('.st-lock');
        if (lock) {
          const lr = lock.getBoundingClientRect();
          const q = lr.top > 0 ? -lr.top / vh : clamp(-lr.top / Math.max(lr.height - vh, 1));
          lock.style.setProperty('--q', q.toFixed(3));
          lock.querySelectorAll('.st-card').forEach((c, i) => c.style.setProperty('--e', clamp((q + 0.25 - i * 0.22) / 0.2).toFixed(3)));
          continue;
        }
        p.querySelectorAll('.st-frame, .st-card').forEach((f, k) => {
          const fr = f.getBoundingClientRect();
          f.style.setProperty('--e', clamp((vh - fr.top) / (vh * 0.42) - (k % 4) * 0.1).toFixed(3));
        });
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [dep]);
}

/* ---- overlays ----------------------------------------------------------- */
function portalFor(panel, n) {
  if (panel.arc) return panel.arc;
  const list = Array.isArray(panel.portal) ? panel.portal : panel.portal ? [panel.portal] : [];
  return list[n - 1] || list[0];
}

function PortalLink({ slug, children, from }) {
  const arc = ARCS[slug];
  const location = useLocation();
  if (!arc || arc.status === 'hold') return <span className="st-cap PORTAL off">{children}</span>;
  const remember = () => {
    // Back from the side story returns to this exact spot (panel + scroll position).
    try { sessionStorage.setItem(RETURN_KEY, JSON.stringify({ arc: slug, path: location.pathname, panel: from, y: Math.round(scrollY) })); } catch { /* private mode */ }
    trackEvent('portal_open', { arc: slug });
  };
  return (
    <Link className="st-cap PORTAL" to={`/story/arc/${slug}`} state={{ from }} onClick={remember}>
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
  if (type === 'MODAL') return <Modal label={line.s || 'Open list'} items={line.x.split(/\s+[|·]\s+/).map((v) => v.trim()).filter(Boolean)} />;
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

/*
 * Subjects: the faces of the main (non-faint) figures and any on-screen
 * content (boards, big numbers). Captions must never cover them. Positions
 * are in % of the frame, derived from the storyboard so they follow the art.
 */
const HEAD = { sit: 0.84, type: 0.84, bench: 0.83, slump: 0.68, seated: 0.84 };
function subjectsOf(frame) {
  const [aw, ah] = frame.aspect.split(':').map(Number);
  const k = ah / aw;  // % of height → % of width
  const out = [];
  for (const tok of frame.els) {
    const n = nums(tok);
    if (tok[0] === 'fig' && !tok.includes('faint')) {
      const [x, y, h] = n;
      if (tok.includes('bust') || tok.includes('silhouette')) continue;
      const pose = tok.find((t) => HEAD[t]);
      const cy = y - h * (HEAD[pose] || 0.94), ry = h * 0.1, rx = Math.max(ry * k * 1.2, 2.5);
      out.push({ kind: 'face', x: x - rx, y: cy - ry, w: rx * 2, h: ry * 2.2 });
    } else if (tok[0] === 'board') {
      out.push({ kind: 'board', x: n[0], y: n[1], w: n[2], h: n[3] });
    }
  }
  return out;
}

/* Move captions the least distance needed so none covers a subject or another caption. */
function avoid(root, boxes, pad = 4, stackDown = false) {
  if (!root) return;
  const R = root.getBoundingClientRect();
  if (!R.width) return;
  const solids = [...root.querySelectorAll(':scope > .st-caps > .st-subject')].map((s) => s.getBoundingClientRect());
  const placed = [];
  const hit = (a) => [...solids, ...placed].some((b) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad);
  const slack = 0.035 * R.width;
  const inside = (a) => a.left >= R.left - slack && a.right <= R.right + slack && a.top >= R.top - slack && a.bottom <= R.bottom + slack;
  for (const b of boxes) {
    b.style.translate = '';
    const r0 = b.getBoundingClientRect();
    const at = (dx, dy) => ({ left: r0.left + dx, right: r0.right + dx, top: r0.top + dy, bottom: r0.bottom + dy });
    let best = [0, 0];
    if (hit(at(0, 0)) || (stackDown && !inside(at(0, 0)))) {
      best = null;
      const step = Math.max(6, R.height / 60);
      search: for (let d = 1; d <= 40; d++) {
        const s = d * step;
        const cands = stackDown ? [[0, s], [0, -s], [-s, 0], [s, 0]] : [[0, -s], [0, s], [-s, 0], [s, 0], [-s, -s], [s, -s], [-s, s], [s, s]];
        for (const [dx, dy] of cands) { const a = at(dx, dy); if (inside(a) && !hit(a)) { best = [dx, dy]; break search; } }
      }
      best ||= [0, 0];
    }
    if (best[0] || best[1]) b.style.translate = `${best[0]}px ${best[1]}px`;
    placed.push(at(...best));
  }
}

function useAvoid(ref, deps) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const run = () => avoid(root, [...root.querySelectorAll(':scope > .st-caps > .st-capbox')]);
    run();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(run) : null;
    ro?.observe(root);
    document.fonts?.ready?.then(run);
    return () => ro?.disconnect();
  }, deps);  // eslint-disable-line react-hooks/exhaustive-deps
}

function Subjects({ frame }) {
  return subjectsOf(frame).map((s, i) => (
    <i key={i} className={`st-subject ${s.kind}`} aria-hidden="true" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }} />
  ));
}

/* Viewfinder: the scene pans gently behind a fixed viewfinder, following the cursor. */
function useViewfinder(on) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!on || !el || reduceMotion()) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1).toFixed(3));
      el.style.setProperty('--my', clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1).toFixed(3));
    };
    const reset = () => { el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); };
  }, [on]);
  return ref;
}

function Frame({ frame, panel, id, fi, visual, phone, chapter }) {
  const [aw, ah] = frame.aspect.split(':').map(Number);
  const ref = useRef(null);
  const vf = panel.interaction === 'viewfinder';
  const vfRef = useViewfinder(vf);
  const page = panel.size === 'page';
  const placed = [];
  for (const tok of frame.els) {
    if (tok[0] !== 'cap') continue;
    const [x, y, w, n = 1] = nums(tok);
    const line = linesOf(panel, tok[1])[n - 1];
    if (!isOpen(line)) continue;
    placed.push({ type: tok[1], x, y, w, n, line, key: `${tok[1]}-${n}` });
  }
  const deskRef = useRef(null);
  useAvoid(phone ? ref : deskRef, [phone, frame]);
  const plate = (
    vf ? (
      <div className="st-vf" ref={vfRef}>
        <div className="st-vfart"><Sketch frame={frame} panel={panel} id={id} layer="art" label={visual} /></div>
        <div className="st-vffx"><Sketch frame={frame} panel={panel} id={`${id}-fx`} layer="fx" label="" /></div>
      </div>
    ) : <Sketch frame={frame} panel={panel} id={id} label={visual} />
  );
  const box = (c, i, cls = '', style = {}) => (
    <div key={c.key} className={`st-capbox ${cls}`} style={{ '--i': i, ...style }}>
      <CaptionBody type={c.type} line={c.line} panel={panel} n={c.n} />
    </div>
  );
  if (!phone) {
    return (
      <figure className="st-frame" ref={deskRef} style={{ '--ar': `${aw} / ${ah}`, flex: `${aw / ah} 1 0`, ...(page ? { maxWidth: `calc(92svh * ${(aw / ah).toFixed(4)})` } : {}) }}>
        {plate}
        <InkFrame seed={id} />
        <div className="st-caps">
          <Subjects frame={frame} />
          {placed.map((c, i) => box(c, i, [c.x <= 6 && 'edge-l', c.x + c.w >= 94 && 'edge-r', c.y <= 8 && 'edge-t'].filter(Boolean).join(' '),
            { '--x': `${c.x}%`, '--y': `${c.y}%`, '--w': `${c.w}%` }))}
          <Eggs frame={frame} owner={panel} fi={fi} chapter={chapter} />
        </div>
        {frame.label && <figcaption className="st-framelabel">{tidy(frame.label)}</figcaption>}
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
        {plate}
        <InkFrame seed={id} />
        <div className="st-caps">
          <Subjects frame={frame} />
          {inside.map((c, i) => box(c, i, 'in', { '--x': `${Math.min(c.x, 96 - Math.max(c.w, 58))}%`, '--y': `${c.y}%`, '--w': `${Math.max(c.w, 58)}%` }))}
          <Eggs frame={frame} owner={panel} fi={fi} chapter={chapter} />
        </div>
      </div>
      {bottom.length > 0 && <div className="st-edge bottom">{bottom.map((c, i) => box(c, i))}</div>}
      {outside.length > 0 && <div className="st-out">{outside.map((c, i) => box(c, i))}</div>}
      {frame.label && <figcaption className="st-framelabel">{tidy(frame.label)}</figcaption>}
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
  const phone = useIsPhone();
  const visual = linesOf(panel, 'VISUAL').map((l) => l.x).join(' ');
  const frames = panel.board?.variants?.[0]?.frames || [];
  const cls = ['st-panel', panel.type || '', `n${frames.length}`, panel.size === 'page' && 'page', panel.layout, panel.interaction].filter(Boolean).join(' ');
  return (
    <article id={panel.id} className={cls}>
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
  const phone = useIsPhone();
  const items = panel.items.filter((i) => i.board && isOpen(linesOf(i, 'SUB')[0] || { st: 'draft', x: '' }));
  const [open, setOpen] = useState(null);
  const locked = !phone && items.length === 3;  // Present Day: the page pauses on the three panels
  const cards = (
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
              <div className="st-carddetail" id={`card-${it.id}`} aria-hidden={!on}>
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
  );
  return (
    <article id={panel.id} className={`st-panel st-select${locked ? ' locked' : ''}`} style={{ '--n': items.length }}>
      {locked ? <div className="st-lock"><div className="st-stage">{cards}</div></div> : cards}
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

/* ---- hero ------------------------------------------------------------------- */
/*
 * Scroll 1: push in from the upper body to the face (--z). Scroll 2: the
 * picture splits along three diagonal cuts that slide apart (--c), the
 * three-cut transition into Present Day. Both reverse when you scroll up.
 * On a mouse, the cursor becomes a spotlight that recolours the name under it.
 */
// cut lines in % of the picture: (49,0)→(41,100) and (58,0)→(50,100), so both cross the face in the close-up
const CUTS = [[49, 41], [58, 50]];
const SHARDS = [`polygon(0 0, ${CUTS[0][0]}% 0, ${CUTS[0][1]}% 100%, 0 100%)`, `polygon(${CUTS[0][0]}% 0, ${CUTS[1][0]}% 0, ${CUTS[1][1]}% 100%, ${CUTS[0][1]}% 100%)`, `polygon(${CUTS[1][0]}% 0, 100% 0, 100% 100%, ${CUTS[1][1]}% 100%)`];
function Hero({ chapter }) {
  const panel = chapter.scenes[0].panels[0];
  const cut = chapter.scenes.flatMap((s) => s.panels).find((p) => p.type === 'PANEL_TRANSITION');
  const cutLine = cut && linesOf(cut, 'NAR').find(isOpen);
  const variants = panel.board?.variants || [];
  const desk = variants[0]?.frames[0];
  const phoneFrame = (variants.find((v) => /mobile/i.test(v.label)) || variants[0])?.frames[0];
  const ref = useRef(null);
  const pin = useRef(null);
  const name = useRef(null);
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      setDocked(scrollY > Math.min(140, innerHeight * 0.15));
      const el = ref.current;
      if (!el || reduceMotion()) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(r.height - innerHeight, 1));
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--z', clamp(p / 0.5).toFixed(4));
      el.style.setProperty('--c', clamp((p - 0.56) / 0.36).toFixed(4));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    const el = pin.current;
    if (!el || typeof matchMedia !== 'function' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${e.clientX - r.left}px`);
      el.style.setProperty('--sy', `${e.clientY - r.top}px`);
      const n = name.current?.getBoundingClientRect();
      if (n) { name.current.style.setProperty('--lx', `${e.clientX - n.left}px`); name.current.style.setProperty('--ly', `${e.clientY - n.top}px`); }
      el.classList.add('lit');
    };
    const out = () => el.classList.remove('lit');
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', out);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', out); };
  }, []);
  const [first, ...rest] = chapter.title.split(' ');
  const fig = (frame, key) => (
    <>
      {SHARDS.map((clip, i) => (
        <div key={i} className={`st-shard s${i}`} style={{ clipPath: clip }}>
          <Sketch frame={frame} panel={panel} id={`${key}-${i}`} layer="art" cover label={i ? '' : 'Red silhouette of Reginald Tan, arms folded'} />
        </div>
      ))}
      <svg className="st-cuts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {CUTS.map(([a, b]) => <line key={a} x1={a} y1="0" x2={b} y2="100" />)}
      </svg>
    </>
  );
  const nameText = (
    <>
      <span className="st-latin"><span>{first}</span> <span>{rest.join(' ')}</span></span>
      <span className="st-cjk" lang="zh-Hans">陈彦杰</span>
    </>
  );
  return (
    <header className="st-hero" id={`ch-${chapter.id}`} ref={ref} data-chapter={chapter.id}>
      <nav className={`st-nav ${docked ? 'docked' : ''}`} aria-label="Portfolio modes">
        <Link to="/paper"><span>CV</span></Link>
        <Link to="/tech"><span>Tech</span></Link>
        <Link to="/finance"><span>Finance</span></Link>
        <Link to="/life"><span>Life</span></Link>
      </nav>
      <div className="st-heropin" ref={pin}>
        <div className="st-herofig desk">{desk && fig(desk, 'hero-d')}</div>
        <div className="st-herofig phone">{phoneFrame && fig(phoneFrame, 'hero-m')}</div>
        <h1 className="st-name" ref={name}>
          {nameText}
          <span className="st-lit" aria-hidden="true">{nameText}</span>
        </h1>
        <p className="st-cue">Scroll to begin</p>
        {cutLine && <p className="st-cap NAR st-cutline">{cutLine.x}</p>}
        <span className="st-spot" aria-hidden="true" />
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
          {meta.length > 0 && <p className="st-meta">{meta.map((m) => <span key={m}>{m}</span>)}</p>}
        </header>
      )}
      {chapter.scenes.flatMap((s) => s.panels)
        .filter((p) => p.type !== 'TITLE_HERO' && !(index === 0 && p.type === 'PANEL_TRANSITION'))
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
  let ret = null;
  try { ret = JSON.parse(sessionStorage.getItem(RETURN_KEY) || 'null'); } catch { /* ignore */ }
  if (ret && ret.arc !== slug) ret = null;
  const back = ret ? `${ret.path}#${ret.panel}` : `/story/chapter/${PANEL_CHAPTER[parent] || 'opening'}#${parent}`;
  const letter = LETTERS[slug];
  const BackLink = () => <Link className="st-back" to={back} state={{ from: location.pathname, y: ret?.y }}>← Return to the story</Link>;
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
    try { await navigator.clipboard.writeText(c.email); setCopied('Email copied'); trackEvent('contact_click', { via: 'story_copy_email' }); }
    catch { setCopied('Select the address to copy it'); }
    setTimeout(() => setCopied(''), 2200);
  };
  return (
    <footer className="st-end">
      <p className="st-endtitle">Thank you for reading.</p>
      <div className="st-contact">
        <span className="st-email"><span>{c.email}</span>
          <button type="button" className="st-copy" onClick={copy} aria-label={copied || 'Copy email address'} title={copied || 'Copy email address'}>
            {copied === 'Email copied' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="1.5" /><path d="M15.5 8.5V5.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" /></svg>
            )}
          </button>
        </span>
        <a href={c.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={c.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a className="cv" href={c.cvUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('resume_download', { via: 'story' })}>CV (PDF)</a>
      </div>
      <p className="st-sr" role="status">{copied}</p>
      <p className="st-try">Try the same career as a terminal and as a room you can explore:
        {' '}<Link to="/tech">Tech mode</Link> or <Link to="/life">Life mode</Link>.
        <span className="st-tryalt"> Or the classic <Link to="/paper">Paper portfolio</Link>.</span>
      </p>
      <p className="st-preview" role="note">Storyboard edition: sketches stand in for the final art</p>
      <span className="st-endducky" aria-hidden="true" dangerouslySetInnerHTML={{ __html: duckySVG(true) }} />
    </footer>
  );
}

export default function Story() {
  const { chapter, arc } = useParams();
  const location = useLocation();
  const [active, setActive] = useState(CHAPTERS[0].id);

  useEffect(() => {
    if (arc) return undefined;
    const y = location.state?.y;
    const target = location.hash ? decodeURIComponent(location.hash.slice(1)) : chapter ? `ch-${chapter}` : null;
    if (!target && typeof y !== 'number') return undefined;
    const go = () => {
      if (typeof y === 'number') scrollTo({ top: y, behavior: 'instant' });
      else document.getElementById(target)?.scrollIntoView({ behavior: 'instant', block: location.hash ? 'center' : 'start' });
    };
    // run again once fonts and lazy layout settle, so the spot doesn't drift
    const ts = [80, 400].map((ms) => setTimeout(go, ms));
    return () => ts.forEach(clearTimeout);
  }, [chapter, arc, location.hash, location.key]);  // eslint-disable-line react-hooks/exhaustive-deps

  useScrollFx(arc || 'main');

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
      </div>
    </DuckyProvider>
  );
}

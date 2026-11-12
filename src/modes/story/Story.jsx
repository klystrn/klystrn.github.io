import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import '@fontsource-variable/archivo/wdth.css';
import './story.css';
import payload from '../../story/storyboards.json';
import compiled from '../../story/story.json';
import { renderFrame, fitFrame } from './sketch.js';
import { trackEvent } from '../../lib/analytics';

/*
 * Story mode — PREVIEW. Everything here is driven by docs/STORY-SCRIPT.md and
 * docs/story/storyboards/ (compiled by scripts/story/build.py):
 *   - the "plate" of each panel is a pencil sketch drawn in code from the
 *     storyboard — a stand-in for final art, the only thing an external
 *     image/video tool will ever supply;
 *   - every caption, balloon, fact box, portal, card, title and all scroll
 *     behaviour is plain HTML/CSS/JS in this file.
 * Desktop: captions are placed over the panel at their storyboard positions
 * and may sit on the frame edge like a comic. Phone: frames are shown whole
 * (never cropped) and captions stack underneath, so no content is cut.
 */

const GROUPS = payload.groups;
const CHAPTERS = GROUPS.filter((g) => g.kind === 'chapter').sort((a, b) => Number(a.order) - Number(b.order));
const ARCS = Object.fromEntries(GROUPS.filter((g) => g.kind === 'arc').map((g) => [g.id, g]));
const LETTERS = Object.fromEntries((compiled.arcs || []).filter((a) => a.letter).map((a) => [a.id, a.letter]));
const PANEL_CHAPTER = {};
for (const c of CHAPTERS) for (const s of c.scenes) for (const p of s.panels) PANEL_CHAPTER[p.id] = c.id;

const isOpen = (line) => line && line.st !== 'edit' && !line.x.includes('[EDIT');
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const NUM = /^-?\d+(\.\d+)?$/;

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

/* ---- reveal on scroll --------------------------------------------------- */
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

/* ---- captions ----------------------------------------------------------- */
function portalFor(panel, n) {
  if (panel.arc) return panel.arc;                      // selection item
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

/* Hand-inked panel border, drawn in code around every plate (plates are
   generated full-bleed with no border of their own). */
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

function Frame({ frame, panel, id, used, visual }) {
  const [aw, ah] = frame.aspect.split(':').map(Number);
  const caps = [];
  for (const tok of frame.els) {
    if (tok[0] !== 'cap') continue;
    const nums = tok.slice(2).filter((t) => NUM.test(t)).map(Number);
    const [x, y, w, n = 1] = nums;
    const line = linesOf(panel, tok[1])[n - 1];
    if (!isOpen(line)) continue;
    const edge = [x <= 6 && 'edge-l', x + w >= 94 && 'edge-r', y <= 8 && 'edge-t'].filter(Boolean).join(' ');
    caps.push(
      <div key={`${tok[1]}-${n}`} className={`st-capbox ${edge}`} style={{ '--x': `${x}%`, '--y': `${y}%`, '--w': `${w}%`, '--i': caps.length }}>
        <CaptionBody type={tok[1]} line={line} panel={panel} n={n} />
      </div>
    );
  }
  return (
    <figure className="st-frame" style={{ '--ar': `${aw} / ${ah}`, flex: `${aw / ah} 1 0` }}>
      <Sketch frame={frame} panel={panel} id={id} label={visual} />
      <InkFrame seed={id} />
      <div className="st-caps">{caps}</div>
      {frame.label && <figcaption className="st-framelabel">{frame.label}</figcaption>}
    </figure>
  );
}

/* ---- panels --------------------------------------------------------------- */
function Leftovers({ panel, used }) {
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

function Panel({ panel }) {
  if (panel.type === 'PANEL_SELECTION' && panel.items?.some((i) => i.board)) return <Selection panel={panel} />;
  return <PlainPanel panel={panel} />;
}

function PlainPanel({ panel }) {
  const [ref, seen] = useReveal();
  const visual = linesOf(panel, 'VISUAL').map((l) => l.x).join(' ');
  const frames = panel.board?.variants?.[0]?.frames || [];
  // Lines already placed on a frame by the storyboard; the rest go under the panel.
  const used = new Set(frames.flatMap((f) => f.els.filter((t) => t[0] === 'cap').map((t) => {
    const nums = t.slice(2).filter((v) => NUM.test(v));
    return `${t[1]}-${nums[3] ? Number(nums[3]) : 1}`;
  })));
  return (
    <article id={panel.id} ref={ref} className={`st-panel ${panel.type || ''} ${seen ? 'in' : ''} n${frames.length}`}>
      {frames.length ? (
        <div className="st-frames">
          {frames.map((f, i) => <Frame key={i} frame={f} panel={panel} id={`${panel.id}-0-${i}`} used={used} visual={visual} />)}
        </div>
      ) : (
        <p className="st-pending">This part of the story is still being written.</p>
      )}
      <Leftovers panel={panel} used={used} />
    </article>
  );
}

function Selection({ panel }) {
  const [ref, seen] = useReveal();
  const items = panel.items.filter((i) => i.board && isOpen(linesOf(i, 'SUB')[0] || { st: 'draft', x: '' }));
  const [open, setOpen] = useState(null);
  const used = new Set();
  return (
    <article id={panel.id} ref={ref} className={`st-panel st-select ${seen ? 'in' : ''}`} style={{ '--n': items.length }}>
      <div className={`st-cards c${items.length}`} onMouseLeave={() => setOpen(null)}>
        {items.map((it, i) => {
          const frames = it.board.variants[0].frames;
          const crop = frames[0];
          const full = frames[1] || frames[0];
          const on = open === it.id;
          const visual = linesOf(it, 'VISUAL').map((l) => l.x).join(' ');
          const sub = linesOf(it, 'SUB').find(isOpen);
          const nar = linesOf(it, 'NAR').find(isOpen);
          const portal = linesOf(it, 'PORTAL').find(isOpen);
          return (
            <section key={it.id} className={`st-card ${on ? 'on' : ''}`} style={{ '--i': i }} onMouseEnter={() => setOpen(it.id)}>
              <button className="st-cardbtn" aria-expanded={on} aria-controls={`card-${it.id}`} onClick={() => setOpen(it.id)} onFocus={() => setOpen(it.id)}
                onKeyDown={(e) => { if (e.key === 'Escape') setOpen(null); }}>
                <span className="st-cardart crop"><Sketch frame={crop} panel={it} id={`${it.id}-crop`} cover label={visual} /></span>
                <span className="st-cardart full"><Sketch frame={full} panel={it} id={`${it.id}-full`} label={visual} /></span>
                <span className="st-cardtitle">{it.title}</span>
              </button>
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
      <Leftovers panel={panel} used={used} />
    </article>
  );
}

/* ---- hero ------------------------------------------------------------------ */
function Hero({ chapter }) {
  const panel = chapter.scenes[0].panels[0];
  const variants = panel.board?.variants || [];
  const desk = variants[0]?.frames[0];
  const phone = (variants.find((v) => /mobile/i.test(v.label)) || variants[0])?.frames[0];
  const ref = useRef(null);
  useEffect(() => {
    if (reduceMotion()) return undefined;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(Math.max(-r.top / Math.max(r.height - innerHeight, 1), 0), 1);
      el.style.setProperty('--p', p.toFixed(4));
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
      <div className="st-heropin">
        <div className="st-herofig desk">{desk && <Sketch frame={desk} panel={panel} id="hero-d" layer="art" cover label="Red silhouette of Reginald Tan, arms folded" />}</div>
        <div className="st-herofig phone">{phone && <Sketch frame={phone} panel={panel} id="hero-m" layer="art" cover label="Red silhouette of Reginald Tan, arms folded" />}</div>
        <nav className="st-nav" aria-label="Portfolio modes">
          <Link to="/"><span>CV</span></Link>
          <Link to="/tech"><span>Tech</span></Link>
          <Link to="/finance"><span>Finance</span></Link>
          <Link to="/life"><span>Life</span></Link>
        </nav>
        <h1 className="st-name">
          <span className="st-latin"><span>{first}</span> <span>{rest.join(' ')}</span></span>
          <span className="st-cjk" lang="zh-Hans">陈彦杰</span>
        </h1>
        <p className="st-cue">Scroll to begin</p>
      </div>
    </header>
  );
}

/* ---- chapter, rail, arc ----------------------------------------------------- */
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
        .map((p) => <Panel key={p.id} panel={p} />)}
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
  if (!arc) return <div className="st-arc"><header className="st-title"><h2>Side story not found</h2><p><Link to="/story">Back to the story</Link></p></header></div>;
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

export default function Story() {
  const { chapter, arc } = useParams();
  const location = useLocation();
  const [active, setActive] = useState(CHAPTERS[0].id);

  // Preview: keep it out of search results and name the tab.
  useEffect(() => {
    const prev = document.title;
    document.title = 'Reginald Tan · Story (preview)';
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => { document.title = prev; meta.remove(); };
  }, []);

  // Deep links: /story/chapter/<slug> (optionally #<panel id>) scrolls there.
  // Deferred so it runs after ModeProvider's scroll-to-top on a mode change.
  useEffect(() => {
    if (arc) return undefined;
    const target = location.hash ? decodeURIComponent(location.hash.slice(1)) : chapter ? `ch-${chapter}` : null;
    if (!target) return undefined;
    const t = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'auto', block: location.hash ? 'center' : 'start' });
    }, 80);
    return () => clearTimeout(t);
  }, [chapter, arc, location.hash, location.key]);

  // Chapter rail: highlight the chapter under the middle of the viewport.
  useEffect(() => {
    if (arc || typeof IntersectionObserver !== 'function') return undefined;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { setActive(e.target.dataset.chapter); trackEvent('chapter_enter', { chapter: e.target.dataset.chapter }); }
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.st-chapter').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [arc]);

  const body = useMemo(() => CHAPTERS.map((c, i) => <Chapter key={c.id} chapter={c} index={i} />), []);

  return (
    <div className="story">
      {arc ? <Arc slug={arc} /> : (
        <>
          {body}
          <footer className="st-end">
            <p>Thank you for reading.</p>
            <nav aria-label="More">
              <Link to="/">Paper portfolio</Link>
              <Link to="/tech">Tech</Link>
              <Link to="/finance">Finance</Link>
              <Link to="/life">Life</Link>
            </nav>
          </footer>
          <Rail active={active} />
        </>
      )}
      <p className="st-preview" role="note">Story preview · sketches stand in for final art · draft copy</p>
    </div>
  );
}

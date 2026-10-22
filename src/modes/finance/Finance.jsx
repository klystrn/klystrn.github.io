import '@fontsource/ibm-plex-mono/latin-400-italic.css';
import '../../styles/finance.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { identity, experience, testimonials, awards, certs, skills, timeline, headers } from '../../lib/data';
import { education, feed } from '../../lib/financeData';
import { PROJECTS, FLAGSHIP, SUPPLEMENTARY, bySym } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { useGithubFeed } from '../../lib/githubFeed';
import { trackEvent } from '../../lib/analytics';
import { useMarquee, useInView, prefersReducedMotion } from '../../lib/hooks';
import Chart from './Chart';

/* Everything below is derived once from static data at module load — none of
   it depends on state, so recomputing it on every render (the boot flicker
   re-renders ~8 times a second) was pure waste. */

/* Derived career fundamentals — computed from data, never hand-typed. */
const FUNDAMENTALS = (() => {
  const firstYear = Number(timeline.phases[0].when.split('–')[0]);
  const yrs = new Date().getFullYear() - firstYear;
  const shipped = PROJECTS.filter((p) => p.status === 'shipped').length;
  const growths = PROJECTS.map((p) => p.curve[p.curve.length - 1] - p.curve[0]);
  const avg = Math.round(growths.reduce((a, b) => a + b, 0) / growths.length);
  return [
    ['YRS ACTIVE', `${yrs}Y`],
    ['PROJECTS', `${PROJECTS.length}`],
    ['SHIPPED', `${shipped}/${PROJECTS.length}`],
    ['AVG GROWTH', `+${avg} PTS`, 'u'],
    ['POSITIONS', `${experience.length}`],
    ['LICENCES', `${certs.length}`],
  ];
})();

/* Cluster strengths from skills.json → portfolio-style sector allocation.
   Leaves attach to a hub OR a sub-hub (Programming/Data/Infra under TECH,
   Design under MEDIA), so roll each leaf up to its top-level hub before summing. */
const ALLOC_COLORS = { tech: '#5aa2ff', ai: '#b18aff', trade: '#2fd17a', media: '#f5b942', pm: '#ff7eb6' };
const SUB_TO_HUB = Object.fromEntries((skills.subhubs || []).map((s) => [s.id, s.hub]));
const hubOf = (parent) => SUB_TO_HUB[parent] || parent;
const ALLOCATION = (() => {
  const sums = {};
  skills.leaves.forEach((l) => {
    const h = hubOf(l.parent);
    sums[h] = (sums[h] || 0) + l.strength;
  });
  const total = Object.values(sums).reduce((a, b) => a + b, 0) || 1;
  return skills.hubs.map((h) => ({
    key: h.id,
    label: h.label,
    pct: Math.round(((sums[h.id] || 0) / total) * 100),
    color: ALLOC_COLORS[h.id],
  }));
})();

/* Which allocation sectors each project sits in: the hubs of its skills (as
   named in skills.json), plus its sector label for skills the graph doesn't
   name (Figma, Swift, Pitching…). Drives the click-to-filter on the bar. */
const LEAF_HUB = Object.fromEntries(skills.leaves.map((l) => [l.name.toLowerCase(), hubOf(l.parent)]));
const SECTOR_HUBS = [[/MARKETS/, 'trade'], [/UI\/UX|PROTOTYPE|MOCK/, 'media'], [/PITCH/, 'pm'], [/WEB|MOBILE|GAME|ENTERPRISE/, 'tech'], [/\bAI\b/, 'ai']];
const PROJECT_HUBS = Object.fromEntries(PROJECTS.map((p) => {
  const hubs = new Set(p.skills.map((s) => LEAF_HUB[s.toLowerCase()]).filter(Boolean));
  SECTOR_HUBS.forEach(([re, h]) => { if (re.test(p.sector)) hubs.add(h); });
  return [p.sym, hubs];
}));

/* Sparkline points, split into rising and falling segments so a dip in a
   project's arc reads red instead of everything being uniformly green. */
const SPARKS = Object.fromEntries(PROJECTS.map((p) => {
  const c = p.curve;
  const max = Math.max(...c);
  const min = Math.min(...c);
  const pt = (i) => [(i / (c.length - 1)) * 100, 20 - ((c[i] - min) / (max - min)) * 18];
  const segs = c.slice(1).map((v, i) => ({ d: v < c[i] ? 'd' : 'u', a: pt(i), b: pt(i + 1) }));
  return [p.sym, segs];
}));

/* SGX session state from the visitor's clock, in Singapore time: pre-open
   08:30–09:00, open 09:00–12:00 and 13:00–17:00 with a lunch break between,
   Mon–Fri. Public holidays aren't modelled — it's a portfolio, not a feed. */
function sgxSession(now = new Date()) {
  const sg = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
  const day = sg.getDay();
  const m = sg.getHours() * 60 + sg.getMinutes();
  if (day === 0 || day === 6) return { state: 'closed', label: 'MARKET CLOSED · WEEKEND' };
  if (m >= 510 && m < 540) return { state: 'pre', label: 'PRE-OPEN' };
  if ((m >= 540 && m < 720) || (m >= 780 && m < 1020)) return { state: 'open', label: 'MARKET OPEN' };
  if (m >= 720 && m < 780) return { state: 'pre', label: 'LUNCH BREAK' };
  return { state: 'closed', label: 'MARKET CLOSED' };
}
function useSession() {
  const [s, setS] = useState(sgxSession);
  useEffect(() => {
    const iv = setInterval(() => setS(sgxSession()), 30000);
    return () => clearInterval(iv);
  }, []);
  return s;
}

/* Boot flicker plays once per session, not on every return to the page. */
let flickerShown = false;

const SORTS = {
  sector: { label: 'SECTOR', fn: null },
  chg: { label: 'CHG ▼', fn: (a, b) => (b.curve.at(-1) - b.curve[0]) - (a.curve.at(-1) - a.curve[0]) },
  new: { label: 'NEWEST', fn: (a, b) => Number(b.from) - Number(a.from) },
};

function Tape({ onPick }) {
  const paused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useMarquee(paused);
  const setP = (v) => { paused.current = v; setIsPaused(v); };
  const items = [
    <>$RTAN <b className="u">▲</b></>,
    ...PROJECTS.map((p) => (
      <button type="button" className="tape-sym" tabIndex={-1} onClick={() => onPick(p.sym)}>
        ${p.sym} <b className="u">{p.chg}</b>
      </button>
    )),
    ...awards
      .filter((a) => a.tape)
      .map((a) => (
        <>
          {a.tape} <span className="fdim">{a.tape.includes('×') ? '' : a.year}</span>
        </>
      )),
    ...identity.finance.tape.map((t) => <>{t.label} <span className="fdim">{t.dim}</span></>),
  ];
  const copy = (key) => (
    <div className="tape-copy" key={key}>
      {items.map((it, i) => (
        <span key={i}>{it}</span>
      ))}
    </div>
  );
  // The moving tape is decorative to assistive tech (every symbol on it is
  // reachable in the watchlist); the pause control is the one real control,
  // since moving content needs a way to stop it (WCAG 2.2.2).
  return (
    <div className="tape" onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = isPaused)}>
      <div className="tape-track" ref={trackRef} aria-hidden="true">
        {copy('a')}
        {copy('b')}
      </div>
      <button
        type="button"
        className="tape-pause"
        onClick={() => setP(!isPaused)}
        aria-label={isPaused ? 'Resume ticker tape' : 'Pause ticker tape'}
      >
        {isPaused ? '▶' : '❚❚'}
      </button>
    </div>
  );
}

/* Trade ticket that actually "fills": a simulated market order animates a fill
   bar (a CSS animation on transform, so no per-frame React renders) and lands
   on a confirmation that opens a pre-filled email — so the panel reads
   transactional instead of decorative. */
function TradeTicket({ ticket, sym, email, linkedin, cvUrl, onCv }) {
  const [phase, setPhase] = useState('idle'); // idle | filling | filled
  const subject = encodeURIComponent(`Re: $${sym} position`);
  const body = encodeURIComponent(`Hi Reginald,\n\nI'd like to open a position in $${sym}. `);
  const orderMail = `mailto:${email}?subject=${subject}&body=${body}`;

  const fill = () => {
    if (phase === 'filling') return;
    trackEvent('trade_ticket_fill', { sym });
    setPhase(prefersReducedMotion() ? 'filled' : 'filling');
  };

  return (
    <div className="ticket">
      <p>{ticket}</p>
      <div className={`tk-order ${phase}`}>
        <div className="tk-order-head">
          <span>MARKET ORDER</span>
          <span className="tk-order-sym">BUY 1 ${sym} @ MKT</span>
        </div>
        {phase !== 'idle' && (
          <div className="tk-fillbar"><i onAnimationEnd={() => setPhase('filled')} /></div>
        )}
        {phase === 'filled' ? (
          <a className="tk-filled" href={orderMail} onClick={() => trackEvent('contact_click', { channel: 'ticket_confirm' })}>
            ✓ FILLED @ MKT · send the order confirmation →
          </a>
        ) : (
          <button type="button" className="tk-sim" onClick={fill}>
            {phase === 'filling' ? 'FILLING…' : '▸ SIMULATE FILL'}
          </button>
        )}
      </div>
      <div className="t-row">
        <a className={`btn buy ${phase === 'filled' ? 'pulse' : ''}`} href={orderMail}>BUY · CONTACT</a>
        <a className="btn line" href={linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
      </div>
      <a className="prospectus" href={cvUrl || '#'} onClick={onCv}>
        <span>⬇ DOWNLOAD PROSPECTUS</span>
        <span>CV.PDF</span>
      </a>
    </div>
  );
}

/* Function-key bar: Bloomberg-style shortcuts that double as section nav.
   Sticky, so on a phone it's also the way between the stacked panels.
   F5 is skipped on purpose — it's the browser's reload. */
const FKEYS = [
  ['F1', 'HELP', null],
  ['F2', 'WATCH', 'fin-watchlist'],
  ['F3', 'DETAIL', 'fin-detail'],
  ['F4', 'HOLD', 'fin-holdings'],
  ['F6', 'TICKET', 'fin-ticket'],
  ['F7', 'NEWS', 'fin-news'],
];

export default function Finance() {
  const { toast, pendingFinanceSym } = useMode();
  const [searchParams, setSearchParams] = useSearchParams();
  // A ?sym= in the URL (a shared link, or a reload) picks the initial stock,
  // same as the Tech-mode handoff below — both just need a valid symbol.
  const urlSym = searchParams.get('sym');
  const initialSym = urlSym && bySym(urlSym) ? urlSym : 'ATW';
  const [tab, setTab] = useState(bySym(initialSym).flag ? 'flag' : 'supp');
  const [sym, setSym] = useState(initialSym);
  const [flick, setFlick] = useState(null);
  const [allocHot, setAllocHot] = useState(null);
  const [sector, setSector] = useState(null); // allocation filter (hub id)
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('sector');
  const [sheet, setSheet] = useState(false); // mobile detail bottom sheet
  const session = useSession();
  const fin = identity.finance;
  const c = identity.contact;

  // Live GitHub activity replaces the static feed.json entries once it
  // resolves (null while loading falls back to the static entries too, so
  // there's no empty flash). The fetch waits until the News panel is near
  // the viewport.
  const [newsRef, newsInView] = useInView();
  const ghUsername = c.github.split('/').filter(Boolean).pop();
  const liveGh = useGithubFeed(ghUsername, 5, newsInView);
  const feedItems = liveGh && liveGh.length ? liveGh : feed;

  // Live-terminal boot flicker: quotes jitter briefly, then settle on the
  // derived values. Purely cosmetic; first visit per session only, and
  // skipped for prefers-reduced-motion.
  useEffect(() => {
    if (flickerShown || prefersReducedMotion()) return undefined;
    flickerShown = true;
    let n = 0;
    const iv = setInterval(() => {
      n += 1;
      if (n > 8) {
        clearInterval(iv);
        setFlick(null);
        return;
      }
      const m = {};
      PROJECTS.forEach((p) => { m[p.sym] = Math.random() * 0.6 - 0.3; });
      setFlick(m);
    }, 150);
    return () => clearInterval(iv);
  }, []);

  const chgOf = (p) =>
    flick && flick[p.sym] != null
      ? `+${(p.curve[p.curve.length - 1] - p.curve[0] + flick[p.sym]).toFixed(1)} pts`
      : p.chg;

  // Single path for picking a stock: sets the tab to match, and keeps the
  // URL in sync (replacing, not pushing, so clicking through the watchlist
  // doesn't fill up the back button) — so wherever you land is a link you
  // can copy and share, and it's always in sync with what's on screen.
  const selectSym = (newSym) => {
    const p = bySym(newSym);
    if (!p) return;
    setTab(p.flag ? 'flag' : 'supp');
    setSym(newSym);
    setSearchParams({ sym: newSym }, { replace: true });
  };
  // A tap on a phone opens the detail as a bottom sheet instead of leaving
  // the visitor to scroll past the whole watchlist to find it.
  const pickRow = (s) => {
    selectSym(s);
    if (window.matchMedia('(max-width: 720px)').matches) setSheet(true);
  };

  // Consume a ticker handed over from Tech mode ("$SYM in Finance mode →") —
  // takes priority over whatever the URL says, since it's a fresher pick.
  useEffect(() => {
    const pending = pendingFinanceSym.current;
    if (pending && bySym(pending)) {
      pendingFinanceSym.current = null;
      selectSym(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSheet(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [sheet]);

  // Function keys jump between panels (F1 shows the key map).
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const help = () => toast('F2 watchlist · F3 detail · F4 holdings · F6 ticket · F7 news · / to search');
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); return; }
      const k = FKEYS.find(([f]) => f === e.key);
      if (!k) return;
      e.preventDefault();
      if (k[2]) jump(k[2]); else help();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watchlist: a search or a sector filter spans both tabs; otherwise the
  // active tab's list, grouped by sector or sorted flat.
  const filtering = query.trim() !== '' || sector;
  const list = useMemo(() => {
    let l = filtering ? PROJECTS : tab === 'flag' ? FLAGSHIP : SUPPLEMENTARY;
    const q = query.trim().toLowerCase();
    if (q) l = l.filter((p) => `${p.sym} ${p.title} ${p.sector} ${p.skills.join(' ')}`.toLowerCase().includes(q));
    if (sector) l = l.filter((p) => PROJECT_HUBS[p.sym].has(sector));
    return SORTS[sort].fn ? [...l].sort(SORTS[sort].fn) : l;
  }, [filtering, tab, query, sector, sort]);
  const groups = useMemo(() => {
    if (sort !== 'sector') return [['', list]];
    const g = {};
    list.forEach((p) => { (g[p.sector.split('·')[0].trim()] ||= []).push(p); });
    return Object.entries(g);
  }, [list, sort]);
  const sel = bySym(sym) || list[0] || FLAGSHIP[0];
  const sectorLabel = sector && ALLOCATION.find((a) => a.key === sector)?.label;

  const switchTab = (k) => {
    setQuery('');
    setSector(null);
    const first = (k === 'flag' ? FLAGSHIP : SUPPLEMENTARY)[0];
    if (first) selectSym(first.sym);
    else setTab(k);
  };

  // Clicking a symbol on the ticker tape jumps to it in the watchlist: switch to
  // the right tab, select it, scroll the panel into view, and flash the row.
  const [picked, setPicked] = useState(null);
  const pickFromTape = (s) => {
    if (!bySym(s)) return;
    setQuery('');
    setSector(null);
    selectSym(s);
    document.getElementById('fin-watchlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setPicked(s);
    setTimeout(() => setPicked((cur) => (cur === s ? null : cur)), 1200);
  };

  const cvClick = (e) => {
    e.preventDefault();
    trackEvent('resume_download', { mode: 'finance' });
    if (c.cvUrl) window.open(c.cvUrl, '_blank');
    else toast('Wire up to your CV PDF');
  };

  const tr = fin.trackRecord;

  return (
    <div className="mf">
      <Tape onPick={pickFromTape} />
      <main className="shell">
        <header className="term-head">
          <div className="th-sym">
            ${fin.sym}
            <span className="exch">·{fin.exch}</span>
          </div>
          <div className="th-name">{fin.name}</div>
          <div className="th-quote" dangerouslySetInnerHTML={{ __html: fin.quoteHtml }} />
          <div className={`th-status ${session.state}`}>
            <span className="dot" /> {session.state === 'open' ? 'LIVE · ' : ''}{session.label} · {fin.market}
          </div>
        </header>
        <nav className="fkeys" aria-label="Terminal sections">
          {FKEYS.map(([k, label, id]) => (
            <button key={k} type="button" onClick={() => (id ? jump(id) : help())}>
              <b>{k}</b>{label}
            </button>
          ))}
        </nav>
        <div className="fund-strip">
          {FUNDAMENTALS.map(([k, v, cls]) => (
            <div className="fund-cell" key={k}>
              <div className="fund-k">{k}</div>
              <div className={`fund-v ${cls || ''}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="grid">
          <div className="col">
            <section className="panel" id="fin-watchlist">
              <div className="p-head">
                <span className="p-title">{headers.finance.watchlist}</span>
                <span className="p-hint">click to inspect</span>
              </div>
              <div className="wl-tools">
                <input
                  ref={searchRef}
                  className="wl-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="/ search symbol, name, skill"
                  aria-label="Search the watchlist"
                />
                <div className="wl-sort" role="group" aria-label="Sort">
                  {Object.entries(SORTS).map(([k, s]) => (
                    <button key={k} type="button" className={sort === k ? 'on' : ''} aria-pressed={sort === k} onClick={() => setSort(k)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {filtering ? (
                <div className="wl-filter">
                  {list.length} MATCH{list.length === 1 ? '' : 'ES'}
                  {sectorLabel && <> · SECTOR <b>{sectorLabel}</b></>}
                  <button type="button" onClick={() => { setQuery(''); setSector(null); }}>CLEAR ✕</button>
                </div>
              ) : (
                <div className="wl-tabs">
                  <button className={`wl-tab ${tab === 'flag' ? 'on' : ''}`} onClick={() => switchTab('flag')}>FLAGSHIP</button>
                  <button className={`wl-tab ${tab === 'supp' ? 'on' : ''}`} onClick={() => switchTab('supp')}>SUPPLEMENTARY</button>
                </div>
              )}
              <div>
                {list.length === 0 && <div className="wl-empty">NO SYMBOLS MATCH</div>}
                {groups.map(([sec, arr]) => (
                  <div key={sec || 'all'}>
                    {sec && <div className="wl-sect">{sec}</div>}
                    {arr.map((p) => (
                      <div
                        className={`wl-row ${p.sym === sel.sym ? 'on' : ''} ${p.sym === picked ? 'flash' : ''}`}
                        key={p.sym}
                        tabIndex={0}
                        role="button"
                        onClick={() => pickRow(p.sym)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickRow(p.sym); }
                        }}
                      >
                        <span className="wl-sym">${p.sym}</span>
                        <span className="wl-name">{p.title}</span>
                        <span className="wl-chg u">{chgOf(p)}</span>
                        <svg className="wl-spark" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">
                          {SPARKS[p.sym].map((s, i) => (
                            <line key={i} className={s.d} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} />
                          ))}
                        </svg>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="col">
            {sheet && <div className="sheet-scrim" onClick={() => setSheet(false)} aria-hidden="true" />}
            <section
              className={`panel det-panel ${sheet ? 'sheet-open' : ''}`}
              id="fin-detail"
              role={sheet ? 'dialog' : undefined}
              aria-modal={sheet ? 'true' : undefined}
              aria-label={sheet ? `$${sel.sym} detail` : undefined}
            >
              <button type="button" className="sheet-close" onClick={() => setSheet(false)} aria-label="Close detail">✕</button>
              <div className="det-head">
                <div className="det-sym">${sel.sym}</div>
                <div className="det-name">{sel.title}</div>
                <div className="det-quote">
                  <span className="u">▲ {chgOf(sel)} since inception</span>
                </div>
              </div>
              <Chart project={sel} />
              <div className="det-body">
                <div className="det-fund">
                  <div className="f-label">{headers.finance.fundamentals}</div>
                  <p className="f-text">{sel.desc}</p>
                  <div className="f-label" style={{ marginTop: 14 }}>{headers.finance.sector}</div>
                  <div className="chips">
                    {sel.skills.map((s) => (
                      <span className="chip" key={s}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="det-side">
                  <div className="f-label">{headers.finance.keystats}</div>
                  <div>
                    {Object.entries(sel.stats).map(([k, v]) => (
                      <div className="kv" key={k}>
                        <span className="k">{k}</span>
                        <span className="v">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="panel" id="fin-holdings">
              <div className="p-head">
                <span className="p-title">{headers.finance.holdings}</span>
                <span className="p-hint">positions held</span>
              </div>
              {experience.map((x) => (
                <div className="hold" key={x.id}>
                  <div className="hold-top">
                    <span className="hold-name">{x.orgShort}</span>
                    <span className="hold-tag">{x.financeTag}</span>
                  </div>
                  <div className="hold-meta">{x.financeMeta}</div>
                  <p className="hold-desc">{x.financeDesc}</p>
                </div>
              ))}
            </section>
            <section className="panel">
              <div className="p-head">
                <span className="p-title">{headers.finance.education}</span>
              </div>
              {education.map((e) => (
                <div className="hold edu" key={e.id}>
                  <div className="hold-top">
                    <span className="hold-name">{e.financeName}</span>
                    <span className="hold-tag">{e.financeTag}</span>
                  </div>
                  <div className="hold-meta">{e.financeMeta}</div>
                  <p className="hold-desc">{e.financeDesc}</p>
                </div>
              ))}
            </section>
            {tr && (
              <section className="panel" id="fin-track">
                <div className="p-head">
                  <span className="p-title">{headers.finance.track}</span>
                  <span className="p-hint">process, not P&amp;L</span>
                </div>
                <p className="hold-desc">{tr.strategy}</p>
                <div className="f-label" style={{ marginTop: 12 }}>PROCESS</div>
                <ol className="tr-list">{tr.process.map((s) => <li key={s}>{s}</li>)}</ol>
                <div className="f-label" style={{ marginTop: 12 }}>RISK RULES</div>
                <ul className="tr-list">{tr.rules.map((s) => <li key={s}>{s}</li>)}</ul>
                {tr.stats?.map(([k, v]) => (
                  <div className="kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
                ))}
              </section>
            )}
          </div>
          <div className="col col-r">
            <section className="panel" id="fin-ticket">
              <div className="p-head">
                <span className="p-title">{headers.finance.ticket}</span>
              </div>
              <TradeTicket
                ticket={fin.ticket}
                sym={fin.sym}
                email={c.email}
                linkedin={c.linkedin}
                cvUrl={c.cvUrl}
                onCv={cvClick}
              />
            </section>
            <section className="panel">
              <div className="p-head">
                <span className="p-title">Sector Exposure · Allocation</span>
                <span className="p-hint">click to filter</span>
              </div>
              <div className={`alloc ${allocHot ? 'has-hot' : ''}`}>
                <div className="alloc-bar" aria-hidden="true">
                  {ALLOCATION.map((a) => (
                    <i
                      key={a.key}
                      className={`${allocHot === a.key ? 'hot' : ''} ${sector === a.key ? 'sel' : ''}`}
                      style={{ width: `${a.pct}%`, background: a.color }}
                      onMouseEnter={() => setAllocHot(a.key)}
                      onMouseLeave={() => setAllocHot((h) => (h === a.key ? null : h))}
                      onClick={() => setSector((s) => (s === a.key ? null : a.key))}
                    />
                  ))}
                </div>
                <div className="alloc-key">
                  {ALLOCATION.map((a) => (
                    <button
                      type="button"
                      className={`alloc-row ${allocHot === a.key ? 'hot' : ''} ${sector === a.key ? 'sel' : ''}`}
                      key={a.key}
                      aria-pressed={sector === a.key}
                      onMouseEnter={() => setAllocHot(a.key)}
                      onMouseLeave={() => setAllocHot((h) => (h === a.key ? null : h))}
                      onFocus={() => setAllocHot(a.key)}
                      onBlur={() => setAllocHot((h) => (h === a.key ? null : h))}
                      onClick={() => {
                        setSector((s) => (s === a.key ? null : a.key));
                        jump('fin-watchlist');
                      }}
                    >
                      <b style={{ background: a.color }} />
                      {a.label}
                      <span className="pct">{a.pct}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="p-head">
                <span className="p-title">{headers.finance.coverage}</span>
              </div>
              {testimonials.filter((t) => t.quote).map((t) => (
                <div className="rate" key={t.slug}>
                  <div className="rate-tag">{t.financeTag}</div>
                  <p className="rate-q">{`"${t.quoteFinance || t.quote}"`}</p>
                  <div className="rate-by">
                    {t.titleFinance}
                    {t.url && (
                      <>
                        {' · '}
                        <a href={t.url} target="_blank" rel="noopener noreferrer">FULL NOTE ↗</a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </section>
            <section className="panel" id="fin-news" ref={newsRef}>
              <div className="p-head">
                <span className="p-title">{headers.finance.news}</span>
                <span className="p-hint">GitHub</span>
              </div>
              <div>
                {feedItems.map((f, i) => (
                  <div className="feed-item" key={`${f.src}-${i}`}>
                    <span className="feed-t">{f.t}</span>
                    <span className="feed-x">
                      <span className="feed-src gh">GITHUB</span>
                      <span dangerouslySetInnerHTML={{ __html: f.xHtml }} />{' '}
                      {f.link && f.link !== '#' && (
                        <a href={f.link} target="_blank" rel="noopener noreferrer">view ↗</a>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="foot">{fin.disclaimer}</footer>
      <div className="credit">BUILT BY {identity.name.toUpperCase()} · ${fin.sym}</div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import identity from '../../data/identity.json';
import experience from '../../data/experience.json';
import education from '../../data/education.json';
import testimonials from '../../data/testimonials.json';
import awards from '../../data/awards.json';
import certs from '../../data/certs.json';
import skills from '../../data/skills.json';
import timeline from '../../data/timeline.json';
import feed from '../../data/feed.json';
import headers from '../../data/headers.json';
import { PROJECTS, FLAGSHIP, SUPPLEMENTARY, bySym } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { useMarquee, prefersReducedMotion } from '../../lib/hooks';
import Chart from './Chart';

/* Derived career fundamentals — computed from data at render, never hand-typed. */
function fundamentals() {
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
}

/* Cluster strengths from skills.json → portfolio-style sector allocation.
   Leaves attach to a hub OR a sub-hub (Programming/Data/Infra under TECH,
   Design under MEDIA), so roll each leaf up to its top-level hub before summing. */
const ALLOC_COLORS = { tech: '#5aa2ff', ai: '#b18aff', trade: '#2fd17a', media: '#f5b942', pm: '#ff7eb6' };
function allocation() {
  const subToHub = Object.fromEntries((skills.subhubs || []).map((s) => [s.id, s.hub]));
  const hubOf = (parent) => subToHub[parent] || parent;
  const sums = {};
  skills.leaves.forEach((l) => {
    const h = hubOf(l.parent);
    sums[h] = (sums[h] || 0) + l.strength;
  });
  const total = Object.values(sums).reduce((a, b) => a + b, 0) || 1;
  return skills.hubs.map((h) => ({
    key: h.id,
    label: h.label,
    pct: Math.round((sums[h.id] || 0) / total * 100),
    color: ALLOC_COLORS[h.id],
  }));
}

function spark(c) {
  const max = Math.max(...c);
  const min = Math.min(...c);
  return c.map((v, i) => `${(i / (c.length - 1)) * 100},${20 - ((v - min) / (max - min)) * 18}`).join(' ');
}

function Tape({ onPick }) {
  const trackRef = useMarquee();
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
    <>PIOI OLYMPIAD <span className="fdim">TOP-8</span></>,
    <>16 WORKSHOPS <span className="fdim">OVERFLOW</span></>,
  ];
  const copy = (key) => (
    <div className="tape-copy" key={key}>
      {items.map((it, i) => (
        <span key={i}>{it}</span>
      ))}
    </div>
  );
  return (
    <div className="tape" aria-hidden="true">
      <div className="tape-track" ref={trackRef}>
        {copy('a')}
        {copy('b')}
      </div>
    </div>
  );
}

/* Trade ticket that actually "fills": a simulated market order animates a fill
   bar and lands on a confirmation, then nudges toward the real contact CTA —
   so the panel reads transactional instead of decorative. */
function TradeTicket({ ticket, sym, email, linkedin, cvUrl, onCv }) {
  const [phase, setPhase] = useState('idle'); // idle | filling | filled
  const [pct, setPct] = useState(0);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fill = () => {
    if (phase === 'filling') return;
    setPhase('filling');
    setPct(0);
    if (prefersReducedMotion()) { setPct(100); setPhase('filled'); return; }
    const start = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - start) / 900, 1);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100)); // ease-out
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setPhase('filled');
    };
    raf.current = requestAnimationFrame(tick);
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
          <div className="tk-fillbar"><i style={{ width: `${pct}%` }} /></div>
        )}
        {phase === 'filled' ? (
          <div className="tk-filled">✓ FILLED @ MKT · settles in an interview →</div>
        ) : (
          <button type="button" className="tk-sim" onClick={fill}>
            {phase === 'filling' ? `FILLING… ${pct}%` : '▸ SIMULATE FILL'}
          </button>
        )}
      </div>
      <div className="t-row">
        <a className={`btn buy ${phase === 'filled' ? 'pulse' : ''}`} href={`mailto:${email}`}>BUY · CONTACT</a>
        <a className="btn line" href={linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
      </div>
      <a className="prospectus" href={cvUrl || '#'} onClick={onCv}>
        <span>⬇ DOWNLOAD PROSPECTUS</span>
        <span>CV.PDF</span>
      </a>
    </div>
  );
}

export default function Finance() {
  const { toast, pendingFinanceSym } = useMode();
  const [tab, setTab] = useState('flag');
  const [sym, setSym] = useState('ATW');
  const [flick, setFlick] = useState(null);
  const [allocHot, setAllocHot] = useState(null);
  const alloc = allocation();
  const fin = identity.finance;
  const c = identity.contact;

  // Live-terminal boot flicker: quotes jitter briefly, then settle on the
  // derived values. Purely cosmetic; skipped for prefers-reduced-motion.
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
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

  // Consume a ticker handed over from Tech mode ("$SYM in Finance mode →").
  useEffect(() => {
    const pending = pendingFinanceSym.current;
    if (pending && bySym(pending)) {
      pendingFinanceSym.current = null;
      setTab(bySym(pending).flag ? 'flag' : 'supp');
      setSym(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = tab === 'flag' ? FLAGSHIP : SUPPLEMENTARY;
  const sectors = {};
  list.forEach((p) => {
    const s = p.sector.split('·')[0].trim();
    (sectors[s] ||= []).push(p);
  });
  const sel = bySym(sym) || list[0];

  const switchTab = (k) => {
    setTab(k);
    const first = (k === 'flag' ? FLAGSHIP : SUPPLEMENTARY)[0];
    if (first) setSym(first.sym);
  };

  // Clicking a symbol on the ticker tape jumps to it in the watchlist: switch to
  // the right tab, select it, scroll the panel into view, and flash the row.
  const [picked, setPicked] = useState(null);
  const pickFromTape = (s) => {
    const p = bySym(s);
    if (!p) return;
    setTab(p.flag ? 'flag' : 'supp');
    setSym(s);
    document.getElementById('fin-watchlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setPicked(s);
    setTimeout(() => setPicked((cur) => (cur === s ? null : cur)), 1200);
  };

  const cvClick = (e) => {
    e.preventDefault();
    if (c.cvUrl) window.open(c.cvUrl, '_blank');
    else toast('Wire up to your CV PDF');
  };

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
          <div className="th-status">
            <span className="dot" /> LIVE · {fin.statusLine}
          </div>
        </header>
        <div className="fund-strip">
          {fundamentals().map(([k, v, cls]) => (
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
              <div className="wl-tabs">
                <button className={`wl-tab ${tab === 'flag' ? 'on' : ''}`} onClick={() => switchTab('flag')}>FLAGSHIP</button>
                <button className={`wl-tab ${tab === 'supp' ? 'on' : ''}`} onClick={() => switchTab('supp')}>SUPPLEMENTARY</button>
              </div>
              <div>
                {Object.entries(sectors).map(([sec, arr]) => (
                  <div key={sec}>
                    <div className="wl-sect">{sec}</div>
                    {arr.map((p) => (
                      <div
                        className={`wl-row ${p.sym === sel.sym ? 'on' : ''} ${p.sym === picked ? 'flash' : ''}`}
                        key={p.sym}
                        tabIndex={0}
                        role="button"
                        onClick={() => setSym(p.sym)}
                        onKeyDown={(e) => e.key === 'Enter' && setSym(p.sym)}
                      >
                        <span className="wl-sym">${p.sym}</span>
                        <span className="wl-name">{p.title}</span>
                        <span className="wl-chg u">{chgOf(p)}</span>
                        <svg className="wl-spark" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">
                          <polyline points={spark(p.curve)} fill="none" stroke="#2fd17a" strokeWidth="1.4" />
                        </svg>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="col">
            <section className="panel">
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
            <section className="panel">
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
                <div className="hold" key={e.id}>
                  <div className="hold-top">
                    <span className="hold-name">{e.financeName}</span>
                    <span className="hold-tag">{e.financeTag}</span>
                  </div>
                  <div className="hold-meta">{e.financeMeta}</div>
                  <p className="hold-desc">{e.financeDesc}</p>
                </div>
              ))}
            </section>
          </div>
          <div className="col col-r">
            <section className="panel">
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
                <span className="p-hint">by skill strength</span>
              </div>
              <div className={`alloc ${allocHot ? 'has-hot' : ''}`}>
                <div className="alloc-bar">
                  {alloc.map((a) => (
                    <i
                      key={a.key}
                      className={allocHot === a.key ? 'hot' : ''}
                      style={{ width: `${a.pct}%`, background: a.color }}
                      onMouseEnter={() => setAllocHot(a.key)}
                      onMouseLeave={() => setAllocHot((h) => (h === a.key ? null : h))}
                    />
                  ))}
                </div>
                <div className="alloc-key">
                  {alloc.map((a) => (
                    <div
                      className={`alloc-row ${allocHot === a.key ? 'hot' : ''}`}
                      key={a.key}
                      onMouseEnter={() => setAllocHot(a.key)}
                      onMouseLeave={() => setAllocHot((h) => (h === a.key ? null : h))}
                    >
                      <b style={{ background: a.color }} />
                      {a.label}
                      <span className="pct">{a.pct}%</span>
                    </div>
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
            <section className="panel">
              <div className="p-head">
                <span className="p-title">{headers.finance.news}</span>
                <span className="p-hint">GitHub · LinkedIn</span>
              </div>
              <div>
                {feed.map((f, i) => (
                  <div className="feed-item" key={i}>
                    <span className="feed-t">{f.t}</span>
                    <span className="feed-x">
                      <span className={`feed-src ${f.src}`}>{f.src === 'gh' ? 'GITHUB' : 'LINKEDIN'}</span>
                      <span dangerouslySetInnerHTML={{ __html: f.xHtml }} />{' '}
                      <a href={f.link}>view ↗</a>
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

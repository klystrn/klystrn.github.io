import { useEffect, useMemo, useRef, useState } from 'react';
import identity from '../../data/identity.json';
import experience from '../../data/experience.json';
import timeline from '../../data/timeline.json';
import { PROJECTS, FLAGSHIP, SUPPLEMENTARY } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { buildFiles } from './files.jsx';
import Terminal from './Terminal';
import Palette from './Palette';

/* Session-scoped: the palette force-opens only on the first Tech visit. */
let paletteIntroShown = false;

/* Map each file to its "last commit" for the git-blame hover tooltip. */
function buildBlame() {
  const commits = timeline.commits;
  const latest = commits[0];
  const byTag = (tag) => commits.find((c) => c.tag === tag);
  const byYear = (y) => commits.find((c) => c.when <= String(y)) || latest;
  const blame = {
    readme: latest,
    timeline: latest,
    approvals: latest,
    stack: latest,
    certs: byYear(2025),
    contact: latest,
    jpmc: byTag('jpmc'),
    ali: byTag('alibaba'),
    saf: byTag('saf'),
  };
  const tagFor = (p) => {
    if (p.sector.includes('MARKETS')) return 'trade';
    if (p.sector.includes('JPMC')) return 'jpmc';
    if (p.sector.includes('SAF')) return 'saf';
    if (p.sector.includes('NP') || p.sector.includes('ASP.NET') || p.sector.includes('UI/UX')) return 'np';
    if (p.sector.includes('SST') || Number(p.from) <= 2021) return 'sst';
    return null;
  };
  PROJECTS.forEach((p) => {
    const t = tagFor(p);
    blame[`p_${p.id}`] = (t && byTag(t)) || byYear(p.from);
  });
  return blame;
}

/* Tree nodes live at module scope so their component identity is stable across
   renders. When they were defined inside Tech(), every state change (including
   setTip on each mouse-move) created a fresh component type, so React unmounted
   and remounted the whole tree — and unmounting a hovered node never fires its
   onMouseLeave, leaving the blame tooltip stuck on screen after a click. */
function FileNode({ f, ico, label, lvl, activeF, openFile, showBlame, setTip }) {
  return (
    <div
      className={`node ${lvl ? `lvl${lvl}` : ''} ${activeF === f ? 'on' : ''}`}
      onClick={() => { setTip(null); openFile(f); }}
      onMouseMove={(e) => showBlame(e, f)}
      onMouseLeave={() => setTip(null)}
    >
      <span className="ico">{ico}</span>
      {label}
    </div>
  );
}
function DirNode({ k, label, lvl, dirs, toggleDir, setTip }) {
  return (
    <div
      className={`node dir ${lvl ? `lvl${lvl}` : ''} ${dirs[k] ? 'open' : ''}`}
      onClick={() => { setTip(null); toggleDir(k); }}
    >
      <span className="ico tri">▸</span>
      {label}
    </div>
  );
}

export default function Tech() {
  const { setMode, toast, pendingFinanceSym } = useMode();
  const FILES = useMemo(buildFiles, []);
  const BLAME = useMemo(buildBlame, []);
  const [openTabs, setOpenTabs] = useState(['readme']);
  const [activeF, setActiveF] = useState('readme');
  const [dirs, setDirs] = useState({ exp: true, proj: false, supp: false });
  const [palette, setPalette] = useState(false);
  const [tip, setTip] = useState(null);
  const paneRef = useRef(null);

  useEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0;
  }, [activeF]);

  // Force first-visit users into the quick-open flow; ⌘K/Ctrl+K afterwards.
  useEffect(() => {
    if (!paletteIntroShown) {
      paletteIntroShown = true;
      const t = setTimeout(() => setPalette(true), 700);
      return () => clearTimeout(t);
    }
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const openFile = (f) => {
    if (!FILES[f]) return;
    setOpenTabs((t) => (t.includes(f) ? t : [...t, f]));
    setActiveF(f);
  };
  const closeTab = (f) => {
    setOpenTabs((t) => {
      const next = t.filter((o) => o !== f);
      const tabs = next.length ? next : ['readme'];
      if (activeF === f) setActiveF(tabs[tabs.length - 1]);
      return tabs;
    });
  };
  const expandDirs = (keys) => setDirs((d) => ({ ...d, ...Object.fromEntries(keys.map((k) => [k, true])) }));
  const toggleDir = (k) => setDirs((d) => ({ ...d, [k]: !d[k] }));

  const paletteItems = useMemo(() => {
    const flagIds = new Set(FLAGSHIP.map((p) => `p_${p.id}`));
    const suppIds = new Set(SUPPLEMENTARY.map((p) => `p_${p.id}`));
    const icoFor = (id) =>
      id === 'readme' ? '▣' : id === 'timeline' ? '⎇' : id === 'approvals' ? '✓'
      : id === 'stack' ? '{}' : id === 'certs' ? '🔒' : id === 'contact' ? '@' : '◆';
    const pathFor = (id) =>
      experience.some((x) => x.id === id) ? 'experience/'
      : flagIds.has(id) ? 'projects/'
      : suppIds.has(id) ? 'projects/supplementary/'
      : '~';
    return Object.entries(FILES).map(([id, f]) => ({ id, label: f.label, ico: icoFor(id), path: pathFor(id) }));
  }, [FILES]);

  const pickFromPalette = (id) => {
    if (experience.some((x) => x.id === id)) expandDirs(['exp']);
    else if (id.startsWith('p_')) {
      expandDirs(SUPPLEMENTARY.some((p) => `p_${p.id}` === id) ? ['proj', 'supp'] : ['proj']);
    }
    openFile(id);
  };

  const showBlame = (e, f) => {
    const c = BLAME[f];
    if (!c) return;
    setTip({ x: e.clientX, y: e.clientY, hash: c.hash, tag: c.tag, when: c.when });
  };
  const gotoFinance = (sym) => {
    pendingFinanceSym.current = sym;
    setMode('finance');
  };
  const cvClick = (e) => {
    if (!identity.contact.cvUrl) {
      e.preventDefault();
      toast('Wire to CV PDF');
    }
  };
  const ctx = { openFile, openDir: (k) => expandDirs([k]), gotoFinance, cvClick };

  // Shared props for the module-scope tree nodes (spread at each call site).
  const fileProps = { activeF, openFile, showBlame, setTip };
  const dirProps = { dirs, toggleDir, setTip };

  return (
    <div className="mt">
      <div className="window">
        <div className="titlebar">
          <div className="dots"><i /><i /><i /></div>
          <div className="tb-title"><b>klystrn</b> · ~/portfolio · zsh</div>
          <button className="kbtn" onClick={() => setPalette(true)} aria-label="Quick open">⌘K</button>
        </div>
        <div className="ide">
          <aside className="tree"><div className="tree-h">Explorer · klystrn</div>
            <FileNode f="readme" ico="▣" label="README.md" {...fileProps} />
            <FileNode f="timeline" ico="⎇" label="timeline.git" {...fileProps} />
            <DirNode k="exp" label="experience/" {...dirProps} />
            <div className={`group ${dirs.exp ? 'open' : ''}`}>
              {experience.map((x) => (
                <FileNode key={x.id} f={x.id} ico="◆" label={x.tech.file} lvl={1} {...fileProps} />
              ))}
            </div>
            <DirNode k="proj" label="projects/" {...dirProps} />
            <div className={`group ${dirs.proj ? 'open' : ''}`}>
              {FLAGSHIP.map((p) => (
                <FileNode key={p.id} f={`p_${p.id}`} ico="◆" label={`${p.repo}/`} lvl={1} {...fileProps} />
              ))}
              <DirNode k="supp" label="supplementary/" lvl={1} {...dirProps} />
              <div className={`group ${dirs.supp ? 'open' : ''}`}>
                {SUPPLEMENTARY.map((p) => (
                  <FileNode key={p.id} f={`p_${p.id}`} ico="◆" label={`${p.repo}/`} lvl={2} {...fileProps} />
                ))}
              </div>
            </div>
            <FileNode f="approvals" ico="✓" label="APPROVALS.md" {...fileProps} />
            <FileNode f="stack" ico="{}" label="stack.json" {...fileProps} />
            <FileNode f="certs" ico="🔒" label="certs.lock" {...fileProps} />
            <FileNode f="contact" ico="@" label="CONTACT.me" {...fileProps} />
          </aside>
          <div className="editor">
            <div className="etabs">
              {openTabs.map((f) => (
                <div className={`etab ${f === activeF ? 'on' : ''}`} key={f} onClick={() => setActiveF(f)}>
                  {FILES[f].label}
                  <span
                    className="x"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(f);
                    }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
            <div className="epane" ref={paneRef}>{FILES[activeF].render(ctx)}</div>
            <Terminal openFile={openFile} expandDirs={expandDirs} />
            <div className="status">
              <span className="br">⎇ main</span>
              <span className="ok">✓ all checks passing</span>
              <span>UTF-8</span>
              <div className="right">
                <span>Ln 14, Col 1</span>
                <span>Markdown</span>
                <span className="ok">● hire-ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="credit">{`// built by ${identity.name}`}</div>
      <Palette open={palette} onClose={() => setPalette(false)} onPick={pickFromPalette} items={paletteItems} />
      {tip && (
        <div className="blame-tip" style={{ left: tip.x + 14, top: tip.y + 16 }}>
          ⎇ last commit <span className="hs">{tip.hash}</span> · <span className="tg">{tip.tag}</span> · {tip.when}
        </div>
      )}
    </div>
  );
}

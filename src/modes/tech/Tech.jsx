import '../../styles/fonts-tech.css';
import '../../styles/tech.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { identity, experience, timeline } from '../../lib/data';
import { PROJECTS, FLAGSHIP, SUPPLEMENTARY } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { trackEvent } from '../../lib/analytics';
import { buildFiles, fileAliases, FileIcon } from './files.jsx';
import Terminal from './Terminal';
import Palette from './Palette';

/* Session-scoped: the ⌘K chip pulses only on the first Tech visit. */
let paletteHintShown = false;

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
   onMouseLeave, leaving the blame tooltip stuck on screen after a click.
   The blame tip also shows on keyboard focus (anchored to the node), so it
   isn't a mouse-only affordance. */
function FileNode({ f, ext, label, lvl, activeF, openFile, blame }) {
  const open = () => { blame.hide(); openFile(f); };
  return (
    <div
      className={`node ${lvl ? `lvl${lvl}` : ''} ${activeF === f ? 'on' : ''}`}
      role="button"
      tabIndex={0}
      aria-current={activeF === f ? 'true' : undefined}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      onMouseMove={(e) => blame.at(f, e.clientX, e.clientY)}
      onMouseLeave={blame.hide}
      onFocus={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        blame.at(f, r.right - 14, r.top + 4);
      }}
      onBlur={blame.hide}
    >
      <FileIcon ext={ext} />
      {label}
    </div>
  );
}
function DirNode({ k, label, lvl, dirs, toggleDir, blame }) {
  const toggle = () => { blame.hide(); toggleDir(k); };
  return (
    <div
      className={`node dir ${lvl ? `lvl${lvl}` : ''} ${dirs[k] ? 'open' : ''}`}
      role="button"
      tabIndex={0}
      aria-expanded={!!dirs[k]}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
    >
      <span className="ico tri">▸</span>
      {label}
    </div>
  );
}

/* Blame tooltip: which file it describes lives in state (changes rarely);
   its position is written straight to the DOM once per frame, so mouse-move
   over the tree no longer re-renders the whole IDE on every event. */
function useBlame(BLAME) {
  const [file, setFile] = useState(null);
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const place = () => {
    raf.current = 0;
    if (ref.current) ref.current.style.transform = `translate(${pos.current.x + 14}px, ${pos.current.y + 16}px)`;
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => { if (file) place(); }, [file]);
  const api = useMemo(() => ({
    at: (f, x, y) => {
      pos.current = { x, y };
      if (!BLAME[f]) return;
      setFile((cur) => (cur === f ? cur : f));
      if (!raf.current) raf.current = requestAnimationFrame(place);
    },
    hide: () => setFile(null),
  }), [BLAME]);
  return { file, ref, api };
}

export default function Tech() {
  const { setMode, toast, pendingFinanceSym, ideTheme } = useMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const FILES = useMemo(buildFiles, []);
  const BLAME = useMemo(buildBlame, []);
  const ALIASES = useMemo(fileAliases, []);
  // ?file=<id> (a shared link, or a reload) opens straight on that file.
  const urlFile = searchParams.get('file');
  const initialFile = urlFile && FILES[urlFile] ? urlFile : 'readme';
  const [openTabs, setOpenTabs] = useState(() => (initialFile === 'readme' ? ['readme'] : ['readme', initialFile]));
  const [activeF, setActiveF] = useState(initialFile);
  const [dirs, setDirs] = useState(() => ({
    exp: true,
    proj: initialFile.startsWith('p_'),
    supp: SUPPLEMENTARY.some((p) => `p_${p.id}` === initialFile),
  }));
  const [palette, setPalette] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false); // mobile explorer drawer
  const paneRef = useRef(null);
  const tabRefs = useRef({});
  const blame = useBlame(BLAME);

  useEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0;
    // Keep the URL on whatever's open (replace, not push — tab-hopping
    // shouldn't fill the back button), so it's always a shareable link.
    setSearchParams(activeF === 'readme' ? {} : { file: activeF }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeF]);

  // Body background follows the IDE theme (light/dark), set via the nav toggle.
  useEffect(() => {
    document.body.dataset.ide = ideTheme;
    return () => { delete document.body.dataset.ide; };
  }, [ideTheme]);

  // First visit: pulse the ⌘K chip instead of throwing the palette over the
  // README before anyone has read it. ⌘K/Ctrl+K opens it any time.
  useEffect(() => {
    if (paletteHintShown) return undefined;
    paletteHintShown = true;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPulse(false);
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
    setTreeOpen(false);
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

  // Tabs are a real tablist: ←/→ (and Home/End) move between open tabs,
  // Delete closes the focused one.
  const onTabKey = (e, f) => {
    const i = openTabs.indexOf(f);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % openTabs.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + openTabs.length) % openTabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = openTabs.length - 1;
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); closeTab(f); return; }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveF(f); return; }
    if (j == null) return;
    e.preventDefault();
    setActiveF(openTabs[j]);
    tabRefs.current[openTabs[j]]?.focus();
  };

  const paletteItems = useMemo(() => {
    const flagIds = new Set(FLAGSHIP.map((p) => `p_${p.id}`));
    const suppIds = new Set(SUPPLEMENTARY.map((p) => `p_${p.id}`));
    const pathFor = (id) =>
      experience.some((x) => x.id === id) ? 'experience/'
      : flagIds.has(id) ? 'projects/'
      : suppIds.has(id) ? 'projects/supplementary/'
      : '~';
    return Object.entries(FILES).map(([id, f]) => ({
      id,
      label: f.label,
      ext: f.ext,
      path: pathFor(id),
      aliases: (ALIASES[id] || []).join(' '),
      lines: f.text(),
    }));
  }, [FILES, ALIASES]);

  const pickFromPalette = (id) => {
    if (experience.some((x) => x.id === id)) expandDirs(['exp']);
    else if (id.startsWith('p_')) {
      expandDirs(SUPPLEMENTARY.some((p) => `p_${p.id}` === id) ? ['proj', 'supp'] : ['proj']);
    }
    openFile(id);
  };

  const gotoFinance = (sym) => {
    pendingFinanceSym.current = sym;
    setMode('finance');
  };
  const cvClick = (e) => {
    trackEvent('resume_download', { mode: 'tech' });
    if (!identity.contact.cvUrl) {
      e.preventDefault();
      toast('Wire to CV PDF');
    }
  };
  const ctx = { openFile, openDir: (k) => expandDirs([k]), gotoFinance, cvClick };

  // Shared props for the module-scope tree nodes (spread at each call site).
  const fileProps = { activeF, openFile, blame: blame.api };
  const dirProps = { dirs, toggleDir, blame: blame.api };

  const active = FILES[activeF];
  const lineCount = useMemo(() => active.text().length, [active]);
  const tipCommit = blame.file && BLAME[blame.file];

  return (
    <div className={`mt ${ideTheme === 'light' ? 'light' : ''}`}>
      <div className="window">
        <div className="titlebar">
          <div className="dots"><i /><i /><i /></div>
          <button
            type="button"
            className="tree-toggle"
            aria-expanded={treeOpen}
            aria-controls="ide-tree"
            onClick={() => setTreeOpen((o) => !o)}
          >
            ☰ Explorer
          </button>
          <div className="tb-title"><b>klystrn</b> · ~/portfolio · zsh</div>
          <button
            className={`kbtn ${pulse ? 'pulse' : ''}`}
            onClick={() => { setPulse(false); setPalette(true); }}
            aria-label="Quick open (⌘K)"
          >
            ⌘K{pulse && <span className="kbtn-hint">quick open</span>}
          </button>
        </div>
        <div className="ide">
          {treeOpen && <div className="tree-scrim" onClick={() => setTreeOpen(false)} aria-hidden="true" />}
          <aside className={`tree ${treeOpen ? 'open' : ''}`} id="ide-tree"><div className="tree-h">Explorer · klystrn</div>
            <FileNode f="readme" ext="md" label="README.md" {...fileProps} />
            <FileNode f="timeline" ext="git" label="timeline.git" {...fileProps} />
            <DirNode k="exp" label="experience/" {...dirProps} />
            <div className={`group ${dirs.exp ? 'open' : ''}`}>
              {experience.map((x) => (
                <FileNode key={x.id} f={x.id} ext="md" label={x.tech.file} lvl={1} {...fileProps} />
              ))}
            </div>
            <DirNode k="proj" label="projects/" {...dirProps} />
            <div className={`group ${dirs.proj ? 'open' : ''}`}>
              {FLAGSHIP.map((p) => (
                <FileNode key={p.id} f={`p_${p.id}`} ext="repo" label={`${p.repo}/`} lvl={1} {...fileProps} />
              ))}
              <DirNode k="supp" label="supplementary/" lvl={1} {...dirProps} />
              <div className={`group ${dirs.supp ? 'open' : ''}`}>
                {SUPPLEMENTARY.map((p) => (
                  <FileNode key={p.id} f={`p_${p.id}`} ext="repo" label={`${p.repo}/`} lvl={2} {...fileProps} />
                ))}
              </div>
            </div>
            <FileNode f="approvals" ext="md" label="APPROVALS.md" {...fileProps} />
            <FileNode f="stack" ext="json" label="stack.json" {...fileProps} />
            <FileNode f="certs" ext="lock" label="certs.lock" {...fileProps} />
            <FileNode f="contact" ext="me" label="CONTACT.me" {...fileProps} />
          </aside>
          <div className="editor">
            <div className="etabs" role="tablist" aria-label="Open files">
              {openTabs.map((f) => (
                <div
                  className={`etab ${f === activeF ? 'on' : ''}`}
                  key={f}
                  ref={(el) => { tabRefs.current[f] = el; }}
                  role="tab"
                  id={`etab-${f}`}
                  aria-selected={f === activeF}
                  aria-controls="epane"
                  tabIndex={f === activeF ? 0 : -1}
                  onClick={() => setActiveF(f)}
                  onKeyDown={(e) => onTabKey(e, f)}
                >
                  <FileIcon ext={FILES[f].ext} />
                  {FILES[f].label}
                  <button
                    type="button"
                    className="x"
                    tabIndex={-1}
                    aria-label={`Close ${FILES[f].label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(f);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="epane" id="epane" role="tabpanel" aria-labelledby={`etab-${activeF}`} ref={paneRef}>
              {active.render(ctx)}
            </div>
            <Terminal openFile={openFile} expandDirs={expandDirs} files={FILES} />
            <div className="status">
              <span className="br">⎇ main</span>
              <span className="ok">✓ all checks passing</span>
              <span>UTF-8</span>
              <div className="right">
                <span>{active.label}</span>
                <span>Ln {lineCount}, Col 1</span>
                <span>{active.lang}</span>
                <span className="ok">● hire-ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="credit">{`// built by ${identity.name}`}</div>
      <Palette open={palette} onClose={() => setPalette(false)} onPick={pickFromPalette} items={paletteItems} />
      {tipCommit && (
        <div className="blame-tip" ref={blame.ref} role="tooltip">
          ⎇ last commit <span className="hs">{tipCommit.hash}</span> · <span className="tg">{tipCommit.tag}</span> · {tipCommit.when}
        </div>
      )}
    </div>
  );
}

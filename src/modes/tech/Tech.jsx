import { useEffect, useMemo, useRef, useState } from 'react';
import identity from '../../data/identity.json';
import experience from '../../data/experience.json';
import { FLAGSHIP, SUPPLEMENTARY } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { buildFiles } from './files.jsx';
import Terminal from './Terminal';

export default function Tech() {
  const { setMode, toast, pendingFinanceSym } = useMode();
  const FILES = useMemo(buildFiles, []);
  const [openTabs, setOpenTabs] = useState(['readme']);
  const [activeF, setActiveF] = useState('readme');
  const [dirs, setDirs] = useState({ exp: true, proj: false, supp: false });
  const [hint, setHint] = useState(true);
  const paneRef = useRef(null);

  useEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0;
  }, [activeF]);

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
  const treeClick = () => setHint(false);
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

  const FileNode = ({ f, ico, label, lvl }) => (
    <div
      className={`node ${lvl ? `lvl${lvl}` : ''} ${activeF === f ? 'on' : ''}`}
      onClick={() => openFile(f)}
    >
      <span className="ico">{ico}</span>
      {label}
    </div>
  );
  const DirNode = ({ k, label, lvl }) => (
    <div className={`node dir ${lvl ? `lvl${lvl}` : ''} ${dirs[k] ? 'open' : ''}`} onClick={() => toggleDir(k)}>
      <span className="ico tri">▸</span>
      {label}
    </div>
  );

  return (
    <div className="mt">
      <div className="window">
        <div className="titlebar">
          <div className="dots"><i /><i /><i /></div>
          <div className="tb-title"><b>klystrn</b> · ~/portfolio · zsh</div>
        </div>
        <div className="ide">
          <aside className="tree" onClick={treeClick}>
            <div className="tree-h">Explorer · klystrn</div>
            {hint && (
              <div className="tree-hint">
                click a file to open it<span>this explorer is the nav</span>
              </div>
            )}
            <FileNode f="readme" ico="▣" label="README.md" />
            <FileNode f="timeline" ico="⎇" label="timeline.git" />
            <DirNode k="exp" label="experience/" />
            <div className={`group ${dirs.exp ? 'open' : ''}`}>
              {experience.map((x) => (
                <FileNode key={x.id} f={x.id} ico="◆" label={x.tech.file} lvl={1} />
              ))}
            </div>
            <DirNode k="proj" label="projects/" />
            <div className={`group ${dirs.proj ? 'open' : ''}`}>
              {FLAGSHIP.map((p) => (
                <FileNode key={p.id} f={`p_${p.id}`} ico="◆" label={`${p.repo}/`} lvl={1} />
              ))}
              <DirNode k="supp" label="supplementary/" lvl={1} />
              <div className={`group ${dirs.supp ? 'open' : ''}`}>
                {SUPPLEMENTARY.map((p) => (
                  <FileNode key={p.id} f={`p_${p.id}`} ico="◆" label={`${p.repo}/`} lvl={2} />
                ))}
              </div>
            </div>
            <FileNode f="approvals" ico="✓" label="APPROVALS.md" />
            <FileNode f="stack" ico="{}" label="stack.json" />
            <FileNode f="certs" ico="🔒" label="certs.lock" />
            <FileNode f="contact" ico="@" label="CONTACT.me" />
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
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import identity from '../../data/identity.json';
import experience from '../../data/experience.json';
import { PROJECTS } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { prefersReducedMotion } from '../../lib/hooks';
import { openNames } from './files.jsx';

const HELP =
  'available: whoami · ls · cd <dir> · open <file> · projects · contact · cv · stack · github · linkedin · email · mode <name> · date · echo · history · clear';

const FS = {
  '~': ['README.md', 'timeline.git', 'experience/', 'projects/', 'APPROVALS.md', 'stack.json', 'certs.lock', 'CONTACT.me'],
  '~/experience': experience.map((x) => x.tech.file),
  '~/projects': PROJECTS.filter((p) => p.flag).map((p) => `${p.repo}/`).concat(['supplementary/']),
  '~/projects/supplementary': PROJECTS.filter((p) => !p.flag).map((p) => `${p.repo}/`),
};
const DIRMAP = { '~/experience': ['exp'], '~/projects': ['proj'], '~/projects/supplementary': ['proj', 'supp'] };
const NAMES = openNames();

/* Terminal boots by running `help` (v6 behaviour), typed out char-by-char. */
const INITIAL = [
  { kind: 'cmd', cwd: '~', text: 'help' },
  { kind: 'out', text: HELP },
];

export default function Terminal({ openFile, expandDirs }) {
  const { setMode, toast } = useMode();
  const [lines, setLines] = useState(() => (prefersReducedMotion() ? INITIAL : []));
  const [booting, setBooting] = useState(() => (prefersReducedMotion() ? null : ''));

  // Boot sequence: type "help", then print its output.
  useEffect(() => {
    if (booting === null) return undefined;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      if (i <= 4) {
        setBooting('help'.slice(0, i));
      } else {
        clearInterval(iv);
        setBooting(null);
        setLines(INITIAL);
      }
    }, 90);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [cwd, setCwd] = useState('~');
  const [hist, setHist] = useState([]);
  const histIdx = useRef(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [lines]);

  const changeDir = (target) => {
    setCwd(target);
    expandDirs(DIRMAP[target] || []);
  };

  const run = (raw) => {
    const [c, ...args] = raw.split(' ');
    const CMDS = {
      help: () => HELP,
      cd: () => {
        const t = (args[0] || '~').replace(/\/+$/, '');
        if (t === '~') { changeDir('~'); return null; }
        if (t === '..') {
          changeDir(cwd.includes('/') ? cwd.split('/').slice(0, -1).join('/') || '~' : '~');
          return null;
        }
        const cand = (cwd === '~' ? '~/' : `${cwd}/`) + t;
        if (FS[cand]) { changeDir(cand); return null; }
        return `cd: no such directory: ${t}`;
      },
      projects: () => PROJECTS.map((p) => `${p.flag ? '' : 'supplementary/'}${p.repo}/`).join('  '),
      github: () => { window.open(identity.contact.github, '_blank'); return 'opening github.com/klystrn ↗'; },
      linkedin: () => { window.open(identity.contact.linkedin, '_blank'); return 'opening LinkedIn ↗'; },
      email: () => { location.href = `mailto:${identity.contact.email}`; return 'drafting email…'; },
      date: () => new Date().toString(),
      echo: () => args.join(' '),
      history: () => (hist.length ? hist.join('  ·  ') : '(empty)'),
      mode: () => {
        const m = (args[0] || '').toLowerCase();
        if (['paper', 'tech', 'finance'].includes(m)) {
          setTimeout(() => setMode(m), 300);
          return `switching to ${m} mode…`;
        }
        return 'usage: mode paper|tech|finance';
      },
      sudo: () => (args.join(' ') === 'hire-me' ? 'request escalated ✓ drafting offer letter…' : 'permission denied (hint: sudo hire-me)'),
      whoami: () => 'SWE × markets. Now: Guards HQ (media team manager · AI task force). Prev: JPMC CIB, Alibaba Cloud.',
      ls: () => (FS[cwd] || []).join('  '),
      contact: () => { openFile('contact'); return `opening CONTACT.me… email: ${identity.contact.email}`; },
      cv: () => {
        if (identity.contact.cvUrl) { window.open(identity.contact.cvUrl, '_blank'); return 'fetching résumé.pdf… ⬇'; }
        toast('Wire to CV PDF');
        return 'fetching résumé.pdf… (wire to real CV) ⬇';
      },
      stack: () => { openFile('stack'); return 'opening stack.json…'; },
      clear: () => { setLines([]); return null; },
    };
    if (CMDS[c]) return CMDS[c]();
    if (c === 'open' && args[0]) {
      const seg = args[0].toLowerCase().replace(/\/+$/, '').split('/').pop().replace(/^(projects|experience)\./, '');
      const k = Object.keys(NAMES).find((f) => NAMES[f].startsWith(seg) || f === seg);
      if (k) { openFile(k); return `opening ${NAMES[k]}…`; }
      return `open: file not found: ${args[0]}`;
    }
    return `zsh: command not found: ${c}, try 'help'`;
  };

  const onKeyDown = (e) => {
    const input = inputRef.current;
    if (e.key === 'ArrowUp') {
      if (hist.length) {
        histIdx.current = histIdx.current < 0 ? hist.length - 1 : Math.max(0, histIdx.current - 1);
        input.value = hist[histIdx.current];
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      if (histIdx.current >= 0) {
        histIdx.current += 1;
        if (histIdx.current >= hist.length) { histIdx.current = -1; input.value = ''; }
        else input.value = hist[histIdx.current];
        e.preventDefault();
      }
      return;
    }
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';
    histIdx.current = -1;
    const echo = { kind: 'cmd', cwd, text: raw };
    if (!raw) { setLines((l) => [...l, echo]); return; }
    setHist((h) => [...h, raw]);
    const out = run(raw);
    // `clear` resets lines inside run(); everything else appends.
    if (raw.split(' ')[0] === 'clear') return;
    setLines((l) => (out === null ? [...l, echo] : [...l, echo, { kind: out.includes('not found') ? 'err' : 'out', text: out }]));
  };

  return (
    <div className="term" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="term-h"><b>terminal</b><span>zsh · try: help</span></div>
      <div className="term-body" ref={bodyRef}>
        {booting !== null && (
          <div className="tl">
            <span className="pr">klystrn@portfolio</span> <span className="out">~ %</span>{' '}
            <span className="cmd">{booting}</span>
            <span className="cursor" />
          </div>
        )}
        {lines.map((l, i) =>
          l.kind === 'cmd' ? (
            <div className="tl" key={i}>
              <span className="pr">klystrn@portfolio</span> <span className="out">{l.cwd} %</span>{' '}
              <span className="cmd">{l.text}</span>
            </div>
          ) : (
            <div className={`tl ${l.kind}`} key={i}>{l.text}</div>
          )
        )}
        <div className="tin">
          <span className="pr">klystrn@portfolio</span>&nbsp;
          <span className="out">{cwd} %</span>&nbsp;
          <input ref={inputRef} autoComplete="off" spellCheck="false" aria-label="terminal input" onKeyDown={onKeyDown} />
        </div>
      </div>
    </div>
  );
}

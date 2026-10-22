import { useEffect, useRef, useState } from 'react';
import { identity, experience } from '../../lib/data';
import { PROJECTS } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { prefersReducedMotion } from '../../lib/hooks';
import { openNames } from './files.jsx';

const HELP =
  'available: whoami · ls · cd <dir> · open <file> · cat <file> · grep <term> · projects · contact · cv · stack · github · linkedin · email · mode <name> · date · echo · history · clear  (tab completes)';
const COMMANDS = ['whoami', 'ls', 'cd', 'open', 'cat', 'grep', 'projects', 'contact', 'cv', 'stack', 'github', 'linkedin', 'email', 'mode', 'date', 'echo', 'history', 'clear', 'help'];
const MODES = ['paper', 'tech', 'finance', 'life'];
// Scrollback cap: a long session shouldn't grow the DOM without bound.
const MAX_LINES = 200;

const FS = {
  '~': ['README.md', 'timeline.git', 'experience/', 'projects/', 'APPROVALS.md', 'stack.json', 'certs.lock', 'CONTACT.me'],
  '~/experience': experience.map((x) => x.tech.file),
  '~/projects': PROJECTS.filter((p) => p.flag).map((p) => `${p.repo}/`).concat(['supplementary/']),
  '~/projects/supplementary': PROJECTS.filter((p) => !p.flag).map((p) => `${p.repo}/`),
};
const DIRMAP = { '~/experience': ['exp'], '~/projects': ['proj'], '~/projects/supplementary': ['proj', 'supp'] };
const NAMES = openNames();

/* Terminal boots by running `help` (v6 behaviour), typed out char-by-char.
   The tip line surfaces the two least-discoverable interactions in this mode —
   the git-blame hover tooltip on the file tree, and ⌘K / Ctrl-K quick-open. */
const TIP = 'tip · hover a file in the tree for its last commit · ⌘K to quick-open · tab to complete';
const INITIAL = [
  { kind: 'cmd', cwd: '~', text: 'help' },
  { kind: 'out', text: HELP },
  { kind: 'tip', text: TIP },
];

export default function Terminal({ openFile, expandDirs, files }) {
  const { setMode, toast, flashTab } = useMode();
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

  // `open`/`cat` accept a filename, a repo path, or a bare prefix.
  const resolve = (arg) => {
    const seg = arg.toLowerCase().replace(/\/+$/, '').split('/').pop().replace(/^(projects|experience)\./, '');
    return Object.keys(NAMES).find((f) => NAMES[f].startsWith(seg) || f === seg) || null;
  };

  // Each command returns plain text (an 'out' line), null (no output), or
  // { text, kind } where kind is ok | err | info, which colours the line.
  const run = (raw) => {
    const [c, ...args] = raw.split(/\s+/);
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
        return { text: `cd: no such directory: ${t}`, kind: 'err' };
      },
      projects: () => PROJECTS.map((p) => `${p.flag ? '' : 'supplementary/'}${p.repo}/`).join('  '),
      github: () => { window.open(identity.contact.github, '_blank'); return { text: `opening ${identity.contact.github.replace(/^https?:\/\//, '')} ↗`, kind: 'ok' }; },
      linkedin: () => { window.open(identity.contact.linkedin, '_blank'); return 'opening LinkedIn ↗'; },
      email: () => { location.href = `mailto:${identity.contact.email}`; return 'drafting email…'; },
      date: () => new Date().toString(),
      echo: () => args.join(' '),
      history: () => (hist.length ? hist.join('  ·  ') : '(empty)'),
      mode: () => {
        const m = (args[0] || '').toLowerCase();
        if (MODES.includes(m)) {
          flashTab(m);
          setTimeout(() => setMode(m), 300);
          return { text: `switching to ${m} mode…`, kind: 'ok' };
        }
        return { text: `usage: mode ${MODES.join('|')}`, kind: 'err' };
      },
      cat: () => {
        if (!args[0]) return { text: 'usage: cat <file>', kind: 'err' };
        const k = resolve(args[0]);
        if (!k) return { text: `cat: ${args[0]}: no such file`, kind: 'err' };
        return files[k].text().join('\n');
      },
      grep: () => {
        const term = args.join(' ').replace(/^["']|["']$/g, '').trim();
        if (!term) return { text: 'usage: grep <term>', kind: 'err' };
        const needle = term.toLowerCase();
        const hits = [];
        Object.entries(files).forEach(([id, f]) => {
          f.text().forEach((line, i) => {
            if (line.toLowerCase().includes(needle)) hits.push(`${NAMES[id]}:${i + 1}: ${line.trim()}`);
          });
        });
        if (!hits.length) return { text: `grep: no matches for "${term}"`, kind: 'info' };
        const shown = hits.slice(0, 12);
        return shown.join('\n') + (hits.length > shown.length ? `\n… ${hits.length - shown.length} more (try a narrower term)` : '');
      },
      sudo: () => (args.join(' ') === 'hire-me' ? 'request escalated ✓ drafting offer letter…' : 'permission denied (hint: sudo hire-me)'),
      whoami: () => identity.tech.whoami,
      ls: () => (FS[cwd] || []).join('  '),
      contact: () => { openFile('contact'); return { text: `opening CONTACT.me… email: ${identity.contact.email}`, kind: 'ok' }; },
      cv: () => {
        if (identity.contact.cvUrl) { window.open(identity.contact.cvUrl, '_blank'); return 'fetching résumé.pdf… ⬇'; }
        toast('Wire to CV PDF');
        return 'fetching résumé.pdf… (wire to real CV) ⬇';
      },
      stack: () => { openFile('stack'); return { text: 'opening stack.json…', kind: 'ok' }; },
      clear: () => { setLines([]); return null; },
    };
    if (CMDS[c]) return CMDS[c]();
    if (c === 'open' && args[0]) {
      const k = resolve(args[0]);
      if (k) { openFile(k); return { text: `opening ${NAMES[k]}…`, kind: 'ok' }; }
      return { text: `open: file not found: ${args[0]}`, kind: 'err' };
    }
    return { text: `zsh: command not found: ${c}, try 'help'`, kind: 'err' };
  };

  // Tab completion: the command name first, then its argument — a mode name,
  // a directory under the cwd, or any file name. One match completes in
  // place; several print as a list, like zsh.
  const complete = (input) => {
    const val = input.value;
    const parts = val.split(/\s+/);
    let pool;
    let word;
    if (parts.length <= 1) {
      word = parts[0] || '';
      pool = COMMANDS;
    } else {
      word = parts[parts.length - 1];
      const cmd = parts[0];
      if (cmd === 'mode') pool = MODES;
      else if (cmd === 'cd') pool = (FS[cwd] || []).filter((n) => n.endsWith('/')).concat(['..', '~']);
      else pool = [...new Set([...(FS[cwd] || []), ...Object.values(NAMES)])];
    }
    const hits = pool.filter((n) => n.toLowerCase().startsWith(word.toLowerCase()));
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      input.value = parts.join(' ') + (parts.length === 1 || !hits[0].endsWith('/') ? ' ' : '');
    } else if (hits.length > 1) {
      // Extend to the longest shared prefix, then list the options.
      let pre = hits[0];
      hits.forEach((h) => { while (!h.toLowerCase().startsWith(pre.toLowerCase())) pre = pre.slice(0, -1); });
      if (pre.length > word.length) { parts[parts.length - 1] = pre; input.value = parts.join(' '); }
      push([{ kind: 'cmd', cwd, text: val }, { kind: 'info', text: hits.join('  ') }]);
    }
  };

  const push = (add) => setLines((l) => [...l, ...add].slice(-MAX_LINES));

  const onKeyDown = (e) => {
    const input = inputRef.current;
    if (e.key === 'Tab') {
      e.preventDefault();
      complete(input);
      return;
    }
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
    if (!raw) { push([echo]); return; }
    setHist((h) => [...h, raw].slice(-MAX_LINES));
    const out = run(raw);
    // `clear` resets lines inside run(); everything else appends.
    if (raw.split(/\s+/)[0] === 'clear') return;
    if (out === null) { push([echo]); return; }
    const line = typeof out === 'string' ? { kind: 'out', text: out } : out;
    push([echo, line]);
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

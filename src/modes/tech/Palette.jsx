import { useEffect, useMemo, useRef, useState } from 'react';
import { FileIcon } from './files.jsx';

/*
 * ⌘K command palette — the forcing function for "the explorer is the nav".
 * Auto-opens on the first Tech-mode visit of the session; afterwards, ⌘K/Ctrl+K
 * or the titlebar chip reopen it.
 *
 * Matches rank: filename first, then aliases (org names, tickers, skills),
 * then file contents. A content hit shows the matching line as a snippet.
 */
export default function Palette({ open, onClose, onPick, items }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    const out = [];
    items.forEach((it) => {
      if (`${it.label} ${it.path}`.toLowerCase().includes(needle)) { out.push({ ...it, rank: 0 }); return; }
      if (it.aliases.toLowerCase().includes(needle)) { out.push({ ...it, rank: 1 }); return; }
      const line = it.lines.find((l) => l.toLowerCase().includes(needle));
      if (line) {
        const at = line.toLowerCase().indexOf(needle);
        const start = Math.max(at - 28, 0);
        const snip = `${start ? '…' : ''}${line.slice(start, at + needle.length + 40).trim()}…`;
        out.push({ ...it, rank: 2, snip });
      }
    });
    return out.sort((a, b) => a.rank - b.rank);
  }, [q, items]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    const el = listRef.current?.children[sel];
    el?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  if (!open) return null;

  const pick = (it) => {
    onPick(it.id);
    onClose();
  };

  const onKey = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && hits[sel]) pick(hits[sel]);
  };

  return (
    <div className="kbar-ov" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kbar" role="dialog" aria-modal="true" aria-label="Quick open">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="search files, orgs, tickers or text — the explorer is the nav"
          aria-label="Search files"
          spellCheck="false"
        />
        <div className="kbar-list" ref={listRef}>
          {hits.length === 0 && <div className="kbar-empty">nothing matches "{q}" — try grep in the terminal</div>}
          {hits.map((it, i) => (
            <div
              key={it.id}
              className={`kbar-it ${i === sel ? 'on' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(it)}
            >
              <FileIcon ext={it.ext} />
              <span className="kbar-label">
                {it.label}
                {it.snip && <span className="kbar-snip">{it.snip}</span>}
              </span>
              <span className="path">{it.path}</span>
            </div>
          ))}
        </div>
        <div className="kbar-hint">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span>⌘K / ctrl+K anytime</span>
        </div>
      </div>
    </div>
  );
}

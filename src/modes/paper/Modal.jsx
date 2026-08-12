import { useEffect, useRef } from 'react';

/*
 * Shared detail modal (projects, experience, certificates).
 * `data`: { title, meta, body, skills, stats, private } or null when closed.
 */
export default function Modal({ data, onClose }) {
  const boxRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocused = useRef(null);

  // Move focus into the dialog on open, and give it back to whatever
  // triggered it (a project/experience card) on close — a dialog that eats
  // focus without returning it strands keyboard users past the trigger.
  useEffect(() => {
    if (data) {
      lastFocused.current = document.activeElement;
      closeRef.current?.focus();
    } else {
      lastFocused.current?.focus?.();
    }
  }, [data]);

  useEffect(() => {
    const onKey = (e) => {
      if (!data) return;
      if (e.key === 'Escape') { onClose(); return; }
      // Trap Tab inside the dialog's focusable elements so keyboard users
      // can't tab out into the page hiding behind the modal overlay.
      if (e.key === 'Tab' && boxRef.current) {
        const items = boxRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [data, onClose]);

  return (
    <div
      className={`pj-modal ${data ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Details"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {data && (
        <div className="box" ref={boxRef}>
          <button className="close" aria-label="Close" ref={closeRef} onClick={onClose}>✕</button>
          <h3>{data.title}</h3>
          <div className="meta">{data.meta}</div>
          <p className="body">{data.body}</p>
          <div className="chips">
            {(data.skills || []).map((s) => (
              <span className="chip" key={s}>{s}</span>
            ))}
          </div>
          <div className="kvs">
            {Object.entries(data.stats || {}).map(([k, v]) => (
              <div className="kv2" key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          {data.private && <div className="private" style={{ display: 'block' }}>🔒 {data.private}</div>}
        </div>
      )}
    </div>
  );
}

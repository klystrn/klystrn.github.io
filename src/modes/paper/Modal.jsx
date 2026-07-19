import { useEffect } from 'react';

/*
 * Shared detail modal (projects, experience, certificates).
 * `data`: { title, meta, body, skills, stats, private } or null when closed.
 */
export default function Modal({ data, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

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
        <div className="box">
          <button className="close" aria-label="Close" onClick={onClose}>✕</button>
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

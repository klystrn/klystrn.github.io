import { useMode } from './ModeContext';

export default function PillNav() {
  const { mode, setMode } = useMode();
  const life = mode === 'life';
  const proMode = life ? null : mode;

  return (
    <nav className="nav-wrap" aria-label="Primary">
      <div className="pill">
        <span className="brand" title="Reginald">R.</span>
        <button className={`tab-btn ${life ? '' : 'on'}`} onClick={() => setMode('paper')}>
          Professional
        </button>
        <div className={`modes ${life ? 'hidden' : ''}`}>
          {['paper', 'tech', 'finance'].map((m) => (
            <button
              key={m}
              className={`mode-btn ${proMode === m ? 'on' : ''}`}
              onClick={() => setMode(m)}
            >
              {m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <div className="pill-div" style={{ opacity: life ? 0 : 1 }} />
        <button className={`tab-btn ${life ? 'on' : ''}`} onClick={() => setMode('life')}>
          Life
        </button>
      </div>
    </nav>
  );
}

import { useMode } from './ModeContext';

// Tech and Finance are permanently dark by design, and Life paints its own
// fixed-dark stage (literal colours matching the photorealistic render, not
// gated by the dark-mode CSS) — so the toggle only has a visible effect,
// and is only shown, in Paper.
function ThemeToggle({ theme, toggleTheme }) {
  const dark = theme === 'dark';
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}

export default function PillNav() {
  const { mode, setMode, flashedMode, theme, toggleTheme } = useMode();
  const life = mode === 'life';
  const proMode = life ? null : mode;
  const showThemeToggle = mode === 'paper';

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
              className={`mode-btn ${proMode === m ? 'on' : ''} ${flashedMode === m ? 'flash' : ''}`}
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
      {showThemeToggle && <ThemeToggle theme={theme} toggleTheme={toggleTheme} />}
    </nav>
  );
}

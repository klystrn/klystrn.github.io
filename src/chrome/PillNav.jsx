import { useRef, useState } from 'react';
import { useMode } from './ModeContext';
import { prefetch } from '../lib/routes';

// Touch has no hover, so the CSS-only reveal above never fires there. A
// long-press peeks at the tip without navigating (mirroring the press-to-
// pause pattern on the watch page); a normal tap still navigates immediately,
// same as it always has. Auto-hides after a few seconds like a one-shot hint.
const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 10;
const AUTO_HIDE_MS = 3000;

function useTouchTip() {
  const [shownId, setShownId] = useState(null);
  const pressTimer = useRef(null);
  const hideTimer = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const suppressClick = useRef(false);

  const touchHandlers = (id) => ({
    onTouchStart: (e) => {
      const t = e.touches[0];
      startPos.current = { x: t.clientX, y: t.clientY };
      clearTimeout(pressTimer.current);
      pressTimer.current = setTimeout(() => {
        setShownId(id);
        suppressClick.current = true;
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setShownId(null), AUTO_HIDE_MS);
      }, LONG_PRESS_MS);
    },
    onTouchMove: (e) => {
      const t = e.touches[0];
      if (Math.hypot(t.clientX - startPos.current.x, t.clientY - startPos.current.y) > MOVE_CANCEL_PX) {
        clearTimeout(pressTimer.current);
      }
    },
    onTouchEnd: () => clearTimeout(pressTimer.current),
    onTouchCancel: () => clearTimeout(pressTimer.current),
  });

  // Wrap a button's real onClick: a click completing a long-press is
  // swallowed (that's what just showed the tip) — any other click, tap, or
  // keypress navigates exactly as it always did.
  const guardClick = (fn) => (e) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.preventDefault();
      return;
    }
    setShownId(null);
    clearTimeout(hideTimer.current);
    fn(e);
  };

  return { shownId, touchHandlers, guardClick };
}

// Short, hover/focus-revealed explanations of what each mode actually is —
// the labels alone ("Tech", "Finance") don't say it's the same career told
// three different ways until you've already clicked in. "Professional"
// itself is just the umbrella tab (same destination as "Paper"), so it gets
// no tip of its own — only the four actual modes underneath it do.
const MODE_TIPS = {
  paper: 'The classic view — résumé, timeline, projects.',
  tech: 'The same career as a terminal — cd into it.',
  finance: 'The same career as a stock ticket — $RTAN.',
};
const LIFE_TIP = 'Off the clock — an interactive room, a watch, two games.';

// Paper toggles the site theme; Tech toggles its own IDE theme (dark by
// default). Finance is permanently dark by design, and Life paints its own
// fixed-dark stage — so the toggle is only shown in Paper and Tech.
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

function NavTip({ id, show, children }) {
  return (
    <span className={`nav-tip ${show ? 'show' : ''}`} id={id} role="tooltip">
      {children}
    </span>
  );
}

export default function PillNav() {
  const { mode, setMode, flashedMode, theme, toggleTheme, ideTheme, toggleIdeTheme } = useMode();
  const { shownId, touchHandlers, guardClick } = useTouchTip();
  const life = mode === 'life';
  const proMode = life ? null : mode;
  const showThemeToggle = mode === 'paper' || mode === 'tech';
  // Hovering/focusing a tab starts that mode's chunk download, so the click
  // usually lands on an already-loaded route.
  const warm = (m) => ({ onMouseEnter: () => prefetch(m), onFocus: () => prefetch(m) });

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
              onClick={guardClick(() => setMode(m))}
              aria-describedby={`nav-tip-${m}`}
              {...touchHandlers(m)}
              {...warm(m)}
            >
              {m[0].toUpperCase() + m.slice(1)}
              <NavTip id={`nav-tip-${m}`} show={shownId === m}>{MODE_TIPS[m]}</NavTip>
            </button>
          ))}
        </div>
        <div className="pill-div" style={{ opacity: life ? 0 : 1 }} />
        <button
          className={`tab-btn ${life ? 'on' : ''}`}
          onClick={guardClick(() => setMode('life'))}
          aria-describedby="nav-tip-life"
          {...touchHandlers('life')}
          {...warm('life')}
        >
          Life
          <NavTip id="nav-tip-life" show={shownId === 'life'}>{LIFE_TIP}</NavTip>
        </button>
      </div>
      {showThemeToggle && (mode === 'tech'
        ? <ThemeToggle theme={ideTheme} toggleTheme={toggleIdeTheme} />
        : <ThemeToggle theme={theme} toggleTheme={toggleTheme} />)}
    </nav>
  );
}

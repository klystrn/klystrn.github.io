import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

const ModeContext = createContext(null);

const PATH_TO_MODE = { '/': 'paper', '/tech': 'tech', '/finance': 'finance', '/life': 'life' };
const MODE_TO_PATH = { paper: '/', tech: '/tech', finance: '/finance', life: '/life' };

const THEME_KEY = 'theme';

// Only 'light'/'dark' count as an explicit user choice — anything else means
// "follow the OS", which is also what a corrupted/foreign localStorage value
// should fall back to.
function getStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

const MODE_INTRO = {
  tech: 'Tech lens: same story as Paper, rendered as a repo. Click files in the tree, or type help in the terminal.',
  finance: 'Finance lens: same story as a brokerage. Click a ticker in the watchlist to inspect it.',
};

export function ModeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  // /life and its sub-pages (/life/photography, /life/watch, /life/cards) all
  // resolve to the 'life' lens so the nav tab stays active and chrome consistent.
  const mode = location.pathname.startsWith('/life')
    ? 'life'
    : PATH_TO_MODE[location.pathname] || 'paper';

  const [seenModes, setSeenModes] = useState(() => new Set(['paper']));
  const [toastMsg, setToastMsg] = useState('');
  const [flashedMode, setFlashedMode] = useState(null);
  // The head script in index.html already set this attribute before mount
  // (avoiding a flash of the wrong theme), so read it back as the initial
  // state instead of re-deriving it from localStorage/matchMedia here.
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  const toastTimer = useRef();
  const flashTimer = useRef();
  // Cross-mode handoff: Tech's "$SYM in Finance mode →" link pre-selects a ticker.
  const pendingFinanceSym = useRef(null);

  const toast = (m) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
  };

  // Briefly pulse a nav tab — used when a mode switch is triggered indirectly
  // (e.g. the Tech terminal's `mode <name>`) so the destination tab visibly
  // acknowledges the command instead of just silently becoming active.
  const flashTab = (m) => {
    setFlashedMode(m);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashedMode(null), 850);
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private browsing / storage disabled — theme still applies for this tab */
      }
      trackEvent('theme_toggle', { theme: next });
      return next;
    });
  };

  useEffect(() => {
    // As long as the visitor hasn't made an explicit choice, keep following
    // the OS setting live (e.g. their system switches to dark at sunset).
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e) => {
      if (getStoredTheme()) return;
      const next = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      setTheme(next);
    };
    mq.addEventListener('change', onSystemChange);
    return () => mq.removeEventListener('change', onSystemChange);
  }, []);

  useEffect(() => {
    // Life keeps the paper (light) chrome, as in the prototype.
    document.body.dataset.mode = mode === 'life' ? 'paper' : mode;
    scrollTo(0, 0);
    trackEvent('mode_switch', { mode });
    if (mode !== 'life' && !seenModes.has(mode)) {
      setSeenModes((s) => new Set(s).add(mode));
      if (MODE_INTRO[mode]) setTimeout(() => toast(MODE_INTRO[mode]), 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      seenModes,
      setMode: (m) => navigate(MODE_TO_PATH[m] || '/'),
      toast,
      toastMsg,
      flashedMode,
      flashTab,
      pendingFinanceSym,
      theme,
      toggleTheme,
    }),
    [mode, seenModes, toastMsg, flashedMode, theme] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);

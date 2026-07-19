import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ModeContext = createContext(null);

const PATH_TO_MODE = { '/': 'paper', '/tech': 'tech', '/finance': 'finance', '/life': 'life' };
const MODE_TO_PATH = { paper: '/', tech: '/tech', finance: '/finance', life: '/life' };

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

  useEffect(() => {
    // Life keeps the paper (light) chrome, as in the prototype.
    document.body.dataset.mode = mode === 'life' ? 'paper' : mode;
    scrollTo(0, 0);
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
    }),
    [mode, seenModes, toastMsg, flashedMode] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);

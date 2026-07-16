import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ModeContext = createContext(null);

const PATH_TO_MODE = { '/': 'vanilla', '/tech': 'tech', '/finance': 'finance', '/life': 'life' };
const MODE_TO_PATH = { vanilla: '/', tech: '/tech', finance: '/finance', life: '/life' };

const MODE_INTRO = {
  tech: 'Tech lens: same story as Vanilla, rendered as a repo. Click files in the tree, or type help in the terminal.',
  finance: 'Finance lens: same story as a brokerage. Click a ticker in the watchlist to inspect it.',
};

export function ModeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = PATH_TO_MODE[location.pathname] || 'vanilla';

  const [seenModes, setSeenModes] = useState(() => new Set(['vanilla']));
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef();
  // Cross-mode handoff: Tech's "$SYM in Finance mode →" link pre-selects a ticker.
  const pendingFinanceSym = useRef(null);

  const toast = (m) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
  };

  useEffect(() => {
    // Life keeps the vanilla (light) chrome, as in the prototype.
    document.body.dataset.mode = mode === 'life' ? 'vanilla' : mode;
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
      pendingFinanceSym,
    }),
    [mode, seenModes, toastMsg] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ModeProvider } from './chrome/ModeContext';
import PillNav from './chrome/PillNav';
import Toast from './chrome/Toast';
import Paper from './modes/paper/Paper';
import NotFound from './modes/NotFound';
import { initAnalytics, trackPageview } from './lib/analytics';

// Paper ('/') is the default landing route and stays eager. The other three
// lenses are route-split so a first-time visit only ships the editorial
// bundle; Tech/Finance/Life (and Life's sub-pages) load on demand when the
// visitor actually switches lenses.
const Tech = lazy(() => import('./modes/tech/Tech'));
const Finance = lazy(() => import('./modes/finance/Finance'));
const Life = lazy(() => import('./modes/life/Life'));
const Photography = lazy(() => import('./modes/life/Photography'));
const WatchStory = lazy(() => import('./modes/life/WatchStory'));
const CardGame = lazy(() => import('./modes/life/CardGame'));

function Analytics() {
  const location = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => {
    trackPageview(location.pathname, document.title);
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <ModeProvider>
      <Analytics />
      <a className="skip-link" href="#main">Skip to content</a>
      <PillNav />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="route-loading" aria-live="polite">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Paper />} />
            <Route path="/tech" element={<Tech />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/life" element={<Life />} />
            <Route path="/life/photography" element={<Photography />} />
            <Route path="/life/watch" element={<WatchStory />} />
            <Route path="/life/cards" element={<CardGame />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Toast />
    </ModeProvider>
  );
}

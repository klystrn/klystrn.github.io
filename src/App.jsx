import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ModeProvider } from './chrome/ModeContext';
import PillNav from './chrome/PillNav';
import Toast from './chrome/Toast';
import Paper from './modes/paper/Paper';
import Tech from './modes/tech/Tech';
import Finance from './modes/finance/Finance';
import NotFound from './modes/NotFound';

// Life is a WebGL scene (three.js) — lazy-load so the other three modes don't
// ship the ~400KB 3D bundle. Its sub-pages ride the same split.
const Life = lazy(() => import('./modes/life/Life'));
const Photography = lazy(() => import('./modes/life/Photography'));
const WatchStory = lazy(() => import('./modes/life/WatchStory'));
const CardGame = lazy(() => import('./modes/life/CardGame'));

export default function App() {
  return (
    <ModeProvider>
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

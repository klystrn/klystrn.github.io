import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ModeProvider } from './chrome/ModeContext';
import PillNav from './chrome/PillNav';
import Toast from './chrome/Toast';
import Paper from './modes/paper/Paper';
import NotFound from './modes/NotFound';
import { initAnalytics, trackPageview } from './lib/analytics';
import { loaders } from './lib/routes';
import { headers } from './lib/data';

const SITE = 'https://reginaldtan.com';

// Per-route <title>, description, canonical and og:url. index.html carries
// the '/' values for crawlers that don't run JS; this keeps them right once
// the visitor (or a JS-rendering crawler) lands on any other route.
function setPageMeta(pathname) {
  const m = headers.meta[pathname] || headers.meta['/'];
  document.title = m.title;
  const set = (sel, attr, val) => document.head.querySelector(sel)?.setAttribute(attr, val);
  set('meta[name="description"]', 'content', m.description);
  set('meta[property="og:title"]', 'content', m.title);
  set('meta[property="og:description"]', 'content', m.description);
  set('meta[property="og:url"]', 'content', SITE + pathname);
  set('link[rel="canonical"]', 'href', SITE + pathname);
}

// Paper ('/') is the default landing route and stays eager. The other three
// lenses are route-split so a first-time visit only ships the editorial
// bundle; Tech/Finance/Life (and Life's sub-pages) load on demand when the
// visitor actually switches lenses.
const Tech = lazy(loaders.tech);
const Finance = lazy(loaders.finance);
const Life = lazy(loaders.life);
const Photography = lazy(loaders.photography);
const WatchStory = lazy(loaders.watch);
const CardGame = lazy(loaders.cards);

function Analytics() {
  const location = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => {
    setPageMeta(location.pathname);
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

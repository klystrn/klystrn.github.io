import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
// Self-hosted fonts (was Google Fonts <link>) — no external round-trip, no
// flash of fallback text. Newsreader (a real publication serif) for display,
// Hanken Grotesk for body; both variable. Newsreader italic is a separate face
// for the accent words. JetBrains/IBM Plex mono stay (deliberate, thematic).
import '@fontsource-variable/newsreader/standard.css';
import '@fontsource-variable/newsreader/standard-italic.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/400-italic.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-mono/700.css';
import './styles/global.css';
import './styles/enhancements.css';

// Hash routing under file:// lets a built dist/index.html be opened straight
// from disk for review; deployed builds keep clean BrowserRouter paths.
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

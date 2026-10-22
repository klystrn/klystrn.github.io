import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
// Self-hosted fonts (was Google Fonts <link>) — no external round-trip, no
// flash of fallback text. Newsreader (a real publication serif) for display,
// Hanken Grotesk for body; both variable, latin subset only (styles/fonts.css).
// IBM Plex Mono is the shared mono for chrome, Paper and Finance; JetBrains
// Mono is Tech-only and loads with that route's chunk (styles/fonts-tech.css).
import './styles/fonts.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-700.css';
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

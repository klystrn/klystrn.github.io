/*
 * Privacy-conscious, env-gated GA4 wrapper. With no VITE_GA_ID set (the
 * default for local dev, PR previews, or anyone forking this repo) every
 * export here is a no-op — nothing loads, nothing is sent, no console noise.
 * Set VITE_GA_ID in a .env.production (or as a build-time env var / repo
 * secret for the deploy workflow) to turn it on.
 */
const GA_ID = import.meta.env.VITE_GA_ID;
let ready = false;

export function initAnalytics() {
  if (!GA_ID || ready) return;
  ready = true;

  window.dataLayer = window.dataLayer || [];
  // gtag.js expects a plain function that pushes arguments onto dataLayer —
  // this is the standard snippet, not a custom shim.
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // Page views are sent manually on route change (see trackPageview), since
  // this is a client-routed SPA and the automatic pageview only fires once.
  window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function trackPageview(path, title) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path, page_title: title, page_location: location.href });
}

export function trackEvent(name, params = {}) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

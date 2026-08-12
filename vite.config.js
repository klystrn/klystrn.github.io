import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Preload the two above-the-fold variable fonts (body sans + display serif,
// Latin subset) so the browser fetches them immediately instead of only after
// discovering them inside the CSS — shortens the FOIT->real-font swap and
// cuts layout shift from the swap. Hashes are content-derived by Vite, so we
// find them in the built bundle rather than hardcoding filenames.
function fontPreload() {
  return {
    name: 'preload-critical-fonts',
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;
      const patterns = [/hanken-grotesk-latin-wght-normal-.*\.woff2$/, /newsreader-latin-standard-normal-.*\.woff2$/];
      const links = Object.keys(bundle)
        .filter((f) => patterns.some((p) => p.test(f)))
        .map((f) => `<link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin>`)
        .join('\n    ');
      return links ? html.replace('</title>', `</title>\n    ${links}`) : html;
    },
  };
}

// User/org root Pages site (klystrn.github.io) deploys from the domain root,
// so base MUST stay '/' — never a subpath.
export default defineConfig({
  base: '/',
  plugins: [react(), fontPreload()],
});

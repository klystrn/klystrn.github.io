# klystrn.github.io — Reginald Tan portfolio (v2)

Personal portfolio: one canonical dataset, three renderers.

- **Vanilla** (`/`) — light editorial scroll site
- **Tech** (`/tech`) — dark IDE simulation with a working terminal
- **Finance** (`/finance`) — dark brokerage terminal with watchlist + charts
- **Life** (`/life`) — stub, deferred until Professional ships

## Architecture

All content lives in `src/data/*.json` (identity, experience, education, projects, skills, awards,
certs, testimonials, timeline, feed, headers). **Content parity rule:** add a fact once in data and
it appears in all three modes; if a fact exists in only one mode, that's a bug. Components are
furniture only — no hardcoded content strings outside `src/data/`.

Reference docs: `docs/CONTENT-DOC-reginald-v4.md` (authoritative content source),
`docs/CLAUDE-CODE-HANDOFF.md` (build spec), `docs/rtan-portfolio-v6.html` (visual/behavioral
prototype). Outstanding items: `KNOWN-GAPS.md`.

## Develop

```
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
```

## Deploy

GitHub Pages via Actions (`.github/workflows/deploy.yml`) on push to `main`. This is a user-root
Pages site, so `vite.config.js` keeps `base: '/'`. Cutover = merge `portfolio-v2` into `main`.

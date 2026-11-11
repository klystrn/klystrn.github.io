# klystrn.github.io — Reginald Tan portfolio (v2)

Personal portfolio: one canonical dataset, three renderers.

- **Paper** (`/`) — light editorial scroll site
- **Tech** (`/tech`) — dark IDE simulation with a working terminal
- **Finance** (`/finance`) — dark brokerage terminal with watchlist + charts
- **Life** (`/life`) — a photorealistic room render with interactive hotspots (photography,
  card-throwing minigame, watch story)

## Architecture

All content lives in `src/data/*.json` (identity, experience, education, projects, skills, awards,
certs, testimonials, timeline, feed, headers). **Content parity rule:** add a fact once in data and
it appears in all three modes; if a fact exists in only one mode, that's a bug. Components are
furniture only — no hardcoded content strings outside `src/data/`.

Reference doc: `docs/CONTENT-DOC-reginald-v4.md` (authoritative content source, kept in sync with
`src/data/`). Outstanding items: `KNOWN-GAPS.md`.

### Story mode (in production — preview at `/story`)

Story mode is a cinematic autobiographical comic with its **own** content source, outside the
content parity rule above. Paper/CV, Tech and Finance keep sharing the canonical `src/data` facts.
The Story script tells the same life as narrative, so it may phrase, sequence or omit facts
differently, but it must not contradict them. `scripts/story/build.py` warns when the script and
`src/data` disagree.

- Script: `docs/STORY-SCRIPT.md` (Chapter → Story → Scene → Panel, plus optional Arcs; format in
  `docs/story/SCHEMA.md`)
- Testimonial letters: `docs/story/letters/`
- Art registry: `public/story/manifest.json`
- Compiler/validator: `python3 scripts/story/build.py` → `src/story/story.json` (generated)
- Working docs, edit list and plan: `docs/story/`
- Claude skill: `.claude/skills/portfolio-story-content-update/`

A **preview** of Story mode is live at `/story` (also `/story/chapter/<slug>` and
`/story/arc/<slug>`): it renders the script and storyboards with pencil sketches standing in for
final art. It is not linked from the nav and is marked `noindex`. The only external dependency of
Story mode is image/video generation for the art; every caption, card, title and scroll effect is
code in `src/modes/story/`. `/` stays Paper until Story launch is explicitly approved.

## Develop

```
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
```

## Deploy

GitHub Pages via Actions (`.github/workflows/deploy.yml`) on push to `main`. This is a user-root
Pages site, so `vite.config.js` keeps `base: '/'`. `public/CNAME` points the deploy at
`reginaldtan.com` (routed via Route 53); GitHub Pages serves that file to tell Pages about the
custom domain.

## Analytics (optional)

`src/lib/analytics.js` is a thin GA4 wrapper, gated entirely on a `VITE_GA_ID` env var. With it
unset (the default), every call is a no-op — nothing loads, nothing sends. To turn it on:

1. Create a GA4 property, get its Measurement ID (`G-XXXXXXX`).
2. Add it as a repo secret: Settings → Secrets and variables → Actions → `VITE_GA_ID`.
3. The deploy workflow already passes it through to the build (`env: VITE_GA_ID` in
   `deploy.yml`) — next push to `main` picks it up automatically.

Tracked events: `page_view` (route change), `mode_switch`, `resume_download`, `contact_click`,
`project_view`, `experience_view`, `trade_ticket_fill`.

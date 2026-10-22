# KNOWN GAPS

Outstanding content/asset items, mirroring `docs/CONTENT-DOC-reginald-v4.md`'s flags so nothing
ships silently wrong. Fix in `src/data/*.json` (content) — components carry no content.

## Pending: Life mode rebuild (room as a live scene)

Rebuild `/life` so the room is composed of objects rather than one flat render
(`public/life/room-*.{webp,jpg}`), making each part customisable and animatable.

**Goal:** the same isometric room, but every object is its own layer/component that can carry
live content:

- **Desk monitors**: play a looping "workday" slideshow: an IDE (reuse Tech mode's editor look,
  e.g. a file from `src/data` scrolling), then a finance app (Finance mode's watchlist/chart),
  then working through documents (résumé/case-study pages), and back to the start. Clicking still
  routes to `/finance`.
- **TV**: shows the current time (visitor's clock, or Singapore time with a label), styled as a
  clock screensaver; could cycle to the watch collection once that content exists.
- **Shelf, trophy cabinet, camera, watch, sofa, window**: separate objects with their own
  hotspots, so each can change (e.g. trophies from `life.json`, the window sky following the
  time of day, lamp on/off) without re-rendering the whole image.

**Approach options** (decide before building):

1. **Layered 2.5D (recommended first step):** keep the photoreal render as the base layer; cut
   the screen areas (monitors, TV) out as transparent regions and place live HTML/SVG/canvas
   "screens" over them, using a CSS `matrix3d`/perspective transform to match each screen's
   isometric angle. Cheap, keeps the photoreal look, works on low-end GPUs.
2. **Full scene (three.js / react-three-fiber):** model the room (or import a glTF) and render
   screens as textures (`CanvasTexture`/`VideoTexture`). Most flexible (camera moves, lighting,
   swapping objects), but heavier; the earlier three.js room was removed for being slow on
   low-end GPUs, so this needs a static-image fallback and a lazy, on-demand chunk.

**Constraints to keep:** percent-positioned hotspots with keyboard (1–N) and touch (tap to
preview, tap to enter) support; `prefers-reduced-motion` stops the slideshows; the room must
still load fast (screen content lazy-loaded after the base image); the fallback link list in
`Life.jsx` stays.

## Content (needs Reginald's input)

1. **Photography and watch pages are switched off** (`life.json` → `wip.photography`,
   `wip.watch` = `true`): they show a "work in progress" card. To bring one back, add the content
   and set its flag to `false`. Append `?preview` to the URL (`/life/watch?preview`) to see the
   real page while the content goes in.
   - Photography: add photos per set in `life.json` → `photography.tiles[].photos` (a path, or
     `{ "src", "caption", "exif" }` for the viewer's caption line), plus `avatar`.
   - Watch: confirm or replace the `watchStory.entries` copy (currently draft text).
2. **Project READMEs (Tech mode)**: each project in `projects.json` can take an optional
   `"readme": { "problem", "approach", "next" }`; those render as sections in its repo README.
   None are filled in yet.
3. **Hard numbers for experience impact lines** (`experience.json` → `impact`): the lines use
   facts already in the data. Add real figures where you can share them (teams or users of the
   JPMC tool, time saved by the trading workflow, reach of Guards HQ socials).
4. **Longer testimonial excerpts**: Paper's quotes are still the short excerpts. Pick the most
   specific line from each letter (PDFs on Drive) and update `testimonials.json` → `quote`.
5. **Trading track record (Finance)**: `identity.json` → `finance.trackRecord` is `null`, so the
   panel stays hidden. Fill in `{ "strategy", "process": [], "rules": [], "stats": [[label,
   value]] }` (process and risk rules, no P&L needed) and it appears.
6. **Guards HQ logo**: Paper's experience cards show the J.P. Morgan Chase and Alibaba Cloud
   marks (`public/logos/`, from Simple Icons). The Guards crest isn't available as a vetted SVG,
   so SAF shows a "GDS" monogram. Drop the crest in as `public/logos/saf.svg` and set
   `experience.json` → `saf.logo` to `"/logos/saf.svg"`.
7. **Please review the drafted copy**: the commit bodies in `timeline.json` (`commits[].body`),
   the "On the job" lines in `life.json` (`objects.*.trait`), and the Life WIP card copy.

RESOLVED 2026-10-22:
- News feed: GitHub-only now (no LinkedIn posts yet); static fallback entries link to real
  GitHub URLs.

RESOLVED 2026-07-17 (Reginald's direct edits + follow-up sync):
- §10 testimonial quotes — Rahul Varma and Dimuthu Makawita now have real quotes, `quoteFinance`
  variants, and a `url` (Drive PDF) per person; a "Read in full ↗" link is wired in Vanilla, Tech
  (APPROVALS.md), and Finance (Analyst Coverage).
- §15 header rewrites — Timeline, Experience, Projects, Skills, and Testimonials headers all
  rewritten (`headers.json`).
- locationX — enriched with its real Python stack, description, and milestones (`projects.json`,
  `id: locx`); the duplicate "Interschool Games Planner" entry is gone.

## Assets (content doc §14)

- [x] CV PDF — resolved, `identity.json` → `contact.cvUrl`
- [x] Google Drive certificates folder URL — resolved, `identity.json` → `contact.driveUrl`
- [ ] 2–3 personal photos (About/hero)
- [ ] 1–3 images per flagship project (`atw-01.png`, `tcs-01.png`, …)
- [x] Favicon — resolved: typographic red "R." SVG (`public/favicon.svg`)
- [x] Testimonial PDFs (Rahul Varma, Dimuthu Makawita) — resolved via `testimonials.json` `url`
- [ ] Guards HQ crest SVG (`public/logos/saf.svg`), see Content §6

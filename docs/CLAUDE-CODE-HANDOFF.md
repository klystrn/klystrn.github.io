# Reginald Tan Portfolio — Claude Code Handoff

## 0 · How to use this document

This is the transition brief from a design/prototyping chat into Claude Code. Two files are being
uploaded alongside this one:

- **`rtan-portfolio-v6.html`** — a single-file, vanilla JS/CSS/SVG interactive prototype. No build
  tooling, no framework. This is the **visual and behavioral spec**, not code to inherit directly.
  Every layout, animation, and interaction it contains should be ported faithfully into the real
  React build; nothing in it is a placeholder unless explicitly marked otherwise below.
- **`CONTENT-DOC-reginald-v4.md`** — the authoritative content source. Structured to map 1:1 onto the
  JSON files the real site will read from (`identity.json`, `experience.json`, etc.). Still has a
  handful of `[CONFIRM]`/`[PENDING]` flags — see §6 below for how to handle those.

Suggested first planning-mode task: **read both uploaded files in full**, then produce a build plan
that sequences Phases B–J below, starting with JSON generation from the content doc. Don't wait on
the open content flags to start scaffolding; they're small enough to patch in later without
restructuring anything.

---

## 1 · Project summary

Reginald Tan (Singapore, SWE × financial markets) is building a personal portfolio site. Goal
audiences: finance, tech, and fintech roles — but the site is deliberately built to show he's more
than any one of those.

**Hosting now:** `klystrn.github.io` (GitHub Pages, user/org root site)
**Hosting later:** `reginaldtan.com` (already owned, via AWS Route 53) — deliberately deferred, see §7.

---

## 2 · Architecture (locked decisions — do not relitigate without good reason)

- **Hierarchy:** tabs → modes → views → items.
- **Two tabs:** `Professional` (default) and `Life` (**deferred** — stub/nav-entry only, no build work
  until Professional ships and has been live a while).
- **Professional has 3 modes:**
  - **Vanilla** — light editorial scroll site. Red accent `#d92b35`, Fraunces serif + Archivo sans.
    Default landing mode.
  - **Tech** — dark IDE simulation: file tree, editor tabs, working terminal, git-graph timeline.
    Cyan/violet accents.
  - **Finance** — dark brokerage terminal: watchlist, ticker detail, chart, trade ticket, news wire.
    Green/amber accents; red reserved strictly for losses.
- **Content parity rule (important):** one canonical dataset drives all three renderers. A project,
  skill, or experience entry is added once and must appear correctly in Vanilla, Tech, and Finance
  without per-mode duplication of the underlying data. Modes may add "furniture" (a terminal, a ticker
  tape) but never exclusive *substance* — if a fact only exists in one mode, that's a bug.
  - Depth layering: summary → detail → deep-dive, consistent across modes.
- **Nav:** semi-transparent blurred pill. Red italic "R." monogram (**typographic only — no
  hand-drawn signature**, that was explicitly ruled out). Professional tab has an extending mode
  segment (Vanilla · Tech · Finance) directly attached; Life tab sits separately on the far right.
- **Gamification principle — "optional depth":** a passive scroller gets 100% of the content with zero
  interaction required. Interactivity (constellation clicks, terminal commands, chart hovers) rewards
  the curious but never gates information behind it.
- **Custom cursor per mode** (already implemented in v6 as inline SVG data-URIs on `body[data-mode]`):
  Vanilla = dark ink arrow, red outline · Tech = cyan chevron `❯` · Finance = amber crosshair with a
  green center dot.
- **Life tab (future, not now):** an animated table scene — camera (→ photography portfolio), watch
  (→ family collection history dial), playing cards (→ cardistry minigame), namecard. Hover → modal →
  click → zoom transition into each hobby page. Keep this in mind for data-layer extensibility but
  build zero UI for it yet.

---

## 3 · What v6 already proves out (port this behavior, don't redesign it)

**Vanilla:**
Six-stat grid (2 director's lists / 9 years code / 2 years trading / 7 competitions / 11 projects /
16 workshops, in that order) · About section, 2 paragraphs · 4-phase timeline (SST → NP → JPMC →
Guards HQ) with typed sub-events (education/experience/service, extracurricular items folded in) ·
Experience cards (JPMC, Alibaba, SAF Guards HQ) that open a detail modal with a classification/privacy
note where relevant · Project grid: **5 flagship cards** (ATW, TCS, ATHN, FRTS, Panel Party — note
Sorts was deliberately swapped OUT to supplementary, Panel Party swapped IN) + a **supplementary
list** of 8 concise rows below it · Skills constellation (SVG, hand-laid-out coordinates, 4 hub nodes
+ ~21 leaf nodes + 1 context node) with **adjacency-based interaction**: hovering or clicking a node
highlights *only its direct edges* (hub connection + any explicit skill↔skill links defined in content
doc §7's "Connects to" column) — NOT the whole cluster — with a 0.25s opacity fade on non-highlighted
nodes/edges; click pins the state, click again or click background releases it · Awards/certs section,
certs shows a curated subset plus a "…and 7 more · view all ↗" control that opens a modal listing the
full 14 (this becomes a real Google Drive link once content doc §14 supplies the URL — see the
`DRIVE_URL` constant in the JS) · Testimonials (4 cards, 2 with placeholder quotes pending) · Small
icon-only footer (email/LinkedIn/GitHub circular icon buttons + a résumé pill button — **no footer
prose**, that was explicitly stripped).

**Tech:**
File tree sidebar with expand/collapse; **first-visit users see a pulsing dashed-border hint** telling
them to click into the tree (self-removes on first interaction) · Terminal starts by auto-running
`help` (not `whoami`) · Working, cwd-aware prompt (`~`, `~/experience`, `~/projects`,
`~/projects/supplementary`) driven by a small `FS` map + a real `cd` command (`cd experience`,
`cd ..`, `cd ~`) that also auto-expands the matching tree folder · Command set: `whoami · ls · cd · open
<path> · projects · contact · cv · stack · github · linkedin · email · mode <name> · date · echo ·
history · sudo hire-me · clear`, plus arrow-key command history · Native blinking text caret (not a
fake CSS block) that only blinks when the terminal is actually focused; clicking anywhere in the
terminal focuses the input · Terminal is taller (320px) with its own slim dark scrollbar · Long
file/folder names wrap instead of clipping when active/open (this directly answers a past ask about
sidebar text getting cut off as more nested files accumulate) · `projects/` folder shows the 5
flagship repos at the top level and nests the other 7 inside a `supplementary/` subfolder ·
`certs.lock` file lists all 14 certificates, not a curated subset · git-graph timeline with 15 commits
tagged by branch (`sst / np / work / saf / trade / xtra`), each colored by branch.

**Finance:**
Watchlist has **two tabs, FLAGSHIP and SUPPLEMENTARY**, rendering only the matching project set (OCS
was explicitly moved out of the flagship tab) · Selecting a project draws its chart from a 12-point
`curve` array with **milestone markers plotting at specific curve indices**, each with a hover tooltip
showing its label (`data-label`) — milestones are not decorative, they're the same milestones defined
in content doc §6 · Growth % (`+N pts`) is **derived**, computed at load as `last curve point − first
curve point`, never hand-typed, so it can't drift out of sync with the chart · News wire mixes GitHub
and LinkedIn style items with source chips (violet GITHUB / blue LINKEDIN) · The ticker tape at the
top uses a **`requestAnimationFrame` marquee**, not CSS keyframes: two identical content copies,
measured pixel width (re-measured after web fonts load and on resize, and defensively re-measured on
finance-mode entry since it was previously being measured while `display:none`), translated together
in a continuous loop — this is what makes it seamless with no restart-jump. **Port this exact
technique** as the `useMarquee` hook mentioned in the deploy phases below; don't re-implement the loop
from scratch, the width-measurement timing is the part that's easy to get wrong.

---

## 4 · Known rough edges to smooth out during the port (not blocking, just noted)

- The constellation's node coordinates are hand-placed magic numbers in the prototype. During the
  React port this is a good place to consider a light force-directed layout or at least named
  constants, since more skills will be added over time.
- `PROJECTS`, `FEED`, `FILES`, `COMMITS`, `XP_DETAILS`, `CERTS` are all inline JS arrays/objects in the
  prototype. In the real build these all come from `src/data/*.json` per §5 below — nothing should
  stay hardcoded in components.
- Two testimonial quotes (Rahul Varma, Dimuthu Makawita) are placeholder strings pending real quotes.
- `DRIVE_URL` is currently an empty string (falls back to an in-page modal). Set it once content doc
  §14 has the real Google Drive folder link.

---

## 5 · Content doc status (§ numbers refer to `CONTENT-DOC-reginald-v4.md`)

The doc is close to final. Outstanding flags, none of which should block scaffolding:

1. §1 — positioning line / sub-line / goal pull-quote marked `[CONFIRM]` (currently usable as-is)
2. §2 — "9 years writing code" has a soft arithmetic inconsistency against Sorts shipping in 2019 ⚠
3. §7 — design tool list conflict: draft mentions Adobe XD, an earlier pass said DaVinci ⚠
4. §8 — Ngee Ann Scholarship end year: 2022–2024 vs. an earlier 2022–2025 ⚠
5. §10 — two testimonial quotes still pending (Rahul Varma, Dimuthu Makawita) `[PENDING]`
6. §15 — two section header rewrites flagged as awkward, not yet replaced ⚠
7. §14 — asset checklist: CV PDF, testimonial PDFs, 2–3 personal photos, 1–3 images per flagship
   project, favicon, and the Google Drive certificates URL are all still `[PENDING]`
8. §6 — whether to include "locationX" (an SST capstone/NSG scheduling app) is an open `[CONFIRM]`

**Handling guidance:** generate the JSON bundle now using the doc's current best values, use the
placeholder text already present for anything still pending, and maintain a short `KNOWN-GAPS.md` (or
equivalent TODO) in the repo root that mirrors this list so nothing ships silently wrong. Don't block
Phase B–D work on any of these being resolved.

---

## 6 · JSON files to generate first (Phase A equivalent, now happening in Claude Code)

One file per content type, in `src/data/`:

```
identity.json · experience.json · education.json · projects.json · skills.json ·
awards.json · certs.json · testimonials.json · timeline.json · feed.json · headers.json
```

Each object should carry its per-mode fields exactly as used in v6 — e.g. a project object needs its
finance ticker symbol and curve/milestones, its tech repo slug and flagship/supplementary flag, and
its vanilla card copy, all in the same object. This is what makes the "add once, appears everywhere"
architecture real. The skills file should preserve the explicit `connects_to` links from content doc
§7 (not just cluster membership) — that's what powers the adjacency-highlight interaction in §3 above.

---

## 7 · Deployment plan

**Now — `klystrn.github.io`:**
- This is a **user/org Pages site**, which deploys from the repo root, not a subpath. In
  `vite.config.js`: `base: '/'` — not `/portfolio-v2/` or any subpath variant. This is the single most
  common GitHub Pages misconfiguration, worth double-checking.
- Branch first (`git checkout -b portfolio-v2` on the existing repo) so the currently-live old site
  stays untouched until the new one is ready to cut over.
- Settings → Pages → source should be **"GitHub Actions"**, not "Deploy from a branch."
- Deploy workflow: standard `actions/checkout` → `actions/setup-node` → `npm ci` → `npm run build` →
  `actions/upload-pages-artifact` → `actions/deploy-pages`, triggered on push to `main`.
- Cutover is just merging `portfolio-v2` into `main` — because this is the root user-Pages repo, no
  separate "point the domain here" step is needed; the domain is already `klystrn.github.io`.

**Later — `reginaldtan.com` via Route 53** (deliberately last, no rush):
Two options, both compatible with everything above:
- **Option 1 (fast, free):** keep GitHub Pages, just point Route 53 at it. Settings → Pages → Custom
  domain → `reginaldtan.com`. In Route 53: an A record at the apex pointing to GitHub Pages' four IPs
  (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`), plus a CNAME for `www` → `klystrn.github.io`.
  Enable "Enforce HTTPS" once DNS propagates. Add a `CNAME` file to `public/` so it survives future
  deploys.
- **Option 2 (full AWS):** S3 bucket + CloudFront distribution + ACM certificate + Route 53 alias
  record, with the GitHub Actions workflow extended to also `aws s3 sync` and invalidate the CloudFront
  cache. Only worth it if full AWS-native hosting is a goal in itself.

---

## 8 · Suggested phase sequence for planning mode to expand on

- **B — Environment:** branch, scaffold Vite + React (or `react-ts`), install
  `framer-motion gsap lucide-react react-router-dom`, Tailwind, set up the `src/data · chrome · modes ·
  lib` folder structure, confirm Pages settings.
- **C — Chrome & routing:** `PillNav`, mode-segment, `ModeContext` (`currentMode`, `seenModes` for the
  try-other-modes tracker), global toast, routes for `/`, `/tech`, `/finance`.
- **D — Port each mode:** Vanilla first (CSS modules over Tailwind for this mode specifically, given
  how bespoke it is), then Tech (terminal as a small reducer, file tree/repo views reading straight
  from `projects.json`/`experience.json`), then Finance (`useMarquee` hook per §3, chart + tooltip
  component). Life stays a stub.
- **E — Data wiring:** import all JSON, confirm zero hardcoded content strings remain outside
  `src/data/`, wire real assets as they arrive from §5's checklist.
- **F — Polish:** Framer Motion scroll-linked animation if the raw scroll-listener feels janky in
  React, optional mode-switch transition, accessibility pass (focus states, aria-labels, tab order
  through pill nav and terminal).
- **G — QA:** responsive check on a real phone (`npm run dev -- --host`), `prefers-reduced-motion`
  degradation check, Lighthouse pass, Safari spot check, broken-link sweep.
- **H — Deploy:** workflow file per §7, push, verify, merge to `main`.
- **I — Route 53 migration:** whenever ready, per §7's two options.
- **J — Post-launch:** Life tab build-out; ongoing additions to `feed.json`/`projects.json`/etc. should
  need zero per-mode extra work, proving the content-parity architecture held.

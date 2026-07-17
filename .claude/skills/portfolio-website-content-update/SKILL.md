---
name: portfolio-website-content-update
description: Apply an uploaded/edited portfolio content markdown doc (the "CONTENT-DOC-reginald-v*.md" format) or raw src/data/*.json exports to this site's JSON source files. Use when the user uploads or points to a content doc or JSON file and asks to update the website content, sync the JSON, or apply content changes. Handles the section→JSON mapping, the content-parity rule, and per-mode fields.
---

# Portfolio website content update

Turn an edited content markdown doc — or a raw uploaded `src/data/*.json` file — into changes
across `src/data/*.json`. The content doc (`docs/CONTENT-DOC-reginald-v4.md`) is the human-readable
source of truth; the JSON files are what the React app actually renders. Components carry **no**
content strings — everything lives in `src/data/`.

## Golden rules

1. **Apply deltas, don't overwrite.** An uploaded file — markdown doc or raw JSON — is often an
   *older copy* in some fields (the user edited one part and re-uploaded/exported from a stale
   working copy). Diff the upload against the **current repo state on `origin`** (fetch/pull first
   — the user may have pushed directly, bypassing any session) field by field. Apply only what
   genuinely changed; never regress a newer decision (e.g. a merged project, a revised cursor, a
   renamed header, a filled-in quote) just because the uploaded copy still shows the old version.
   When in doubt whether something is a real change or stale, ask.
2. **Direct pushes win.** If the user has edited and pushed JSON directly to the repo (rather than
   going through a session), treat that push as the most authoritative, freshest signal of intent —
   more authoritative than an upload sitting in the same conversation, and more authoritative than
   any content this session wrote earlier. Reconcile session-only code/UX changes (CSS, JSX, skills,
   non-content files) *on top of* the user's pushed content, not the other way around.
3. **Content parity.** One fact is authored once but carries per-mode fields in the same object. When
   you change a fact, update every per-mode variant of it (Vanilla / Tech / Finance) so the modes stay
   in sync. If a fact only renders in one mode, that's a bug.
4. **Never hand-write derived values.** These are computed at render from other data — leave them out:
   - Finance growth `chg` (`last curve point − first`) — `src/lib/projects.js`
   - Finance fundamentals strip (yrs active, projects, shipped, avg growth, positions, licences) and
     the sector-allocation percentages — `src/modes/finance/Finance.jsx`
   Only edit the inputs (curves, project entries, skill strengths), never the outputs.
5. **HTML fields.** Fields ending in `Html` (or containing `<b>`/`<em>`) are injected with
   `dangerouslySetInnerHTML`. Keep tags balanced. Bold proper nouns / key phrases in `aboutHtml`;
   the emphasised word per hero line is wrapped in `<em>`.
6. **New fields may need UI wiring, not just data.** If an upload adds a field with no consumer yet
   (e.g. a testimonial `url` for a Drive-hosted PDF), check whether it's meant to resolve a pending
   `KNOWN-GAPS.md` item — if so, wire a minimal, content-parity-respecting UI touchpoint (e.g. a
   "Read in full ↗" link) in every mode that renders that fact, don't just let the data sit unused.
7. **Keep the repo content doc in sync.** After editing JSON, mirror the same prose changes into
   `docs/CONTENT-DOC-reginald-v4.md` (mark them e.g. `UPDATED <date>`), and tick/update items in
   `KNOWN-GAPS.md`. The repo doc — not the upload — remains the canonical record.

## Section → file map

| Content-doc section | File | Key fields |
|---|---|---|
| §1 Identity | `src/data/identity.json` | `positioningLinesHtml[]` (rotating hero), `lede`, `status`, `goal`, `aboutHtml[]`, `eyebrow`, `name`, `credit`; `contact.*`; `finance.*`; `tech.*` |
| §2 Quick stats | `src/data/identity.json` | `stats[]` = `{ n, label, key }` (hand-authored counts) |
| §3 Experience | `src/data/experience.json` | per org: `role`,`when`,`org`,`orgShort`,`vanillaTag`,`vanillaDesc`,`financeTag`,`financeMeta`,`financeDesc`,`detail{meta,body,skills,stats,private}`,`tech{file,title,badges,bodyHtml,highlights}` |
| §4 Education | `src/data/education.json` | `school`,`programme`,`years`,`financeName`,`financeTag`,`financeMeta`,`financeDesc`,`academics`,`beyond` |
| §5 Positions / §11 Extracurricular | `src/data/timeline.json` | `phases[].miles[]` (`{b,text,when}`) and `commits[]` (Tech git-graph) |
| §6 Projects | `src/data/projects.json` | `{id,sym,flag,repo,title,sector,from,to,year,role,status,desc,skills,stats,langs,curve,miles,private?}`; flagship also `card{feat?,yr,title?,blurb,tags}`; supplementary also `mini{blurb,tag}` |
| §7 Skills | `src/data/skills.json` | `leaves[]`=`{name,strength,x,y,cluster,evidence,connects_to[]}`; `hubs`,`root`,`context`,`hubLinks`,`stack{}` |
| §8 Awards | `src/data/awards.json` | `{name,year,curated,tape?}` |
| §9 Certificates | `src/data/certs.json` | `{name,short,issuer,year,slug,curated}` |
| §10 Testimonials | `src/data/testimonials.json` | `{name,slug,title,titleFinance,quote,quoteFinance?,url?,financeTag}` (a pending quote is `quote: null`; `url` is an optional Drive link to the full testimonial) |
| §12 News feed | `src/data/feed.json` | `{t,src("gh"/"li"),xHtml,link}` |
| §13 Contact | `src/data/identity.json` | `contact.{email,linkedin,linkedinHandle,github,githubHandle,cvUrl,driveUrl}` |
| §15 Headers | `src/data/headers.json` | per section: `eyebrow`,`vanilla`,`vanillaSub`; `finance.*` |
| §16 Cursors / §17 Furniture | CSS/JSX, **not** JSON | `src/styles/enhancements.css`, mode components — only touch when the doc explicitly changes interaction/visual behaviour |

Notes:
- Flagship vs supplementary is the `flag` boolean in `projects.json`. Curves are 12-point arrays;
  milestones are `[curveIndex, label]` pairs that must reference valid indices 0–11.
- Constellation node coords (`x`,`y` in `skills.json`) are hand-placed — when adding a skill, pick a
  gap so its label doesn't overlap neighbours.
- Some fields resolve pending flags: e.g. a real CV file → `contact.cvUrl`; the Google Drive certs URL
  → `contact.driveUrl` (the "view all" button falls back to an in-page modal while empty); a
  testimonial `url` → resolves that person's pending PDF item in `KNOWN-GAPS.md`.

## Procedure

1. `git fetch`/pull the relevant branches first — never diff against a possibly-stale local checkout.
2. Read the uploaded file(s) **and** `docs/CONTENT-DOC-reginald-v4.md`. Diff field by field against
   the freshly-pulled current JSON to build a precise list of real changes (rules 1–2).
3. Edit the mapped JSON fields, updating every per-mode variant of each changed fact (rule 3), wiring
   any new-field UI touchpoints (rule 6), keeping HTML tags balanced (rule 5), and leaving derived
   values alone (rule 4).
4. Mirror the prose changes into `docs/CONTENT-DOC-reginald-v4.md` and update `KNOWN-GAPS.md`.
5. `npm run build` — must pass (also validates the JSON parses).
6. Verify visually before declaring done: serve `dist/` and screenshot the changed sections in the
   affected mode(s) with Playwright (Chromium at `/opt/pw-browsers/chromium`). Because these are
   client-routed pages, serve through a static server that falls back to `404.html` (the GH-Pages SPA
   shim) so `/tech` and `/finance` resolve — or drive mode switches via the nav from `/`.
7. Do **not** push or merge unless asked. Summarise what changed and which modes were affected.

# Story script format (`docs/STORY-SCRIPT.md`)

`docs/STORY-SCRIPT.md` is the **single editable source** for Story mode. `scripts/story/build.py`
validates it and compiles it to `src/story/story.json` (generated — never hand-edit). Art metadata
lives in `public/story/manifest.json`; full testimonial letters live in `docs/story/letters/`.

```text
docs/STORY-SCRIPT.md ──┐
docs/story/letters/*.md ├─► scripts/story/build.py ─► src/story/story.json ─► Story components
public/story/manifest.json ┘         │
src/data/*.json (cross-check only) ──┘
```

## 1. Hierarchy = heading levels

| Level | Heading | Example |
|---|---|---|
| `#` | `Chapter <slug>` or `Arc <slug>` | `# Chapter sst · SCHOOL OF SCIENCE & TECHNOLOGY` |
| `##` | `Story <ID>` | `## Story C03A · Learning to code together` |
| `###` | `Scene <ID>` | `### Scene C03-S01 · The classroom` |
| `####` | `Panel <ID>` | `#### Panel C03-S01-P01 · Python classroom` |
| `#####` | `Item <id>` (only inside a `PANEL_SELECTION`) | `##### Item present-trading` |

Text after ` · ` is a human label only — you can rename it freely. **The ID is what links things.**

### IDs are permanent
- Never renumber. If you insert a panel between `P01` and `P02`, call it `P05` (next free number).
  Reading order is the order in the file, not the number.
- Deleting a panel is fine; just don't reuse its ID for something else.
- Chapter / arc slugs become URLs (`/story/chapter/<slug>`, `/story/arc/<slug>`) — lowercase,
  digits and hyphens only. Changing one breaks shared links.

## 2. Metadata block

Directly under a heading, an optional fenced block tagged `story` holds `key: value` lines:

````markdown
#### Panel C05-S07-P01 · Achievements & Milestones
```story
type: PANEL_SELECTION
layout: {desktop: 2x2, mobile: stack}
portal: [testimonial-rahul]
```
````

Values: plain text, `[a, b]` lists, or `{k: v, k2: v2}` (one level). `#` starts a comment.

### Keys by node

| Node | Keys |
|---|---|
| Chapter | `order` (required), `title` (required), `years`, `category`, `title_type` (`TITLE_HERO` / `TITLE_CHAPTER`), `data_ref`, `status` |
| Arc | `kind` (`project` / `daily-life` / `achievement` / `testimonial`), `parent` (panel ID to return to), `portal` (past-tense label), `title`, `data_ref`, `letter` (testimonials), `status` |
| Story / Scene | `status` (optional) |
| Panel | `type` (required), `art`, `interaction`, `portal` (list of arc slugs), `skills`, `data_ref`, `layout`, `status` |
| Item | `title` (required), `art` (required), `arc`, `skills`, `status` |

`status`: `draft` (default) · `approved` · `hold` (exists but hidden from the public build — e.g. a
future event).

## 3. Panel types

`TITLE_HERO` · `TITLE_CHAPTER` · `PANEL_SPLASH` · `PANEL_STANDARD` · `PANEL_SELECTION` ·
`PANEL_EVIDENCE` · `PANEL_TESTIMONIAL` · `PANEL_TRANSITION`

## 4. Copy lines

One line each, optionally starting with `- `:

```
PREFIX[speaker] {status}: text
```

| Prefix | Rendered as | Published? |
|---|---|---|
| `NAR` | narration box (first person, present tense) | yes |
| `THO` | thought bubble | yes |
| `DIA[Name]` | speech balloon — dramatised dialogue | yes |
| `SUB` | expanded subtitle (selection items) | yes |
| `FAC` | fact box | yes |
| `SKL` | skills sidecar (1–3 items, comma separated) | yes |
| `SFX` | hand-lettered sound effect | yes |
| `PORTAL[arc-slug]` | button to a side story, past-tense label | yes |
| `MODAL[Button label]` | button that opens a pop-up list; items separated by ` · ` | yes |
| `ALT` | image alt text | yes (screen readers) |
| `VISUAL` | what the art shows | no — production note |
| `NOTE` | editorial/production note | no |

`{status}` on publishable lines: `{draft}` (default if omitted) · `{approved}` · `{edit}` (you
must change/confirm it). Inline `[EDIT: …]` anywhere marks a gap to fill.

## 5. Build commands

```bash
python3 scripts/story/build.py              # validate + write src/story/story.json (dev mode)
python3 scripts/story/build.py --todo       # list every {edit} line and [EDIT: …] marker by ID
python3 scripts/story/build.py --sync-manifest   # add pending manifest entries for new art IDs
python3 scripts/story/build.py --release    # strict: fails unless everything public is approved
python3 scripts/story/build.py --check      # fails if story.json is out of date (for CI)
```

### Errors (block the build)
Unparseable heading/meta, duplicate IDs, panel outside a scene, unknown `type`, `portal`/`arc`/
`parent` pointing nowhere, bad slug, private-data patterns (NRIC, phone numbers, emails).
In `--release` additionally: any published line or node not `approved`, unresolved `[EDIT: …]`,
art not `approved-for-publication` in the manifest, missing desktop/mobile crop/full variants on
selection items, testimonial letter not `approved` or empty.

### Warnings (report, don't block)
Scene copy over 45 words, main path over 42 panels, art ID missing from manifest, panel ID not
prefixed by its scene ID, `data_ref` years/names/titles that disagree with `src/data/*.json`,
skills not found in `src/data/skills.json`.

## 6. Testimonial letters

`docs/story/letters/<slug>.md` — a `story` meta block (`name`, `title`, `data_ref`, `status`)
followed by `## Text` with the verbatim letter. Status: `awaiting-text` → `transcribed` (text
pasted, not yet checked) → `approved` → `published`. The reader only renders text whose status is `approved` or `published`. Never write,
paraphrase or "improve" letter text.

## 7. Asset manifest (`public/story/manifest.json`)

Keyed by art ID. Each entry: `scene_ids`, `kind`, `description`, `character_age`, `status`
(`pending` · `approved-for-generation` · `generated` · `approved-for-publication` · `rejected`),
`rights` (`not_reviewed` · `self` · `consented` · `anonymised` · `licensed`), `subjects`,
`references` (opaque private IDs only, e.g. `private:ref-current-03` — never paths, URLs or
photos), `model`, `prompt`, `cost`, `hosting` (`repo` · `external`), `variants`
(`desktop`/`mobile` × `crop`/`full`), `motion`.

**Never put in the public repo:** raw face photos, workplace documents, trading statements, client
materials, credentials, or private reference URLs.

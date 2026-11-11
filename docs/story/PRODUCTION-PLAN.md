# Story mode — production plan (v0.4)

Condensed from the v0.3 production brief, reference handoff and the 2026-11-11 audit. Decisions:
`DECISIONS.md` · What's left for you: `EDIT-LIST.md` · Script format: `SCHEMA.md`.

> **Production lock.** Nothing here authorises changing the live site, adding `/story`, installing
> or authenticating Higgsfield, training a Soul ID, uploading photos, generating images/video or
> spending credits. Each phase starts only when Reginald names it.

## 1. Concept
A cinematic, scroll-driven autobiographical comic — original painterly 3D-like forms, tactile brush
texture, 2D ink effects, crimson / near-black / ivory with restrained gold and teal. Flashbacks and
build scenes mostly black and white; colour marks what matters or is interactive. Influenced by
the *impact* of Arcane/VALORANT cinematics and manga/Western panel grammar — never their
characters, frames, logos or marks.

Hierarchy: **Chapter → Story → Scene → Panel**; **Arc** = optional, shareable side story with a
return to its parent panel. Present tense in story and arcs, past tense on portal labels,
conditional in Future Plans.

## 2. Chapters
| # | Slug | Title | Years | Category |
|---|---|---|---|---|
| 1 | `opening` | REGINALD TAN / 陈彦杰 (`PORTFOLIO` typed above) | — | — |
| 2 | `present` | WHAT I'M DOING NOW | — | — |
| 3 | `sst` | SCHOOL OF SCIENCE & TECHNOLOGY | 2018–2021 | education |
| 4 | `np` | NGEE ANN POLYTECHNIC | 2022–2025 | education |
| 5 | `jpmorgan` | JPMorganChase | 2024–2025 | career |
| 6 | `guards` | GUARDS FORMATION | 2025–2027 | national service |
| 7 | `registudio` | REGISTUDIO (concurrent with NS) | 2026–present | running a business |
| 8 | `future` | FUTURE PLANS (imagined) | — | — |

Main path: **37 panels** (budget 30–42). 20 arcs: `frats`, `overflow`, `tya`, `trading-nebius`,
`imperium`, `market-city`, `guards-media`, `guards-ai`, `guards-life`, `registudio-business`,
`design-playground`, 4 × `jpm-*`, 5 × `testimonial-*`.

## 3. Repo map
| Path | Role | Status |
|---|---|---|
| `docs/STORY-SCRIPT.md` | Single editable script | v0.4 draft |
| `docs/story/letters/*.md` | Verbatim testimonial letters | awaiting text |
| `docs/story/*.md` | Schema, edit list, decisions, this plan | current |
| `scripts/story/build.py` | Validator / compiler (stdlib Python) | working |
| `src/story/story.json` | Generated — never hand-edit | generated (dev) |
| `public/story/manifest.json` | Art registry: provenance, rights, status, variants | 88 IDs, all `pending` |
| `.claude/skills/portfolio-story-content-update/` | How Claude edits Story content safely | current |
| `docs/story/storyboards/`, `docs/story/viewer/` | Storyboards + Storyboard Room (artifact) | 49/67 scenes drafted |
| `src/modes/story/`, `/story` route | Components and routes | **not built** (Phase E) |
| `src/modes/cv/`, `/cv` route | Interactive CV | **not built** (Phase F) |

## 4. Phases and gates
| Phase | Work | Gate (explicit go from Reginald) |
|---|---|---|
| **A** Script | Fill `EDIT-LIST.md`; mark lines `{approved}` | Script sign-off |
| **B** Storyboards *(in progress)* | Every scene gets a storyboard (`docs/story/storyboards/`), reviewed in the Storyboard Room (https://claude.ai/artifact/SwkpGXkwGMVKsYQV5MVN5x); then a numbered master asset list with cost estimates | **No asset generation for a scene until its storyboard is approved**; asset list approved |
| **C** Soul ID characters | Verify current Higgsfield models/prices (read-only, with permission). Consented photos kept outside git. Character bible and age variants as stills first | "Approve Batch C-n" per batch |
| **D** Kling transitions | Only from approved stills and locked storyboards; still fallbacks | "Approve Batch D-n" per batch |
| **E0** Placeholder | Inert `/story/*` Coming Soon route; `/` untouched; tests | "Start placeholder" |
| **E** Story build | Reviewable PRs: compiler in CI → components with dev placeholders → nav (dock, rail, deep links, scroll ownership, per-route OG stubs) → chapters → arcs → a11y/perf/analytics | Each PR reviewed |
| **F** CV | Semantic A4 HTML viewer, zoom/pan, hotspots, print CSS, separate ATS PDF | CV approved |
| **G** Launch | Paper → `/paper`; redirect `/?project=` and `/?xp=`; re-point tests; sitemap | Explicit launch go |

### Batch approval form (Phases C and D — shown before anything runs)
Batch ID and scene/arc IDs · purpose and art IDs · model, mode, expected credits / cap · exact
prompts and negative constraints · reference inputs and subject consent · quantity, resolution,
aspect, responsive crops (and duration for clips) · rights/privacy/brand checks · reused approved
frames · fallback · **explicit "approve Batch X"**.

## 5. Architecture notes for Phase E (from the audit)
- `ModeContext.jsx` maps exact paths only — `/story/*` needs a `startsWith` branch like `/life`.
- `ModeProvider` calls `scrollTo(0,0)` on mode change *after* child effects run, which would undo
  chapter deep-link scrolling. Story must own its scroll restoration.
- GitHub Pages SPA fallback (`public/404.html` ↔ `index.html`) already handles deep paths.
- Shared links need per-route OG tags: generate static `dist/story/{chapter,arc}/<slug>/index.html`
  stubs from `story.json` at build time.
- Paper's section rail (`Furniture.jsx` `SectionRail`) is the logic model for the chapter rail; on
  mobile combine rail + mode dock into one drawer.
- Fonts: condensed heavy Latin via the existing `@fontsource-variable/archivo` width axis; a CJK
  Black face subset to 陈彦杰 only.
- Keep heavy media out of git history (GitHub Pages limits); manifest `hosting: external`.
- Launch: `tests/content.spec.js` asserts Paper content on `/` — re-point when Paper moves.

## 6. Reference notes
- **REF-HERO-02** (heavy condensed ivory title, red heavy-sans CJK in the counters) is the direct
  hero model. **REF-HERO-01** shows the small eyebrow and credits tiers — a model for the chapter
  plate's years/category line. Don't copy the V-mark or `// … //` styling.
- **REF-SCROLL-01** (11.4 s MP4, reviewed as 18 extracted frames): sparse white paper with muted
  ochre figures and small clipped caption boxes → a circle motif carried across scenes (moon →
  sphere → red disc → arch window) as a shape match-cut → one full red takeover with an
  interactive-looking orb → ink-scratch wipe → red columns with a letterboxed eye-strip inset.
  Lesson: red is a climax, not a constant; each chapter can earn one takeover. Scroll mapping isn't
  recoverable from the recording.
- The three YouTube/Instagram links were blocked from the build session — supply timestamps or
  screenshots if they matter.

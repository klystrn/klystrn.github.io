# What you need to edit — and what can be storyboarded now

**Updated 2026-11-11.** Work through this on your desktop clone, then run:

```bash
python3 scripts/story/build.py --todo    # the live version of section 1
python3 scripts/story/build.py           # must end with 0 error(s)
```

Search the script for the **panel ID** (e.g. `C04-S05-P01`) — line numbers shift as you edit.
When a line is final, change `{draft}` / `{edit}` to `{approved}`. Delete anything you'd rather
not publish; a deleted panel just disappears (don't reuse its ID).

---

## 1. Gaps in `docs/STORY-SCRIPT.md` (33 markers)

### Main story — 12 (none of these block storyboarding)
| Panel | What to supply |
|---|---|
| `C01-S01-P02` | Pick one opening line, the alternative in the NOTE, or delete both (silent opening) |
| `C03-S01-P02` | Year of the NRIC validator + one sentence on what it checked |
| `C04-S05-P01` | Rough month/year of the JPM call; how you reacted; check the caller's dramatised line |
| `C05-S02-P01` | Which project you talked about with Rahul on day one |
| `C05-S04-P02` | The specific blocker (optional) |
| `C06-S01-P02` | How much medical detail to show (currently just "pneumonia") |
| `C06-S02-P01` | Your first camera assignment and why it mattered |
| `guards-life-media` | Keep this 4th daily-life card, replace it, or delete it (→ 3-card board) |
| `C07-S01-P01` | Month/year of the friend's call |
| `C07-S02-P01` | Month/year the first client was secured |
| `C07-S05-P02` | What Design Playground does today, and any real time saved |

### Arcs — 21 (these block the *arc's* storyboard, not the main story)
| Arc | Panels | What to supply |
|---|---|---|
| `frats` | A-FR-S02-P01, S02-P02, S03-P01 | Modules you built · one real technical problem · result/lesson |
| `tya` | A-TY-S01-P01, P02 | Why/how often · one anonymised tutoring moment |
| `trading-nebius` | A-NB-S02-P01, S03-P01, S04-P01 | Entry criteria and risk rules · **entry/exit month/year, confirm ticker NBIS** · one real lesson |
| `imperium` | A-IM-S01-P01, S03-P01 | What problem made you build ATW · what Imperium adds |
| `market-city` | A-MC-S02-P01 | City or constellation layout · one real build problem |
| `guards-media` | A-GM-S01-P02 | One leadership lesson |
| `guards-ai` | A-GA-S01-P01 | The workflow you're proudest of and what it saved |
| `registudio-business` | A-RS-S01-P01, S02-P01 | Why you started / who for / first price formula · first project scope and timeline |
| `design-playground` | A-DP-S01-P01, S02-P01 | Where one-off styling slowed you · real impact or "goal" |
| `jpm-data-retrieval` | A-JR-S01-P01, P02 | What was being retrieved (non-confidential) · what you changed |
| `jpm-visualisation` | A-JV-S01-P01 | Which decision the tool made easier |
| `jpm-migration` | A-JM-S01-P01 | Your tasks vs the team's |

---

## 2. Not marked in the script, but needs you

1. **Paste the four testimonial letters** into `docs/story/letters/{jovita-tang,keith-wee,dimuthu-makawita,rahul-varma}.md`
   under `## Text`, verbatim, then set `status: approved`. (Drive was blocked from the build
   session, so I couldn't transcribe them.) Leave `yap-shi-hao.md` as `awaiting-text`.
2. **Teacher titles.** The script uses the live-site titles from `src/data/testimonials.json`:
   Jovita Tang — *ML & NLP Specialist · Mathematics & Computing, SST*; Keith Wee —
   *Service-Learning In-Charge · Mathematics, SST*. Your manuscript said "Computing+, form teacher"
   and "ACE teacher-in-charge". If the manuscript is right, change `testimonials.json` (and the
   content doc) — the build warns while they disagree.
3. **Dramatised dialogue I drafted** — read each and rewrite in your voice or delete:
   `C03-S01-P02` Friend · `C04-S05-P01/P02` Caller · `C05-S02-P01` Rahul · `C05-S03-P01` Rahul ·
   `C05-S05-P01` Coworker · `C06-S03-P01` Yap Shi Hao · `C07-S01-P01` Friend.
4. **Live-site wording I changed** (check `git diff`):
   - Guards team 8 → **9** everywhere (experience, timeline, feed, content doc).
   - locationX role "Solo builder" → **"Team build with friends"** (`projects.json`, content doc).
   - ATW description + card blurb now end: *"Two larger components are in progress: Imperium, a
     trading-workflow app, and Market City, a spatial way to visualise markets."* Rewrite if my
     one-line descriptions of Imperium/Market City are off.
5. **Live-site items you may want to change** (I didn't touch them):
   - "+250% sign-ups" for ACE still appears in `timeline.json` (Tech git graph) and the content
     doc, next to "25% of SCS volunteers". Keep both, or drop the 250%?
   - Ex COORES and the Guards chatbot are labelled "classified" on the live site. You said
     everything is publicly discussable — remove those privacy notes?
   - "Trading Universe" isn't used anywhere now; I treated it as another name for ATW.
6. **Client confidentiality.** `storyline.md` named two prospects/clients. I kept them out of
   the repo (it's public). Keep it that way.
7. **Hero choice** — after the wireframes (storyboard item 1 below): pose A/B/C and 1- vs 2-line name.

---

## 3. What can be storyboarded now

Storyboards are rough layout boards (boxes, silhouettes, camera, text placement). They don't need
final copy or any generated art.

### Ready now — 34 of 37 main-path panels
| Chapter | Panels |
|---|---|
| Opening | `C01-S01-P01` as 6 wireframes (A/B/C × 1/2 lines), `C01-S01-P02` |
| Present | `C02-S01-P01` (3 cards: crop vs full framing), `C02-S01-P04` |
| SST | `C03-S01-P01`, `C03-S01-P02`, `C03-S02-P01`, `C03-S03-P01` |
| NP | `C04-S01-P01`, `C04-S01-P02`, `C04-S02-P01`, `C04-S03-P01`, `C04-S05-P01`, `C04-S05-P02` |
| JPMorganChase | `C05-S01-P01` → `C05-S07-P01` (all 8, plus the 4 milestone cards) |
| Guards | `C06-S01-P01`, `C06-S01-P02`, `C06-S03-P01`, `C06-S03-P02` |
| RegiStudio | `C07-S01-P01`, `C07-S02-P01`, `C07-S03-P01`, `C07-S05-P01`, `C07-S07-P01` |
| Future | `C08-S01-P01`, `C08-S02-P01`, `C08-S03-P01` |

### Ready with a placeholder — 2
- `C06-S02-P01` (first camera) — frame now, swap the subject when you name the assignment.
- `C07-S05-P02` (Design Playground) — frame now, real components drop in later.

### Waiting on you — 1
- `C06-S04-P01` daily-life board — decide the 4th card first.

### Arcs
- **Ready now:** `overflow`, `guards-life`, `jpm-multilob`, all five testimonial arcs (shared
  three-scene layout; Yap stays a "coming soon" teaser).
- **After your arc edits (section 1):** `frats`, `tya`, `trading-nebius`, `imperium`,
  `market-city`, `guards-media`, `guards-ai`, `registudio-business`, `design-playground`,
  `jpm-data-retrieval`, `jpm-visualisation`, `jpm-migration`.

### Shared components to board alongside
Chapter title plate · arc title plate · selection panel (3-up, 2×2, mobile stack) · letter reader ·
skills sidecar · portal inset · right-side chapter rail + mode dock (desktop) and the single mobile
drawer.

---

## 4. Reference material to gather for storyboarding (keep out of the public repo)

Storyboards only need **public or non-sensitive** references. Personal photos come later (Soul ID
phase) and never go into this repo.

- Public exterior references: CapitaSpring, SST, Ngee Ann Polytechnic, Botanic Gardens amphitheatre.
- Your own screenshots: The Tea Shop, FRATS (synthetic faces only), Panel Party, ATW output,
  Imperium and Market City work-in-progress screens, Design Playground components.
- Scans: DrCT Bronze certificate, NP awards (optional, for the drawer).
- Published Guards HQ photos you'd like to feature (for `guards-media`).
- Timestamps or screenshots from the three YouTube/Instagram references (blocked from the build
  session).

# Story mode — decisions log

Resolved decisions. Newest first. The script (`docs/STORY-SCRIPT.md`) and `src/data/*.json`
already reflect everything here.

## 2026-11-11 — storyboarding phase started

| Topic | Decision |
|---|---|
| Branch | All changes go straight to `main` from now on (each push deploys the live site). |
| Storyboard gate | Every scene gets its own storyboard; no Higgsfield generation for a scene until its storyboard is approved. |
| Review tool | Storyboard Room artifact; reviews saved there are synced into the script as `storyboard: approved / revise`. |
| Letters | Six letters supplied as PDFs; transcribed verbatim (contact details removed), status `transcribed` until you approve. |
| Victor Lum | New testimonial (Senior Lecturer, School of ICT, NP; your advisor for 3 years) → arc `testimonial-victor`, linked from C04-S02-P01. |
| ACE | Per Keith Wee's letter: Overall-In-Charge of SCS@ACE; 129 volunteers for Relay For Life 2020, nearly 25% of SCS's national target. |

## 2026-11-11 — answers to the v0.3 audit

| # | Topic | Decision | Applied in |
|---|---|---|---|
| 1 | Trading timeline | Trading started **2024**; went deeper during NS. | Present card subtitle, Guards daily-life card, Nebius arc. Live-site "years trading since 2024" stays correct. |
| 1 | Trading products | Imperium, Market City and "Trading Universe" are all part of the **Automated Trading Workflow (ATW)**. Imperium and Market City are **work in progress**. | `projects.json` ATW `desc` + `card.blurb`, content doc §6, arcs `imperium` and `market-city` (`data_ref: projects:atw`). |
| 2 | Nebius `$90 → $299` | Your **own entry and exit** prices. Public. Dates to be supplied. | Arc `trading-nebius` A-NB-S03-P01. |
| 3 | Alibaba Cloud | **Excluded from Story**; stays everywhere else in the portfolio. | No Story panel. `experience.json` unchanged. |
| 4 | ACE | **25% of Singapore Cancer Society's volunteers** (Chairperson, ACE board, 2020). | C03-S02-P01. |
| 4 | locationX / NRIC validator | locationX built **with friends**; NRIC validator **solo**. | C03-S01-P02; `projects.json` locationX role; content doc §6. |
| 5 | JPM baseline | What the live site already says (AWS, Athena, CEM, FX Cash & Options, global multi-LOB use) is the **cleared baseline**. | Chapter 5, JPM arcs. |
| 5 | 4h → 30s | A tasking where you optimised a data-retrieval process from ~4 hours to ~30 seconds. | Milestone card `ms-retrieval`, arc `jpm-data-retrieval`. |
| 5 | Multi-LOB | Other lines of business **used your work**; you **supported and coordinated**. | Card `ms-multilob` ("Supported a multi-line-of-business rollout"), arc `jpm-multilob`. |
| 6 | Testimonials | Transcribe the full letters into the reader. **Handovers are a story device** and needn't have happened. | Testimonial arcs; letter files in `docs/story/letters/` (text still to paste). |
| 6 | Yap Shi Hao | **Head of Manpower, Guards Formation.** Letter not yet received. | C06-S03-P01, arc `testimonial-yap` (`status: hold`, "coming soon"). |
| 7 | Guards role | Team Manager, **team of 9** (new joiner). Everything else is publicly discussable (pneumonia, AI Task Force, chatbot, Recruitment Board, social accounts). | Chapter 6; `experience.json`, `timeline.json`, `feed.json`, content doc. |
| 7 | CKF | Another way of saying Guards and its partners in the Navy and Air Force — not a separate organisation. | Story uses "Guards Formation" / "Guards HQ". |
| 8 | Ongoing dates | Show the date only — no "expected". | Guards chapter shows `2025–2027`. |
| 9 | Length | Merge the main path to ≤ 42 panels. | 54 → **37** panels (see below). |
| 9 | Dialogue | Not blocked. Dramatised lines are fine; you delete what needs redacting. | `DIA[...] {draft}` lines added. |

### Panel merges (54 → 37)
- Testimonial panels became portals on existing panels: C03-S04, C04-S06, C05-S08, C06-S08.
- Merged pairs: ACE (C03-S02), DrCT (C03-S03), JPM conference + Rahul (C05-S02), desk + brief (C05-S03), Grafana + update (C05-S05), pricing setback + repricing (C07-S03 + S04).
- Guards trading/projects/gym-cardistry panels (C06-S05–S07) folded into the daily-life board (C06-S04).
- NP recognition panel (C04-S04) became an evidence drawer on C04-S01-P01.
- Auction House (C07-S06) moved into the `registudio-business` arc.

## Standing rules (from the production plan)
- `/` stays Paper until you explicitly authorise launch. `/story` is built only when you approve that phase.
- No Higgsfield / Soul ID / Kling / paid generation without explicit approval of a specific, itemised batch.
- No raw personal photos, workplace documents, trading statements, client materials or credentials in this public repo.
- Never fabricate testimonial text, signatures, certificates or results. Future scenes are labelled as imagined.

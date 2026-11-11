---
name: portfolio-story-content-update
description: Edit Story mode content — the comic screenplay in docs/STORY-SCRIPT.md, testimonial letters in docs/story/letters/, and the art registry public/story/manifest.json — then validate with scripts/story/build.py and show a diff. Use for requests like "update Story chapter 4", "change the JPM milestone cards", "add a panel to the Guards chapter", "paste Rahul's letter into the reader", "mark the SST chapter approved", or "add a new arc". Not for Paper/Tech/Finance/Life facts (use portfolio-website-content-update) and never a licence to generate images or video.
---

# Portfolio Story content update

Story mode is a scroll-driven autobiographical comic. Its content is **independent narrative
content**: it does not follow the Paper/Tech/Finance content-parity rule, but its facts must not
contradict `src/data/*.json`.

| Source | Edit? |
|---|---|
| `docs/STORY-SCRIPT.md` | **Yes** — the single script (format: `docs/story/SCHEMA.md`) |
| `docs/story/letters/<slug>.md` | Yes — verbatim letter text only, pasted by Reginald |
| `public/story/manifest.json` | Yes — art metadata; add entries with `--sync-manifest` |
| `docs/story/EDIT-LIST.md`, `DECISIONS.md` | Yes — keep them current |
| `src/story/story.json` | **Never by hand** — regenerate with the build |
| React components under `src/modes/story/` | **No** for copy/image changes. Only when the user asks for behaviour/layout changes. |

## Golden rules

1. **Fetch first, apply deltas.** `git fetch` and work from the latest branch state. An uploaded
   script/manuscript may be stale — change only what the user actually changed. Direct pushes by
   the user win.
2. **IDs are permanent.** Never renumber or reuse panel/scene/story IDs or chapter/arc slugs (slugs
   are public URLs). New panels take the next free number; reading order is file order.
3. **Never mark something approved on your own.** Only Reginald turns `{draft}`/`{edit}` into
   `{approved}`, or a node/letter/art status into approved. You may set `{edit}` and add
   `[EDIT: …]` markers to flag gaps.
4. **Never fabricate.** No invented testimonial text, signatures, certificates, metrics, trading
   results or project features. Letter files contain only verbatim text the user supplied.
   Dramatised dialogue is allowed only as `DIA[...] {draft}` and only where the user wants it.
5. **Keep facts consistent with `src/data`.** If a Story fact changes a real-world fact (role,
   dates, team size, metric), ask whether `src/data/*.json` should change too; if yes, apply that
   with the `portfolio-website-content-update` skill (content parity, content doc,
   `KNOWN-GAPS.md`). The build warns on drift — resolve or explain every new warning.
6. **Public repo.** No raw photos, workplace documents, trading statements, client names or
   materials, phone numbers, emails, NRICs or private URLs in the script or manifest. Manifest
   `references` are opaque IDs (`private:ref-…`) only. Client names stay anonymous.
7. **Future stays future.** Unhappened events (e.g. ORD 2027, the pending Yap Shi Hao
   testimonial) stay `status: hold` / "coming soon" and are never depicted as done.
8. **No generation, ever, from a content request.** Editing the script or manifest never
   authorises Higgsfield, Soul ID training, photo uploads, Kling, or any paid model. Those need an
   itemised batch the user explicitly approves ("approve Batch X") — see
   `docs/story/PRODUCTION-PLAN.md`.
9. **Copy budget.** ≤ 45 words of NAR/THO/DIA per scene; main path ≤ 42 panels. If an edit breaks
   the budget, propose moving detail into an arc rather than silently cutting the user's words.

## Procedure

1. `git fetch` and update the working branch.
2. Read `docs/story/SCHEMA.md` (format) and the relevant part of `docs/STORY-SCRIPT.md`.
3. Make the edit in the script / letters / manifest. If you add or rename art IDs, run
   `python3 scripts/story/build.py --sync-manifest`.
4. Run `python3 scripts/story/build.py` — it must end with **0 errors**. Read the warnings and fix
   or report any new ones. Run `--todo` if the user asks what's left.
5. Show the user a concise diff summary: which IDs changed, any new `{edit}` markers, any `src/data`
   drift warnings, and the panel count.
6. If React code exists and was touched, run `npm run build` and `npm test`.
7. Don't push or merge unless asked.

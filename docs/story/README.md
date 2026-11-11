# Story mode — working docs

| File | What it is |
|---|---|
| [`../STORY-SCRIPT.md`](../STORY-SCRIPT.md) | **The script.** The only file you edit for Story copy. |
| [`EDIT-LIST.md`](EDIT-LIST.md) | What you still need to fill in, and what can be storyboarded now. |
| [`SCHEMA.md`](SCHEMA.md) | Script format: headings, IDs, meta blocks, copy-line prefixes, statuses. |
| [`DECISIONS.md`](DECISIONS.md) | Resolved decisions log. |
| [`PRODUCTION-PLAN.md`](PRODUCTION-PLAN.md) | Phases A–G, gates, generation approval form, architecture notes. |
| [`STORYBOARDS.md`](STORYBOARDS.md) | Storyboard sketch format and how approval works. |
| [`STORYBOARD-STATUS.md`](STORYBOARD-STATUS.md) | Generated: every scene's storyboard state. |
| [`storyboards/`](storyboards/) | Storyboard sketches, one file per chapter (+ arcs). |
| [`viewer/`](viewer/) | Storyboard Room: `template.html` (source) → `index.html` (generated; open locally or at https://claude.ai/artifact/SwkpGXkwGMVKsYQV5MVN5x). |
| [`REFERENCES.md`](REFERENCES.md) | Reference images to collect before generation (by scene; pending arcs sidelined). |
| [`STORYBOARD-REVIEWS.md`](STORYBOARD-REVIEWS.md) | Log of your storyboard reviews and what was done. |
| [`letters/`](letters/) | Verbatim testimonial letters (one file per person). |

Related: `public/story/manifest.json` (art registry) · `scripts/story/build.py` (validator) ·
`src/story/story.json` (generated output — don't edit).

## Everyday loop

```bash
python3 scripts/story/build.py --todo          # what's left to fill
# …edit docs/STORY-SCRIPT.md…
python3 scripts/story/build.py --sync-manifest # if you added new art IDs
python3 scripts/story/build.py                 # 0 errors → story.json rewritten
git diff
```

`--release` is the publication gate: it fails until every public line is `{approved}`, every
letter is approved and every image is `approved-for-publication`. It's expected to fail today.

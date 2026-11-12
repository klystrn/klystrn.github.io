# Batch C-1 proposal: Soul ID sample (present day), NOT APPROVED

Status: **draft, blocked**. Nothing in this file has been run. No Higgsfield call, Soul ID training,
photo upload, Kling call or credit spend happens until Reginald replies **"approve Batch C-1"**
after the blockers below are cleared and the open values are filled in.

## Blockers (must clear before this can be approved)
1. **Reference photos.** The Storyboard Room's `REF-YOU-2026` slot is empty. Soul ID needs a set of
   current, consented photos of you (Higgsfield's guidance is roughly 20+ varied, well-lit photos;
   to be confirmed). They stay in the artifact's private storage, never in this public repo.
2. **Higgsfield access in a session.** No Higgsfield tools are connected in this session. You set up
   the connector or CLI and sign in yourself in the browser; Claude never handles credentials.
3. **Verified models and prices.** Current Soul ID availability, model IDs, credit costs and whether
   Soul ID characters can be used with Kling must be checked read-only once access exists. The
   values marked `TBC` below are placeholders, not quotes.
4. **Storyboard approvals.** Generation is only allowed for scenes whose storyboard is approved. C-1
   uses the hero (C01-S01, drafted) and Present Day (C02-S01, reopened). Approve those storyboards
   first, or approve C-1 as a character-bible test that is not used on the site.

## Purpose
Train one Soul ID of present-day Reginald and generate a few still test images, to judge likeness
before any production assets (character bible, ages, outfits, watches, Ducky) are proposed in
Batch C-2 onward.

## Items
| # | ID | Purpose | Model | Inputs | Output | Aspect | Count | Used on site? |
|---|---|---|---|---|---|---|---|---|
| 1 | `soul-reginald-2026` | Train the Soul ID | Higgsfield Soul ID (TBC) | REF-YOU-2026 photos (you supply and consent) | Character ID | n/a | 1 | No |
| 2 | `cb-present-front` | Character bible: front, neutral light | Soul (TBC) + item 1 | item 1 | Still | 3:4 | 4 variations | No (review only) |
| 3 | `cb-present-34` | Character bible: three-quarter, work shirt | Soul (TBC) + item 1 | item 1 | Still | 3:4 | 4 | No |
| 4 | `hero-sample` | C01-S01 hero plate test (upper body, arms folded, red rim light) | Soul (TBC) + item 1 | item 1, storyboard C01-S01 | Still, text-free | 16:9 + 9:16 | 2 + 2 | Only after you approve the result and the storyboard |
| 5 | `present-ponder-sample` | C02-S01-P04 placeholder test (window above the city, hand on chin, from behind three-quarter) | Soul (TBC) + item 1 | item 1, storyboard C02-S01-P04 | Still, text-free | 16:9 | 2 | Same as above |

Prompts (all images): no text, captions, logos or on-screen UI; collared button-up work shirt;
painterly 3D-like forms with brush texture, crimson / near-black / ivory palette (from
`PRODUCTION-PLAN.md`); negative: extra fingers, distorted face, visible brand marks.
- Item 2: "Portrait of the subject facing camera, neutral expression, collared button-up work shirt,
  soft studio light, plain dark background."
- Item 3: as item 2, three-quarter view, slight smile.
- Item 4: "Upper-body portrait, arms folded, head facing straight, collared work shirt, near-black
  background, strong red rim light outlining the body, cinematic, generous empty space below the
  chest for a title (no text)."
- Item 5: "Seen from behind at three-quarters, the subject in a collared work shirt stands at a
  floor-to-ceiling window high above a city at dusk, one hand at his chin, pondering; calm and
  professional; the skyline fills the frame."

## Cost and cap
Expected credits: **TBC** (to be quoted from the live price list before approval).
Proposed hard cap: **TBC**. If a run would exceed the cap, stop and ask.

## Fallback
If the likeness is weak: add more photos and retrain once (asked as a new batch), or stay with the
storyboard sketches. Nothing reaches the site without your approval of the specific image.

## Privacy
Photos are consented, stored only in the Storyboard Room's private storage and Higgsfield, never
committed. Generated stills are reviewed in the Storyboard Room before any are committed.

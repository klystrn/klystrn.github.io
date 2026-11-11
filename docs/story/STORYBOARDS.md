# Storyboard format (`docs/story/storyboards/*.md`)

Storyboards are rough layout sketches — framing, figure placement, camera, caption placement,
scroll behaviour and crops — drawn before any asset is generated. They are **not** art. The viewer
(`docs/story/viewer/index.html`, also published as an artifact) draws them as pencil sketches and
fills the caption boxes with the **current** copy from `docs/STORY-SCRIPT.md`, so script edits show
up after `python3 scripts/story/build.py`.

**Rule:** no Higgsfield / Soul ID / Kling batch for a scene until its storyboard is `approved`.

## Layers — what Higgsfield makes vs what code draws

Every panel is built from layers, so text and UI never have to be generated (or regenerated):

| Layer | Made by | Contains |
|---|---|---|
| **Plate** | Higgsfield, from an approved batch | Characters, places, props, light. **No text, lettering, speech balloons, captions, logos or on-screen UI** — screens are blank (or softly lit) so code can fill them. |
| **Evidence** | Your real files | Screenshots, certificates, letters — placed as-is (`real` flag). |
| **Code overlays** | Claude, in HTML/CSS/SVG | Narration, thought and speech balloons (with tails), fact boxes, skills, portals, SFX lettering, titles and the Chinese name, nav bar, selection cards, charts, trade logs, to-do lists, diagrams, red lines and highlights (`code` flag or an overlay element). |
| Guides | Storyboard only | Crop boxes, pencil notes, motion arrows, perspective lines — never shipped. |

So Claude can add, move, reword or delete any caption, balloon, label, diagram or screen content
by editing the script/storyboard — no new image, no external service. In the viewer, each panel's
**Show** toggle splits the composite into *Generated plate* and *Code overlays + evidence*, and a
badge says whether the panel needs a generated plate at all. The build records the same in
`public/story/manifest.json` (`plate: generate | evidence | code`); only `generate` art IDs ever go
into a Higgsfield batch.

**Caption safe zones:** the `cap` boxes in each storyboard are the areas a plate must keep calm
(no faces or key action underneath). They're passed into every generation prompt.

## Frame edges and phones

Like a printed comic, captions and balloons **may sit on the panel's edge** (the build allows a
caption to hang up to 4% past it, and the website nudges edge captions outward so they straddle the
border). Art, figures and diagrams stay inside the frame. **On phones nothing is cropped:** every
frame is shown whole, scaled to the screen, and its captions stack underneath in reading order.

What the build enforces:

- `python3 scripts/story/build.py` **errors** on art outside the frame (boxes, figures, discs,
  lines, lists, crops, text that's too wide) and on captions hanging more than 4% past it, and
  **warns** when a caption's text may wrap past the bottom or overlap another caption.
- The Storyboard Room keeps its sketches tidy by fitting captions inside each frame. The website
  (`/story`) places them as real HTML at the same positions; `tests/story.spec.js` checks at four
  screen sizes that no caption, title or card is cut off and the page never scrolls sideways.

## Approving

Add to the scene's `story` block in the script (create the block under the `### Scene` heading if
there isn't one):

````markdown
### Scene C03-S01 · The classroom
```story
storyboard: approved      # or: revise
```
````

Or press **Approve** / **Request changes** in the viewer, then ask Claude to "sync storyboard
reviews" — Claude reads the viewer's saved reviews and writes them into the script.
`docs/story/STORYBOARD-STATUS.md` lists every scene's state (generated).

| State | Meaning |
|---|---|
| Not started | No storyboard yet |
| Waiting on script edits | Not started, and the scene still has `{edit}` / `[EDIT: …]` gaps |
| Partly drafted | Some panels have storyboards |
| Drafted | Every panel has a storyboard — ready for your review |
| Changes requested | `storyboard: revise` |
| Approved | `storyboard: approved` — cleared for asset planning |

## File format

One `## Panel <ID>` (or `## Item <id>` for selection cards) per storyboard. Field lines, then one
or more frames. Coordinates are **percent of the frame** (x from left, y from top).

```text
## Panel C03-S01-P01
shot: Wide establishing · eye level
camera: Slow push-in as you scroll (CSS scale 1.00 → 1.06)
scroll: Fades up from grey; the red code line lights last
transition: Hard cut across a gutter to C03-S01-P02
mobile: Crop to the screen + Reginald; caption moves below the image
tags: GENERATE LATER, REAL EVIDENCE (classroom reference)
refs: Public SST classroom photo for layout
note: anything else

variant A · optional label for alternatives (e.g. hero poses)
frame 16:9 optional frame label
floor 74
fig 30 74 40 sit r teen "Reginald" red
screen 44 20 26 20 "pandas" red
cap NAR 4 6 40
crop mobile 30 0 40 100
```

| Element | Arguments |
|---|---|
| `floor Y` | horizon / floor line |
| `vp X Y` | perspective guide lines from a vanishing point |
| `box X Y W H "label"` | any object; flags `dash`, `fill`, `red` |
| `screen X Y W H "label"` | monitor/laptop/phone screen with UI lines |
| `chart X Y W H` | a price/line chart |
| `card X Y W H "TITLE"` | selection card |
| `building X Y W H "label"` | tower / facade |
| `paper X Y W H "label"` | letter / document |
| `tree X Y H` | tree / foliage |
| `phone X Y` | handset |
| `disc X Y R` | circle motif (moon, sun, red disc) |
| `fig X Y H pose [l\|r\|f] [teen\|young\|adult\|old] "label"` | figure; X,Y = feet, H = height. Poses: `stand walk sit type slump point present hold fold lean bust silhouette back bench` |
| `arrow X1 Y1 X2 Y2 "label"` | motion or camera move |
| `line X1 Y1 X2 Y2` | plain line |
| `wash X Y W H` / `dark X Y W H` | red flood / black flood |
| `text X Y SIZE "TEXT"` | on-screen typography; SIZE = % of frame height; flags `red ivory ink center` |
| `cap TYPE X Y W [N] [tail=X,Y]` | caption box filled from the script (NAR, THO, DIA, FAC, SFX, SUB, PORTAL, SKL); N = which line of that type (1 = first); `tail=` points a speech/thought balloon at the speaker |
| `list X Y W ["TITLE"] "a\|b\|c"` | code-drawn checklist / log (to-do lists, trade logs) |
| `crop NAME X Y W H` | dashed crop guide (mobile crop, card crop, full) |
| `label X Y "text"` | pencil annotation |

Flags on any element: `red` · `dash` · `fill` · `faint` · `code` (drawn in code, not generated) · `real` (your real file) · `detail` (on a red figure: rim-light body detail).

Tags: `PLACEHOLDER` · `REAL EVIDENCE` · `GENERATE LATER` · `NEEDS PERMISSION`.

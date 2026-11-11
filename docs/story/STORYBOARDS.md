# Storyboard format (`docs/story/storyboards/*.md`)

Storyboards are rough layout sketches — framing, figure placement, camera, caption placement,
scroll behaviour and crops — drawn before any asset is generated. They are **not** art. The viewer
(`docs/story/viewer/index.html`, also published as an artifact) draws them as pencil sketches and
fills the caption boxes with the **current** copy from `docs/STORY-SCRIPT.md`, so script edits show
up after `python3 scripts/story/build.py`.

**Rule:** no Higgsfield / Soul ID / Kling batch for a scene until its storyboard is `approved`.

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
| `cap TYPE X Y W [N]` | caption box filled from the script (NAR, THO, DIA, FAC, SFX, SUB, PORTAL); N = which line of that type (1 = first) |
| `crop NAME X Y W H` | dashed crop guide (mobile crop, card crop, full) |
| `label X Y "text"` | pencil annotation |

Tags: `PLACEHOLDER` · `REAL EVIDENCE` · `GENERATE LATER` · `NEEDS PERMISSION`.

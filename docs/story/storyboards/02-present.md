# Storyboards · Chapter 2 · Present Day

## Panel C02-S01-P01
shot: Three-up selection board · full width, edge to edge, under the chapter title
camera: Static frame; cards slide in from the right one at a time
scroll: Scroll locks on the three panels for ~1 viewport (sticky): card 1 at 0%, card 2 at 30%, card 3 at 60%, hold, release at 100%
transition: Hover/focus widens a card to ~50% and its neighbours narrow; the image un-crops to the "full" art
mobile: Cards stack vertically; tap expands one card in place to show the subtitle and the full image
tags: GENERATE LATER
note: Review (12 Nov, round 5) applied: the three cards fill the screen width and are taller, cropped dynamically to the screen; skills and the narration lines are gone; the scroll pauses on the three panels.
note: Each card needs 4 images (desktop crop/full, mobile crop/full) of the same scene — 12 in total.
note: Review of 11 Nov applied — the expanded state shows the captions (narration + subtitle) as code overlays; trading shows a real home-trader setup with a trade-log screen; RegiStudio shows a business to-do list instead of a pipeline board.

variant At rest · three equal cards
frame 16:9 desktop, resting
text 50 8 5 "PRESENT DAY" ink center
card 0 14 33 86 "ACTIVE TRADING"
card 33.5 14 33 86 "RUNNING REGISTUDIO"
card 67 14 33 86 "SERVING NS"

variant Hover · trading expanded
frame 16:9 desktop, hover on card 1
text 50 8 5 "PRESENT DAY" ink center
card 0 14 52 86 "ACTIVE TRADING" red
cap SUB 6 68 46 1
card 52.5 14 23.5 86 "REGISTUDIO"
card 76.5 14 23.5 86 "NS"

variant Mobile
frame 9:16 mobile, one card tapped open
text 50 5 3 "PRESENT DAY" ink center
card 6 10 88 14 "ACTIVE TRADING"
card 6 26 88 46 "RUNNING REGISTUDIO" red
label 10 66 "tapped: subtitle + full image"
card 6 74 88 14 "SERVING NS"

## Item present-trading
shot: Medium · over-the-shoulder at a home trading desk at night
camera: Pointer parallax on the screens only
mobile: Crop to the face lit by the screen and the red line
tags: GENERATE LATER, REAL EVIDENCE (your home trading setup for layout)
refs: Your desk and monitor layout; synthetic charts and trade log — no real balances, order IDs or tickers
note: Screen contents (charts, trade-log rows) are code overlays on blank screens, so they can change without regenerating the plate.
frame 3:4 card crop
dark 0 0 100 100
screen 30 20 66 44 "chart" red
chart 34 26 58 32 red
fig 22 100 70 bust r adult "Reginald"
frame 16:9 full (hover) · home trader setup
dark 0 0 100 100
box 4 62 92 4 "desk"
screen 22 18 22 30 "charts"
chart 24 26 18 18
screen 46 10 26 38 "main chart" red
chart 48 18 22 26 red
screen 74 18 22 30 "trade log"
list 75 22 20 "" "BUY 10 · 09:31|SELL 5 · 11:02|STOP moved|BUY 4 · 15:40"
box 40 57 18 4 "keyboard"
fig 16 100 56 sit r adult "Reginald"
cap SUB 64 70 32
crop card 14 0 42 100

## Item present-registudio
shot: Medium-wide · high angle over a planning desk
mobile: Crop to the to-do list and hands
tags: GENERATE LATER
refs: Client names and logos never visible; the to-do items are code overlays you can edit any time
frame 3:4 card crop
paper 8 6 56 46 ""
list 12 10 48 "TO-DO" "Reply to new lead|Send proposal v2|Invoice: site build|Post case study"
fig 72 100 62 sit l adult "Reginald"
frame 16:9 full (hover)
box 4 70 92 4 "desk"
paper 6 8 32 56 ""
list 8 12 28 "TO-DO · REGISTUDIO" "Reply to new lead|Send proposal v2|Invoice: site build|Post case study|Book a client call"
paper 42 58 14 10 "proposal"
screen 70 22 24 34 "site draft"
fig 56 100 54 sit r adult "Reginald"
cap SUB 42 6 26
crop card 30 0 42 100

## Item present-ns
shot: Medium · eye level · camera raised to the eye
mobile: Crop to the camera, face and red focus point
tags: GENERATE LATER
refs: Guards HQ media setting; your own photos for the camera and uniform
frame 3:4 card crop
fig 50 100 76 hold f adult "Reginald"
box 42 26 16 10 "camera" red
frame 16:9 full (hover)
floor 78
box 4 40 24 30 "shot list board" dash
fig 46 96 70 hold f adult "Reginald"
box 41 34 12 8 "camera" red
fig 76 96 52 stand l adult "team"
fig 86 96 50 stand l adult
cap SUB 4 6 30
crop card 30 0 42 100

## Panel C02-S01-P04
shot: Page-sized splash · from behind at three-quarters, a floor-to-ceiling window high above the city at dusk
camera: Very slow push toward the window; parallax between the skyline layers
scroll: The panel fills the page; as you scroll past, colour drains to monochrome for the flashback
transition: Colour drains; cut to the SST chapter in black and white
mobile: Crop to the figure and the window; skyline stays visible
tags: PLACEHOLDER (awaiting your approval), GENERATE LATER
note: Review (12 Nov, round 5) applied: the code window is replaced by a scene that shows you as professional and ready for new challenges: standing at a window, hand on chin, pondering. This is a placeholder until you approve it.
frame 16:9
dark 0 0 100 100
wash 0 0 100 58
building 4 38 10 50 ""
building 16 28 8 60 ""
building 70 34 12 54 ""
building 84 44 10 44 ""
line 0 88 100 88
line 30 0 30 88 faint
line 62 0 62 88 faint
fig 46 96 58 ponder r adult "Reginald"
ducky 92 82 6 show=0.6

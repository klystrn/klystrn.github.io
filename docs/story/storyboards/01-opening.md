# Storyboards · Chapter 1 · Opening

## Panel C01-S01-P01
shot: Full-bleed title card · upper body, arms folded, straight-on
camera: Scroll-driven push-in from upper body to a close-up of the face (scale 1.0 → ~1.9, anchored on the face). Pointer moves the red rim-light glint 1–2°
scroll: Nav bar visible from the first frame → silhouette fades up → REGINALD TAN lands → 陈彦杰 stamps over the centre → scrolling pushes the camera into the close-up while the name lifts away
transition: When the push-in ends, the nav bar compacts into the right-side dock; then the fracture (P02)
mobile: Name on two lines; same push-in, cropped to head and shoulders
tags: GENERATE LATER, NEEDS PERMISSION (your photos for the silhouette)
refs: REF-HERO-02 (title over black, red CJK over the name)
note: Wardrobe — a collared button-up work shirt (review, 11 Nov).
note: Second review (11 Nov) applied — the figure is taller so the face sits clear above the name, the Chinese name is letter-spaced wide like the reference, and the head faces fully straight.
note: First review applied — bigger REGINALD TAN, smaller Chinese name, pose A (folded arms) with a scroll zoom into a close-up, the silhouette shows body detail in red rim light instead of one flat shade, and the PORTFOLIO eyebrow is replaced by the nav bar. Assumed: one-line name on desktop, two lines on mobile.
note: Two plates are generated (upper body, close-up) or one tall high-resolution plate the camera pushes into. The name, Chinese name and nav bar are code overlays.

variant Desktop · at rest
frame 16:9 desktop, top of page
dark 0 0 100 100
box 28 3 44 7 "Story · CV · Tech · Finance · Life" code
fig 50 100 104 bust f adult red detail fold
text 50 66 27 "REGINALD TAN" ivory center
text 50 66 8 "陈彦杰" red center wide
crop mobile 34 0 32 100

variant Desktop · scrolled into close-up
frame 16:9 desktop, end of the push-in
dark 0 0 100 100
box 28 3 44 7 "nav bar" code
fig 50 100 118 silhouette f adult red detail
label 4 92 "camera pushed in ~1.9×; the name has lifted away"

variant Mobile
frame 9:16 mobile
dark 0 0 100 100
box 6 2 88 4 "nav bar" code
fig 50 100 70 bust f adult red detail fold
text 50 76 11 "REGINALD" ivory center
text 50 90 11 "TAN" ivory center
text 50 83 3.6 "陈彦杰" red center wide

## Panel C01-S01-P02
shot: Graphic transition · straight-on
camera: Silhouette splits along three diagonal cuts that slide apart (CSS clip-path, no video needed)
scroll: Tied to scroll over ~0.6 viewport; reversible when scrolling back up
transition: The three shards become the three Present cards in Chapter 2
mobile: Cuts become horizontal bands instead of diagonals
tags: PLACEHOLDER
note: Built from the hero art plus CSS masks — no separate generated image required.

frame 16:9
dark 0 0 100 100
fig 50 100 104 bust f adult red detail fold
line 28 0 44 100 red code
line 52 0 68 100 red code
arrow 30 50 18 50 "slide"
arrow 70 50 82 50 "slide"
cap NAR 34 74 32

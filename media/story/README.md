# Story media (originals)

Photos featured on the site — Photo Scene panels and the army photography gallery — are kept here
at full quality. Claude adds them when you ask it to "sync the Storyboard Room".

- **Originals** live here; only location and camera metadata is removed, losslessly (the picture
  data is byte-for-byte what you uploaded). Untouched originals, metadata included, stay in the
  Storyboard Room's private storage.
- `index.json` says which scene or gallery each photo belongs to, and its caption.
- `python3 scripts/story/media.py` makes the web copies in `public/story/media/` (WebP, quality 90,
  long edge 2400 px) and `src/story/media.json` for the site.
- Reference photos of you and other people are **not** stored here — they stay private in the
  Storyboard Room.

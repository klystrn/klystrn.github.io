# KNOWN GAPS

Outstanding content/asset items, mirroring `docs/CONTENT-DOC-reginald-v4.md`'s flags so nothing
ships silently wrong. Fix in `src/data/*.json` (content) — components carry no content.

## Content (needs Reginald's input)

1. **§1 hero copy** — positioning lines confirmed 2026-07-16 (rotating carousel of three);
   sub-line and goal pull-quote still marked `[CONFIRM]`, shipping as written. → `identity.json`
2. **§10 testimonial quotes** — Rahul Varma and Dimuthu Makawita render the
   `[Quote pending]` placeholder. → `testimonials.json` (`quote: null`)
3. **§15 header rewrites** — Timeline ("A line that keeps trending up.") and Experience
   ("Where the code went to work.") flagged as awkward, not yet replaced. → `headers.json`
4. **locationX** — confirmed for the supplementary list, but stack tags, langs, and milestones are
   placeholders (`TBD` langbar in Tech mode). → `projects.json` (`id: locx`)

## Assets (content doc §14)

- [ ] CV PDF → set `identity.json` → `contact.cvUrl` (résumé buttons currently toast a placeholder)
- [ ] Google Drive certificates folder URL → `identity.json` → `contact.driveUrl`
      (the "view all ↗" button falls back to an in-page modal until set)
- [ ] 2–3 personal photos (About/hero)
- [ ] 1–3 images per flagship project (`atw-01.png`, `tcs-01.png`, …)
- [x] Favicon — resolved: typographic red "R." SVG (`public/favicon.svg`)
- [ ] Testimonial PDFs (Rahul Varma, Dimuthu Makawita)

## News feed

- `feed.json` links are all `#` — replace with real GitHub/LinkedIn URLs.

# KNOWN GAPS

Outstanding content/asset items, mirroring `docs/CONTENT-DOC-reginald-v4.md`'s flags so nothing
ships silently wrong. Fix in `src/data/*.json` (content) — components carry no content.

## Content (needs Reginald's input)

1. **§1 hero copy** — positioning lines and sub-line/goal pull-quote all confirmed and current.
   Nothing outstanding here.

RESOLVED 2026-07-17 (Reginald's direct edits + follow-up sync):
- §10 testimonial quotes — Rahul Varma and Dimuthu Makawita now have real quotes, `quoteFinance`
  variants, and a `url` (Drive PDF) per person; a "Read in full ↗" link is wired in Vanilla, Tech
  (APPROVALS.md), and Finance (Analyst Coverage).
- §15 header rewrites — Timeline, Experience, Projects, Skills, and Testimonials headers all
  rewritten (`headers.json`).
- locationX — enriched with its real Python stack, description, and milestones (`projects.json`,
  `id: locx`); the duplicate "Interschool Games Planner" entry is gone.

## Assets (content doc §14)

- [x] CV PDF — resolved, `identity.json` → `contact.cvUrl`
- [x] Google Drive certificates folder URL — resolved, `identity.json` → `contact.driveUrl`
- [ ] 2–3 personal photos (About/hero)
- [ ] 1–3 images per flagship project (`atw-01.png`, `tcs-01.png`, …)
- [x] Favicon — resolved: typographic red "R." SVG (`public/favicon.svg`)
- [x] Testimonial PDFs (Rahul Varma, Dimuthu Makawita) — resolved via `testimonials.json` `url`

## News feed

- `feed.json` links are all `#` — replace with real GitHub/LinkedIn URLs.

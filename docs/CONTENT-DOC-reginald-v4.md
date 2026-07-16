# PORTFOLIO CONTENT DOC v3 — Reginald Tan
> The single authoritative content source. Populated from your rough draft, cleaned and rephrased.
> Structure maps 1:1 to the JSON files that will be generated for /src/data/.
> Edit anything. Items in [BRACKETS] still need your input; ⚠ marks a conflict to resolve.
> When done, upload this file back to chat → JSON conversion → Claude Code.

---

## 1 · IDENTITY (→ identity.json — hero + About in all modes)

- Full name: Reginald Tan
- Positioning lines (hero — vertical rotating carousel of 3, CONFIRMED 2026-07-16, replaces the
  single line; emphasised word in italics per line):
  1. "Business analytics, with a *market* mind."
  2. "Financial technology, with an *analytical* mind."
  3. "Software engineering, with a *business* mind."
- Sub-line (hero lede): "Nine years of coding, two years of equity trading. Built tools for a cloud 
  migration in J.P. Morgan, developed facial recognition software for a biometrics firm, & taught workshops
  at Overflow. Currently leading a media & design team in the Singapore Armed Forces and automating a trading
  workflow in after-hours."
- Location: Singapore
- Current status: NS @ SAF Guards HQ - Team Manager (Media & Design) · AI Task Force (DECISION: no end date shown)
- Target: finance, tech, and fintech opportunities (site deliberately shows breadth beyond these)
- Goal pull-quote: "The goal: make the decisions that enable corporations to make & move money strategically." 
- About paragraphs (Vanilla, 2 paras):
  1. "At fourteen, I shipped my first real product, Sorts, an iOS app for educators. Since then, I've completed an
     O-Level Computing specialisation at SST, a Diploma in IT at Ngee Ann Polytechnic on the Ngee Ann
     Scholarship (Director's List, twice), and a year at J.P. Morgan migrating investment banking processes and
     building a cloud-workload monitoring tool now used globally, with a stint running server operations 
     at Alibaba Cloud's Singapore data centres along the way."
  2. "Beyond my background in data analytics & software engineering lies a second obsession: financial markets. I've been 
      trading equities for two years, building workflows and tooling to further my passion, from a portfolio tracker to a 
      Claude-powered automated trading workflow."

## 2 · QUICK STATS (→ identity.json, animated counters)

| # | Number | Label |
|---|---|---|
| 1 | 7 | IT competitions |
| 2 | 11 | IT projects |
| 3 | 16 | workshops led |
| 4 | 2 | director's lists |
| 5 | 9 | years writing code (CONFIRMED: counts from first code written ~2017, not from Sorts shipping in 2019) |
| 6 | 2 | years trading |

## 3 · EXPERIENCE (→ experience.json)

### J.P. Morgan Chase · Corporate & Investment Bank
- Title: Software Engineer Intern (Data Analytics & Cloud) · Dates: 2024–2025 · Singapore
- Summary: Workload migration, data analytics and tool development on the Athena platform.
- Detail: Specialised in workload migration, data analytics, and tool development. Created a tool used
  globally by various lines of business to monitor their workloads and visualise areas for optimisation.
  Served as SME for cloud migration workload & data visualisation. Largely classified.
- Skills: Python, Data analytics, AWS, Cloud infrastructure, Tool development
- Finance-mode tag: BLUE CHIP · Privacy note: "Specific internals are JPMC-internal; happy to go deeper in an interview."

### Alibaba Cloud · SG Data Centres
- Title: Assistant IT Engineer (Server Tech) · Dates: 2025 · 8-week part-time
- Summary: Back-office server operations at the Singapore data centres.
- Detail: Handled server equipment and transferred confidential client data between servers. This 8 week attachment 
  was short but memorable. It provided me with a a ground-level view of the background processes that keep servers 
  functional and operable.
- Skills: Server operations, Data handling, Hardware, Networking
- Finance-mode tag: INFRASTRUCTURE

### SAF · Guards HQ
- Title: Team Manager, Media & Design · AI Task Force · Dates: 2025–now (NS)
- Summary: Leading a team of 8; building an army chatbot for combatants.
- Detail: Managerial role over a team of 8 for the media & design team: multiple large-scale projects
  for army exercises and events (classified); managing Guards HQ Facebook and Instagram. Sitting on the AI Task
  Force and Recruitment Team, I'm working on multiple projects, like building an army chatbot for Guards combatants 
  and managing the media for division-level exercises.
- Skills: Team management, Photoshop, Illustrator, AI / Claude
- Finance-mode tag: SOVEREIGN · Privacy note: "Several projects (Ex COORES and others) are classified."
> DECISION LOCKED: Guards media IC counts as work experience (managerial, deliverables, 8 reports).

## 4 · EDUCATION (→ education.json)

### Ngee Ann Polytechnic — Diploma in Information Technology, School of InfoComm Technology · 2022–2025
- Academics: OOP, ASP.NET Core, Data Structures & Algorithms, Databases, Data Analytics, UI/UX design.
  Languages developed: Python, C#, C++, JavaScript.
- Beyond the diploma: organised Open House 2023, RED Camp, internal CCA events, and a class visit
  teaching elderly residents to use smart devices.
- Finance-mode framing: "UPLISTED 2022"

### School of Science & Technology, Singapore — O-Levels, Computing specialisation · 2018–2021
- Academics: dynamic programming, computer architecture, networking, AI & machine learning.
- Built: Sorts (iOS) and a Python interschool-games planner for teachers.
- Leadership: Service Leader (elderly interaction projects and more).
- Post-graduation: talks to new cohorts; open-house panelist multiple years.
- Finance-mode framing: "IPO 2018"

## 5 · POSITIONS (→ timeline.json sub-events, type=position; also folded into parent org cards)

| Position | Org | Years | Notes |
|---|---|---|---|
| Chairperson, ACE Board | SST | 2020 | Service-learning board; partners incl. Singapore Cancer Society, National Youth Council, Special Olympics SG; sign-ups +~250%; 100+ individual service hours |
| Head Secretary, Overflow | NP | 2023–2024 | Logistics, admin, EXCO event prep; technical support; taught and ran multiple workshops |
| Child Mentor Volunteer | Touch Young Arrows | 2023 | Tutoring underprivileged children: English, Mathematics, Science |
| SME, cloud migration workload & data visualisation | JPMC CIB | 2024–2025 | Folded into JPMC experience card |
| AI Task Force | Guards HQ, SAF | 2026 | Army chatbot interface for Guards combatants |
| Team Manager, Media & Design | Guards HQ, SAF | 2026–2027 | Team of 8; classified large-scale projects; social accounts |

## 6 · PROJECTS (→ projects.json)
> Flagship = featured cards in Vanilla + FLAGSHIP watchlist tab (Finance) + top-level repos (Tech).
> Supplementary = concise rows in Vanilla + SUPPLEMENTARY watchlist tab + projects/supplementary/ folder.
> Milestones: [curve index 0–11] · label · level 0–100 (plots the Finance chart). Levels ESTIMATED — adjust.

### FLAGSHIP

**1 · Automated Trading Workflow** · 2026 · active · Solo builder
- Ticker $ATW · repo `automated-trading-workflow` · sector MARKETS TOOLING · langs Python 55 / Md 30 / Shell 15
- Detail: A daily workflow running on Claude and MCP integrations that automates the research half of a
  swing-trading side hustle: scans, structured analysis, and trade-ready summaries before the open.
- Skills: Claude & MCP, Prompt engineering, Python, Markets research
- Milestones: [2] First MCP pipeline running · 25 → [6] Pre-market report automated · 60 → [10] Full workflow in daily use · 90
- Links: [repo/demo URL?] · Images: [atw-01.png…]

**2 · Trading Command Sheet** · 2026 · active · Solo builder
- $TCS · `trading-command-sheet` · MARKETS TOOLING · Python 62 / Md 22 / Shell 16
- Detail: A personal command sheet for market analysis workflows: structured research, trade planning
  parameters, and repeatable analysis playbooks. Where the software engineering discipline meets the
  markets obsession.
- Skills: Markets research, Technical analysis, Risk management, Automation
- Milestones: [2] Playbook structure defined · 25 → [6] First full analysis run · 55 → [10] Adopted into daily trading · 85

**3 · Athena Cloud Migration** · 2024–2025 · shipped · SWE Intern @ JPMC
- $ATHN · `athena-cloud-migration` · ENTERPRISE · JPMC · Python 74 / YAML 15 / Shell 11
- Detail: Workload migration, data analytics, and tool development. Built a monitoring and visualisation
  tool now used globally by multiple lines of business to spot workload optimisation opportunities.
  Largely classified.
- Skills: Python, Data analytics, Cloud infrastructure, Tool development
- Milestones: [2] Onboarded to Athena codebase · 30 → [6] Monitoring tool prototype adopted · 60 → [10] Global rollout across LOBs · 95

**4 · FRATS — Facial Recognition Attendance Taking System** · 2024 · shipped · NP capstone
- $FRTS · `frats-capstone` · CAPSTONE · NP × AIDC · Python 58 / JS 28 / HTML-CSS 14
- Detail: Built for AIDC, a biometrics security company based in Indonesia, using Python and its CV
  libraries end to end. Supervised and mentored by an AIDC technical manager throughout.
- Skills: Computer vision, AI, Python, UX
- Milestones: [2] CV pipeline prototype working · 30 → [6] AIDC requirements integrated · 60 → [10] Attendance interface delivered · 90

**5 · Panel Party** · 2023 · shipped · Team developer (sprites & collision)
- $PNLP · `panel-party` · GAME · NP OPEN HOUSE · JS 64 / HTML-CSS 36
- Detail: Interactive tile-capture game built by my team for NP ICT Open House 2023: capture tiles by
  moving over them before the timer runs out, without letting opponents re-capture. I built sprite
  movement and collision detection.
- Skills: JavaScript, Game design, Collision detection, Sprites
- Milestones: [2] Core loop playable · 30 → [6] Collision and sprites done · 60 → [10] Live at Open House · 85

### SUPPLEMENTARY (Vanilla one-liners; can be promoted later)
| Year | Project | One-liner | Tags |
|---|---|---|---|
| 2026 | AI Chatbot for Guards | Army chatbot interface for combatants, SAF AI Task Force (in progress, largely classified) | AI · Claude |
| 2023 | Shipee App Prototype | Shipment-tracking concept (Aftership rebrand): user research, business analysis → hi-fi Figma prototype | Figma · MapBox |
| 2023 | Online Courier System | Full ASP.NET Core MVC courier platform (NinjaVan-style); customer & staff roles, auth, database workflows | C# · SQL |
| 2022 | The Tea Shop | Mock online tea business with friends; first website built from scratch; Bootstrap + product renders | Web |
| 2022 | Tower Defence Game | Text-based Python unit-defence game (PvZ-style); game design & logic | Python · PyGame |
| 2021 | C3 | Mock start-up pitch: code collaboration + AI product suite; highest grade band | Pitch |
| 2021 | Interschool Games Planner | Python scheduler built for SST teachers to plan interschool games | Python |
| 2019 | Sorts (iOS) | Student-grouping app for educators; lead programmer, team Pollo, shipped at 14 ($SRTS, `sorts-ios`) | Swift · iOS |
| 2021 | locationX | SST capstone: scheduling app built for the National School Games (NSG) (CONFIRMED: include) | Capstone · [ADD STACK TAGS] |

### PROJECT IMAGES [PENDING]
1–3 per flagship. Vanilla: card thumbnail + modal gallery. Tech: assets/ folder inside each repo.
Finance: thumbnail strip under Fundamentals. Name files `atw-01.png`, `tcs-01.png`, etc.

## 7 · SKILLS (→ skills.json — powers the constellation; strengths /10 ESTIMATED)
> **THE CONNECTION MECHANISM:** every skill automatically connects to its CLUSTER hub. The
> **Connects to** column adds *direct* node-to-node edges on top (drawn as dashed lines; these are
> what light up when a node is clicked). To link any two skills, name them in each other's row —
> e.g. Claude & MCP ↔ Trade Automation. Add/remove freely; the constellation is generated from this table.

| Skill | Cluster | Strength | Connects to (direct edges) | Evidence / used in |
|---|---|---|---|---|
| Python | TECH | 9 | Computer Vision | Athena · FRATS · ATW · Pandas, NumPy, OpenCV, PyGame |
| Data Analytics | TECH | 8 | Fundamental Analysis | JPM tooling · PowerBI · Excel |
| C# | TECH | 7 | — | Courier System · ASP.NET |
| JavaScript | TECH | 7 | UI/UX · Figma | Web · Vue.js · Panel Party |
| SQL | TECH | 7 | — | Courier · InfluxDB · MS SQL Server |
| Cloud & AWS | TECH | 7 | — | EC2 · S3 · Route 53 · CloudWatch · JPM CloudGrid |
| ASP.NET Core | TECH | 6 | — | Courier System |
| Vue.js | TECH | 6 | — | Overflow workshops · Tailwind · DaisyUI |
| Prompt Engineering | AI | 8 | — | ATW · daily workflows |
| Claude & MCP | AI | 8 | Trade Automation | ATW · Guards chatbot |
| Context Design | AI | 7 | — | Guards chatbot |
| Computer Vision | AI | 6 | Python | FRATS |
| Technical Analysis | MARKETS | 7 | — | TCS · swing trading |
| Trade Automation | MARKETS | 7 | Claude & MCP | ATW |
| Fundamental Analysis | MARKETS | 6 | Data Analytics | TCS research |
| Portfolio Management | MARKETS | 6 | — | Position sizing · risk-reward |
| Sentiment Analysis | MARKETS | 5 | — | Market context |
| UI/UX · Figma | DESIGN | 7 | JavaScript | Shipee · portfolio workshops · IBM design thinking |
| Photoshop | DESIGN | 6 | — | Guards media |
| Lightroom | DESIGN | 6 | — | Photography |
| Illustrator | DESIGN | 5 | — | Guards media |
| SketchUp | DESIGN | 5 | — | Product renders · Enscape |

- Context node: Guards HQ Media Team (DESIGN cluster; connects to design hub + root)
- Hub cross-links: AI↔TECH · AI↔MARKETS · TECH↔MARKETS · DESIGN↔TECH
- Click behaviour: clicking a node highlights ONLY its direct connections (hub + Connects-to edges), not the whole cluster.
- REMOVED from constellation (kept in stack.json / project details): PHP, C++ (minor), Swift (lives in
  Sorts), proprietary stacks (Athena, Hydra, Sigma, CloudGrid, Perspective), Jira/Agile/Confluence,
  Adobe XD, DaVinci (CONFIRMED: both — XD for design, DaVinci for media work; both stay in stack data, neither in constellation)

## 8 · AWARDS (→ awards.json — display: name + year)

Ngee Ann Scholarship · 2022–2024 (CONFIRMED)
Director's List, Diploma in IT · 2022 & 2023
2nd Most Outstanding Performance, Diploma in IT · 2022
Module Prize, Computing Mathematics · 2022
Module Prize, Design Principles · 2022
Edusave Certificate of Academic Achievement · 2023 & 2025
DrCT International, Bronze · 2021
Highest Grade, Entrepreneurship First Steps · 2021

## 9 · CERTIFICATES (→ certs.json — DECISION: show name + year; issuer kept in data, not displayed)

| Certificate | Issuer | Year |
|---|---|---|
| J.P. Morgan Polytechnic Internship Programme | JPMorganChase | 2025 |
| AI4I — Literacy in AI | AI Singapore | 2024 |
| PolyForum Certificate of Participation | Polytechnic Forum | 2023 |
| IBM Enterprise Design Thinking Practitioner | IBM | 2023 |
| React.js Essentials Training | LinkedIn Learning | 2023 |
| Programming Foundations: Data Structures | LinkedIn Learning | 2023 |
| Cloud Explorer Badge | AWS Educate | 2022 |
| Fundamentals of Dynamic Programming | LinkedIn Learning | 2021 |
| Succeeding in Web Development: Full Stack & Front End | LinkedIn Learning | 2021 |
| Python: Recursion | LinkedIn Learning | 2021 |
| Learning Cloud Computing: Core Concepts | LinkedIn Learning | 2021 |
| Youth Cyber Exploration Programme | CSA Singapore, Cybint | 2020 |
| Learn JavaScript | CodeCademy | 2020 |
| Learn Command Line | CodeCademy | 2020 |

Vanilla shows top 7 + "…and 7 more". Tech certs.lock shows top 7 + comment. Full list in data.

## 10 · TESTIMONIALS (→ testimonials.json)

| Name | Title | Quote |
|---|---|---|
| Rahul Varma | Executive Director, Global Head of Currencies & Emerging Markets Platform Technology, J.P. Morgan | [PENDING — provide quote] |
| Dimuthu Makawita | Deputy Director (School Operations & Planning), ICT, Ngee Ann Polytechnic | [PENDING — provide quote] |
| Jovita Tang | ML & NLP Specialist · Mathematics & Computing Teacher, SST | "…a promising individual who has both the knowledge and the heart to make significant contributions to the community in the future…" |
| Keith Wee | Service-Learning In-Charge · Mathematics Teacher, SST | "…prioritises work quality and works well in a team through positive contribution…" |

## 11 · EXTRACURRICULAR (→ timeline.json sub-events, type=xtra)

| Year | Event | Notes |
|---|---|---|
| 2018 | 3M Makeathon | Portable water filter for third-world drinkable-water shortage |
| 2019 | Innofest | Overnight makeathon; automatic distribution system for disaster relief in dangerous terrain |
| 2022 | TCP Camp | Christieara Programme: character, leadership, critical thinking |
| 2022 | Overflow Workshop: Vue.js | Facilitator & organiser; Vue.js, Tailwind, DaisyUI, web dev basics |
| 2023 | Overflow Bootcamp: DSA | 3-day bootcamp; Big O, stacks, queues, trees |
| 2023 | Overflow Workshop: Portfolio with Figma & Web Dev | Overall-in-charge, facilitator, organiser |
| 2024 | Poly-ITE Olympiad in Informatics | Organising committee (former participant) |
| 2025 | Microsoft Copilot for Organisations Workshop | Participant |
| 2025 | Ex COORES | Working party, Guards HQ (classified) |

## 12 · NEWS FEED (→ feed.json — curated, GitHub + LinkedIn mix; replace # with real URLs)

| When | Source | Item |
|---|---|---|
| recent | GitHub | pushed commits to automated-trading-workflow |
| recent | LinkedIn | joined the Guards HQ AI Task Force, building a chatbot for combatants |
| recent | LinkedIn | appointed Team Manager, media & design (team of 8), Guards HQ |
| recent | GitHub | published playbook update to trading-command-sheet |
| 2025 | LinkedIn | Position closed: JPMC internship, monitoring tool live globally |

## 13 · CONTACT & LINKS (→ identity.json)

- Email: reginald.140105@gmail.com
- LinkedIn: https://www.linkedin.com/in/reginald-tan/
- GitHub: https://github.com/klystrn
- CV: [PENDING — provide PDF filename]
- Domain: reginaldtan.com (Route 53, Phase I of build guide) · hosting now: klystrn.github.io

## 14 · ASSET CHECKLIST

- [x] CV PDF (current)
- [x] Rahul Varma quote / testimonial PDF
- [x] Dimuthu Makawita quote / testimonial PDF
- [ ] 2–3 photos of you (About/hero)
- [ ] 1–3 images per flagship project (atw-01.png, tcs-01.png, athn-01.png*, frts-01.png, srts-01.png) *if shareable
- [ ] 6–10 photography shots (Life tab, later)
- [x] Favicon mark — DECISION 2026-07-16: the typographic red italic "R." (same as the nav
      monogram), shipped as an SVG favicon
- [x] Google Drive folder URL for certificates (powers the "view all" button): [https://drive.google.com/drive/folders/1ZERfpR6xgMSrJyxMapfdozw5U_tW2Xws?usp=sharing]
> DECISION: no hand-drawn signature. The monogram stays the typographic red "R." across all modes.

## 15 · SECTION HEADERS & SUBHEADERS (→ headers.json)

| Section | VANILLA header | VANILLA sub | TECH | FINANCE |
|---|---|---|---|---|
| Hero | "Software engineering, with a market mind." | see §1 sub-line | titlebar: klystrn · ~/portfolio | $RTAN · Reginald Tan |
| About | "The short version." | — | README.md → "About me" | About the issuer |
| Timeline | "A line that keeps trending up." ⚠ [rewrite] | "Scroll, and the spine draws itself." | timeline.git | Listing History · Education |
| Experience | "Where the code went to work." ⚠ [rewrite] | — | experience/ | Institutional Holdings · Experience |
| Projects | "Selected work." | "Full catalogue lives in Tech & Finance modes." | projects/ | Watchlist · Projects |
| Skills | "One person, four clusters." | — | stack.json | Sector exposure · skills |
| Awards & certs | "Awards & honours" / "Certificates" | — | certs.lock | folded into listing/licences |
| Testimonials | "In others' words." | — | APPROVALS.md | Analyst Coverage · Testimonials |
| Contact | "Let's build something." | "Open to opportunities in software engineering, fintech…" | CONTACT.me | Trade Ticket |

## 16 · MODE CURSORS (custom cursor per mode — REVISED 2026-07-16)

Two cursors per mode: a default cursor and an interactive variant shown over links, buttons, and
clickable cards (replaces the earlier "clickable elements keep the native pointer" decision).

| Mode | Default cursor | Interactive cursor |
|---|---|---|
| Vanilla | Circular transparent liquid-glass bubble (specular highlight, dark rim) | Same bubble, red-rimmed (#d92b35) with a warm tint |
| Tech | Cyan chevron ❯, scaled down (16px — the 22px version read too big) | Cyan terminal block-caret (translucent fill) |
| Finance | Blue crosshair + white centre dot, 16px (REVISED: amber/green didn't read against the dark palette, sized down) | Target-lock: blue crosshair with a blue acquisition ring, white dot |

## 17 · SITE FURNITURE & INTERACTION DECISIONS (batch 1 · 2026-07-16)

Locked in during the first post-launch edit batch; implemented in the React build.

- **Credit line:** "Built by Reginald Tan" at the bottom of every page, styled per mode
  (Vanilla: serif italic name in red · Tech: `// built by …` comment · Finance: uppercase ticker style).
- **Vanilla footer:** consolidated to ONE footer — the dark contact box keeps only the icon buttons
  (email · LinkedIn · GitHub · résumé pill) with padding, no heading or prose; the old light
  button row below it is removed.
- **Vanilla try-other-modes box:** removed entirely once the visitor has seen both Tech and
  Finance (no more struck-through "completionist" state).
- **Vanilla additions:** top-of-viewport scroll progress bar (red accent) · floating right-side
  section dot-rail (hidden ≤1100px) · testimonials carousel (auto-rotate 5s, pauses on hover,
  dot controls; no auto-rotate under reduced motion).
- **Tech first-visit nudge:** the passive pulsing tree hint is replaced by a ⌘K/Ctrl+K command
  palette that auto-opens on the first Tech visit of a session (fuzzy file search; also a ⌘K chip
  in the titlebar). Terminal boots by *typing* `help` character-by-character. Tree files show a
  git-blame tooltip on hover (last commit hash · branch · year, derived from timeline commits).
- **Finance additions:** boot "live flicker" — quotes jitter briefly then settle on derived values
  (skipped under reduced motion) plus a pulsing LIVE dot · a fundamentals strip of derived career
  metrics (yrs active, projects, shipped, avg growth, positions, licences — all computed from data,
  never hand-typed) · a Sector Exposure · Allocation panel showing cluster-strength percentages
  from §7's skills table as a stacked bar.
- **Responsive pass:** Tech mobile explorer fixed (horizontal chip strip, no letter-wrapping),
  tighter Vanilla timeline/type scale ≤600px, Finance header/strip wrapping, smaller nav pill ≤380px.

### Batch 1.1 addendum (same day)

- **Favicon:** typographic red italic "R." as SVG (§14 resolved).
- **Hero:** positioning line replaced by a vertical rotating carousel of the three §1 sentences
  (3.8s interval; static first line under reduced motion).
- **Supplementary projects:** rows in Vanilla are now clickable and open the same detail modal as
  flagship cards (description, skills, key stats, privacy note where applicable).
- **Constellation:** ASP.NET Core and Vue.js nodes nudged apart from Prompt Engineering so their
  labels no longer overlap in the top-left cluster.

---
### Outstanding items summary (everything blocking JSON conversion)
1. §1 positioning/sub-line/goal [CONFIRM] · 2. §10 two quotes [PENDING] · 3. §15 two header rewrites ⚠ ·
4. §14 assets incl. Drive certificates URL (can trickle in; only CV + project images affect launch) ·
5. §6 locationX stack tags [ADD STACK TAGS]

RESOLVED 2026-07-16: §2 "9 years code" (keep 9, counts from ~2017) · §7 XD vs DaVinci (both) ·
§8 scholarship end-year (2022–2024) · §6 locationX (include).
